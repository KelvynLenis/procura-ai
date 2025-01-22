import { Features } from "@/components/Features";
import { FAQ } from "@/components/FAQ";
import { Hero } from "@/components/Hero";
import { Header } from "@/components/Header";
import Image from "next/image";
import logo from '../assets/icons/procura-ai-logo-header.svg'

export default function Landing() {
  return (
    <>
      <header className="shadow-xl flex items-center">
        <Image src={logo} alt="logo" className="w-28 lg:w-44" />
        <span className='lg:h-12 h-7 w-0.5 bg-secondary rounded-full' />
      </header>
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <Hero />
        <Features />
        <FAQ />
      </main>
    </>
  );
}
