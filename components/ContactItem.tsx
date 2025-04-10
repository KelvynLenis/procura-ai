'use client'

import { cn } from '@/lib/utils'
import { IoIosWarning } from 'react-icons/io'
import { MarkAsStolenForm } from './Forms/MarkAsStolenForm'
import type { Contact, DeviceProps } from '@/types'
import { Eye, Trash2, X } from 'lucide-react'
import { AlertDetails } from './AlertDetails'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { useState } from 'react'
import { DeviceDetailsCard } from './DeviceDetailsCard'
import { Modal } from './Modal'
import { createEvent } from '@/functions/event/create-event'
import { updateDeviceStatus } from '@/functions/device/update-device-status'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ImPencil } from 'react-icons/im'
import { ConfirmationDialog } from './ConfirmationDialog'

interface ContactItemProps {
  contact: Contact
}

export function ContacItem({ contact }: ContactItemProps) {
  return (
    <>
      <div className="flex flex-col w-full h-fit bg-white rounded-xl shadow-md">
        <div className="flex items-center justify-end w-full h-12 bg-primary rounded-t-xl px-4 gap-3">
          <Dialog>
            <DialogTrigger>
              <button
                type="button"
                className="flex rounded-lg w-8 h-8 bg-white ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
              >
                <ImPencil size={20} />
              </button>
            </DialogTrigger>
            <DialogContent className="h-[95%] w-[90%] overflow-scroll flex flex-col">
              <DialogTitle className="hidden">Editar dispositivo</DialogTitle>
            </DialogContent>
          </Dialog>
          <ConfirmationDialog
            onConfirm={() => {}}
            title="Excluir contato"
            description="Tem certeza que deseja excluir esse contato?"
          >
            <button
              type="button"
              className="flex rounded-lg w-8 h-8 bg-white group relative items-center justify-center gap-2 ring-1 ring-zinc-300 hover:bg-red-200 hover:ring-red-600 text-red-600 hover:opacity-90"
            >
              <Trash2 size={20} />
            </button>
          </ConfirmationDialog>
        </div>

        <div className="flex w-full h-full">
          <div className="flex flex-col items-start justify-center gap-2 bg-procura-ai-zinc/10 px-4 pt-4 pb-4 h-full">
            <span className="">Nome</span>

            <span className="">E-mail</span>

            <span className="">Contato</span>
          </div>

          <div className="flex flex-col items-start justify-center gap-2 px-4 pt-4 w-full h-full">
            <span className="font-semibold">{contact.name_contact}</span>

            <span className="font-semibold">{contact.email_contact}</span>

            <span className="font-semibold">{contact.number_contact}</span>
          </div>
        </div>
      </div>
    </>
  )
}
