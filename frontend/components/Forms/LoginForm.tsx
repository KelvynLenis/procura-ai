'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "../Input"
import Link from "next/link"
import { account } from "@/lib/appwrite"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import logo from '../../assets/icons/procura-ai-logo-header.svg'
import Image from "next/image"
import { Button } from "../ui/button"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-toastify"

interface LoginFormProps {
  admin?: boolean
}

const formSchema = z.object({
  email: z.string(),
  password: z.string(),
})

export function LoginForm({ admin }: LoginFormProps) {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  async function onSubmit(values: { email: string, password: string }) {
    try {
      await account.createEmailPasswordSession(values.email, values.password)
      const user = await account.get()
      const isAdmin = user.labels[0] === 'admin';

      if (admin && !isAdmin) {
        toast({
          variant: 'destructive',
          title: "Falha no login",
          description: "Acesso restrito para administradores.",
        })
        router.push('/')
        return
      }

      if (isAdmin && admin) {
        router.push('/dashboard');
      } else if (!admin) {
        router.push('/home');
      }
    } catch (error) {
      form.setError('email', { message: "Email ou senha incorretos" })
      form.setError('password', { message: "Email ou senha incorretos" })


      console.log("Erro ao logar: ", error)
    }
  }

  useEffect(() => {
    const getSession = async () => {
      try {
        const sessions = await account.get()

        if (sessions.status) {
          sessions.labels[0] == "admin" ? router.push('/dashboard') : router.push('/home')
        }

        toast.promise(callFunction, {
          pending: 'Verificando sessão ativa...',
          success: 'Sessão encontrada',
          error: 'Sem sessão ativa. Faça login para continuar.'
        })

      } catch (error) {
        console.log("Erro: ", error)
      }
    }

    getSession()
  }, [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] h-fit flex flex-col gap-4 bg-white items-center px-10 py-5 rounded-xl">
        <Image src={logo} alt="logo" width={200} height={100} />

        {
          admin ? (
            <h3 className="text-center text-secondary font-bold">Acesso do Admin</h3>
          ) : (
            <h3 className="text-center">Para acessar o Procura.Aí faça login  abaixo:</h3>
          )
        }

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel className="text-zinc-700 ml-4 font-bold">Usuário</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Email" {...field} className="rounded-md" />
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
              <FormLabel className="text-zinc-700 ml-4 font-bold">Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Senha" {...field} className="rounded-md" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Link href="/forgot-password" className="underline self-start hover:opacity-50 text-sm">Esqueceu sua senha?</Link>

        <Button className="bg-primary text-white rounded-full text-lg px-12 py-4 shadow hover:bg-white hover:text-primary hover:ring-1 hover:ring-primary transition-all duration-300">Entrar</Button>

        <span className="w-full h-[1px] rounded-full bg-secondary" />

        {
          admin ? (
            <div className="w-full flex flex-col gap-3">
              <Link className="flex w-full" href={'/login'}>
                <Button type="button" className="bg-secondary text-white rounded-full flex w-full text-lg py-3 shadow hover:bg-white hover:text-secondary hover:ring-1 hover:ring-secondary transition-all duration-300">Retroceder à página do usuário</Button>
              </Link>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <span className="font-bold self-center">
                Se preferir, acesse pela conta Gov.br
              </span>
              <Button disabled type="button" className="bg-secondary text-white rounded-full text-lg py-3 shadow hover:bg-white hover:text-secondary hover:ring-1 hover:ring-secondary transition-all duration-300">Entrar com Gob.br</Button>
              <span className="font-bold self-center">
                Não possui conta?
              </span>
              <Link href={'/cadastro'}>
                <Button type="button" className="bg-secondary w-full text-white rounded-full text-lg py-3 shadow hover:bg-white hover:text-secondary hover:ring-1 hover:ring-secondary transition-all duration-300">Cadastre-se</Button>
              </Link>
              <span className="font-bold self-center">
                Acesso do administrador
              </span>
              <Link className="flex w-full" href={'/admin-login'}>
                <Button type="button" className="bg-secondary text-white rounded-full flex w-full text-lg py-3 shadow hover:bg-white hover:text-secondary hover:ring-1 hover:ring-secondary transition-all duration-300">Entre como Administrador</Button>
              </Link>
            </div>
          )
        }
      </form>
    </Form>
  )
}