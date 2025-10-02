'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ChevronRight, X } from 'lucide-react'
import Image from "next/image"
import { useEffect, useState } from 'react'
import DeviceCheck from '../assets/icons/device-check.svg'
import { Device, Notification, NotificationProps } from "@/types"
import { cn, formatDateTime } from "@/lib/utils"
import { getDeviceById } from "@/functions/device/get-device-by-id"
import Link from "next/link"
import { getNotificationsUnread } from "@/functions/notification/get-notifications-unread"
import { account } from "@/lib/appwrite"
import { Skeleton } from "./ui/skeleton"
import { markNotificationsAsRead } from "@/functions/notification/mark-as-read"

function RenderNotification({ notification } : { notification: NotificationProps }) {
  const isRecovered = notification.type === 'Recuperado'
  const [device, setDevice] = useState<Device>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDevice = async () => {
    try {
      if (notification.type === 'push') return
      const device = await getDeviceById(notification.id_device!)
      setDevice(device)
    } catch (err) {
      console.error("Erro ao buscar device:", err)
    }
    setIsLoading(false)
  }
  fetchDevice()
  }, [notification.id_device])

  return (
    <div key={notification.$id} className="w-full">
      <DropdownMenuSeparator />
      {
        isLoading ? (
          <Skeleton className="w-full h-16" />
        ) : (
          <DropdownMenuItem 
            className={`py-3 w-full flex items-start flex-col gap-2 relative ${
              isRecovered ? '' : 'hover:bg-zinc-50 cursor-pointer'
            }`}
            // onClick={() => !isRecovered && handleNotificationClick(notification)}
          >
            <div className='w-full flex h-full px-5 py-3 rounded-lg bg-blue-100/40 gap-4'>
                <Image src={DeviceCheck} alt="device-check" className="w-6 h-6 self-center" />
                <div className='flex flex-col gap-4'>
                  <div className='flex justify-between items-center'>
                    <h1 className='font-bold text-sm text-primary'>Seu dispositivo foi recuperado</h1>
                    
                    <span className='w-2 h-2 rounded-full bg-[#004EC1]'></span>
                  </div>
                  <p className='text-sm'>
                    Informamos que o seu dispositivo {device?.phone_model}, <strong className="font-semibold">foi localizado e recuperado pela polícia.</strong> 
                    Acompanhe todas as atualizações desta ocorrência na página de recuperação.
                  </p>
                  <span className='text-xs'>
                    {formatDateTime(notification.time_event)}
                  </span>

                  <span className='text-primary flex self-end text-sm underline'>
                    Acompanhar atualizações
                    <ChevronRight size={16} />
                  </span>
                </div>
              </div>
          </DropdownMenuItem>
        )
      }
    </div>
  )
}

function PreviousNotification({ notification } : {notification: Notification}) {
  const isRecovered = notification.type === 'Recuperado'
  const [device, setDevice] = useState<Device>()
  const [isLoading, setIsLoading] = useState(true)

  async function markAsReadAndRedirect() {
    await markNotificationsAsRead(notification.$id!)

    if (notification.type === 'push') { 
      window.location.href = `/notificacoes`
      return
    }

    window.location.href = `/meus-dispositivos?id=${device?.$id}`
  }

  useEffect(() => {
    const fetchDevice = async () => {
    try {
      if (notification.type === 'push') {
        setIsLoading(false)
        return
      }
      const device = await getDeviceById(notification.id_device!)
      setDevice(device)
    } catch (err) {
      console.error("Erro ao buscar device:", err)
    }
    setIsLoading(false)
  }
  fetchDevice()
  }, [notification.id_device])
  
  return (
    <div key={notification.$id} className="w-full">
      <DropdownMenuSeparator />
      {
        isLoading ? (
          <Skeleton className="w-full h-56" />
        ) : (
          <DropdownMenuItem 
            className={`py-3 w-full flex items-start flex-col gap-2 relative ${
              isRecovered ? '' : 'hover:bg-zinc-50 cursor-pointer'
            }`}
            // onClick={() => !isRecovered && handleNotificationClick(notification)}
          >
            <div className='w-full flex h-full px-5 py-3 rounded-lg bg-blue-100/40 gap-4'>
                <Image src={DeviceCheck} alt="device-check" className="w-6 h-6 self-center" />
                <div className='flex flex-col gap-4 w-full'>
                  <div className='flex justify-between items-center'>
                    <h1 className='font-bold text-sm text-primary'>
                      {
                        notification.type === 'push'
                        ? notification.title
                        : 
                          'Seu dispositivo foi recuperado'
                      }
                    </h1>
                    
                    <span className={cn('w-2 h-2 rounded-full', notification.is_read ? 'bg-zinc-400' : 'bg-[#004EC1]')}></span>
                  </div>
                  <p className='text-sm'>
                    {
                      notification.type === 'push'
                      ? notification.message
                      : 
                        (
                          <>
                            Informamos que o seu dispositivo {device?.phone_model}, <strong className="font-semibold">foi localizado e recuperado pela polícia.</strong> 
                            Acompanhe todas as atualizações desta ocorrência na página de recuperação.
                          </>
                        )
                    }
                    
                  </p>
                  <span className='text-xs'>
                    {formatDateTime(notification.$createdAt!)}
                  </span>

                  <button onClick={markAsReadAndRedirect} type='button' className='text-secondary flex self-end text-sm underline hover:opacity-70'>
                    Acompanhar atualizações
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
          </DropdownMenuItem>
        )
      }
    </div>
  )
}

