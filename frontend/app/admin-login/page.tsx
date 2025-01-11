import { LoginForm } from "@/components/Forms/LoginForm";

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
