import Image from "next/image";
import logo from "../../assets/icons/logo-text.svg";

// import { LoginFormMobile } from "@/components/Forms/LoginForm-mobile";

export default function Login() {
  return (
    <>
      <header className="h-15 sticky z-10 flex items-center bg-primary px-5 pt-2 shadow-lg">
        <Image src={logo} alt="logo" className="relative -left-8 h-16" />
      </header>
      <main className="row-start-2 flex h-full min-h-fit w-full flex-col items-center bg-primary sm:items-start">
        <div className="mb-0 flex h-[calc(100svh-theme(spacing.4))] w-full flex-col items-center justify-center bg-login-bg bg-cover bg-center bg-no-repeat p-2">
          {/* <LoginFormMobile />
        </div> */}
      </main>
    </>
  );
}
