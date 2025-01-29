'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { account } from "@/lib/appwrite"
import { ChartColumnBig, CirclePlus, FileWarning, Home, LogOut, Pencil, Plus, Siren, Smartphone, Table, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { CustomSidebarTrigger } from "./CustomSidebarTrigger"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { IoMdAddCircle } from "react-icons/io";
import { PiUsersThreeFill } from "react-icons/pi";
import { useState } from "react"
import { LoadingToast } from "./LoadingToast"
import { toast } from "react-toastify"

const devicesGroup = [
  {
    title: "Meus dispositivos",
    url: "meus-dispositivos",
    icon: <Smartphone />,
  },
  {
    title: "Cadastrar novo dispositivo",
    url: "cadastrar-dispositivo",
    icon: <div className="relative">
      <Smartphone className="size-4" />
      <IoMdAddCircle className="absolute top-0.5 -right-0.5 bg-white rounded-full size-3" />
    </div>,
  },
]

const securityGroup = [
  {
    title: "Contatos de confiança",
    url: "criar-alerta",
    icon: <PiUsersThreeFill />,
  },
  {
    title: "Alertar autoridades",
    url: "meus-alertas",
    icon: <Siren />,
  },
  {
    title: "Criar boletim de ocorrência",
    url: "perfil",
    icon: <FileWarning />,
  },

  {
    title: "Editar perfil",
    url: "perfil",
    icon: <Pencil />,
  },
]

const itemsForAdmins = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: <ChartColumnBig />,
  },
  {
    title: "Usuários cadastrados",
    url: "usuarios",
    icon: <PiUsersThreeFill />,
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
      position: "top-center",
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
      position: "top-center",
      closeOnClick: true,
    })
    router.push(`http://localhost:3000/${url}`)
  }

  return (
    <>
      <Sidebar collapsible="icon" className="text-zinc-900 z-[1] shadow-md h-full">
        <CustomSidebarTrigger />
        <SidebarContent className="bg-white flex flex-col">
          <div className="h-32 w-full flex items-end justify-center gap-3">
            <span className="w-[90%] rounded-lg h-0.5 bg-zinc-300" />
          </div>

          {
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
          }


          <SidebarGroup className="flex flex-col gap-2 px-2">
            <SidebarGroupLabel className="uppercase">Dispositivos</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-1 font-bold">
                {
                  admin ? (
                    itemsForAdmins.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={pathname === item.url}>
                          <button onClick={() => showLoadingToast(item.url)}>
                            {
                              item.icon
                            }
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  ) : (
                    devicesGroup.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={pathname === item.url}>
                          <button onClick={() => showLoadingToast(item.url)}>
                            {
                              item.icon
                            }
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )))
                }
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="flex flex-col gap-2">
            <SidebarGroupLabel className="uppercase">segurança</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-1 font-bold">
                {
                  securityGroup.map((item) => (
                    <SidebarMenuItem key={item.title} title="Em breve">
                      <SidebarMenuButton asChild isActive={pathname === item.url}>
                        <button onClick={() => showLoadingToast(item.url)} disabled>
                          {
                            item.icon
                          }
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                }

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button onClick={logout} className="text-red-500 flex gap-1 self-start">
                      <LogOut />
                      Sair
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent >
      </Sidebar >

    </>
  )
}
