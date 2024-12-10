import { FAQ } from "@/components/FAQ";
import loginImages from '../../assets/images/login-images.png'
import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";

export default function Login() {
  return (
    <>
      <main className="flex flex-col row-start-2 items-center justify-center sm:items-start h-screen">
        <div className="flex w-full justify-center my-5 px-3">
          <LoginForm admin />
        </div>
      </main>
    </>
  );
}
