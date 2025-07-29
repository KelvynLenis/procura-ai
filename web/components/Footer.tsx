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
      <footer className={cn("w-full relative bottom-0 md:mt-0 flex items-center justify-start z-[20]", light ? 'bg-white' : 'bg-primary py-4')}>
        <div className={cn('w-full h-20 flex items-center justify-start pl-9', light ? ' overflow-hidden': 'justify-center hidden lg:flex md:justify-start py-0 px-8 h-14 md:h-fit')}>
          {
            light ? (
              <>
                {/* <Image src={logo} alt="logo" className='w-32 md:w-44 hidden sm:block' /> */}
                <Image src={govFull} alt="logo" className='w-64 h-12 md:w-96 z-10' />
                <Image src={line} alt="logo" className='h-full absolute right-0 self-end hidden sm:block md:w-[50%] lg:w-[80%] xl:w-[90%] z-0' />
              </>
            ) : (
              <>
                <Image src={secties} alt="logo" className='w-28 md:w-auto md:h-12' />
                <Image src={gov} alt="logo" className='w-28 md:w-auto md:h-12' />
              </>
            )
          }
        </div>
      </footer>
    )
  )
}