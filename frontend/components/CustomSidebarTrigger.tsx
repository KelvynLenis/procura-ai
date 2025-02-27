'use client'

import { Menu, X } from "lucide-react"
import { useSidebar } from "./ui/sidebar"

interface CustomSidebarTriggerProps extends React.HTMLAttributes<HTMLButtonElement> { }

export function CustomSidebarTrigger({ ...props }: CustomSidebarTriggerProps) {
  const { state, open, openMobile, isMobile, toggleSidebar } = useSidebar()

  function handleClick() {
    // 
    toggleSidebar()
  }

  return (
    isMobile ? (
      openMobile ? (
        <button className="absolute top-4 right-4" onClick={handleClick} {...props}>
          <X />
        </button>
      ) : (
        <button className="absolute top-4 right-3" onClick={handleClick} {...props}>
          <Menu />
        </button>
      )
    ) : (
      open ? (
        <button className="absolute top-4 right-4" onClick={handleClick} {...props}>
          <X />
        </button>
      ) : (
        <button className="absolute top-4 right-3" onClick={handleClick} {...props}>
          <Menu />
        </button>
      )
    )
  )
}