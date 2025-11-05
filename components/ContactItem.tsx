"use client";

import type { Contact } from "@/types";
import { Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { ConctactForm } from "./Forms/ConctactForm";
import { deleteContact } from "@/functions/contact/delete-contact";

interface ContactItemProps {
  contact: Contact;
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

export function ContacItem({ contact, setContacts }: ContactItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleDelete() {
    toast.promise(deleteContact(contact.$id), {
      pending: "Excluindo contato...",
      success: "Contato excluido com sucesso!",
      error: "Erro ao excluir contato",
    });

    setContacts((prevContacts) =>
      prevContacts.filter((c) => c.$id !== contact.$id),
    );
  }

  return (
    <>
      <div className="flex h-fit w-full flex-col rounded-xl bg-white shadow-md">
        <div className="flex h-12 w-full items-center justify-end gap-3 rounded-t-xl bg-primary px-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="group relative flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-zinc-300 hover:bg-sky-100 hover:text-blue-900 hover:opacity-90 hover:ring-blue-700"
              >
                <Pencil size={26} />
                <span className="transition- absolute -top-8 right-5 hidden w-36 rounded-sm bg-black/60 py-1 text-white opacity-0 duration-300 group-hover:block group-hover:opacity-100">
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
              className="group relative flex h-8 w-8 items-center justify-center gap-2 rounded-lg bg-white text-red-600 ring-1 ring-zinc-300 hover:bg-red-200 hover:opacity-90 hover:ring-red-600"
            >
              <Trash2 size={20} />
              <span className="transition- absolute -top-8 right-5 hidden w-36 rounded-sm bg-black/60 py-1 text-white opacity-0 duration-300 group-hover:block group-hover:opacity-100">
                Deletar contato
              </span>
            </button>
          </ConfirmationDialog>
        </div>

        <div className="flex h-full w-full">
          <div className="flex h-full flex-col items-start justify-center gap-2 px-4 pb-4 pt-4">
            <span className="">Nome</span>

            <span className="">
              <Mail /> E-mail
            </span>

            <span className="">
              <Phone /> Contato
            </span>
          </div>

          <div className="flex h-full w-full flex-col items-start justify-center gap-2 px-4 pt-4">
            <span className="font-semibold">{contact.name_contact}</span>

            <span className="font-semibold">{contact.email_contact}</span>

            <span className="font-semibold">{contact.number_contact}</span>
          </div>
        </div>
      </div>
    </>
  );
}
