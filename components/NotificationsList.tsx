'use client'

import { getDeviceById } from '@/functions/device/get-device-by-id'
import { getEventById } from '@/functions/event/get-event-by-id'
import { getNotifications } from '@/functions/notification/get-notifications'
import { markNotificationsAsRead } from '@/functions/notification/mark-as-read'
import { account } from '@/lib/appwrite'
import { cn } from '@/lib/utils'
import { Device, Notification } from '@/types'
import { ChevronRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface NotitificationItemProps {
  isRead?: boolean
  notification: Notification
  refresh: () => void
}

function NotificationItem({ isRead, notification, refresh }: NotitificationItemProps) {
  const [device, setDevice] = useState<Device>()

  async function markAsReadAndRedirect() {
    await markNotificationsAsRead(notification.$id!)

    if (notification.type === 'push') {
      refresh()
      return
    }

    window.location.href = `/meus-dispositivos?id=${device?.$id}`
  }

  
  useEffect(() => {
    const fetchDevice = async () => {
      if (notification.type !== 'push') {
        const event = await getEventById(notification.event_id!)
        const device = await getDeviceById(event.id_device!)
        
        setDevice(device)
      }
    }

    fetchDevice()
  }, [])

  return (
    <div className='w-full rounded-lg ring-1 ring-zinc-200 flex px-4 py-6 gap-6'>
      <span className={cn('w-2 h-full rounded-lg', isRead ? 'bg-zinc-400' : 'bg-secondary')} />
      <div className='flex flex-col gap-2'>
        <h1 className='font-medium text-lg'>
          {
            notification.type === 'push' ? (
              notification.title
            ) : (
              'Seu dispositivo foi recuperado'
            )
          }
        </h1>
        <p className='text-sm'>

          {
            notification.type === 'push' ? (
              notification.message
            ) : (
              `Informamos que o seu dispositivo ${device?.phone_model}, foi localizado e recuperado pela polícia. Acompanhe todas as atualizações desta ocorrência na página de recuperação.`
            )
          }
        </p>
        <button onClick={markAsReadAndRedirect} type='button' className='text-secondary underline text-sm mt-2 flex self-end'>
          ir para página de recuperação
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>
    </div>
  )
}

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [NewNotifications, setNewNotifications] = useState<Notification[]>([])
  const [oldNotifications, setOldNotifications] = useState<Notification[]>([])
  const [refetch, setRefetch] = useState(false)

  async function refresh() {
    setRefetch(!refetch)
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = await account.get()
      
      const notifications = await getNotifications(user.$id)

      const filteredNotifications = notifications.map(notification => ({
        ...notification,
        time_event: new Date(notification.$createdAt!),
      }))

      const hoursAgo = 24 * 60 * 60 * 1000

      const newNotificationsSplit = filteredNotifications.filter(notification => notification.time_event > new Date(Date.now() - hoursAgo))
      const oldNotificationsSplit = filteredNotifications.filter(notification => notification.time_event < new Date(Date.now() - hoursAgo))

      const newNotifications = newNotificationsSplit.sort((a, b) => b.time_event.getTime() - a.time_event.getTime())
      const oldNotifications = oldNotificationsSplit.sort((a, b) => b.time_event.getTime() - a.time_event.getTime())
      
      setNewNotifications(newNotifications)
      setOldNotifications(oldNotifications)

      setNotifications(notifications)
    }

    fetchNotifications()
  }, [refetch])

  return (
    <div className='w-full min-h-screen flex flex-col rounded-lg bg-white px-4 py-6 gap-4'>
      <h1 className='font-semibold text-lg'>Notificação em destaque</h1>
      {
        NewNotifications.length > 0 ? (
          NewNotifications.map(notification => (
            <NotificationItem key={notification.$id} notification={notification} isRead={notification.is_read} refresh={refresh} />
          ))

        ) : (
          <p className='text-sm text-zinc-500 self-center'>Nenhuma notificação em destaque</p>
        )
      }
      <h1 className='font-semibold text-lg'>Notificação anteriores</h1>
      {
        oldNotifications.length > 0 ? (
          oldNotifications.map(notification => (
            <NotificationItem key={notification.$id} notification={notification} isRead={notification.is_read} refresh={refresh} />
          ))

        ) : (
          <p className='text-sm text-zinc-500 self-center'>Nenhuma notificação anteriores</p>
        )
      }
    </div>
  )
}

