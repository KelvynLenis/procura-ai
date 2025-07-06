'use client'

import { client } from '@/lib/appwrite'
import { formatDateTime } from '@/lib/utils'
import { toZonedTime } from 'date-fns-tz'
import { Bell, ChevronRight, X } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import DeviceCheck from '../assets/icons/device-check.svg'
import Image from 'next/image'
import Link from 'next/link'

interface Notification {
  $id: string
  type: string
  description: string
  time_event: string
  id_device: string
  is_alert_on: boolean
}

interface NotificationResponse {
  payload: Notification
}

interface NotificationButtonProps {
  notifications: Notification[]
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
  onNotificationClick?: (notification: Notification) => void
}

export function NotificationButton({
  notifications,
  setNotifications,
  onNotificationClick,
}: NotificationButtonProps) {
  const [isListVisible, setIsListVisible] = useState(false)

  const handleNewNotification = useCallback((response: NotificationResponse) => {
    const { payload } = response
    const relevantTypes = [
      'Furto simples',
      'Extravio ou Perda',
      'Roubo',
      'Recuperado',
      'Regular'
    ]

    if (relevantTypes.includes(payload.type)) {
      setNotifications(prevNotifications => {
        const exists = prevNotifications.some(n => n.$id === payload.$id)
        return exists ? prevNotifications : [...prevNotifications, payload]
      })
    }
  }, [setNotifications])

  useEffect(() => {
    const unsubscribe = client.subscribe(
      `databases.${process.env.NEXT_PUBLIC_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}.documents`,
      handleNewNotification
    )

    return () => unsubscribe()
  }, [handleNewNotification])

  const toggleList = () => setIsListVisible(prev => !prev)

  const filteredNotifications = notifications.sort((a, b) => 
    new Date(b.time_event).getTime() - new Date(a.time_event).getTime()
  )

  function handleNotificationClick(notification: Notification) {
    if (notification.type === 'Recuperado') return

    if (onNotificationClick) {
      onNotificationClick(notification)
    }
  }

  function handleCloseNotification(e: React.MouseEvent, notificationId: string) {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.$id !== notificationId))
    
    if (filteredNotifications.length === 1) {
      setIsListVisible(false)
    }
  }

  function renderNotification(notification: Notification) {
    const isRecovered = notification.type === 'Recuperado'
    const baseClassName = "py-3 w-full flex items-center justify-center flex-col gap-1 border-b last:border-b-0 relative"
    const className = isRecovered 
      ? baseClassName
      : `${baseClassName} hover:bg-zinc-100 cursor-pointer`

    const content = (
      <>
        <button
          onClick={(e) => handleCloseNotification(e, notification.$id)}
          className="absolute top-2 right-2 p-1 hover:bg-zinc-200 rounded-full transition-colors"
          title="Fechar notificação"
        >
          <X size={16} />
        </button>
        <h1 className="font-bold">Novo {notification.type}</h1>
        <p className="text-sm text-gray-600 text-justify">
          <span className="font-semibold">Descrição: </span>
          {notification.description}
        </p>
        <span className="text-xs text-zinc-500">
          {formatDateTime(notification.time_event)}
        </span>
      </>
    )

    return isRecovered ? (
      <div key={notification.$id} className={className}>
        {content}
      </div>
    ) : (
      <button
        key={notification.$id}
        onClick={() => handleNotificationClick(notification)}
        className={className}
      >
        {content}
      </button>
    )
  }

  return (
    <>
      <button
        className="absolute right-10 top-3 bg-procura-ai-white p-2 rounded-full hover:bg-procura-ai-blue hover:ring-1 hover:ring-procura-ai-white hover:text-white transition-all duration-500"
        onClick={toggleList}
      >
        <Bell className="size-7" />
        {filteredNotifications.length > 0 && (
          <span className="bg-red-500 text-white rounded-full w-6 h-6 font-bold flex items-center justify-center absolute -top-1 right-3">
            {filteredNotifications.length}
          </span>
        )}
      </button>
      {isListVisible && (
        <div className="absolute right-0 top-12 bg-white shadow-lg rounded-md w-96 border z-100">
          <div className="p-2 text-gray-700 font-semibold border-b w-full flex justify-between items-center">
            Notificações
            <button onClick={() => setIsListVisible(false)} type='button'>
              <X className="ml-2" size={24}/>
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto flex flex-col items-center justify-center py-2 px-2">
            <div className='w-full flex h-full px-5 py-3 rounded-lg bg-blue-100/40 gap-4'>
              <Image src={DeviceCheck} alt="device-check" className="w-6 h-6 self-center" />
              <div className='flex flex-col gap-4'>
                <div className='flex justify-between items-center'>
                  <h1 className='font-bold text-sm text-primary'>Seu dispositivo foi recuperado</h1>
                  
                  <span className='w-2 h-2 rounded-full bg-[#004EC1]'></span>
                </div>
                <p className='text-sm'>
                  Informamos que o seu dispositivo  Redmi Note 7, registrado como roubado foi localizado e recuperado pela polícia. 
                  Acompanhe todas as atualizações desta ocorrência na página de recuperação.
                </p>
                <span className='text-xs'>
                  Hoje - 06/05/2025
                </span>

                <span className='text-primary flex self-end text-sm underline'>
                  Acompanhar atualizações
                  <ChevronRight size={16} />
                </span>
              </div>
            </div>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => renderNotification(notification))
            ) : (
              <p className="p-3 text-gray-500 text-sm">Nenhuma notificação</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
