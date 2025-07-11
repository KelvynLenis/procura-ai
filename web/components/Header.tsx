'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LoadingToast } from './LoadingToast'
import { toast } from 'react-toastify'
import { getUserId } from '@/functions/user/get-user-id'
import { getUser } from '@/functions/user/get-user'
import { User } from '@/types'
import { Skeleton } from './ui/skeleton'

export function Header() {
  const router = useRouter()
  const pathname = usePathname().slice(1)
  const [isLoading, setIsLoading] = useState(true)
  const [imgPreview, setImgPreview] = useState('')
  const [user, setUser] = useState<User>({} as User)
  
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

   useEffect(() => {
      async function getUserData() {
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
  
      getUserData()
    }, [])

  return (
    !isFullScreen && (
      <>
        <div className="absolute w-full bg-primary inset-0 z-0 h-16" />
        <header className="flex items-center drop-shadow-md justify-between pr-16 w-full h-16">
          {/* <div className="w-1/5 md:w-[35%] lg:w-[26%] xl:w-1/5 h-1" /> */}
          <span className="text-xl text-white lg:-ml-4">{matchedRoute}</span>
          <DropdownMenu>
            <DropdownMenuTrigger className='flex flex-row text-white items-center justify-center gap-2'>
              {
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
                  <Skeleton className='w-8 h-8 rounded-full' />
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
        </header>
      </>
    )
  )
}
