'use client'

import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname().slice(1)

  const isFullScreen = pathname === 'map/ocorrencias'

  const routes = [
    {
      name: 'home',
      value: 'Início',
    },
    {
      name: 'meus-dispositivos',
      value: 'Meus dispositivos',
    },
    {
      name: 'cadastrar-dispositivo',
      value: 'Cadastrar dispositivo',
    },
    {
      name: 'dashboard',
      value: 'Dashboard',
    },
    {
      name: 'usuarios',
      value: 'Usuários',
    }
  ]

  return (
    isFullScreen &&
    (
      <header className="flex items-center drop-shadow-md bg-procura-ai-blue self-end w-full h-16">
        <div className="w-1/5 md:w-[35%] lg:w-[26%] xl:w-1/5 h-1" />
        <span className="text-xl text-white">
          {routes.find(route => route.name === pathname)?.value}
        </span>
      </header>
    )
  )
}