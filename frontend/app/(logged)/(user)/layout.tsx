import { Footer } from "@/components/Footer"
import { MobileNavbar } from "@/components/MobileNavbar"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SidebarProvider>
        <SidebarTrigger className="lg:hiddenz-10 top-16" />
        <AppSidebar />
        {children}
      </SidebarProvider>
    </>
  )
}
