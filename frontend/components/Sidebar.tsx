'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { account } from "@/lib/appwrite"
import { Home, Pencil, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { CloseSidebarTrigger } from "./CloseSidebarTrigger"
import Link from "next/link"

const items = [
  {
    title: "Seus dispositivos",
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

export function AppSidebar() {
  const router = useRouter()

  async function logout() {
    await account.deleteSession('current')

    router.push('/')
  }

  return (
    <Sidebar className="text-white bg-zinc-800">
      <SidebarContent className="bg-zinc-800 flex flex-col">
        <CloseSidebarTrigger className="self-end rounded-xl hover:bg-zinc-500 mr-2 mt-2" />
        <SidebarGroup className="flex flex-col gap-5">
          <SidebarGroupLabel className="text-xl text-white self-center">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-4">
              {
                items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              }
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-zinc-800">
        <SidebarMenu>
          <SidebarMenuItem className="">
            <SidebarMenuButton asChild>
              <button onClick={logout} className="h-10 px-2 bg-red-500 text-white flex justify-center rounded-xl hover:bg-red-600 drop-shadow-md self-end">Log Out</button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
