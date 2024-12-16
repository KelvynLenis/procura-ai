import { OpenSidebarTrigger } from "@/components/OpenSidebarTrigger"
import ProtectedRoute from "@/components/ProtectedRoute"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import logo from '../../assets/icons/procura-ai-logo-header.svg'
import Image from "next/image";
import { MobileNavbar } from "@/components/MobileNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <main className="min-h-screen h-full w-full flex pb-10">
        {/* <MobileNavbar /> */}
        <div className="flex flex-col h-full w-full">
          <header className="flex items-center">
            <Image src={logo} alt="logo" className="w-36 lg:w-44" />
          </header>
          {children}
        </div>
      </main>
      <MobileNavbar />
    </ProtectedRoute>
  )
}
