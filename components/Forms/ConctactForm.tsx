'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '../ui/input-otp'
import { useForm } from 'react-hook-form'
import { Input } from '../Input'
import Button from '../Button'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createContact } from '@/functions/contact/create-contact'
import type { Contact } from '@/types'
import { listContacts } from '@/functions/contact/list-contacts'
import { validatePhoneNumber } from '@/lib/utils'
import { updateContact } from '@/functions/contact/update-contact'
import { toast } from 'react-toastify'

interface ConctactFormProps {
  contact?: Contact
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function ConctactForm({
  contact,
  setContacts,
  setIsOpen,
}: ConctactFormProps) {
  const formSchema = z
    .object({
      contact_name: z.string().min(1, {
        message: 'O nome é obrigatório.',
      }),
      contact_email: z.string().optional(),
      contact_number: z.string().min(1, {
        message: 'O número de contato é obrigatório.',
      }),
    })
    .refine(data => validatePhoneNumber(data.contact_number), {
      path: ['contact_number'], // Indica onde mostrar o erro
      message: 'O número de celular deve conter 11 dígitos numéricos.',
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact_name: contact?.name_contact || '',
      contact_email: contact?.email_contact || '',
      contact_number: contact?.number_contact || '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const callFunction = async () => {
      try {
        if (contact) {
          const updatedContact = await updateContact({
            id: contact?.$id!,
            values,
          })

          if (updatedContact) {
            setIsOpen(false)
            toast.success('Contato atualizado com sucesso!')

            setContacts(prevContacts =>
              prevContacts.map(c =>
                c.$id === contact.$id ? updatedContact : c
              )
            )
          }

          return
        }

        const contacts = await listContacts({})

        if (contacts.length >= 3) {
          toast.error('Limite de contatos atingido')
          return
        }

        const contactCreated = await createContact({ values })

        if (contactCreated) {
          toast.success('Contato criado com sucesso!')
          setIsOpen(false)

          setContacts(prevContacts => [...prevContacts, contactCreated])
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error('Erro ao salvar o contato')
      }
    }

    toast.promise(callFunction(), {
      pending: 'Salvando contato...',
    })
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 text-zinc-900 self-center items-center justify-between rounded-xl px-2 py-4"
        >
          {
            contact 
              ? 'Atualize as informações do seu contato de confiança.'
              : 'Adicione um contato de confiança para eventuais contatos de emergência.'
          }
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel className="w-fit text-center items-center flex">
                  <span className="text-red-500 h-6 flex align-text-bottom">
                    *
                  </span>
                  Nome do contato
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
            name="contact_number"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel className="w-fit text-center items-center flex">
                  <span className="text-red-500 h-6 flex align-text-bottom">
                    *
                  </span>
                  Número do contato
                </FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={11}
                    {...field}
                    className="w-full flex justify-center items-center"
                  >
                    <InputOTPGroup>
                      <span>(</span>
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 border-t-0 border-r-0 border-black  shadow-transparent"
                        index={0}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={1}
                      />
                      <span>)</span>
                    </InputOTPGroup>
                    <span />
                    <InputOTPGroup>
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={2}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={3}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 border-t-0 border-r-0 border-black shadow-transparent"
                        index={4}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={5}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={6}
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator data-dash />
                    <InputOTPGroup>
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={7}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={8}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={9}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={10}
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel className="w-fit text-center items-center flex">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    className="ring-1 ring-zinc-300"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            variant="blue"
            type="submit"
            className="w-fit h-10 flex items-center justify-center text-white self-center"
          >
            Salvar
          </Button>
        </form>
      </Form>
    </>
  )
}
