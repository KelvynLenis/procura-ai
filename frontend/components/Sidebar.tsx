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
import { ChartColumnBig, Home, LogOut, Pencil, Plus, Table } from "lucide-react"
import { useRouter } from "next/navigation"
import { CloseSidebarTrigger } from "./CloseSidebarTrigger"
import Link from "next/link"

const items = [
  {
    title: "Meus dispositivos",
    url: "home",
    icon: Home,
  },
  {
    title: "Cadastrar novo dispositivo",
    url: "cadastrar-dispositivo",
    icon: Plus,
  },
  {
    title: "Editar perfil",
    url: "perfil",
    icon: Pencil,
  },
]

const itemsForAdmins = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: ChartColumnBig,
  },
  {
    title: "Usuários cadastrados",
    url: "usuarios",
    icon: Table,
  },
  {
    title: "Editar perfil",
    url: "perfil-admin",
    icon: Pencil,
  },
]

interface SidebarProps {
  admin?: boolean
}

export function AppSidebar({ admin }: SidebarProps) {
  const router = useRouter()

  async function logout() {
    await account.deleteSession('current')

    router.push('/')
  }

  return (
    <Sidebar className="text-zinc-900 z-[1] shadow-md h-screen">
      <SidebarContent className="bg-white flex flex-col">
        <div className="h-32 w-full flex items-center justify-center gap-3 shadow-md">
          <span className="w-14 h-14 rounded-full bg-zinc-400"></span>

          <div className="flex flex-col">
            <span>Kelvyn Lenis</span>
            <span>status: <span className="text-emerald-400">Seguro</span></span>
          </div>
        </div>


        <SidebarGroup className="flex flex-col gap-2">
          <SidebarGroupLabel className="uppercase">Dispositivos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1 font-bold">
              {
                admin ? (
                  itemsForAdmins.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          {/* <item.icon /> */}
                          <span>{item.title}</span>
                        </Link>
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

              <SidebarMenuItem>
                <SidebarMenuButton asChild >
                  <Link href={'/'}>
                    <span className="menu-active w-1 h-full flex bg-yellow-300" />
                    <span>Contatos de confiança</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild >
                  <Link href={'/'}>
                    <span>Alertar autoridades</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={'/'}>
                    <span>Criar boletim de ocorrência</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>


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
