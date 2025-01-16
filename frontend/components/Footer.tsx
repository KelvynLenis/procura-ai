import Image from 'next/image'
import logo from '../assets/icons/logo-footer.svg'
import fapesq from '../assets/icons/fapesq-logo.png'
import secties from '../assets/images/SECTIES_branco.png'
import gov from '../assets/icons/gov.png'

export function Footer() {

  return (
    <footer className="w-full sticky bg-procura-ai-blue flex items-center justify-center px-2 py-3 z-[20]">
      <div className='w-full lg:w-1/3 flex items-center justify-center'>
        <Image src={secties} alt="logo" className='w-32 md:w-44' />
        <Image src={gov} alt="logo" className='w-28 md:w-32' />
      </div>
    </footer>
  )
}