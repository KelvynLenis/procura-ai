import { X } from "lucide-react"
import { useSidebar } from "./ui/sidebar"

interface CloseSidebarTriggerProps extends React.HTMLAttributes<HTMLButtonElement> { }

export function CloseSidebarTrigger({ ...props }: CloseSidebarTriggerProps) {
  const { toggleSidebar } = useSidebar()

  return <button onClick={toggleSidebar} {...props}>
    <X />
  </button>
}