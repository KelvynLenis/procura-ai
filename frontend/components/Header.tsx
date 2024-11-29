import Image from "next/image";
import logo from '../assets/icons/procura-ai-logo-header.svg'

export function Header() {

  return (
    <header className="shadow-xl flex items-center">
      <Image src={logo} alt="logo" width={200} height={100} />
      <span className='h-12 w-0.5 bg-secondary rounded-full' />
    </header>
  )
}