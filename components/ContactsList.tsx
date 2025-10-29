"use client";

import type { Contact } from "@/types";
import { ContacItem } from "./ContactItem";

interface ContactsListProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

export function ContactsList({ contacts, setContacts }: ContactsListProps) {
  return (
    <>
      <div className="flex w-full flex-col items-center justify-center gap-2 self-center rounded-xl">
        {contacts.map((contact, index) => (
          <ContacItem key={index} contact={contact} setContacts={setContacts} />
        ))}
      </div>
    </>
  );
}
