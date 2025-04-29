'use client'

import { Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import deviceInfo from '../assets/icons/device-info.png'
import occurrenceInfo from '../assets/icons/occurrence-info.png'
import ownerInfo from '../assets/icons/owner-info.png'
import { cn, formatDateTime } from '@/lib/utils'

import type { Contact, Event, OccurrencesProps, Operator } from '@/types'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { listContacts } from '@/functions/contact/list-contacts'
import { getOperator } from '@/functions/operators/get-operator'
import { getDeviceEvents } from '@/functions/event/get-device-events'
import { listAllEvents } from '@/functions/event/list-all-events'

interface RecoverDeviceFormProps {
  occurrence?: OccurrencesProps
}
export function OccurrenceDetails({ occurrence }: RecoverDeviceFormProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [operator, setOperator] = useState<Operator>()
  const [events, setEvents] = useState<Event[]>([])
  const [isShowAllEventsOn, setIsShowAllEventsOn] = useState(false)

  async function getContacts() {
    const contacts = await listContacts({
      userIdParam: occurrence?.device.auth_id,
    })

    setContacts(contacts)

    return contacts
  }

  async function fetchEvents() {
    try {
      const events = await listAllEvents(occurrence?.device.$id!)

      console.log(events.length)

      setEvents(events)
    } catch (error) {
      console.error(error)
    }
  }

  async function fetchOperator() {
    try {
      const operator = await getOperator(occurrence?.device.operator_id)

      setOperator(operator)

      return operator
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getContacts()
    fetchEvents()
    fetchOperator()
  }, [])

  return (
    <>
      <Dialog>
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
        <DialogContent className="flex flex-col py-10 gap-3 w-[840px] h-[680px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Detalhes da ocorrência
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 overflow-y-scroll custom-scroll">
            <div className="flex flex-col">
              <div className="flex items-center px-5 w-full h-20 text-lg font-medium bg-zinc-100 rounded-t-lg  border-zinc-200 gap-3">
                <Image
                  src={deviceInfo}
                  alt="device-info"
                  className="w-12 h-12"
                />
                Informações do dispositivo
              </div>
              <div className="flex flex-col gap-2 border border-zinc-200 p-4 rounded-b-3xl drop-shadow-sm">
                <div className="flex">
                  <span className="w-28 font-medium">Número</span>
                  <span className="w-full">
                    {occurrence?.device.phone_number}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">Operadora</span>
                  <span className="w-full">
                    {operator?.name_operator ?? 'Não informado'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">Modelo</span>
                  <span className="w-full">
                    {occurrence?.device.phone_model}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">Fabricante</span>
                  <span className="w-full">{occurrence?.device.brand}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">IMEI</span>
                  <span className="w-full">{occurrence?.device.imei}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">Status</span>
                  <div className="w-full">
                    <span
                      className={cn(
                        'w-fit rounded-sm flex items-center justify-center',
                        occurrence?.device.status === 'Roubado' &&
                          'bg-robbery-bg text-red-600 px-3 py-1 ring-red-500',
                        occurrence?.device.status === 'Furtado' &&
                          'bg-theft-bg text-orange-600 px-3 py-1 ring-orange-500',
                        occurrence?.device.status === 'Perdido' &&
                          'bg-lost-bg text-yellow-600 px-3 py-1 ring-yellow-500',
                        occurrence?.device.status === 'Recuperado' &&
                          'bg-lime-500/30 text-lime-600 px-3 py-1 ring-lime-500',
                        occurrence?.device.status === 'Regular' &&
                          'bg-lime-500/30 text-lime-600 px-3 py-1 ring-lime-500'
                      )}
                    >
                      {occurrence?.device.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center px-5 w-full h-20 text-lg font-medium bg-zinc-100 rounded-t-lg  border-zinc-200 gap-3">
                <Image
                  src={occurrenceInfo}
                  alt="device-info"
                  className="w-12 h-12"
                />
                <span>Informações do ocorrência</span>
              </div>
              <div
                className={cn(
                  'flex flex-col gap-2 border-x rounded-none border-zinc-200 p-4  drop-shadow-sm'
                )}
              >
                <div className="flex">
                  <span className="w-40 font-medium">ID</span>
                  <span className="w-full">
                    {occurrence?.event
                      ? occurrence?.event?.$id.slice(0, 5)
                      : 'Este evento não existe.'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-40 font-medium">Data e horário</span>
                  <span className="w-full">
                    {occurrence?.event
                      ? formatDateTime(occurrence?.event?.time_event!)
                      : 'Este evento não existe.'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-40 font-medium">Tipo</span>
                  <span className="w-full">{occurrence?.event?.type}</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-medium">Descrição</span>
                  <span className="w-full">
                    {occurrence?.event
                      ? occurrence?.event?.description || 'Não informado'
                      : 'Este evento não existe.'}
                  </span>
                </div>
              </div>
              {events.length > 0 && (
                <div
                  className={cn(
                    'w-full flex justify-center border-x pt-4 pb-1',
                    isShowAllEventsOn
                      ? 'bg-zinc-100/90 border-b-0'
                      : 'border-b rounded-b-3xl'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setIsShowAllEventsOn(!isShowAllEventsOn)}
                    className={'text-primary underline hover:text-blue-400'}
                  >
                    {isShowAllEventsOn
                      ? 'Ocultar histórico de ocorrências'
                      : 'Ver ocorrências anteriores'}
                  </button>
                </div>
              )}
              {isShowAllEventsOn &&
                events.map((prevEvent, index) => (
                  <div
                    key={prevEvent.$id}
                    className={cn(
                      'flex flex-col gap-2 bg-zinc-100/90 border border-zinc-200 p-4 drop-shadow-sm',
                      index === events.length - 1 && 'rounded-b-3xl',
                      index === 0 && 'border-t-0'
                    )}
                  >
                    <div className="flex">
                      <span className="w-40 font-medium">ID</span>
                      <span className="w-full">
                        {prevEvent
                          ? prevEvent?.$id.slice(0, 5)
                          : 'Este evento não existe.'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-40 font-medium">Data e horário</span>
                      <span className="w-full">
                        {prevEvent
                          ? formatDateTime(prevEvent?.time_event!)
                          : 'Este evento não existe.'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-medium">Tipo</span>
                      <span
                        className={cn(
                          'w-fit rounded-sm flex items-start justify-start',
                          prevEvent?.type === 'Roubo' &&
                            'bg-robbery-bg text-red-600 px-3 py-1 ring-red-500',
                          prevEvent?.type === 'Furto simples' &&
                            'bg-theft-bg text-orange-600 px-3 py-1 ring-orange-500',
                          prevEvent?.type === 'Perda ou extravio' &&
                            'bg-lost-bg text-yellow-600 px-3 py-1 ring-yellow-500',
                          prevEvent?.type === 'Recuperado' &&
                            'bg-lime-500/30 text-lime-600 px-3 py-1 ring-lime-500',
                          prevEvent?.type === 'Regular' &&
                            'bg-lime-500/30 text-lime-600 px-3 py-1 ring-lime-500'
                        )}
                      >
                        {prevEvent?.type}
                      </span>
                      {/* <span className="w-full">{prevEvent?.type}</span> */}
                    </div>
                    <div className="flex">
                      <span className="w-40 font-medium">Descrição</span>
                      <span className="w-full">
                        {prevEvent
                          ? prevEvent?.description || 'Não informado'
                          : 'Este evento não existe.'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center px-5 w-full h-20 text-lg font-medium bg-zinc-100 rounded-t-lg  border-zinc-200">
                <Image
                  src={ownerInfo}
                  alt="device-info"
                  className="w-12 h-12"
                />
                Informações do proprietário
              </div>
              <div className="flex flex-col gap-2 border border-zinc-200 p-4 rounded-b-3xl drop-shadow-sm">
                <div className="flex">
                  <span className="w-28 font-medium">Nome</span>
                  <span className="w-full">{occurrence?.user.name}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">CPF</span>
                  <span className="w-full">{occurrence?.user.cpf}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">E-mail</span>
                  <span className="w-full">{occurrence?.user.email}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">IMEI</span>
                  <span className="w-full">{occurrence?.device.imei}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">
                    Contatos de confiança
                  </span>
                  <div className="w-full flex gap-14">
                    {contacts.length > 0 ? (
                      contacts.map(contact => (
                        <div key={contact.$id} className="flex flex-col">
                          <span>{contact.name_contact}</span>
                          <span>{contact.number_contact}</span>
                          <span>
                            {contact.email_contact || 'Não informado'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span>Não informado</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
