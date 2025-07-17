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
import { validateCPF } from '@/lib/utils'
import { updatePassword } from '@/functions/auth/update-password'
import { uploadImage } from '@/functions/storage/upload-image'

const formSchema = z
  .object({
    newPassword: z.string(),
    confirmNewPassword: z.string(),
    oldPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    path: ['confirmPassword'], // Indica onde mostrar o erro
    message: 'As senhas precisam ser iguais',
  })

export function EditPassword() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
      oldPassword: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const callFunction = async () => {
        await updatePassword(values.newPassword, values.oldPassword)
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col px-5 md:p-5 py-4 gap-6 bg-white w-full text-zinc-900 self-center  justify-center rounded-lg"
      >
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <Label className="">Senha antiga</Label>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Senha antiga"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <Label className="">Nova senha</Label>
                <FormControl>
                  <Input type="password" placeholder="Nova senha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <Label className="">Confirme a senha</Label>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Repita a nova senha"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex w-full gap-4 justify-between">
          <Button variant="white" type="button">
            Cancelar
          </Button>
          <Button variant="blue" type="submit">
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  )
}
