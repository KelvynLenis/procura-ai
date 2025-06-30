'use client'

import { TableCell, TableRow } from '../../ui/table'
import { IoIosWarning } from 'react-icons/io'
import { ImPencil } from 'react-icons/im'
import Link from 'next/link'
import type { DeviceProps, Operator } from '@/types'
import { cn } from '@/lib/utils'
import { Eye, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MarkAsStolenForm } from '../../Forms/MarkAsStolenForm'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import { ViewMyAlerts } from '../../ViewMyAlerts'
import { ConfirmationDialog } from '../../ConfirmationDialog'
import { deleteDevice } from '@/functions/device/delete-device'
import { recoverDevice } from '@/functions/device/recover-device'
import { getOperator } from '@/functions/operators/get-operator'
import deviceInfo from '../../../assets/icons/device-info.png'
import Image from 'next/image'
import { updateDeviceStatus } from '@/functions/device/update-device-status'
import { createEvent } from '@/functions/event/create-event'

interface DeviceRowProps {
  id: string // ID do dispositivo
  phone_number: string // Número de telefone
  phone_model: string // Modelo do telefone
  brand: string // Fabricante do telefone
  imei: string // IMEI do telefone
  isStolen: boolean // Status de "roubado" (true/false)
  operator_id: string | undefined // ID do operador
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>
  index: number
  status: string
}

