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
import { Button } from '../ui/button'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { LoadingToast } from '../LoadingToast'

interface LoginFormProps {
  admin?: boolean
}

const formSchema = z.object({
  email: z.string(),
  password: z.string(),
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

  async function onSubmit(values: { email: string; password: string }) {
    try {
      const callFunction = async () => {
        const promise = await account.createEmailPasswordSession(
          values.email,
          values.password
        )
        const user = await account.get()
        const isAdmin = user.labels[0] === 'admin'

        const params = new URLSearchParams({
          'queries[0]': JSON.stringify({
            method: 'equal',
            attribute: 'user_id',
            values: [`${user.$id}`],
          }),
        })

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
          }
        )

        const {
          documents: [userDoc],
        } = await response.json()

        if (userDoc) {
          if (userDoc.status === 'inactive') {
            toast.error('Esse usuário foi desativado.')

            account.deleteSession('current')
            return
          }

          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents/${userDoc.$id}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
              },
              body: JSON.stringify({
                data: {
                  accessed_at: new Date().toISOString(),
                },
              }),
            }
          ).catch(err => {
            console.error('Erro ao atualizar último acesso:', err)
          })
        }

        if (isAdmin) {
          setIsLoading(true)
          router.push('/dashboard')
        } else {
          setIsLoading(true)
          router.push('/meus-dispositivos')
        }

        toast.success('Logado com sucesso')

        return promise
      }

      callFunction()

      // toast.promise(callFunction, {
      //   pending: 'Logando...',
      //   success: 'Logado com sucesso',
      //   error: 'Erro ao logar',
      // })
    } catch (error) {
      form.setError('email', { message: 'Email ou senha incorretos' })
      form.setError('password', { message: 'Email ou senha incorretos' })

      toast.error(`Error: ${error}`)

      console.error('Erro ao logar: ', error)
    }
  }

  function showLoadingToast() {
    setIsLoading(true)
  }

  useEffect(() => {
    const getSession = async () => {
      try {
        const callFunction = async () => {
          const sessions = await account.get()
          const params = new URLSearchParams({
            'queries[0]': JSON.stringify({
              method: 'equal',
              attribute: 'user_id',
              values: [`${sessions.$id}`],
            }),
          })

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
              },
            }
          )

          const {
            documents: [userDoc],
          } = await response.json()

          if (userDoc) {
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents/${userDoc.$id}`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
                },
                body: JSON.stringify({
                  data: {
                    accessed_at: new Date().toISOString(),
                  },
                }),
              }
            ).catch(err => {
              console.error('Erro ao atualizar último acesso:', err)
            })
          }

          if (sessions.status) {
            await account.deleteSession('current')
            // setIsLoading(true)
            // sessions.labels[0] == "admin" ? router.push('/dashboard') : router.push('/meus-dispositivos')
          }
        }

        callFunction()

        // toast.promise(callFunction, {
        //   success: 'Sessão encontrada'
        // })
      } catch (error) {
        console.error('Erro: ', error)
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
          {/* <Image src={logo} alt="logo" width={200} height={100} /> */}
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
          <Link
            href="/forgot-password"
            aria-disabled
            className="underline aria-disabled:text-zinc-400 self-start pl-10 text-sm "
          >
            Esqueceu sua senha?
          </Link>

          <Button className="bg-primary text-white rounded-full w-44 text-lg py-4 shadow hover:bg-white hover:text-primary hover:ring-1 hover:ring-primary transition-all duration-300">
            Entrar
          </Button>

          <div className="w-full flex flex-col gap-9">
            <span className="w-full h-[1px] rounded-full bg-secondary" />

            <div className="flex flex-col gap-3">
              <span className="font-bold self-center">
                Se preferir, acesse pela conta Gov.br
              </span>
              <Link
                href={'/login-gov'}
                aria-disabled
                className="underline self-center text-primary font-semibold aria-disabled: hover:opacity-50"
              >
                Entrar com Gov.br
              </Link>
            </div>

            <span className="w-full h-[1px] rounded-full bg-secondary" />

            <div className="w-full flex flex-col gap-3">
              <span className="font-bold self-center">Não possui conta?</span>
              <Link
                href={'/cadastro'}
                className="flex items-center justify-center"
              >
                <Button
                  onClick={showLoadingToast}
                  type="button"
                  className="bg-white text-primary rounded-full text-lg w-44 py-4 shadow-lg hover:bg-white hover:text-primary ring-1 ring-primary transition-all duration-300"
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
