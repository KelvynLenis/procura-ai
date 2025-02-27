'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

import { useForm } from "react-hook-form"
import { Input } from "../Input"
import Link from "next/link"
import { account, databases, ID } from "@/lib/appwrite"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import logo from '../../assets/icons/procura-ai-logo-header.svg'
import Image from "next/image"
import { Button } from "../ui/button"
import { validateCPF } from "@/lib/utils"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { v4 as uuidv4 } from 'uuid';
import { toast } from "react-toastify"
import ClipLoader from 'react-spinners/ClipLoader';
import { LoadingToast } from "../LoadingToast"

interface RegisterFormProps {
  admin?: boolean
}

const formSchema = z.object({
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
  .refine((data) => validateCPF(data.cpf), {
    path: ["cpf"], // Indica onde mostrar o erro
    message: "O CPF deve conter exatamente 11 dígitos numéricos.",
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"], // Indica onde mostrar o erro
    message: "As senhas precisam ser iguais",
  })
  .refine((data) => data.email === data.confirmEmail, {
    path: ["confirmEmail"], // Indica onde mostrar o erro
    message: "Os e-mails precisam ser iguais",
  });

export function RegisterForm({ admin }: RegisterFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      cpf: '',
      email: '',
      confirmEmail: '',
      password: '',
      confirmPassword: '',
    }
  })

  async function onSubmit(values: { name: string, cpf: string, email: string, confirmEmail: string, password: string, confirmPassword: string }) {
    try {
      if (values.email !== values.confirmEmail) {
        toast.error("Os e-mails precisam ser iguais.");
        return
      }

      if (values.password !== values.confirmPassword) {
        toast.error("As senhas precisam ser iguais.");
        return
      }

      const cpf = values.cpf.trim();

      // Regex para verificar se o CPF tem exatamente 11 dígitos numéricos
      const isValidCPF = /^[0-9]{11}$/.test(cpf);

      if (!isValidCPF) {
        toast.error("O CPF deve conter exatamente 11 dígitos numéricos.");

        return
      }
      const userId = uuidv4();

      const callFunction = async () => {

        const createdUser = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/account`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`
            },
            body: JSON.stringify({
              userId,
              email: values.email,
              password: values.password,
            })
          }).then(async (response) => {
            if (!response.ok) {
              const error = await response.text();
              throw new Error(`Error: ${error}`);
            }
            return response.json();
          }).catch((err) => {
            console.error(`Fetch error: ${err.message}`);
            return null;
          });

        const documentId = uuidv4();
        const insertData = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`
            },
            body: JSON.stringify({
              documentId,
              data: {
                user_id: createdUser.$id,
                name: values.name,
                cpf: values.cpf,
                email: values.email,
              },
              // permissions: [
              //   `read(\"user:"${createdUser.$id}"\")`,
              //   `update(\"user:"${createdUser.$id}"\")`,
              //   `delete(\"user:"${createdUser.$id}"\")`
              // ]
            })
          }).then(async (response) => {
            if (!response.ok) {
              const error = await response.text();
              throw new Error(`Error: ${error}`);
            }
            return response.json();
          }).catch((err) => {
            console.error(`Fetch error: ${err.message}`);
            return null;
          });
      }

      toast.promise(callFunction(), {
        pending: 'Cadastrando...',
        success: 'Cadastro realizado com sucesso.',
        error: 'Erro no cadastro.',
      })

      setIsLoading(true)
      admin ? router.push('/admin-login') : router.push('/login')

    } catch (error) {
      toast.error("Erro no cadastro.");
      console.error("Erro no cadastro: ", error)
    }
  }

  function showLoadingToast() {
    setIsLoading(true)
  }

  useEffect(() => {
    const getSession = async () => {
      try {
        const sessions = await account.get()

        if (sessions.status) {
          setIsLoading(true)
          admin ? router.push('/dashboard') : router.push('/meus-dispositivos')
        }
      } catch (error) {
        console.error("Erro: ", error)
      }
    }

    getSession()
  }, [])

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full lg:w-[400px] h-fit flex flex-col gap-6 bg-white items-center self-center pl-0 px-0 py-5 rounded-xl">
          <Image src={logo} alt="logo" width={200} height={100} />

          {
            admin ? (
              <h3 className="text-center text-secondary font-bold">Acesso do Admin</h3>
            ) : (
              <h3 className="text-center flex">Para se cadastrar, preencha as informações a seguir:</h3>
            )
          }

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel className="text-zinc-900 ml-4 font-bold">Nome completo</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Nome completo" {...field} className="rounded-xl" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel className="text-zinc-900 ml-4 font-bold">CPF</FormLabel>
                <FormControl>
                  <InputOTP maxLength={11} {...field} containerClassName="ring-1 ring-secondary/60" className="w-full flex justify-center items-center" >
                    <InputOTPGroup>
                      <InputOTPSlot className="w-4 h-5 border-t-0 border-r-0 border-black  shadow-transparent" index={0} />
                      <InputOTPSlot className="w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={1} />
                      <InputOTPSlot className="w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator className="relative -bottom-2" />
                    <InputOTPGroup>
                      <InputOTPSlot className="w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={3} />
                      <InputOTPSlot className="w-4 h-5 border-t-0 border-r-0 border-black shadow-transparent" index={4} />
                      <InputOTPSlot className="w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={5} />
                    </InputOTPGroup>
                    <InputOTPSeparator className="relative -bottom-2" />
                    <InputOTPGroup>
                      <InputOTPSlot className="w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={6} />
                      <InputOTPSlot className="w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={7} />
                      <InputOTPSlot className="w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={8} />
                    </InputOTPGroup>
                    <InputOTPSeparator data-dash />
                    <InputOTPGroup>
                      <InputOTPSlot className="w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={9} />
                      <InputOTPSlot className="w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={10} />
                    </InputOTPGroup>
                  </InputOTP>

                  {/* <Input type="text" placeholder="cpf" {...field} className="rounded-xl" /> */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel className="text-zinc-900 ml-4 font-bold">e-mail</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Email" {...field} className="rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmEmail"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full h-fit">
                <FormLabel className="text-zinc-900 ml-4 font-bold">Confirmar e-mail</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Confirmar e-mail" {...field} className="rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel className="text-zinc-900 ml-4 font-bold">Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Senha" {...field} className="rounded-xl" />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel className="text-zinc-900 ml-4 font-bold">Confirmar senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirmar senha" {...field} className="rounded-xl" />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <Link href="/forgot-password" className="underline self-start hover:opacity-50 text-sm">Esqueceu sua senha?</Link>

          <Button className="bg-primary text-white rounded-full text-lg px-12 py-4 shadow hover:bg-white hover:text-primary hover:ring-1 hover:ring-primary transition-all duration-300">Criar conta</Button>

          <span className="w-full h-[1px] rounded-full bg-secondary" />

          {
            admin ? (
              <div className="w-full flex flex-col gap-3">
                <Link className="flex w-full" href={'/login'}>
                  <Button onClick={showLoadingToast} type="button" className="bg-secondary text-white rounded-full flex w-full text-lg py-3 shadow hover:bg-white hover:text-secondary hover:ring-1 hover:ring-secondary transition-all duration-300">Retroceder à página do usuário</Button>
                </Link>
              </div>
            ) : (
              <div className=" flex gap-3">
                <span className="font-bold self-center">
                  Já possui conta?{" "}
                  <Link href={'/login'}>
                    <button onClick={showLoadingToast} type="button" className="text-blue-500 underline w-fit hover:opacity-70">
                      Entre com e-mail ou CPF
                    </button>
                  </Link>
                  {" "}
                  ou
                  {" "}
                  <Link href={'/login'}>
                    <button onClick={showLoadingToast} type="button" disabled className="text-zinc-400 underline w-fit">entre com a conta Gov.br</button>
                  </Link>
                </span>
              </div>
            )
          }
        </form>
      </Form>
      {
        isLoading && (
          <LoadingToast />
        )
      }
    </>
  )
}