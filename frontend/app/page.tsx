import { LoginForm } from "@/components/LoginForm";

export default function Home() {
  return (
    <div>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <LoginForm />
      </main>
    </div>
  );
}
