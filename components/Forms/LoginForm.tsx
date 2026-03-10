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
import loginMobileBanner from "../../assets/images/login-mobile-banner.png";
import { Eye, EyeOff } from "lucide-react";
import { AlternateLoginDrawer } from "./AlternateLoginDrawer";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});
login;
export function LoginForm({ isAdminPage }: { isAdminPage?: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pathname, setPathname] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    const pathname = window.location.hostname;

    setPathname(pathname);
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
          className="mb-0 flex h-screen w-screen flex-col items-center gap-4 bg-zinc-50 p-0 md:mb-10 md:h-fit md:w-96 md:rounded-lg md:px-8 md:py-5"
        >
          {isAdminPage ? (
            <div className="relative mb-2">
              <Image src={logo} alt="logo" className="" />
              <span className="absolute -bottom-1 right-4">Administrador</span>
            </div>
          ) : (
            <div className="flex w-full flex-col items-center">
              <Image src={logo} alt="logo" className="hidden md:block" />
              <Image
                src={loginMobileBanner}
                alt="logo"
                className="h-full w-full md:hidden"
              />

              <span className="hidden text-center font-medium md:block">
                Proteja-se agora e fique um passo à frente
              </span>

              <div className="flex items-center px-5">
                <span className="mt-4 text-center text-sm md:hidden">
                  Clique para acessar o Procura.Aí pela sua conta gov.br
                </span>
              </div>
            </div>
          )}

          {(pathname === "localhost" || isAdminPage) && (
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
                      <div className="relative flex items-center justify-center">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Senha"
                          {...field}
                          className="w-64 self-center rounded-full"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-12 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" variant="blue" className="!w-40 text-base">
                Entrar
              </Button>
            </>
          )}

          {!isAdminPage && (
            <div className="flex w-fit flex-col">
              {pathname !== "localhost" && (
                <>
                  <div className="bg-login-mobile-bg flex flex-col gap-3 md:bg-transparent">
                    <div className="flex items-center justify-center">
                      <GovBrButton className="w-[16.3rem] bg-secondary text-base md:w-fit" />
                    </div>
                  </div>
                  {/* <span className="h-[1px] w-full rounded-full bg-primary" /> */}
                </>
              )}

              <div className="mb-20 flex w-fit flex-col gap-3">
                {pathname === "localhost" && (
                  <>
                    {/* <span className="self-center font-bold">
                      Não possui conta?
                      </span> */}
                    <Link
                      href={"/cadastro"}
                      className="flex items-center justify-center"
                    >
                      <Button
                        onClick={showLoadingToast}
                        type="button"
                        variant="black"
                        className="!w-40 text-base"
                      >
                        Cadastre-se
                      </Button>
                    </Link>
                    <span className="h-[1px] w-full rounded-full bg-primary" />
                  </>
                )}

                <Link
                  href={"/login-admin"}
                  className="mb-20 mt-4 hidden h-fit items-center justify-center text-secondary underline hover:opacity-70 md:flex"
                >
                  Entrar como administrador
                </Link>

                <AlternateLoginDrawer />
              </div>
            </div>
          )}
        </form>
      </Form>

      {/* {isLoading && <LoadingToast />} */}
    </>
  );
}
