'use client'

import { TableCell, TableRow } from '../ui/table'
import recoveryIcon from '../../assets/icons/recover.png'
import { ImPencil } from 'react-icons/im'
import type { OccurrencesProps } from '@/types'
import { cn, formatDateTime } from '@/lib/utils'
import { CloudUpload, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'
import Image from 'next/image'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Combobox } from '../Combobox'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../Input'
import Button from '../Button'

interface AlertRowProps {
  index: number
  occurrence?: OccurrencesProps
}

export function AlertRow({ index, occurrence }: AlertRowProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isRecoverDeviceDialogOpen, setIsRecoverDeviceDialogOpen] =
    useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [entity, setEntity] = useState('')
  const [sector, setSector] = useState('')
  const [deviceLocation, setDeviceLocation] = useState('')

  const options = [
    { label: 'Recover', value: 'recover' },
    { label: 'Ignore', value: 'ignore' },
    { label: 'Block', value: 'block' },
  ]

  function handleSelectEntity(option: string | string[]) {
    setEntity(typeof option === 'string' ? option : '')
    console.log(option)
  }

  function handleSelectSector(option: string | string[]) {
    setSector(typeof option === 'string' ? option : '')
    console.log(option)
  }

  function handleSelectDeviceLocation(option: string | string[]) {
    setDeviceLocation(typeof option === 'string' ? option : '')
    console.log(option)
  }

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
              'rounded-md w-24 flex items-center justify-center capitalize',
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
            {occurrence?.device.status.replace(' ', '')}
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

            <Dialog
              open={isRecoverDeviceDialogOpen}
              onOpenChange={setIsRecoverDeviceDialogOpen}
            >
              <DialogTrigger asChild>
                <button
                  type="button"
                  onClick={showLoadingToast}
                  className="hidden md:flex rounded-lg w-10 h-10 ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
                >
                  <Image alt="recuperar dispositivo" src={recoveryIcon} />
                  <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                    Recuperar dispositivo
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="flex flex-col gap-3 p-0 w-[840px]">
                <DialogHeader>
                  <DialogTitle className="text-xl text-procura-ai-blue bg-sky-100/40 rounded-md py-5 px-6">
                    Dispositivo recuperado
                  </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 p-4">
                  <div className="flex flex-col gap-2">
                    <Label className="font-medium text-base">
                      Informações gerais / Descrição
                    </Label>
                    <Textarea className="w-full" />
                  </div>

                  <div className="grid grid-cols-2 gap-x-20 gap-y-4 justify-between">
                    <div className="flex flex-col gap-2">
                      <Label className="font-medium text-base">
                        Orgão responsável pela recuperação
                      </Label>
                      <select
                        name=""
                        id=""
                        className="bg-zinc-100 w-full h-12 rounded-md ring-1 ring-zinc-300 px-2 font-medium"
                      >
                        <option value="">{entity}</option>
                        {options.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="font-medium text-base">Setor</Label>
                      <select
                        name=""
                        id=""
                        className="bg-zinc-100 w-full h-12 rounded-md ring-1 ring-zinc-300 px-2 font-medium"
                      >
                        <option value="">{entity}</option>
                        {options.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="font-medium text-base">
                        Local para retirada do dispositivo
                      </Label>
                      <select
                        name=""
                        id=""
                        className="bg-zinc-100 w-full h-12 rounded-md ring-1 ring-zinc-300 px-2 font-medium"
                      >
                        <option value="">{entity}</option>
                        {options.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-medium">
                      <Checkbox className="shadow-none rounded-sm border-[#232323]/90 font-medium" />
                      Notificar proprietário através de e-mail e SMS
                    </div>
                    <div className="flex items-center text-base gap-2 font-medium">
                      <Checkbox className="shadow-none rounded-sm border-[#232323]/90 font-medium" />
                      <span className="text-base">
                        Notificar contatos de confiança
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="font-medium text-base">
                      Anexar documentos
                    </Label>
                    <div className="flex flex-col w-full h-32 bg-zinc-100 items-center justify-center rounded-md cursor-pointer hover:bg-zinc-300 transition-colors duration-200 ease-in">
                      <CloudUpload size={60} className="text-zinc-500" />
                      <span className="text-zinc-500">
                        Clique aqui ou arraste e solte arquivos para anexá-los
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between w-full">
                    <Button variant="blue">Salvar Alterações</Button>
                    <Button
                      onClick={() => setIsRecoverDeviceDialogOpen(false)}
                      variant="red"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TableCell>
      </TableRow>
    </>
  )
}
