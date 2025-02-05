import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import landingImages from '../assets/images/landing-images.png'


export function Hero() {
  return (
    <section className="z-100 w-full bg-zinc-100 flex items-center justify-between md:h-[400px] lg:h-[630px] xl:h-[800px] h-full text-lg md:text-xl lg:text-4xl text-white px-2 md:px-5 lg:px-10 py-7 z-10">
      <Image src={landingImages} alt="landing background" className="w-1/2" />
      <div className="flex flex-col items-end gap-1 lg:gap-5">
        <span className="font-bold w-9/12 text-end text-5xl lg:text-5xl text-primary">
          Mais segurança na
          Paraíba
        </span>
        <span className="font-semibold text-2xl break-words w-9/12 text-procura-ai-black text-end">
          Perdeu ou teve seu celular roubado? <br />
          O Procura.AÍ pode te ajudar! <br />
          Cadastre seus dispositivos e, se algo acontecer, acione as autoridades de forma rápida e segura. <br />
          Com ajuda da tecnologia, você aumenta as chances de recuperar seu aparelho e ainda contribui para combater o mercado ilegal. <br />
          Proteja-se agora e fique um passo à frente
        </span>
        <Link href={'/login'}>
          <Button className="bg-primary text-white rounded-full lg:text-3xl lg:px-8 lg:py-7 shadow-md shadow-zinc-800 hover:bg-white hover:text-primary">Comece agora</Button>
        </Link>
      </div>
    </section>
  )
}