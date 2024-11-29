'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "./Input"
import Link from "next/link"
import { account } from "@/lib/appwrite"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import logo from '../assets/icons/procura-ai-logo-header.svg'
import Image from "next/image"
import { Button } from "./ui/button"

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  async function onSubmit(values: { email: string, password: string }) {
    try {
      const promise = await account.createEmailPasswordSession(values.email, values.password)

      console.log(promise)

      router.push('/dashboard')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Falha no login",
        description: "Email ou senha incorretos",
      })
      console.error("Erro ao logar: ", error)
    }
  }

  useEffect(() => {
    const getSession = async () => {
      try {
        const sessions = await account.get()

        if (sessions.status) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error("Erro: ", error)
      }
    }

    getSession()
  }, [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] h-fit flex flex-col gap-4 bg-white items-center px-10 py-5 rounded-xl shadow-form">
        <Image src={logo} alt="logo" width={200} height={100} />
        <h3 className="text-center">Para acessar o Procura.Aí faça login  abaixo:</h3>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel className="text-zinc-700 ml-4 font-bold">Usuário</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Email" {...field} />
              </FormControl>
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
                <Input type="password" placeholder="Senha" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Link href="/forgot-password" className="underline self-start hover:opacity-50 text-sm">Esqueceu sua senha?</Link>

        <Button className="bg-primary text-white rounded-full text-lg px-12 py-4 shadow hover:bg-white hover:text-primary hover:ring-1 hover:ring-primary transition-all duration-300">Entrar</Button>

        <span className="w-full h-[1px] rounded-full bg-secondary" />

        <div className="w-full flex flex-col gap-3">
          <span className="font-bold self-center">
            Se preferir, acesse pela conta Gov.br
          </span>
          <Button className="bg-secondary text-white rounded-full text-lg py-3 shadow hover:bg-white hover:text-secondary hover:ring-1 hover:ring-secondary transition-all duration-300">Entrar com Gob.br</Button>
          <span className="font-bold self-center">
            Não possui conta?
          </span>
          <Button className="bg-secondary w-full text-white rounded-full text-lg py-3 shadow hover:bg-white hover:text-secondary hover:ring-1 hover:ring-secondary transition-all duration-300">Cadastre-se</Button>
        </div>
      </form>
    </Form>
  )
}