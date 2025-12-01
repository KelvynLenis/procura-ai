import Image from "next/image";
import { LoginForm } from "@/components/Forms/LoginForm";
import logo from "../../assets/icons/logo-text.svg";

export default function Login() {
  return (
    <>
      <header className="h-15 sticky z-10 flex items-center bg-primary px-5 pt-2 shadow-lg">
        <Image src={logo} alt="logo" className="relative -left-8 h-16" />
      </header>
      <main className="row-start-2 flex min-h-fit w-full flex-col items-center bg-primary sm:items-start">
        <div className="relative flex w-full flex-col bg-login-admin-bg bg-cover bg-center bg-no-repeat">
          <div className="flex w-full">
            <div className="hidden w-full items-center justify-center md:flex">
              {/* <Image src={logoLogin} alt="login images" /> */}
            </div>

            <LoginForm isAdminPage />
          </div>
        </div>
      </main>
    </>
  );
}
