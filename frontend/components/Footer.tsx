import Image from 'next/image'
import logo from '../assets/icons/logo-footer.svg'
import fapesq from '../assets/icons/fapesq-logo.png'
import gov from '../assets/icons/gov.png'

export function Footer() {

  return (
    <footer className="w-full bg-secondary flex items-center gap-20">
      <div className='flex items-center gap-3'>
        <Image src={logo} alt="logo" />

        <span className='h-12 w-0.5 bg-primary rounded-full' />
      </div>

      <div className='w-1/3 flex justify-center gap-10'>
        <Image src={fapesq} alt="logo" />
        <Image src={gov} alt="logo" />
      </div>
    </footer>
  )
}