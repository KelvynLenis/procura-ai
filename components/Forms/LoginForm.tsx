'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { Input } from '../Input'
import Link from 'next/link'
import { account } from '@/lib/appwrite'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { LoadingToast } from '../LoadingToast'
import Button from '../Button'
import { login } from '@/functions/auth/login'
import { updateLastAccess } from '@/functions/auth/update-last-access'

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const callFunction = async () => {
        try {
          const { isAdmin, userId, userStatus } = await login(
            values.email,
            values.password
          )

          if (userStatus === 'Inativo') {
            toast.error('Esse usuário foi desativado.')
            await account.deleteSession('current')
            return
          }

          await updateLastAccess(userId)

          setIsLoading(true)
          router.push(isAdmin ? '/dashboard' : '/meus-dispositivos')
          toast.success('Logado com sucesso')
        } catch (error: any) {
          if (error.message?.match(/password/)) {
            form.setError('email', { message: 'Email ou senha incorretos' })
            form.setError('password', { message: 'Email ou senha incorretos' })
            toast.error('Email ou senha incorretos')
            return
          }

          toast.error('Erro ao fazer login')
          console.error('Erro ao fazer login:', error.message)
        }
      }

      toast.promise(callFunction(), {
        pending: 'Logando...',
      })
    } catch (error: any) {
      form.setError('email', { message: 'Email ou senha incorretos' })
      form.setError('password', { message: 'Email ou senha incorretos' })
      toast.error(`Error: ${error.message}`)
      console.error('Erro ao fazer login:', error)
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
          await account.deleteSession('current')
        }
      } catch (error: any) {
        console.error('Erro:', error.message)
      }
    }

    getSession()
  }, [])

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full md:w-[500px] h-[700px] flex flex-col gap-4 bg-zinc-50 items-center px-10 py-5"
        >
          <h3 className="text-center">
            Para acessar o Procura.Aí faça login abaixo:
          </h3>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel className="text-zinc-700 ml-4 font-bold pl-5">
                  E-mail
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Email"
                    {...field}
                    className="rounded-full w-64 self-center"
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
              <FormItem className="flex flex-col w-full">
                <FormLabel className="text-zinc-700 ml-4 font-bold pl-5">
                  Senha
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Senha"
                    {...field}
                    className="rounded-full w-64 self-center"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span
            aria-disabled
            title="Em breve"
            className="underline cursor-default aria-disabled:text-zinc-700 self-start pl-10 text-sm "
          >
            Esqueci minha senha
          </span>

          <Button type="submit" variant="blue" className="text-base !w-40">
            Entrar
          </Button>

          <div className="w-full flex flex-col gap-9">
            <span className="w-full h-[1px] rounded-full bg-primary" />

            <div className="flex flex-col gap-3">
              <span className="font-bold self-center">
                Se preferir, acesse pela conta Gov.br
              </span>
              <span
                aria-disabled
                title="Em breve"
                className="underline cursor-default aria-disabled:text-zinc-400 self-start pl-10 text-sm "
              >
                Entrar com Gov.br
              </span>
            </div>

            <span className="w-full h-[1px] rounded-full bg-primary" />

            <div className="w-full flex flex-col gap-3">
              <span className="font-bold self-center">Não possui conta?</span>
              <Link
                href={'/cadastro'}
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
              </Link>
            </div>
          </div>
        </form>
      </Form>

      {isLoading && <LoadingToast />}
    </>
  )
}
