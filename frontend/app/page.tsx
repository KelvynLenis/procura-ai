import { Features } from "@/components/Features";
import { FAQ } from "@/components/FAQ";
import { Hero } from "@/components/Hero";
import { Header } from "@/components/Header";

export default function Landing() {
  return (
    <>
      <Header />
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <Hero />
        <Features />
        <FAQ />
      </main>
    </>
  );
}
