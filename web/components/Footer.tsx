'use client'

import Image from 'next/image'
import logo from '../assets/icons/logo-footer.svg'
import fapesq from '../assets/icons/fapesq-logo.png'
import secties from '../assets/images/SECTIES_branco.png'
import gov from '../assets/icons/gov.svg'
import govFull from '../assets/icons/gov.png'
import { usePathname } from 'next/navigation'
import line from '../assets/images/line02.svg'
import { cn } from '@/lib/utils'

export function Footer({ light }: { light?: boolean }) {
  const pathname = usePathname().slice(1)

  return (
    pathname !== 'map/ocorrencias' &&
    (
      <footer className={cn("w-full relative bottom-0 mt-3 md:mt-0 flex items-center justify-start z-[20]", light ? 'bg-white' : 'bg-primary')}>
        <div className={cn('w-full flex items-center justify-start', light ? 'md:justify-between': 'md:justify-start py-0 px-8')}>
          {
            light ? (
              <>
                <Image src={logo} alt="logo" className='w-32 md:w-44 hidden sm:block' />
                <Image src={govFull} alt="logo" className='w-64 md:w-96' />
                <Image src={line} alt="logo" className='h-20 self-end hidden sm:block md:w-36' />
              </>
            ) : (
              <>
                <Image src={secties} alt="logo" className='w-52 md:w-32' />
                <Image src={gov} alt="logo" className='w-52 md:w-32 md:h-20' />
              </>
            )
          }
        </div>
      </footer>
    )
  )
}