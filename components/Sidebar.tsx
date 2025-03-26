'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { account } from '@/lib/appwrite'
import {
  ChartColumnBig,
  FileWarning,
  Home,
  LogOut,
  Pencil,
  Siren,
  Smartphone,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CustomSidebarTrigger } from './CustomSidebarTrigger'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IoMdAddCircle } from 'react-icons/io'
import { PiUsersThreeFill } from 'react-icons/pi'
import { useState } from 'react'
import { LoadingToast } from './LoadingToast'
import { toast } from 'react-toastify'
import logo from '../assets/icons/logo-text-2.svg'
import Image from 'next/image'
import { RiAlarmWarningFill } from 'react-icons/ri'

const devicesGroup = [
  {
    title: 'Meus dispositivos',
    url: 'meus-dispositivos',
    icon: <Smartphone />,
  },
  {
    title: 'Cadastrar novo dispositivo',
    url: 'cadastrar-dispositivo',
    icon: (
      <div className="relative">
        <Smartphone className="size-4" />
        <IoMdAddCircle className="absolute top-0.5 -right-0.5 bg-white rounded-full size-3" />
      </div>
    ),
  },
]

const securityGroup = [
  {
    title: 'Contatos de confiança',
    url: 'contatos-de-confianca',
    icon: <PiUsersThreeFill />,
  },
  {
    title: 'Alertar autoridades',
    url: 'meus-alertas',
    icon: <Siren />,
  },
  {
    title: 'Criar boletim de ocorrência',
    url: 'perfil',
    icon: <FileWarning />,
  },

  {
    title: 'Editar perfil',
    url: 'perfil',
    icon: <Pencil />,
  },
]

const itemsForAdmins = [
  {
    title: 'Dashboard',
    url: 'dashboard',
    icon: <ChartColumnBig />,
  },
  {
    title: 'Usuários cadastrados',
    url: 'usuarios',
    icon: <PiUsersThreeFill />,
  },
  {
    title: 'Alertas de dispositivos',
    url: 'alertas-de-dispositivos',
    icon: <RiAlarmWarningFill />,
  },
]

const perfilGroup = [
  {
    title: 'Editar perfil',
    url: 'perfil-admin',
    icon: <Pencil />,
  },
]

interface SidebarProps {
  admin?: boolean
}

export function AppSidebar({ admin }: SidebarProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const { isMobile, toggleSidebar } = useSidebar()

  const pathname = usePathname().slice(1)

  async function logout() {
    await account.deleteSession('current')

    setIsLoading(true)
    toast(<LoadingToast isReactToastifyComponent />, {
      autoClose: 1000,
      hideProgressBar: true,
      position: 'top-center',
      closeOnClick: true,
    })

    router.push('/')
  }

  function showLoadingToast(url: string) {
    setIsLoading(true)
    isMobile && toggleSidebar()
    toast(<LoadingToast isReactToastifyComponent />, {
      autoClose: 1000,
      hideProgressBar: true,
      position: 'top-center',
      closeOnClick: true,
    })
    router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/${url}`)
  }

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="text-zinc-900 z-[1] shadow-md h-full"
      >
        <CustomSidebarTrigger />
        <SidebarContent className="bg-white flex flex-col">
          <div className="h-40 w-full flex flex-col items-center justify-center gap-1">
            <Image src={logo} alt="logo" className="" />
            <span className="w-[90%] rounded-lg h-0.5 bg-zinc-300" />
          </div>

          {/* {
            !admin && (
              <SidebarGroup className="flex px-2">
                <SidebarMenu className="flex flex-col gap-1 font-bold">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === 'home'}>
                      <button onClick={() => showLoadingToast('/home')}>
                        <Home />
                        <span>Início</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            )
          } */}

          <SidebarGroup className="flex flex-col gap-2 px-2">
            <SidebarGroupLabel className="uppercase">
              {admin ? 'Gerenciamento' : 'Dispositivos'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-1 font-bold">
                {admin
                  ? itemsForAdmins.map(item => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <button
                            type="button"
                            onClick={() => showLoadingToast(item.url)}
                          >
                            {pathname === item.url && (
                              <span className="w-0.5 h-full absolute left-0 rounded-xl bg-procura-ai-dark-yellow" />
                            )}
                            {item.icon}
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  : devicesGroup.map(item => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <button
                            type="button"
                            onClick={() => showLoadingToast(item.url)}
                          >
                            {pathname === item.url && (
                              <span className="w-0.5 h-full absolute left-0 rounded-xl bg-procura-ai-dark-yellow" />
                            )}
                            {item.icon}
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="flex flex-col gap-2">
            <SidebarGroupLabel className="uppercase">
              {admin ? 'Perfil' : 'Segurança'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-1 font-bold">
                {admin
                  ? perfilGroup.map(item => (
                      <SidebarMenuItem key={item.title} title="Em breve">
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <button
                            type="button"
                            onClick={() => showLoadingToast(item.url)}
                          >
                            {item.icon}
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  : securityGroup.map(item => (
                      <SidebarMenuItem key={item.title} title="Em breve">
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <button
                            type="button"
                            onClick={() => showLoadingToast(item.url)}
                            disabled={item.url !== 'contatos-de-confianca'}
                          >
                            {item.icon}
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      type="button"
                      onClick={logout}
                      className="text-red-500 flex gap-1 self-start"
                    >
                      <LogOut />
                      Sair
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  )
}
