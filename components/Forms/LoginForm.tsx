"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "../Input";
import Link from "next/link";
import { account } from "@/lib/appwrite";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { LoadingToast } from "../LoadingToast";
import Button from "../Button";
import { login } from "@/functions/auth/login";
import { updateLastAccess } from "@/functions/auth/update-last-access";
import { GovBrButton } from "@/components/GovBr";
import Image from "next/image";
import logo from "../../assets/icons/logo-admin.png";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});
login;
export function LoginForm({ isAdminPage }: { isAdminPage?: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const pathname = window.location.hostname;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const callFunction = async () => {
        try {
          const { isAdmin, userId, userStatus } = await login(
            values.email,
            values.password,
          );

          if (isAdminPage && !isAdmin) {
            toast.error("Acesso negado");
            await account.deleteSession("current");
            return;
          }

          if (!isAdminPage && isAdmin) {
            toast.error("Acesso negado");
            await account.deleteSession("current");
            return;
          }

          if (userStatus === "Inativo") {
            toast.error("Esse usuário foi desativado.");
            await account.deleteSession("current");
            return;
          }

          await updateLastAccess(userId);

          setIsLoading(true);
          router.push(isAdmin ? "/dashboard" : "/meus-dispositivos");
          toast.success("Logado com sucesso");
        } catch (error: any) {
          if (error.message?.match(/password/)) {
            form.setError("email", { message: "Email ou senha incorretos" });
            form.setError("password", { message: "Email ou senha incorretos" });
            toast.error("Email ou senha incorretos");
            return;
          }

          toast.error("Erro ao fazer login");
          console.error("Erro ao fazer login:", error.message);
        }
      };

      toast.promise(callFunction(), {
        pending: "Logando...",
      });
    } catch (error: any) {
      form.setError("email", { message: "Email ou senha incorretos" });
      form.setError("password", { message: "Email ou senha incorretos" });
      toast.error(`Error: ${error.message}`);
      console.error("Erro ao fazer login:", error);
    }
  }

  function showLoadingToast() {
    setIsLoading(true);
  }

  useEffect(() => {
    const getSession = async () => {
      try {
        const sessions = await account.get();
        if (sessions.status) {
          await account.deleteSession("current");
        }
      } catch (error: any) {
        console.error("Erro:", error.message);
      }
    };

    getSession();
  }, []);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-[calc(100svh-theme(spacing.19))] w-full flex-col items-center gap-4 bg-zinc-50 px-8 py-5 md:w-[500px]"
        >
          {isAdminPage ? (
            <div className="relative">
              <Image src={logo} alt="logo" className="" />
              <span className="absolute bottom-7 right-6">Administrador</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Image src={logo} alt="logo" className="" />

              <h3 className="text-center font-medium">
                Proteja-se agora e fique um passo à frente
              </h3>
            </div>
          )}

          {pathname === "localhost" && (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="ml-4 pl-5 font-bold text-zinc-700">
                      E-mail
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Email"
                        {...field}
                        className="w-64 self-center rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="ml-4 pl-5 font-bold text-zinc-700">
                      Senha
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Senha"
                        {...field}
                        className="w-64 self-center rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <span
                aria-disabled
                title="Em breve"
                className="cursor-default self-start pl-10 text-sm underline aria-disabled:text-zinc-700"
              >
                Esqueci minha senha
              </span> */}

              <Button
                type="submit"
                variant="blue"
                className="mb-5 !w-40 text-base"
              >
                Entrar
              </Button>
              <span className="h-[1px] w-full rounded-full bg-primary" />
            </>
          )}

          {!isAdminPage && (
            <div className="flex w-full flex-col gap-9">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center">
                  <GovBrButton className="w-full bg-[#396DC0] text-base" />
                </div>
              </div>

              <span className="h-[1px] w-full rounded-full bg-primary" />

              <div className="flex w-full flex-col gap-3">
                {/* <span className="font-bold self-center">Não possui conta?</span>
                  <Link
                    href={"/cadastro"}
                    className="flex items-center justify-center"
                  >
                    <Button
                      onClick={showLoadingToast}
                      type="button"
                      variant="black"
                      className="text-base !w-40"
                    >
                      Cadastre-se
                    </Button>
                  </Link> */}

                <Link
                  href={"/login-admin"}
                  className="hidden items-center justify-center text-secondary underline hover:opacity-70 lg:flex"
                >
                  Entrar como administrador
                </Link>
              </div>
            </div>
          )}
        </form>
      </Form>

      {isLoading && <LoadingToast />}
    </>
  );
}
