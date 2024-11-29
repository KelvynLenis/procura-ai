import { Features } from "@/components/Features";
import { FAQ } from "@/components/FAQ";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <Hero />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
