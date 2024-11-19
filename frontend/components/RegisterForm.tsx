'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { useRouter } from 'next/navigation'
import { Input } from "./Input"
import Link from "next/link"
import { account } from "@/lib/appwrite"

export function RegisterForm() {
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  async function onSubmit(values: { email: string, password: string, confirmPassword: string }) {
    try {

      if (values.password !== values.confirmPassword) {
        form.setError('confirmPassword', { message: 'As senhas não coincidem' })
      }

      const promise = await account.create('fffgfgfg', values.email, values.password)

      console.log(values)

      if (promise.status) {
        router.push('/')
      }


    } catch (error) {
      console.error("Erro ao registrar: ", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-white items-center p-5 rounded-md">
        <h1 className="text-2xl text-zinc-700">Crie sua conta</h1>
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
              <FormMessage>{form.formState.errors.confirmPassword?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-zinc-700">Confirme sua senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirme sua senha" {...field} className="bg-zinc-100" />
              </FormControl>
              <FormMessage>{form.formState.errors.confirmPassword?.message}</FormMessage>
            </FormItem>
          )}
        />

        <button type="submit" className="w-72 h-10 self-center text-zinc-100 bg-green-400 rounded-md hover:opacity-60">Registrar</button>

        <span>
          Já possui uma conta? <Link href="/" className="text-blue-400 hover:opacity-50">Faça login</Link>
        </span>
      </form>
    </Form>
  )
}