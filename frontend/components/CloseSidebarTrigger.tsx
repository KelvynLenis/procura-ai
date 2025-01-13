import { X } from "lucide-react"
import { useSidebar } from "./ui/sidebar"

interface CloseSidebarTriggerProps extends React.HTMLAttributes<HTMLButtonElement> { }

export function CloseSidebarTrigger({ ...props }: CloseSidebarTriggerProps) {
  const { toggleSidebar } = useSidebar()

  return <button className="absolute top-4 right-4 md:hidden" onClick={toggleSidebar} {...props}>
    <X />
  </button>
}