'use client'

import { TableCell, TableRow } from '../ui/table'
import { IoIosWarning } from 'react-icons/io'
import { ImPencil } from 'react-icons/im'
import Link from 'next/link'
import type { DeviceProps, OccurrencesProps } from '@/types'
import { cn, formatDateTime } from '@/lib/utils'
import { Eye, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MarkAsStolenForm } from '../Forms/MarkAsStolenForm'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { useState } from 'react'
import { AlertDetails } from '../AlertDetails'
import { ConfirmationDialog } from '../ConfirmationDialog'

interface AlertRowProps {
  index: number
  occurrence?: OccurrencesProps
}

export function AlertRow({ index, occurrence }: AlertRowProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  function showLoadingToast() {
    setIsLoading(true)
  }

  return (
    <>
      <TableRow className="text-base">
        <TableCell className="font-bold text-zinc-800 pl-5">
          {index + 1}
        </TableCell>
        <TableCell className="font-bold text-zinc-800 px-2 m-0">
          {occurrence?.device.phone_model}
          <br />
          <span className="font-normal">{occurrence?.device.brand}</span>
        </TableCell>
        <TableCell className="font-bold capitalize hidden md:table-cell px-2 m-0">
          {occurrence?.user.name}
        </TableCell>
        <TableCell className="font-bold hidden md:table-cell px-2 m-0">
          {`${occurrence?.device.imei.slice(0, 1)} ${occurrence?.device.imei.slice(1, 8)} ****** **`}
        </TableCell>
        <TableCell className="w-24">
          <span
            className={cn(
              'rounded-md w-20 flex items-center justify-center capitalize',
              occurrence?.device.status === 'Roubado' &&
                'bg-robbery-bg text-robbery-text p-1',
              occurrence?.device.status === 'Recuperado' &&
                'bg-regular-bg text-regular-text p-1',
              occurrence?.device.status === 'Regular' &&
                'bg-regular-bg text-regular-text p-1',
              occurrence?.device.status === 'Furtado' &&
                'bg-theft-bg text-theft-text p-1',
              occurrence?.device.status === 'Perdido' &&
                'bg-lost-bg text-lost-text p-1'
            )}
          >
            {occurrence?.device.status === 'Recuperado'
              ? 'Regular'
              : occurrence?.device.status.replace(' ', '')}
          </span>
        </TableCell>
        <TableCell className="flex gap-2 items-center h-20 py-28 md:py-10 pr-7">
          <div className="flex flex-col md:flex-row items-center w-full gap-2">
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
              <DialogContent className="flex flex-col py-10 gap-3">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    Detalhes da ocorrência
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 bg-zinc-100 py-2 px-4 rounded-lg">
                  <div className="flex flex-col gap-2">
                    {/* <span className="w-full h-0.5 bg-procura-ai-black/20 rounded-full" /> */}
                    <h2 className="font-bold text-lg">
                      Informações do dispositivo
                    </h2>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-start justify-center">
                        <span className="font-bold">Número</span>
                        <span className="break-words">
                          {occurrence?.device.phone_number}
                        </span>
                      </div>

                      <span className="w-0.5 h-24 bg-procura-ai-black/10 rounded-full" />

                      <div className="flex flex-col items-start justify-center">
                        <span className="font-bold">Modelo</span>
                        <span>{occurrence?.device.phone_model}</span>
                      </div>

                      <span className="w-0.5 h-24 bg-procura-ai-black/10 rounded-full" />

                      <div className="flex flex-col gap-2 items-center justify-center">
                        <span className="font-bold">Marca</span>
                        <span>{occurrence?.device.brand}</span>
                      </div>

                      <span className="w-0.5 h-24 bg-procura-ai-black/10 rounded-full" />

                      <div className="flex flex-col gap-2 items-center justify-center">
                        <span className="font-bold">IMEI</span>
                        <span>{occurrence?.device.imei}</span>
                      </div>

                      <span className="w-0.5 h-24 bg-procura-ai-black/10 rounded-full" />

                      <div className="flex flex-col gap-2 items-center justify-center">
                        <span className="font-bold">Status</span>
                        <span>{occurrence?.device.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="w-full h-0.5 bg-procura-ai-black/20 rounded-full" />
                    <h2 className="font-bold text-lg">Informações do alerta</h2>

                    <div className="flex gap-8">
                      <div className="flex flex-col items-start justify-center">
                        <span className="font-bold">Descrição</span>
                        <span className="break-words w-48">
                          {occurrence?.event.description || 'Sem descrição'}
                        </span>
                      </div>

                      <span className="w-0.5 h-24 bg-procura-ai-black/10 rounded-full" />

                      <div className="flex flex-col items-start justify-center">
                        <span className="font-bold">Data e horário</span>
                        <span className="break-words">
                          {formatDateTime(occurrence?.event?.time_event!)}
                        </span>
                      </div>

                      <span className="w-0.5 h-24 bg-procura-ai-black/10 rounded-full" />

                      <div className="flex flex-col items-start justify-center">
                        <span className="font-bold">Tipo de alerta</span>
                        <span className="break-words">
                          {occurrence?.event.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="w-full h-0.5 bg-procura-ai-black/20 rounded-full" />
                    <h2 className="font-bold text-lg">
                      Informações do usuário
                    </h2>

                    <div className="flex gap-8">
                      <div className="flex flex-col items-start justify-center">
                        <span className="font-bold">Email</span>
                        <span className="break-words">
                          {occurrence?.user.email}
                        </span>
                      </div>

                      <span className="w-0.5 h-24 bg-procura-ai-black/10 rounded-full" />

                      <div className="flex flex-col items-start justify-center">
                        <span className="font-bold">Nome do proprietário</span>
                        <span className="break-words">
                          {occurrence?.user.name}
                        </span>
                      </div>

                      <span className="w-0.5 h-24 bg-procura-ai-black/10 rounded-full" />

                      <div className="flex flex-col items-start justify-center">
                        <span className="font-bold">CPF do proprietário</span>
                        <span className="break-words">
                          {occurrence?.user.cpf}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <button
              type="button"
              onClick={showLoadingToast}
              className="hidden md:flex rounded-lg w-10 h-10 ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
            >
              <ImPencil size={16} />
              <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                Editar dispositivo
              </span>
            </button>

            {/* <ConfirmationDialog
              title="Deseja deletar este dispositivo?"
              description="Essa ação não pode ser desfeita. Isso excluirá
                    permanentemente o dispositivo e removerá seus dados de
                    nossos servidores."
              onConfirm={() => {}}
            >
              <button
                type="button"
                className="hidden md:flex rounded-lg w-10 h-10 group relative items-center justify-center gap-2 ring-1 ring-zinc-300 hover:bg-red-200 hover:ring-red-600 text-red-600 hover:opacity-90"
              >
                <Trash2 size={20} />
                <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                  Deletar dispositivo
                </span>
              </button>
            </ConfirmationDialog> */}
          </div>
        </TableCell>
      </TableRow>
    </>
  )
}
