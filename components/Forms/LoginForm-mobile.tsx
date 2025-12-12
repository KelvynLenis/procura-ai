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
export function LoginFormMobile({ isAdminPage }: { isAdminPage?: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // const pathname = window.location.hostname;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function notifyAppAfterLogin() {
    // const token = getAuthTokenSomehow(); // token, cookie, JWT, etc.

    const data = localStorage.getItem("cookieFallback");
    console.log("Data:", data);
    const cookieResponse = await fetch("/api/get-cookie", {
      method: "GET",
    });
    // if (typeof window !== "undefined") {
    //   window.ReactNativeWebView?.postMessage(
    //     JSON.stringify({
    //       type: "login_success",
    //       data: data,
    //     }),
    //   );
    // }
  }

  async function onSubmit(
    values: z.infer<typeof formSchema>,
    event?: React.FormEvent<HTMLFormElement>,
  ) {
    event?.preventDefault();
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

          notifyAppAfterLogin();

          setIsLoading(true);
          // router.push(isAdmin ? "/dashboard" : "/meus-dispositivos");
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
          className="flex h-fit w-full flex-col items-center gap-4 rounded-lg bg-zinc-50 px-8 py-5 md:w-96"
        >
          {isAdminPage ? (
            <div className="relative mb-2">
              <Image src={logo} alt="logo" className="" />
              <span className="absolute -bottom-1 right-4">Administrador</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Image src={logo} alt="logo" className="" />

              <h3 className="text-center font-medium">
                Proteja-se agora e fique um passo à frente
              </h3>
            </div>
          )}

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

          <Button type="submit" variant="blue" className="!w-40 text-base">
            Entrar
          </Button>
        </form>
      </Form>

      {isLoading && <LoadingToast />}
    </>
  );
}
