import { CustomSidebarTrigger } from "@/components/CustomSidebarTrigger"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import ProtectedRoute from "@/components/ProtectedRoute"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <main className="w-full min-h-[calc(100svh-theme(spacing.18))] flex flex-col bg-[#F2F8FD] overflow-hidden">
        <Header />
        <div className="flex relative">
          <SidebarProvider className="flex flex-col w-fit mr-10 md:flex-row relative">
            <CustomSidebarTrigger className="absolute z-1 -top-10 text-white ml-3" />
            <AppSidebar />
          </SidebarProvider>

          {children}

        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  )
}
