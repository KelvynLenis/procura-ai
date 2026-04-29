import { CompleteLogin } from "@/components/Forms/CompleteLogin";
import { CustomSidebarTrigger } from "@/components/CustomSidebarTrigger";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileNavBar } from "@/components/MobileNavBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <NotificationProvider>
        <main className="flex min-h-[calc(100svh-theme(spacing.18))] w-full flex-col overflow-hidden bg-[#F2F8FD]">
          <div className="relative flex">
            <SidebarProvider className="relative mr-10 hidden w-fit flex-col md:flex md:flex-row">
              <CustomSidebarTrigger className="absolute -left-3 top-[18px] z-10 ml-3 text-white" />
              <AppSidebar />
            </SidebarProvider>

            <div className="flex w-full flex-col items-center justify-center px-2 lg:px-0">
              <Header />
              {/* <CompleteLogin /> */}
              {children}
            </div>
          </div>
        </main>
        <Footer />
        <MobileNavBar />
      </NotificationProvider>
    </ProtectedRoute>
  );
}
