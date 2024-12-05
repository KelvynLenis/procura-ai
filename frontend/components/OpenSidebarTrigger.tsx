import { Menu } from "lucide-react"
import { useSidebar } from "./ui/sidebar"

interface OpenSidebarTriggerProps extends React.HTMLAttributes<HTMLButtonElement> { }

export function OpenSidebarTrigger({ ...props }: OpenSidebarTriggerProps) {
  const { toggleSidebar } = useSidebar()

  return <button onClick={toggleSidebar} {...props}>
    <Menu />
  </button>
}