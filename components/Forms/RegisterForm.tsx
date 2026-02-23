"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useForm } from "react-hook-form";
import { Input } from "../Input";
import Link from "next/link";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "../../assets/icons/logo-text-2.svg";
import Image from "next/image";
import Button from "../Button";
import { validateCPF } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { LoadingToast } from "../LoadingToast";
import { createUser } from "@/functions/user/create-user";
import { validateUserCpf } from "@/functions/user/validate-user-cpf";
import { validateUserEmail } from "@/functions/user/validate-user-email";

interface RegisterFormProps {
  admin?: boolean;
}

const formSchema = z
  .object({
    name: z.string(),
    cpf: z.string().min(11, {
      message: "O CPF deve conter exatamente 11 dígitos numéricos.",
    }),
    email: z.string().email({ message: "Email inválido" }),
    confirmEmail: z.string().email({ message: "Email inválido" }),
    password: z.string().min(8, {
      message: "A senha deve conter pelo menos 8 caracteres.",
    }),
    confirmPassword: z.string().min(8, {
      message: "A senha deve conter pelo menos 8 caracteres.",
    }),
  })
  // .refine(data => validateCPF(data.cpf), {
  //   path: ['cpf'],
  //   message: 'CPF inválido. Por favor, verifique os dígitos informados.',
  // })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas precisam ser iguais",
  })
  .refine((data) => data.email === data.confirmEmail, {
    path: ["confirmEmail"],
    message: "Os e-mails precisam ser iguais",
  })
  .refine(
    async (data) => {
      try {
        return await validateUserCpf(data.cpf);
      } catch (error) {
        toast.error("Erro ao verificar CPF. Tente novamente.");
        return false;
      }
    },
    {
      path: ["cpf"],
      message: "Este CPF já está cadastrado no sistema.",
    },
  )
  .refine(
    async (data) => {
      try {
        return await validateUserEmail(data.email);
      } catch (error) {
        toast.error("Erro ao verificar e-mail. Tente novamente.");
        return false;
      }
    },
    {
      path: ["email"],
      message: "Este e-mail já está cadastrado no sistema.",
    },
  );

export function RegisterForm({ admin }: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cpf: "",
      email: "",
      confirmEmail: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (values.email !== values.confirmEmail) {
        toast.error("Os e-mails precisam ser iguais.");
        return;
      }

      if (values.password !== values.confirmPassword) {
        toast.error("As senhas precisam ser iguais.");
        return;
      }

      const cpf = values.cpf.trim();

      // Regex para verificar se o CPF tem exatamente 11 dígitos numéricos
      const isValidCPF = /^[0-9]{11}$/.test(cpf);

      if (!isValidCPF) {
        toast.error("O CPF deve conter exatamente 11 dígitos numéricos.");
        return;
      }

      const userId = uuidv4();

      const promise = createUser({
        userId,
        name: values.name,
        cpf: values.cpf,
        email: values.email,
        password: values.password,
      });

      toast.promise(promise, {
        pending: "Cadastrando...",
        success: "Cadastro realizado com sucesso.",
        error: "Erro no cadastro.",
      });

      await promise;
      setIsLoading(true);
      admin ? router.push("/admin-login") : router.push("/login");
    } catch (error) {
      toast.error("Erro no cadastro.");
      console.error("Erro no cadastro: ", error);
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
          setIsLoading(true);
          admin ? router.push("/dashboard") : router.push("/meus-dispositivos");
        }
      } catch (error) {
        console.error("Erro: ", error);
      }
    };

    getSession();
  }, []);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-fit w-full flex-col items-center gap-6 self-center rounded-xl bg-white px-0 py-5 pl-0 lg:w-[400px]"
        >
          {/* <Image src={logo} alt="logo" width={200} height={100} /> */}
          <h3 className="flex text-center">
            Para se cadastrar, preencha as informações a seguir:
          </h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="ml-4 font-bold text-zinc-900">
                  Nome completo
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Nome completo"
                    {...field}
                    className="rounded-xl"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="ml-4 font-bold text-zinc-900">
                  CPF
                </FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={11}
                    {...field}
                    containerClassName="ring-1 ring-secondary/60"
                    className="flex w-full items-center justify-center"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                        index={0}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                        index={1}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                        index={2}
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator className="relative -bottom-2" />
                    <InputOTPGroup>
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                        index={3}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                        index={4}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                        index={5}
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator className="relative -bottom-2" />
                    <InputOTPGroup>
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                        index={6}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                        index={7}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                        index={8}
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator data-dash />
                    <InputOTPGroup>
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                        index={9}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                        index={10}
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="ml-4 font-bold text-zinc-900">
                  e-mail
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Email"
                    {...field}
                    className="rounded-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmEmail"
            render={({ field }) => (
              <FormItem className="flex h-fit w-full flex-col">
                <FormLabel className="ml-4 font-bold text-zinc-900">
                  Confirmar e-mail
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Confirmar e-mail"
                    {...field}
                    className="rounded-xl"
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
                <FormLabel className="ml-4 font-bold text-zinc-900">
                  Senha
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Senha"
                    {...field}
                    className="rounded-xl"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="ml-4 font-bold text-zinc-900">
                  Confirmar senha
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirmar senha"
                    {...field}
                    className="rounded-xl"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <Button type="submit" variant="blue" className="!w-40 text-base">
            Criar conta
          </Button>

          <span className="h-[1px] w-full rounded-full bg-secondary" />

          {admin ? (
            <div className="flex w-full flex-col gap-3">
              <Link className="flex w-full" href={"/login"}>
                <Button
                  onClick={showLoadingToast}
                  type="button"
                  variant="blue"
                  className="!w-40 text-base"
                >
                  Retroceder à página do usuário
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-3">
              <span className="self-center font-bold">
                Já possui conta?{" "}
                <Link href={"/login"}>
                  <button
                    onClick={showLoadingToast}
                    type="button"
                    className="w-fit text-blue-500 underline hover:opacity-70"
                  >
                    Entre com e-mail ou CPF
                  </button>
                </Link>{" "}
                ou{" "}
                <Link href={"/login"}>
                  <button
                    onClick={showLoadingToast}
                    type="button"
                    disabled
                    className="w-fit text-zinc-400 underline"
                  >
                    entre com a conta Gov.br
                  </button>
                </Link>
              </span>
            </div>
          )}
        </form>
      </Form>
      {/* {isLoading && <LoadingToast />} */}
    </>
  );
}
