import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import landingImages from '../assets/images/landing-images.png'


export function Hero() {
  return (
    <section className="z-100 w-full h-screen bg-hero-bg bg-repeat flex items-center justify-between text-lg md:text-xl lg:text-4xl text-white px-2 md:px-5 lg:px-10 py-7 z-10">
      <Image src={landingImages} alt="landing background" className="w-full hidden lg:block" />
      <div className="flex flex-col items-end gap-4 lg:gap-5">
        <span className="font-bold w-[80.5%] text-end text-xl lg:text-5xl text-primary">
          Perdeu ou teve seu celular roubado? O <span className="text-white bg-primary rounded-lg px-2 py-0">Procura.AÍ</span>pode te ajudar
        </span>
        <span className="font-semibold lg:text-2xl break-words w-9/12 text-procura-ai-black text-end">
          Cadastre seus dispositivos e, se algo acontecer, acione as autoridades de forma rápida e segura. <br />
          Com ajuda da tecnologia, você aumenta as chances de recuperar seu aparelho e ainda contribui para combater o mercado ilegal.
          Proteja-se agora e fique um passo à frente
        </span>
        <Link href={'/login'} className="self-center flex lg:self-end">
          <Button className="bg-primary font-semibold text-xl text-white rounded-full w-fit px-8 py-6 self-center shadow-md shadow-zinc-800 hover:bg-white hover:text-primary">Entrar</Button>
        </Link>
      </div>
    </section>
  )
}