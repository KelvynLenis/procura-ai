'use client'

import type { Contact } from '@/types'
import { ContacItem } from './ContactItem'

interface ContactsListProps {
  contacts: Contact[]
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>
}

export function ContactsList({ contacts, setContacts }: ContactsListProps) {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full ml-1 self-center gap-2 rounded-xl">
        {contacts.map((contact, index) => (
          <ContacItem key={index} contact={contact} />
        ))}
      </div>
    </>
  )
}
