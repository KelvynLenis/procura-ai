import { RegisterForm } from "@/components/Forms/RegisterForm";
import loginImages from "../../assets/images/landing-image.png";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import logo from "../../assets/icons/logo-text.svg";

export default function Login() {
  return (
    <>
      <header className="shadow-lg bg-primary flex items-center h-15 pt-2 px-5 z-10 sticky">
        <Image src={logo} alt="logo" className="h-16 -left-8 relative" />
      </header>
      <main className="flex flex-col row-start-2 items-center sm:items-start min-h-fit h-full">
        <div className="flex items-center w-full">
          <Image
            src={loginImages}
            alt="login images"
            height={780}
            className="hidden lg:flex lg:h-[500px] xl:h-[780px] xl:-mt-36"
          />
          <div className="flex w-full justify-center my-5 px-3">
            <RegisterForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
