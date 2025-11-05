"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import type { Contact } from "@/types";
import { ContactRow } from "./ContactRow";
import Button from "../Button";
import { ConctactForm } from "../Forms/ConctactForm";
import { listContacts } from "@/functions/contact/list-contacts";
import { cn } from "@/lib/utils";

interface ContactsTableProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

export function ContactsTable({ contacts, setContacts }: ContactsTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Table className="w-full rounded-lg bg-white shadow-lg">
        <TableHeader className="bg-secondary/10">
          <TableRow>
            <TableHead className="text-center text-lg font-medium text-black/80">
              ID
            </TableHead>
            <TableHead className="text-lg font-medium text-black/80">
              Nome
            </TableHead>
            <TableHead className="text-lg font-medium text-black/80">
              Email
            </TableHead>
            <TableHead className="text-lg font-medium text-black/80">
              Número
            </TableHead>
            <TableHead className="text-lg font-medium text-black/80">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length > 0 ? (
            contacts.map((contact, index) => (
              <ContactRow
                key={index}
                index={index}
                contact={contact}
                setContacts={setContacts}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Nenhum contato cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
