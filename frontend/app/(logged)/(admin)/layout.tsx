import { CustomSidebarTrigger } from "@/components/CustomSidebarTrigger"
import { Header } from "@/components/Header"
import ProtectedRoute from "@/components/ProtectedRoute"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute admin>
      <main className="min-h-screen h-fit w-full flex flex-col bg-[#F2F8FD] overflow-hidden">
        <Header />
        <div className="flex h-fit">
          <SidebarProvider className="flex flex-col md:flex-row overflow-x-hidden z-[10] w-1/5 md:w-1/2 lg:w-1/3 xl:w-1/4 h-fit">
            <CustomSidebarTrigger className="absolute z-1 top-16" />
            <AppSidebar admin />
          </SidebarProvider>

          {children}

        </div>
      </main>
    </ProtectedRoute>
  )
}
