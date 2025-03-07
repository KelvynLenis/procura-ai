"use client"

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "../Input"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"

interface EditPerfilProps {
  name: string;
  email: string;
  cellphone: string;
  newPassword: string;
  cpf: string;
  address: string;
}

export function EditProfileForm() {
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      cellphone: '',
      newPassword: '',
      cpf: '',
      address: ''
    }
  })

  async function onSubmit(values: EditPerfilProps) {

    try {
      // @Glaymar TODO
      // Lógica para editar o perfil do usuário

      toast({
        variant: 'warning',
        title: 'TODO',
        description: 'Lógica para editar o perfil do usuário',
        duration: 3000
      })


    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col p-10 py-4 gap-4 text-zinc-900 self-center items-center justify-center rounded-lg shadow-form">
        <div>
          <h1 className="text-2xl">Editar Conta</h1>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <label className="">Nome</label>
                  <FormControl>
                    <Input type="text" placeholder="Fulano Beltrano de Cicrano" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <label className="">Email</label>
                  <FormControl>
                    <Input type="text" placeholder="email@mail.com" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="cellphone"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <label className="">Tel</label>
                  <FormControl>
                    <Input type="text" placeholder="+5588999999999" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <label className="">CPF</label>
                  <FormControl>
                    <Input type="text" placeholder="11262269474" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

          </div>

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <label className="">Nova senha</label>
                <FormControl>
                  <Input type="text" placeholder="nova senha" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <label className="">Endereço</label>
                <FormControl>
                  <Input type="text" placeholder="Rua Presidente Fulano Beltrano" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <button type="submit" className="w-full h-10 flex items-center justify-center text-xl text-white self-center rounded-xl bg-primary  hover:opacity-60">Salvar</button>
      </form>
    </Form>
  )
}