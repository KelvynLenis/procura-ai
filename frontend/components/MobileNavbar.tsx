
import perfilIcon from '../assets/icons/perfil.svg'
import phoneIcon from '../assets/icons/phone.svg'
import alertIcon from '../assets/icons/alert.svg'
import phonePlusIcon from '../assets/icons/phone-plus.svg'
import Image from 'next/image'
import Link from 'next/link'

export function MobileNavbar() {

  return (
    <>
      <nav className="w-full flex h-28 bg-zinc-100 shadow text-sm pt-4 items-center justify-center">
        <ul className='grid grid-cols-4 grid-rows-2'>
          <li className='flex w-full h-full flex-col items-center justify-center text-center'>
            <Link href={'/perfil'}>
              <Image src={perfilIcon} alt="meu perfil" width={50} />
            </Link>
          </li>
          <li className='flex w-full h-full flex-col items-center justify-center text-center text-clip'>
            <Link href={'/home'}>
              <Image src={phoneIcon} alt="meus dispositivos" width={50} />
            </Link>
          </li>
          <li className='flex w-full h-full flex-col items-center justify-center text-center gap-2.5'>
            <Link href={'/home'}>
              <Image src={alertIcon} alt="criar alerta" width={50} />
            </Link>

          </li>
          <li className='flex w-full h-full flex-col items-center justify-center text-center'>
            <Link href={'/cadastrar-dispositivo'}>
              <Image src={phonePlusIcon} alt="cadastar novo dispositivo" width={50} />
            </Link>
          </li>
          <li className='text-center'>
            <Link href={'/perfil'}>
              Meu Perfil
            </Link>
          </li>

          <li className='text-center'>
            <Link href={'/home'}>
              Meus Dispositivos
            </Link>
          </li>

          <li className='text-center'>
            <Link href={'/home'}>
              Criar Alerta
            </Link>
          </li>

          <li className='text-center'>
            <Link href={'/cadastrar-dispositivo'}>
              Cadastrar dispositivo
            </Link>
          </li>
        </ul>
        {/* <ul className='flex items-center justify-center w-full text-xs'>
          <li className='flex w-full h-full flex-col items-center justify-center text-center gap-2.5'>
            <Image src={perfilIcon} alt="meu perfil" width={50} />
            <span >
              Meu Perfil
            </span>
          </li>
          <li className='flex w-full h-full flex-col items-center justify-center text-center text-clip'>
            <Image src={phoneIcon} alt="meus dispositivos" width={50} />
            <span>
              Meus Dispositivos
            </span>
          </li>
          <li className='flex w-full h-full flex-col items-center justify-center text-center gap-2.5'>
            <Image src={alertIcon} alt="criar alerta" width={50} />
            <span>
              Criar Alerta
            </span>
          </li>
          <li className='flex w-full h-full flex-col items-center justify-center text-center'>
            <Image src={phonePlusIcon} alt="cadastar novo dispositivo" width={50} />
            <span>
              Cadastrar dispositivo
            </span>
          </li>
        </ul> */}
      </nav>
    </>
  )
}
