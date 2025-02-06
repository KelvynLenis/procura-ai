'use client'

import Image from 'next/image'
import logo from '../assets/icons/logo-footer.svg'
import fapesq from '../assets/icons/fapesq-logo.png'
import secties from '../assets/images/SECTIES_branco.png'
import gov from '../assets/icons/gov.png'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname().slice(1)

  return (
    pathname !== 'map/ocorrencias' &&
    (
      <footer className="w-full relative bottom-0  bg-procura-ai-blue flex items-center justify-start px-2 py-3 z-[20]">
        <div className='w-full lg:w-1/3 flex items-center justify-start'>
          <Image src={secties} alt="logo" className='w-32 md:w-44' />
          <Image src={gov} alt="logo" className='w-28 md:w-32' />
        </div>
      </footer>
    )
  )
}