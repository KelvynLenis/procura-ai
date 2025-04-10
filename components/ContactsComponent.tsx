'use client'

import { useEffect, useState } from 'react'
import type { Contact } from '@/types'
import { listContacts } from '@/functions/contact/list-contacts'
import ClipLoader from 'react-spinners/ClipLoader'
import { ContactsTable } from './Tables/ContactsTable'
import { ContactsList } from './ContactsList'
import { cn } from '@/lib/utils'

export function ContactsComponent() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const getContacts = async () => {
      const contactsResponse = await listContacts({})

      setContacts(contactsResponse)

      setIsLoading(false)
    }

    getContacts()
  }, [])

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
          <span
            className={cn(
              'flex self-end font-medium mt-3',
              contacts.length >= 3 && 'text-red-500'
            )}
          >
            {contacts.length >= 3
              ? 'Você atingiu o limite máximo de contatos cadastrados.'
              : `Você cadastrou ${contacts.length} contatos. Limite máximo de 3
              contatos.`}
          </span>
        </>
      )}
    </>
  )
}
