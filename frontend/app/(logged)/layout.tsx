import { Header } from "@/components/Header"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <ProtectedRoute>
      <main className="min-h-screen h-fit w-full flex flex-col bg-[#F2F8FD] overflow-hidden">
        <Header />
        {children}
      </main>
    </ProtectedRoute>
  )
}
