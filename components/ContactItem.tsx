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
      <div className="flex flex-col w-full h-fit bg-white rounded-xl shadow-md">
        <div className="flex items-center justify-end w-full h-12 bg-primary rounded-t-xl px-4 gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="rounded-lg w-8 h-8 flex ring-1 ring-zinc-300 group relative bg-white hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
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
              className="bg-white flex rounded-lg w-8 h-8 group relative items-center justify-center gap-2 ring-1 ring-zinc-300 hover:bg-red-200 hover:ring-red-600 text-red-600 hover:opacity-90"
            >
              <Trash2 size={20} />
              <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                Deletar contato
              </span>
            </button>
          </ConfirmationDialog>
        </div>

        <div className="flex w-full h-full">
          <div className="flex flex-col items-start justify-center gap-2 px-4 pt-4 pb-4 h-full">
            <span className="">Nome</span>

            <span className="">
              <Mail /> E-mail
            </span>

            <span className="">
              <Phone /> Contato
            </span>
          </div>

          <div className="flex flex-col items-start justify-center gap-2 px-4 pt-4 w-full h-full">
            <span className="font-semibold">{contact.name_contact}</span>

            <span className="font-semibold">{contact.email_contact}</span>

            <span className="font-semibold">{contact.number_contact}</span>
          </div>
        </div>
      </div>
    </>
  );
}