interface ClientNotificationButtonProps {
  notifications: NotificationProps[]
  setNotifications: React.Dispatch<React.SetStateAction<NotificationProps[]>>
  onNotificationClick?: (notification: NotificationProps) => void
}

function ClientNotificationButton({
  notifications,
  setNotifications,
  onNotificationClick,
}: ClientNotificationButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notificationsCount, setNotificationsCount] = useState(0)
  const [previousNotifications, setPreviousNotifications] = useState<Notification[]>([])
  
  const sortedNotifications = [...notifications].sort((a, b) => {
    const dateA = new Date(a.time_event).getTime()
    const dateB = new Date(b.time_event).getTime()
    
    // Debug: verificar ordenação
    console.log('NotificationButton: Ordenando notificações', {
      a: { id: a.$id.slice(0, 8), date: a.time_event, timestamp: dateA },
      b: { id: b.$id.slice(0, 8), date: b.time_event, timestamp: dateB },
      result: dateB - dateA
    })
    
    // Retorna a diferença para ordenação decrescente (mais recente primeiro)
    return dateB - dateA
  })

  useEffect(() => {
    const fetchNotificationsUnread = async () => {
      const user = await account.get()
      
      const { documents, total } = await getNotificationsUnread(user.$id)

      setPreviousNotifications(documents)
      setNotificationsCount(total)
    }

    fetchNotificationsUnread()
  }, [notifications])

  // useEffect(() => {   
  //   setNotificationsCount(notificationsCount + 1)
  // }, [notifications])

  return (
    <DropdownMenu open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DropdownMenuTrigger className="relative bg-procura-ai-white p-2 rounded-full hover:bg-procura-ai-blue hover:ring-1 hover:ring-procura-ai-white hover:text-white transition-all duration-500">
            <Bell className="size-7" />
            {notificationsCount > 0 && (
              <span className="bg-secondary text-white rounded-full w-6 h-6 font-bold flex items-center justify-center absolute -top-1 right-3">
                {notificationsCount}
              </span>
            )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className='bg-white shadow-lg rounded-md w-96 border'>
            <div className="p-2 text-gray-700 font-semibold border-b w-full flex justify-between items-center">
              Notificações
              <button type='button' onClick={() => setIsDialogOpen(false)}>
                <X className="ml-2" size={24}/>
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto flex flex-col py-2 px-2">
              {/* { sortedNotifications.length > 0 && previousNotifications.length > 0 && 
                <p className="p-3 text-gray-500 text-sm">Notificação mais recente</p>
              } */}
              {/* {sortedNotifications.length > 0 &&
                sortedNotifications.map(notification => <RenderNotification notification={notification} />)                 
              } */}
              
              { previousNotifications.length > 0 
                ? previousNotifications.map(notification => <PreviousNotification notification={notification} />)
                : <p className="p-3 text-gray-500 text-sm">Nenhuma notificação encontrada</p>
              }

              <DropdownMenuItem className="w-full p-0">
                <Link href="/notificacoes" className="w-full text-center hover:bg-zinc-100 p-2">
                  Ver tudo
                </Link>
              </DropdownMenuItem>
            </div>
        </DropdownMenuContent>
      </DropdownMenu>
  )
}

export default ClientNotificationButton