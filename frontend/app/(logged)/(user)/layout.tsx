import { MobileNavbar } from "@/components/MobileNavbar"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <SidebarProvider className="absolute">
        <SidebarTrigger className="hidden lg:absolute z-10 top-16" />
        <AppSidebar />
      </SidebarProvider> */}
      {children}
    </>
  )
}
