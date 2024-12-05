import { FAQ } from "@/components/FAQ";
import loginImages from '../../assets/images/login-images.png'
import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";

export default function Login() {
  return (
    <>
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <div className="flex items-center w-full">
          <Image src={loginImages} alt="login images" height={780} className="hidden lg:flex lg:h-[500px] xl:h-[780px]" />
          <div className="flex w-full justify-center my-5 px-3">
            <LoginForm />
          </div>
        </div>
        <FAQ />
      </main>
    </>
  );
}
