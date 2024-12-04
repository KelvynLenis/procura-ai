import landingBackground from '../assets/images/landing-bg.png'
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export function Hero() {
  return (
    <section className="w-full flex items-center justify-end md:h-[400px] lg:h-[630px] xl:h-[800px] h-full text-xs md:text-xl lg:text-4xl text-white bg-landing-bg bg-cover bg-center px-2 md:px-5 lg:px-10 py-7">
      {/* <Image src={landingBackground} alt="landing background" className="w-full" /> */}
      <div className="flex flex-col items-end gap-1 lg:gap-5">
        <span className="font-medium">
          Teve seu celular <br />
        </span>
        <span className="font-extrabold">
          furtado, roubado ou perdido? <br />
        </span>
        <span className="text-primary font-extrabold lg:text-5xl">
          A gente procura pra você! <br />
        </span>
        <span className="leading-normal tracking-wide">
          Faça o bloqueio, notificação e <br />
          rastreamento do aparelho aqui
        </span>
        <Link href={'/login'}>
          <Button className="bg-primary text-white rounded-full lg:text-3xl lg:px-8 lg:py-7 shadow-md shadow-zinc-800 hover:bg-white hover:text-primary">Comece agora</Button>
        </Link>
      </div>
    </section>
  )
}