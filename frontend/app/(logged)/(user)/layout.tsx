import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-fit">
      <SidebarProvider className="flex flex-col md:flex-row overflow-x-hidden z-[10] w-1/5 md:w-1/2 lg:w-1/3 xl:w-1/4 h-fit">
        <SidebarTrigger className="absolute z-1 top-16" />
        <AppSidebar />
      </SidebarProvider>

      {children}

    </div>
  )
}