export function DeviceRow({
  id,
  phone_number,
  phone_model,
  brand,
  imei,
  isStolen,
  status,
  operator_id,
  setDevices,
  index,
}: DeviceRowProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewAlertModalOpen, setIsViewAlertModalOpen] = useState(false)
  const [operator, setOperator] = useState<Operator>()

  async function handleDeleteDevice(id: string) {
    try {
      const callFunction = async () => {
        const response = await deleteDevice(id)
        if (response) {
          setDevices(prevDevices =>
            prevDevices.filter(device => device.$id !== id)
          )
        }
      }

      toast.promise(callFunction(), {
        pending: 'Deletando dispositivo...',
        success: 'Dispositivo deletado com sucesso',
        error: 'Erro ao deletar dispositivo',
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDeviceRecovery(id: string) {
    try {
      await createEvent({
        id_device: id,
        time_event: new Date().toISOString(),
        last_location: [0, 0],
        description: 'Evento Cancelado pelo usuário',
        type: 'Regular',
        is_alert_on: false,
        id_district: '',
      })
      const success = await updateDeviceStatus(id, {
        is_stolen: false,
        status: 'Regular',
      })

      if (success) {
        setDevices(prevDevices =>
          prevDevices.map(device =>
            device.$id === id
              ? { ...device, is_stolen: false, status: 'Regular' }
              : device
          )
        )
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function fetchOperator() {
    try {
      const operator = await getOperator(operator_id)

      setOperator(operator)

      return operator
    } catch (error) {
      console.error(error)
    }
  }

  function showLoadingToast() {
    setIsLoading(true)
  }

  useEffect(() => {
    fetchOperator()
  }, [])

  return (
    <>
      <TableRow className="text-base">
        <TableCell className="font-bold text-zinc-800 pl-5 hidden lg:table-cell">
          {index + 1}
        </TableCell>
        <TableCell className="font-bold text-zinc-800 lg:flex">
          {phone_model}
        </TableCell>
        <TableCell className="font-bold capitalize hidden md:table-cell">
          {brand}
        </TableCell>
        <TableCell className="font-bold hidden md:table-cell">
          {`${imei.slice(0, 1)} ${imei.slice(1, 8)} ****** **`}
        </TableCell>
        <TableCell className="w-24">
          <span
            className={cn(
              'rounded-md w-24 flex items-center justify-center capitalize',
              status === 'Roubado' && 'bg-robbery-bg text-robbery-text p-1',
              status === 'Recuperado' && 'bg-regular-bg text-regular-text p-1',
              status === 'Regular' && 'bg-regular-bg text-regular-text p-1',
              status === 'Furtado' && 'bg-theft-bg text-theft-text p-1',
              status === 'Perdido' && 'bg-lost-bg text-lost-text p-1'
              // status === "Perdido" && "bg-violet-500/20 text-violet-700 p-1",
            )}
          >
            {status}
          </span>
        </TableCell>
        <TableCell className="flex gap-2 items-center h-20 py-28 md:py-10 mdflex-wrap md:my-3">
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
              <DialogContent className="flex flex-col p-0 gap-0 w-[40%] h-fit">
                <DialogHeader className="flex items-start justify-center px-5 w-full h-20 text-lg font-medium bg-zinc-100 rounded-t-lg  border-zinc-200 gap-3">
                  <DialogTitle className="flex gap-2 items-center justify-start">
                    <Image
                      src={deviceInfo}
                      alt="device-info"
                      className="w-12 h-12"
                    />
                    Informações do dispositivo
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col">
                    <div className="flex flex-col gap-2 border border-zinc-200 p-4 rounded-b-lg drop-shadow-sm">
                      <div className="flex">
                        <span className="w-28 font-medium">Número</span>
                        <span className="w-full">{phone_number}</span>
                      </div>
                      <div className="flex">
                        <span className="w-28 font-medium">Operadora</span>
                        <span className="w-full">
                          {operator?.name_operator ?? 'Não informado'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-28 font-medium">Modelo</span>
                        <span className="w-full">{phone_model}</span>
                      </div>
                      <div className="flex">
                        <span className="w-28 font-medium">Fabricante</span>
                        <span className="w-full">{brand}</span>
                      </div>
                      <div className="flex">
                        <span className="w-28 font-medium">IMEI</span>
                        <span className="w-full">{imei}</span>
                      </div>
                      <div className="flex">
                        <span className="w-28 font-medium">Status</span>
                        <div className="w-full">
                          <span
                            className={cn(
                              'w-fit rounded-sm flex items-center justify-center hover:bg-white',
                              status === 'Roubado' &&
                                'bg-robbery-bg text-red-600 px-3 py-1 ring-red-500',
                              status === 'Furtado' &&
                                'bg-theft-bg text-orange-600 px-3 py-1 ring-orange-500',
                              status === 'Perdido' &&
                                'bg-lost-bg text-yellow-600 px-3 py-1 ring-yellow-500',
                              status === 'Recuperado' &&
                                'bg-lime-500/30 text-lime-600 px-3 py-1 ring-lime-500',
                              status === 'Regular' &&
                                'bg-lime-500/30 text-lime-600 px-3 py-1 ring-lime-500'
                            )}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Link href={`meus-dispositivos/edit/${id}`}>
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
            </Link>

            <ConfirmationDialog
              title="Deseja deletar este dispositivo?"
              description="Essa ação não pode ser desfeita. Isso excluirá
                    permanentemente o dispositivo e removerá seus dados de
                    nossos servidores."
              onConfirm={() => {
                handleDeleteDevice(id)
              }}
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
            </ConfirmationDialog>

            {status !== 'Regular' ? (
              <>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => setIsDialogOpen(true)}
                      type="button"
                      className={cn(
                        'w-10 h-10 group relative rounded-lg flex flex-col md:flex-row items-center justify-center hover:bg-white',
                        status === 'Roubado' &&
                          'bg-robbery-bg text-red-600 p-1 ring-1 ring-red-500',
                        status === 'Furtado' &&
                          'bg-theft-bg text-orange-600 p-1 ring-1 ring-orange-500',
                        status === 'Perdido' &&
                          'bg-lost-bg text-yellow-600 p-1 ring-1 ring-yellow-500',
                        status === 'Recuperado' &&
                          'bg-lime-500/30 text-lime-600 p-1 ring-1 ring-lime-500',
                        status === 'Regular' &&
                          'bg-lime-500/30 text-lime-600 p-1 ring-1 ring-lime-500'
                      )}
                    >
                      <IoIosWarning
                        className={cn(
                          status === 'Recuperado' &&
                            'text-lime-600 animate-pulse'
                        )}
                        size={28}
                      />
                      <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 group-hover:animate-none bg-black/60 w-64 rounded-sm absolute -top-8 right-5 py-1 px-2 text-white transition- duration-300">
                        Dispositivo recuperado, clique para ver o local da
                        retirada
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="flex flex-col h-4/5 md:h-fit overflow-y-scroll w-fit py-8">
                    <DialogHeader>
                      <DialogTitle>Informações da ocorrência</DialogTitle>
                    </DialogHeader>
                    <ViewMyAlerts
                      id={id}
                      status={status}
                      handleDeviceRecovery={handleDeviceRecovery}
                      setModalOpen={setIsDialogOpen}
                    />
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'rounded-lg group relative w-10 h-10 ring-1 ring-zinc-300 flex flex-col md:flex-row items-center justify-center text-red-600 hover:bg-red-300 hover:ring-red-500'
                    )}
                  >
                    <IoIosWarning size={28} />
                    <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-28 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                      Acionar alerta
                    </span>
                  </button>
                </DialogTrigger>
                <DialogContent className="flex flex-col h-4/5 md:h-fit overflow-y-scroll w-fit py-8">
                  <DialogHeader>
                    <DialogTitle>Preencha as informações</DialogTitle>
                  </DialogHeader>
                  <MarkAsStolenForm
                    id={id}
                    isStolen={isStolen}
                    setDevices={setDevices}
                    setIsDialogOpen={setIsDialogOpen}
                    isPopup
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </TableCell>
      </TableRow>
    </>
  )
}
