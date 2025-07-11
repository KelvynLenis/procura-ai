import Image from 'next/image'
import Link from 'next/link'
import landingImages from '../assets/images/landing-images.png'
import line from '../assets/icons/line01.svg'
import Button from './Button'

export function Hero() {
  return (
    <section className="z-100 bg-primary w-full h-80 lg:h-fit xl:h-screen bg-hero-bg bg-repeat bg-cover items-end justify-end flex lg:items-center lg:justify-between text-lg md:text-xl lg:text-4xl text-white px-2 md:px-5 lg:px-0 py-0 z-10">
      <Image
        src={landingImages}
        alt="landing background"
        className="w-full hidden lg:w-[70%] xl:w-full lg:block h-full z-0"
      />

      <Image
        src={line}
        alt="landing line image z-0"
        className="lg:hidden absolute h-auto left-0 z-0"
      />
      <div className="flex flex-col items-end gap-4 lg:gap-5 w-full z-10">
        <span className="font-bold w-[80%] lg:w-[76%] text-end md:text-2xl md:mr-16 md:w-[60%] lg:mr-20 lg:mt-20 xl:mr-28 xl:text-4xl text-white leading-7">
          Perdeu ou teve seu celular roubado? O{''}
          <span className="text-secondary  rounded-lg px-1.5 pt-1 h-fit leading-snug">
            Procura.AÍ
          </span>{' '}
          pode te ajudar!
        </span>
        <span className="font-medium text-xs md:text-lg lg:text-xl xl:text-2xl lg:mr-20 xl:mr-28 break-words w-[65%] lg:w-full text-white text-right">
          Cadastre seus dispositivos e, se algo acontecer, acione as autoridades
          de forma rápida e segura.
          Com ajuda da tecnologia, você aumenta as chances de recuperar seu
          aparelho e ainda contribui para combater o mercado ilegal. Proteja-se
          agora e fique um passo à frente
        </span>
        <Link href={'/login'} className="self-end flex lg:self-end mb-4 lg:mb-10 lg:mr-20 xl:mr-28 xl:mt-20">
          <Button variant="blue" className="px-4 py-2 md:px-9 md:py-4 text-xl">
            Entrar
          </Button>
        </Link>
      </div>
    </section>
  )
}
