import { CustomSidebarTrigger } from "@/components/CustomSidebarTrigger"
import { Header } from "@/components/Header"
import ProtectedRoute from "@/components/ProtectedRoute"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <main className="min-h-screen h-fit w-full flex flex-col bg-[#F2F8FD] overflow-hidden">
        <Header />
        <div className="flex h-fit">
          <SidebarProvider className="flex flex-col w-fit mr-10 md:flex-row ">
            <CustomSidebarTrigger className="absolute z-1 top-16" />
            <AppSidebar />
          </SidebarProvider>

          {children}

        </div>
      </main>
    </ProtectedRoute>
  )
}
