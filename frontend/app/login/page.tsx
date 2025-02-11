import Image from "next/image";
import loginBanner from '../../assets/images/login-banner.png'
import { LoginForm } from "@/components/Forms/LoginForm";
import { FAQ } from "@/components/FAQ";
import logo from '../../assets/icons/logo-text.svg'
import logoLogin from '../../assets/icons/logo-login.svg'
import { Footer } from "@/components/Footer";

export default function Login() {
  return (
    <>
      <header className="shadow-lg flex items-center h-15 pt-2 z-10 sticky">
        <Image src={logo} alt="logo" className="h-16 -left-8 relative" />
      </header>
      <main className="flex flex-col row-start-2 items-center sm:items-start min-h-fit w-full">
        <div className="flex relative flex-col w-full bg-login-bg bg-[length:80%_100%]">
          <div className="w-full flex">
            <div className=" w-full items-center justify-center hidden md:flex">
              <Image src={logoLogin} alt="login images" />
            </div>

            <LoginForm />
          </div>
        </div>

        <div className="relative w-full bg-[#F2F7FC]">
          <FAQ position="relative" />
        </div>
        {/* <Footer /> */}
      </main>
    </>
  );
}
