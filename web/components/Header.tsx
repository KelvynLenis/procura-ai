'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-toastify'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from './ui/skeleton'
import { LoadingToast } from './LoadingToast'

import { getUserId } from '@/functions/user/get-user-id'
import { getUser } from '@/functions/user/get-user'
import { NotificationProps, OccurrencesProps, User } from '@/types'

import { Pencil } from 'lucide-react'

import logo from '../assets/icons/logo.svg'
import { AdminNotificationButton } from './AdminNotificationButton'
import { joinDevicesEventsUsers } from '@/functions/occurences/get-occurrences'
import ClientNotificationButton from './ClientNotificationButton'

// Importação condicional do contexto
let useNotification: any = null
try {
  const notificationModule = require('@/contexts/NotificationContext')
  useNotification = notificationModule.useNotification
} catch {
  // Contexto não disponível
}

interface HeaderProps {
  isAdmin?: boolean
}

export function Header({ isAdmin }: HeaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imgPreview, setImgPreview] = useState('')
  const [user, setUser] = useState<User>({} as User)

  // Usar contexto apenas para admins
  let notificationData = {
    notifications: [] as NotificationProps[],
    setNotifications: () => {},
    handleNotificationClick: (notification: NotificationProps) => {},
    occurrences: [] as OccurrencesProps[],
  }

  if (useNotification) {
    try {
      notificationData = useNotification()
    } catch (error) {
      console.warn('Contexto de notificação não disponível:', error)
    }
  }

  const {
    notifications,
    setNotifications,
    handleNotificationClick,
    occurrences,
  } = notificationData

  const router = useRouter()
  const pathname = usePathname().slice(1)
  
  const isFullScreen = pathname === 'map/ocorrencias'

  const routes = [
    {
      name: 'home',
      value: 'Início',
    },
    {
      name: 'meus-dispositivos',
      value: 'Meus dispositivos',
    },
    {
      name: 'cadastrar-dispositivo',
      value: 'Cadastrar dispositivo',
    },
    {
      name: 'dashboard',
      value: 'Dashboard',
    },
    {
      name: 'usuarios',
      value: 'Usuários',
    },
    {
      name: 'meus-dispositivos/edit',
      value: 'Editar dispositivo',
    },
    {
      name: 'perfil',
      value: 'Editar perfil',
    },
    {
      name: 'perfil-admin',
      value: 'Editar perfil',
    },
    {
      name: 'contatos-de-confianca',
      value: 'Contatos de confiança',
    },
    {
      name: 'dispositivos-notificados',
      value: 'Dispositivos notificados',
    },
  ]

  const regex = /^meus-dispositivos\/edit/
  const matchedRoute = regex.test(pathname)
    ? 'Editar dispositivo'
    : routes.find(route => route.name === pathname)?.value

  function showLoadingToast(url: string) {
    setIsLoading(true)
    toast(<LoadingToast isReactToastifyComponent />, {
      autoClose: 1000,
      hideProgressBar: true,
      position: 'top-center',
      closeOnClick: true,
    })

    router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/${url}`)

    setIsLoading(false)
  }

  const handleNotificationClickLocal = (notification: NotificationProps) => {
    handleNotificationClick(notification)
  }

   useEffect(() => {
      async function getData() {
        const userId = await getUserId()
        
        const userFilter = {
          method: 'equal',
          attribute: 'user_id',
          values: [userId],
        }
  
        const userData = await getUser({ filters: [userFilter] })
        
        setUser(userData[0])
        
        if (userData[0].img_url) {
          setImgPreview(userData[0].img_url)
        }
        
        setIsLoading(false)
      }
  
      getData()
    }, [])
    

  return (
    !isFullScreen && (
      <>
        <div className="absolute w-full bg-primary inset-0 z-0 h-16" />
        <header className="flex items-center drop-shadow-md md:justify-between lg:pr-16 w-full h-16">
          {/* <div className="w-1/5 md:w-[35%] lg:w-[26%] xl:w-1/5 h-1" /> */}
          <Image src={logo} alt="logo" className="w-16 md:w-20 md:hidden" />
          <span className="text-xl text-white -ml-2 lg:-ml-4">{matchedRoute}</span>
          <div className='flex items-center gap-4'>
            {
              isAdmin ? (
                <AdminNotificationButton
                  notifications={notifications}
                  setNotifications={setNotifications}
                  onNotificationClick={handleNotificationClickLocal}
                />
              ) : (
                <>
                  <ClientNotificationButton
                    notifications={notifications}
                    setNotifications={setNotifications}
                    onNotificationClick={handleNotificationClickLocal}
                  />
                </>
              )
            }
            <DropdownMenu>
              <DropdownMenuTrigger className='flex-row text-white items-center justify-center gap-2 hidden mr-2 md:flex'>
                {
                  isLoading ? (
                    <Skeleton className='size-10 bg-secondary rounded-full flex items-center justify-center' />
                  ) : (
                    imgPreview ? (
                      <Avatar>
                        <AvatarImage src={imgPreview} />
                        <AvatarFallback className='text-primary text-2xl'>
                          {
                            user.name.split(' ').length > 1
                            ? user.name.split(' ')[0][0] + user.name.split(' ')[1][0]
                            : user.name.split(' ')[0][0]
                          }
                        </AvatarFallback>
                      </Avatar>

                    ) : (
                      <span className='size-10 bg-secondary rounded-full flex items-center justify-center'>
                        {
                          user.name.split(' ').length > 1
                          ? user.name.split(' ')[0][0] + user.name.split(' ')[1][0]
                          : user.name.split(' ')[0][0]
                        }
                      </span>
                    )
                  )
                }
                <div className='flex flex-col items-start'>
                  <span>
                    {user.name}
                  </span>
                  <span>
                    {user.email}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-[17rem]'>
                <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <button onClick={() => showLoadingToast('perfil')} className='flex flex-row items-center gap-2'>
                    <Pencil size={16} />
                    Editar perfil
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      </>
    )
  )
}
