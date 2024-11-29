import landingBackground from '../assets/images/landing-bg.png'
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export function Hero() {
  return (
    <section className="w-full relative text-4xl text-white">
      <Image src={landingBackground} alt="landing background" className="w-full" />
      <div className="absolute top-1/3 right-10 flex flex-col items-end gap-5">
        <span className="font-medium">
          Teve seu celular <br />
        </span>
        <span className="font-extrabold">
          furtado, roubado ou perdido? <br />
        </span>
        <span className="text-primary font-extrabold text-5xl">
          A gente procura pra você! <br />
        </span>
        <span className="leading-normal tracking-wide">
          Faça o bloqueio, notificação e <br />
          rastreamento do aparelho aqui
        </span>
        <Link href={'/login'}>
          <Button className="bg-primary text-white rounded-full text-3xl px-8 py-7 shadow-md shadow-zinc-800 hover:bg-white hover:text-primary">Comece agora</Button>
        </Link>
      </div>
    </section>
  )
}