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
} from "@/components/ui/sidebar"
import { account } from "@/lib/appwrite"
import { ChartColumnBig, CirclePlus, FileWarning, Home, LogOut, Pencil, Plus, Siren, Smartphone, Table, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { CloseSidebarTrigger } from "./CloseSidebarTrigger"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { IoMdAddCircle } from "react-icons/io";
import { PiUsersThreeFill } from "react-icons/pi";

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

  const pathname = usePathname().slice(1)

  async function logout() {
    await account.deleteSession('current')

    router.push('/')
  }

  return (
    <Sidebar className="text-zinc-900 z-[1] shadow-md h-full">
      <CloseSidebarTrigger />
      <SidebarContent className="bg-white flex flex-col">
        <div className="h-32 w-full flex items-end justify-center gap-3">
          <span className="w-[90%] rounded-lg h-0.5 bg-zinc-300" />
        </div>

        {
          !admin && (
            <SidebarGroup className="flex p-0">
              <SidebarMenu className="flex flex-col gap-1 font-bold">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === 'home'}>
                    <Link href={'/home'}>
                      <Home />
                      <span>Início</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          )
        }


        <SidebarGroup className="flex flex-col gap-2 p-0">
          <SidebarGroupLabel className="uppercase">Dispositivos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1 font-bold">
              {
                admin ? (
                  itemsForAdmins.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          {
                            item.icon
                          }
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  devicesGroup.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.url}>
                        <button onClick={() => router.push(`http://localhost:3000/${item.url}`)}>
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
                      <Link href={item.url} aria-disabled>
                        {
                          item.icon
                        }
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              }

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={'/'}>
                    <button onClick={logout} className="text-red-500 flex gap-1 justify-center items-center">
                      <LogOut />
                      Sair
                    </button>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent >
    </Sidebar >
  )
}
