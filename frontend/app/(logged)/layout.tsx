import { OpenSidebarTrigger } from "@/components/OpenSidebarTrigger"
import ProtectedRoute from "@/components/ProtectedRoute"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import logo from '../../assets/icons/procura-ai-logo-header.svg'
import Image from "next/image";
import { MobileNavbar } from "@/components/MobileNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <main className="min-h-screen h-full w-full flex flex-col">
        {/* <div className="flex flex-col h-screen w-full">
        </div> */}
        <header className="flex items-center">
          <Image src={logo} alt="logo" className="w-36 lg:w-44" />
        </header>
        {children}
      </main>
      <MobileNavbar />
    </ProtectedRoute>
  )
}
