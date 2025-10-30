"use client";

import { useEffect, useState } from "react";
import type { Contact } from "@/types";
import { listContacts } from "@/functions/contact/list-contacts";
import ClipLoader from "react-spinners/ClipLoader";
import { ContactsTable } from "./Tables/ContactsTable";
import { ContactsList } from "./ContactsList";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConctactForm } from "./Forms/ConctactForm";
import Button from "./Button";

export function ContactsComponent() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const getContacts = async () => {
      const contactsResponse = await listContacts({});

      setContacts(contactsResponse);

      setIsLoading(false);
    };

    getContacts();
  }, []);

  return (
    <>
      {isLoading ? (
        <ClipLoader color="#0F2498" size={25} />
      ) : (
        <>
          <div className="hidden md:flex md:flex-col">
            <ContactsTable contacts={contacts} setContacts={setContacts} />
          </div>
          <div className="flex md:hidden">
            <ContactsList contacts={contacts} setContacts={setContacts} />
          </div>
          <div className="w-full flex flex-col md:flex-row justify-between">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger className="w-fit">
                <Button
                  type="button"
                  variant="blue"
                  disabled={contacts.length >= 3}
                  className={cn("self-start mt-4")}
                >
                  Adicionar contato
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar contato</DialogTitle>
                  <DialogDescription className="w-64 text-justify">
                    Adicione um contato de confiança para eventuais contatos de
                    emergência.
                  </DialogDescription>
                </DialogHeader>
                <ConctactForm
                  setContacts={setContacts}
                  setIsOpen={setIsDialogOpen}
                />
              </DialogContent>
            </Dialog>
            <span
              className={cn(
                "flex self-end font-medium mt-3",
                contacts.length >= 3 && "text-red-500",
              )}
            >
              {contacts.length >= 3
                ? "Você atingiu o limite máximo de contatos cadastrados."
                : `Você cadastrou ${contacts.length} contatos. Limite máximo de 3
              contatos.`}
            </span>
          </div>
        </>
      )}
    </>
  );
}
