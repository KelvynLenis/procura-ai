'use client'

import { Menu, X } from "lucide-react"
import { useSidebar } from "./ui/sidebar"

interface CustomSidebarTriggerProps extends React.HTMLAttributes<HTMLButtonElement> { }

export function CustomSidebarTrigger({ ...props }: CustomSidebarTriggerProps) {
  const { state, toggleSidebar } = useSidebar()

  return (
    state === "expanded" ? (
      <button className="absolute top-4 right-4" onClick={toggleSidebar} {...props}>
        <X />
      </button>
    ) : (
      <button className="absolute top-4 right-4" onClick={toggleSidebar} {...props}>
        <Menu />
      </button>
    )
  )
}