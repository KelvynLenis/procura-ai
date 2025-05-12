'use client'

import { usePathname } from 'next/navigation'

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
    },
    {
      name: 'meus-dispositivos/edit',
      value: 'Editar dispositivo',
    },
    {
      name: 'perfil',
      value: 'Editar perfil',
    },
    {
      name: 'perfil-admin',
      value: 'Editar perfil',
    },
    {
      name: 'contatos-de-confianca',
      value: 'Contatos de confiança',
    },
    {
      name: 'dispositivos-notificados',
      value: 'Dispositivos notificados',
    },
  ]
  const regex = /^meus-dispositivos\/edit/
  const matchedRoute = regex.test(pathname)
    ? 'Editar dispositivo'
    : routes.find(route => route.name === pathname)?.value

  return (
    !isFullScreen && (
      <>
        <div className="absolute w-full bg-primary inset-0 z-0 h-16" />
        <header className="flex items-center drop-shadow-md  w-full h-16">
          {/* <div className="w-1/5 md:w-[35%] lg:w-[26%] xl:w-1/5 h-1" /> */}
          <span className="text-xl text-white lg:-ml-4">{matchedRoute}</span>
        </header>
      </>
    )
  )
}
