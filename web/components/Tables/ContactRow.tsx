'use client'

import { TableCell, TableRow } from '@/components/ui/table'
import { Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Contact } from '@/types'
import { cn } from '@/lib/utils'
import { ConfirmationDialog } from '../ConfirmationDialog'
import { deleteContact } from '@/functions/contact/delete-contact'
import { toast } from 'react-toastify'
import { ConctactForm } from '../Forms/ConctactForm'
import { useState } from 'react'

interface ContactRowProps {
  contact: Contact
  index: number
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>
}

export function ContactRow({ contact, index, setContacts }: ContactRowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  async function handleDelete() {
    toast.promise(deleteContact(contact.$id), {
      pending: 'Excluindo contato...',
      success: 'Contato excluido com sucesso!',
      error: 'Erro ao excluir contato',
    })

    setContacts(prevContacts => prevContacts.filter(c => c.$id !== contact.$id))
  }

  return (
    <>
      <TableRow>
        <TableCell className="text-center py-8 font-bold">
          {index + 1}
        </TableCell>
        <TableCell className="break-words">
          <div className="flex items-center font-medium">
            {contact.name_contact}
          </div>
        </TableCell>
        <TableCell className="font-medium break-words">
          {contact.email_contact || 'Não informado'}
        </TableCell>
        <TableCell className={cn('font-medium break-words')}>
          <span
            className={cn(
              'font-medium break-words p-2 rounded-md capitalize'
            )}
          >
            {`(${contact.number_contact.slice(0, 2)}) ${contact.number_contact.slice(2, 7)}-${contact.number_contact.slice(7, 11)}`}
          </span>
        </TableCell>
        <TableCell className="w-28 p-0 m-0">
          <div className="flex gap-2">
            {/* <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="rounded-lg w-10 h-10 flex ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
                >
                  <Eye size={26} />
                  <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                    Exibir informações
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="flex flex-col py-10 gap-10 w-[70%]">
                <DialogHeader>
                  <DialogTitle>Detalhes do contato</DialogTitle>
                </DialogHeader>
              </DialogContent>
            </Dialog> */}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="rounded-lg w-10 h-10 flex ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
                >
                  <Pencil size={26} />
                  <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                    Editar contato
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar contato</DialogTitle>
                  <DialogDescription>
                    Edite as informações do contato.
                  </DialogDescription>
                </DialogHeader>
                <ConctactForm
                  contact={contact}
                  setContacts={setContacts}
                  setIsOpen={setIsDialogOpen}
                />
              </DialogContent>
            </Dialog>

            <ConfirmationDialog
              title="Tem certeza que deseja deletar o contato?"
              description="Ao concordar com esta ação, o contato será removido da lista de contatos. Caso a policia encontre o dispositivo não será possível saber a quem ele pertence e nem te alertar de sua recuperação."
              onConfirm={handleDelete}
            >
              <button
                type="button"
                className="hidden md:flex rounded-lg w-10 h-10 group relative items-center justify-center gap-2 ring-1 ring-zinc-300 hover:bg-red-200 hover:ring-red-600 text-red-600 hover:opacity-90"
              >
                <Trash2 size={20} />
                <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                  Deletar contato
                </span>
              </button>
            </ConfirmationDialog>
          </div>
        </TableCell>
      </TableRow>
    </>
  )
}
