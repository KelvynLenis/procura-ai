'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../Button'
import { Checkbox } from '../ui/checkbox'
import { Search } from 'lucide-react'
import { Textarea } from '../ui/textarea'
import NotificationTable from '../Tables/NotificationTable'

function NotificationForm() {
  const formSchema = z
  .object({
    title: z.string().min(1, {
      message: 'O nome é obrigatório.',
    }),
    description: z.string().min(1, {
      message: 'A descrição é obrigatória.',
    })
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: ''
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 text-zinc-900 self-center items-center justify-between rounded-xl bg-white pb-4 w-full"
        >
          <div className='w-full bg-[#E6F1FD] flex justify-start px-4 py-2 rounded-t-xl font-medium'>
            {
              true 
                ? 'Criar notificação'
                : 'Editar notificação'
            }

          </div>

          <div className='px-2 w-full flex flex-col gap-4'>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="w-fit text-center items-center flex">
                    <span className="text-red-500 h-6 flex align-text-bottom">
                      *
                    </span>
                    Título
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      className="ring-1 ring-zinc-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="w-fit text-center items-center flex">
                    <span className="text-red-500 h-6 flex align-text-bottom">
                      *
                    </span>
                    Descrição
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="ring-1 ring-zinc-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='bg-zinc-100 rounded-lg w-full px-8 py-4 flex justify-between'>
              <div className='flex flex-col gap-2'>
                <h3 className='font-medium'>Usuários</h3>

                <div className='flex gap-2 items-center'>
                  <Checkbox className='drop-shadow-sm shadow-sm bg-white' />
                  Todos os usuários
                </div>
                <span>Ou selecione  usuários específicos</span>

                <div className='ring-1 ring-zinc-300 flex items-center gap-2 bg-white px-4 py-2 w-fit'>
                  <Search className='w-6 h-6' />
                  <Input placeholder='Pesquise por nome ou CPF' className='ring-0 border-none' />
                </div>
              </div>

              <div className='flex flex-col gap-2'>
                <h3 className='font-medium'>Status de dispositivo</h3>
                <div className='flex gap-2 items-center'>
                  <Checkbox className='drop-shadow-sm shadow-sm bg-white' />
                  Todos
                </div>

                <div className='flex gap-2 items-start flex-col pl-4'>
                  <div className='flex gap-2 items-center'>
                    <Checkbox className='drop-shadow-sm shadow-sm bg-white' />
                    Regular
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Checkbox className='drop-shadow-sm shadow-sm bg-white' />
                    Roubado
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Checkbox className='drop-shadow-sm shadow-sm bg-white' />
                    Furtado
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Checkbox className='drop-shadow-sm shadow-sm bg-white' />
                    Perdido
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Checkbox className='drop-shadow-sm shadow-sm bg-white' />
                    Recuperado
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-2'>
                <h3 className='font-medium'>Localidade ou região</h3>
                <div className='flex gap-2 items-center'>
                  <Checkbox className='drop-shadow-sm shadow-sm bg-white' />
                  Todos
                </div>

                <div className='flex gap-2 items-start flex-col pl-4'>
                  <div className='flex gap-2 items-center'>
                    <Checkbox className='drop-shadow-sm shadow-sm bg-white' />
                    João Pessoa
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Checkbox className='drop-shadow-sm shadow-sm bg-white' />
                    Cabedelo
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Checkbox className='drop-shadow-sm shadow-sm bg-white' />
                    Campina Grande
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Checkbox className='drop-shadow-sm shadow-sm bg-white' />
                    Bayeux
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Checkbox className='drop-shadow-sm shadow-sm bg-white' />
                    Santa Rita
                  </div>
                </div>
              </div>
            </div>

            <div className='flex justify-between w-full'>
              <Button
                variant="white"
                type="button"
                className="xl:text-base"
              >
                Salvar
              </Button>
              <Button
                variant="blue"
                type="submit"
                className="xl:text-base"
              >
                Enviar notificação
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <div className='w-full h-full bg-white rounded-xl flex flex-col gap-2'>
        <div className='w-full bg-[#E6F1FD] rounded-t-xl px-4 py-2 font-medium'>
          Historico de notificações
        </div>
        
        <NotificationTable />
      </div>
    </>
  )
}

export default NotificationForm