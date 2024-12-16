import Image from 'next/image'
import logo from '../assets/icons/logo-footer.svg'
import fapesq from '../assets/icons/fapesq-logo.png'
import gov from '../assets/icons/gov.png'

export function Footer() {

  return (
    <footer className="w-full bg-secondary hidden lg:flex items-center gap-10 lg:gap-20 px-2 py-1 md:gap-20">
      <div className='flex items-center gap-3'>
        <Image src={logo} alt="logo" className='w-28 md:w-36' />

        <span className='lg:h-12 w-0.5 bg-primary rounded-full h-9' />
      </div>

      <div className='w-1/3 lg:w-1/3 flex justify-center gap-2 lg:gap-10 md:gap-5'>
        <Image src={fapesq} alt="logo" className='w-20 md:w-28' />
        <Image src={gov} alt="logo" className='w-20 md:w-28' />
      </div>
    </footer>
  )
}