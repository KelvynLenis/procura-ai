import { AppSidebar } from "@/components/Sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar admin />
      {children}
    </>
  )
}
