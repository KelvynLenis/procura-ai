import { OpenSidebarTrigger } from "@/components/OpenSidebarTrigger"
import ProtectedRoute from "@/components/ProtectedRoute"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ProtectedRoute>
        <main className="min-h-screen w-screen flex pb-10">
          <SidebarTrigger />
          {children}
        </main>
      </ProtectedRoute>
    </SidebarProvider>
  )
}
