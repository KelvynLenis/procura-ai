import { CustomSidebarTrigger } from "@/components/CustomSidebarTrigger"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import ProtectedRoute from "@/components/ProtectedRoute"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute admin>
      <main className="w-full min-h-[calc(100svh-theme(spacing.18))] flex flex-col bg-[#F2F8FD] overflow-hidden">
        <Header />
        <div className="flex h-fit">
          <SidebarProvider className="flex flex-col w-fit mr-10 md:flex-row ">
            <SidebarTrigger className="absolute z-1 top-16" />
            <AppSidebar admin />
          </SidebarProvider>

          {children}

        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  )
}
