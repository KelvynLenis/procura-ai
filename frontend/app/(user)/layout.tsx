import { OpenSidebarTrigger } from "@/components/OpenSidebarTrigger"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <main className="min-h-screen w-screen flex overflow-y-scroll pb-10">
        <SidebarTrigger />
        <AppSidebar />
        {children}
      </main>
    </SidebarProvider>
  )
}
