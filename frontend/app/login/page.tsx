import { FAQ } from "@/components/FAQ";
import loginImages from '../../assets/images/login-images.png'
import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";

export default function Login() {
  return (
    <>
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <div className="flex items-center w-full">
          <Image src={loginImages} alt="login images" height={720} />
          <div className="flex w-full justify-center">
            <LoginForm />
          </div>
        </div>
        <FAQ />
      </main>
    </>
  );
}
