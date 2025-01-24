import ProtectedRoute from "@/components/ProtectedRoute"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute admin>
      <main className="min-h-screen h-fit w-full flex flex-col bg-[#F2F8FD] overflow-hidden">
        {children}
      </main>
    </ProtectedRoute>
  )
}
