import ProtectedRoute from "@/components/ProtectedRoute"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <main className="min-h-screen h-fit w-full flex flex-col bg-[#F2F8FD]">
        <header className="flex items-center drop-shadow-md bg-procura-ai-blue self-end w-full h-16"></header>
        {children}
      </main>
      {/* <MobileNavbar /> */}
    </ProtectedRoute>
  )
}
