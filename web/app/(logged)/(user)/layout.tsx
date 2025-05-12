import { CustomSidebarTrigger } from '@/components/CustomSidebarTrigger'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AppSidebar } from '@/components/Sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <main className="w-full min-h-[calc(100svh-theme(spacing.18))] flex flex-col bg-[#F2F8FD] overflow-hidden">
        <div className="flex relative">
          <SidebarProvider className="flex flex-col w-fit mr-10 md:flex-row relative">
            <CustomSidebarTrigger className="absolute z-10 top-[18px] -left-3 text-white ml-3" />
            <AppSidebar />
          </SidebarProvider>

          <div className="flex flex-col w-full">
            <Header />
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  )
}
