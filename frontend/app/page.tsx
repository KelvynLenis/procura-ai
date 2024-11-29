import { Features } from "@/components/Features";
import { FAQ } from "@/components/FAQ";
import { Hero } from "@/components/Hero";

export default function Landing() {
  return (
    <>
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <Hero />
        <Features />
        <FAQ />
      </main>
    </>
  );
}
