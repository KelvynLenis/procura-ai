import { Features } from "@/components/Features";
import { FAQ } from "@/components/FAQ";
import { Hero } from "@/components/Hero";
import Image from "next/image";
import logo from '../assets/icons/logo-text.svg'

export default function Landing() {
  return (
    <>
      <header className="shadow-xl  flex items-center h-15 pt-2 z-10 sticky bg-primary">
        <Image src={logo} alt="logo" className="h-16 -left-5 relative" />
      </header>
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <Hero />
        <Features />
        <FAQ bottom="0" homepage />
      </main>
    </>
  );
}
