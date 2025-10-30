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
      <Table className="bg-white shadow-lg rounded-lg w-full">
        <TableHeader className="bg-secondary/10">
          <TableRow>
            <TableHead className="text-black/80 text-lg font-medium text-center">
              ID
            </TableHead>
            <TableHead className="text-black/80 text-lg font-medium ">
              Nome
            </TableHead>
            <TableHead className="text-black/80 text-lg font-medium ">
              Email
            </TableHead>
            <TableHead className="text-black/80 text-lg font-medium ">
              Número
            </TableHead>
            <TableHead className="text-black/80 text-lg font-medium ">
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
