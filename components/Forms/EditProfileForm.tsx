'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { Input } from '../Input'
import { z } from 'zod'
import { Label } from '../ui/label'
import Button from '../Button'
import { useEffect, useState } from 'react'
import { getUserId } from '@/functions/user/get-user-id'
import { getUser } from '@/functions/user/get-user'
import Image from 'next/image'
import { Upload } from 'lucide-react'
import type { User } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUser } from '@/functions/user/update-user'
import { toast } from 'react-toastify'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { validateCPF } from '@/lib/utils'
import { uploadImage } from '@/functions/storage/upload-image'
import { EditPassword } from './EditPassword'

const formSchema = z
  .object({
    name: z.string().min(1, 'O nome é obrigatório'),
    email: z.string().email('Email inválido'),
    cpf: z.string().min(1, 'O CPF é obrigatório'),
  })
  .refine(data => validateCPF(data.cpf), {
    path: ['cpf'],
    message: 'O CPF deve conter exatamente 11 dígitos numéricos.',
  })

export function EditProfileForm() {
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User>({} as User)
  const [file, setFile] = useState<File>()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      cpf: '',
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
      setFile(file)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const callFunction = async () => {
        if (file) {
          console.log('file', file)
          const url = await uploadImage(file || null)

          await updateUser(user.$id, {
            name: values.name,
            email: values.email,
            cpf: values.cpf,
            img_url: url,
          })

          return
        }

        await updateUser(user.$id, {
          name: values.name,
          email: values.email,
          cpf: values.cpf,
        })
      }
      toast.promise(callFunction(), {
        pending: 'Atualizando perfil...',
        success: 'Perfil atualizado com sucesso!',
        error: 'Erro ao atualizar perfil',
      })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    async function getUserData() {
      const userId = await getUserId()

      const userFilter = {
        method: 'equal',
        attribute: 'user_id',
        values: [userId],
      }

      const userData = await getUser({ filters: [userFilter] })

      setUser(userData[0])

      if (userData[0].img_url) {
        setPreview(userData[0].img_url)
      }

      form.setValue('name', userData[0].name)
      form.setValue('email', userData[0].email)
      form.setValue('cpf', userData[0].cpf)

      setIsLoading(false)
    }

    getUserData()
  }, [])

  return isLoading ? (
    <p>Carregando...</p>
  ) : (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col -ml-2 md:ml-0 px-5 md:p-10 py-4 gap-4 bg-white w-full text-zinc-900 self-center  justify-center rounded-lg shadow-form"
      >
        <div>
          <h1 className="text-2xl">Editar Conta</h1>
        </div>

        <div className="flex items-center gap-4">
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="md:w-24 md:h-24 w-16 h-16 p-10 rounded-full flex items-center justify-center text-[48px] font-medium text-white bg-primary">
              {user.name.split(' ').length > 1
                ? user.name.split(' ')[0][0] + user.name.split(' ')[1][0]
                : user.name.split(' ')[0][0]}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <label
                htmlFor="file"
                className="bg-zinc-100 rounded-xl cursor-pointer w-fit items-center justify-center text-sm md:text-base flex gap-3 px-4 py-3 ring-1 ring-[#232323]/30 hover:opacity-70"
              >
                <input
                  id="file"
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                />
                <Upload className="w-5 h-5 md:w-6 md:h-6" />
                Selecionar imagem
              </label>
              {preview && (
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="text-procura-ai-zinc rounded-lg px-4 py-2 ring-1 ring-[#232323]/30"
                >
                  Remover
                </button>
              )}
            </div>
            <span className="text-sm md:text-base">
              * São suportadas imagens nos formatos .png .jpg de até 10 mb
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex md:flex-row flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <Label className="">Nome</Label>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Fulano Beltrano de Cicrano"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <Label className="">Email</Label>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="email@mail.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex md:flex-row flex-col gap-4">
            {/* <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <Label className="">Status da conta</Label>
                  <FormControl>
                    <Input
                          type="text"
                          placeholder="+5588999999999"
                          {...field}
                        />
                  </FormControl>
                </FormItem>
              )}
            /> */}
            <div className="flex flex-col gap-1 w-full">
              <span className="font-medium text-start -mt-0.5 mb-0.5">
                Status do usuário
              </span>
              <span className="px-4 py-1 shadow-md rounded-md flex items-center w-full ring-1 ring-primary/60 h-10">
                {user.status}
              </span>
            </div>

            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <Label className="mb-0.5">CPF</Label>
                  <FormControl>
                    <InputOTP
                      maxLength={11}
                      {...field}
                      containerClassName="ring-1 ring-secondary/60"
                      className="w-full flex justify-center items-center"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 border-t-0 border-r-0 border-black  shadow-transparent"
                          index={0}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={1}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={2}
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator className="relative -bottom-2" />
                      <InputOTPGroup>
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={3}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 border-t-0 border-r-0 border-black shadow-transparent"
                          index={4}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={5}
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator className="relative -bottom-2" />
                      <InputOTPGroup>
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={6}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={7}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={8}
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator data-dash />
                      <InputOTPGroup>
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={9}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={10}
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex w-full justify-between">
          <Button variant="blue" type="submit">
            Salvar alterações
          </Button>
          <Button variant="red" type="button">
            Cancelar
          </Button>
        </div>
      </form>
      <Dialog>
        <DialogTrigger asChild className="mt-5">
          <Button variant="blue" type="button">
            Editar senha
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar senha</DialogTitle>
          </DialogHeader>
          <EditPassword />
        </DialogContent>
      </Dialog>
    </Form>
  )
}
