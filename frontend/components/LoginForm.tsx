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
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-white items-center p-5 rounded-md">
        <h1 className="text-2xl text-zinc-700">Faça login</h1>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-zinc-700">Email</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Email" {...field} className="bg-zinc-100" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-zinc-700">Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Senha" {...field} className="bg-zinc-100" />
              </FormControl>
            </FormItem>
          )}
        />

        <button type="submit" className="w-72 h-10 self-center text-zinc-100 bg-green-400 rounded-md hover:opacity-60">Entrar</button>

        <span>
          Não tem uma conta? <Link href="/register" className="text-blue-400 hover:opacity-50">Cadastre-se</Link>
        </span>
      </form>
    </Form>
  )
}