'use client'

import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname().slice(1)

  return (
    pathname !== 'map/ocorrencias' &&
    (
      <header className="flex items-center drop-shadow-md bg-procura-ai-blue self-end w-full h-16"></header>
    )
  )
}