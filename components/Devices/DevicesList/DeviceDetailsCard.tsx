'use client'

import { cn } from '@/lib/utils'
import { IoIosWarning } from 'react-icons/io'
import { MarkAsStolenForm } from '../../Forms/MarkAsStolenForm'
import type { DeviceProps, Operator } from '@/types'
import { Trash2 } from 'lucide-react'
import { ViewMyAlert } from '../../ViewMyAlert'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { ImPencil } from 'react-icons/im'
import { useEffect, useState } from 'react'
import Button from '../../Button'
import { DeviceForm } from '../../Forms/DeviceForm'
import { deleteDevice } from '@/functions/device/delete-device'
import { createEvent } from '@/functions/event/create-event'
import { updateDeviceStatus } from '@/functions/device/update-device-status'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getOperator } from '@/functions/operators/get-operator'

interface DeviceDetailsCardProps {
  id: string // ID do dispositivo
  phone_number: string // Número de telefone
  phone_model: string // Modelo do telefone
  brand: string // Fabricante  do telefone
  imei: string // IMEI do telefone
  isStolen: boolean // Status de "roubado" (true/false)
  operator_id: string | undefined // ID do operador
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>
  index: number
  status: string
}

export function DeviceDetailsCard({
  id,
  phone_number,
  phone_model,
  operator_id,
  brand,
  imei,
  isStolen,
  status,
  setDevices,
  index,
}: DeviceDetailsCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [operator, setOperator] = useState<Operator>()

  const device = {
    id,
    phone_number,
    phone_model,
    brand,
    operator_id,
    imei,
    isStolen,
    status,
  }

  const isRegular = status === 'Regular' || status === 'Recuperado'

  async function handleDeviceRecovery(id: string) {
    try {
      const callFunction = async () => {
        try {
          await createEvent({
            id_device: id,
            time_event: new Date().toISOString(),
            last_location: [0, 0],
            description: 'Recuperado',
            type: 'Recuperado',
            is_alert_on: false,
            id_district: '',
          })

          await updateDeviceStatus(id, {
            is_stolen: false,
            status: 'Recuperado',
          })

          return true
        } catch (error) {
          console.error('Ocorreu um erro em uma das operações:', error)
          return false
        }
      }

      const success = await toast.promise(callFunction, {
        pending: 'Recuperando Dispositivo...',
        success: 'Recuperado',
        error: 'Erro ao recuperar',
      })

      if (success) {
        setDevices(prevDevices =>
          prevDevices.map(device =>
            device.$id === id
              ? { ...device, is_stolen: false, status: 'Recuperado' }
              : device
          )
        )
      }
    } catch (error) {
      console.error('Erro ao recuperar dispositivo:', error)
    }
  }

  function showLoadingToast() {
    setIsLoading(true)
  }

  async function handleDeleteDevice(id: string) {
    try {
      const callFunction = async () => {
        try {
          await deleteDevice(id)
          setDevices(prevDevices =>
            prevDevices.filter(device => device.$id !== id)
          )
          return true
        } catch (error) {
          console.error('Erro ao deletar dispositivo:', error)
          return false
        }
      }

      toast.promise(callFunction(), {
        pending: 'Deletando dispositivo...',
        success: 'Dispositivo deletado com sucesso',
        error: 'Erro ao deletar dispositivo',
      })
    } catch (error) {
      console.error('Erro ao deletar dispositivo:', error)
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

  useEffect(() => {
    fetchOperator()
  }, [])

  return (
    <>
      <div className="flex flex-col w-[88%] h-fit bg-white rounded-xl shadow-md">
        <div className="flex items-center justify-end w-full h-16 bg-primary rounded-t-xl px-4 gap-3">
          <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  'rounded-lg group relative w-10 h-10 ring-1 flex flex-col md:flex-row items-center justify-center',
                  isRegular
                    ? 'ring-zinc-300 bg-white text-red-600 hover:bg-red-300 hover:ring-red-500'
                    : 'ring-red-700 text-white bg-red-600 hover:bg-red-100 hover:text-red-600'
                )}
              >
                <IoIosWarning size={28} />
              </button>
            </DialogTrigger>
            <DialogContent className="h-[95%] overflow-scroll flex flex-col w-[93%]">
              <DialogTitle className="hidden">
                Marcar como roubado ou visualisar alerta
              </DialogTitle>

              {isStolen ? (
                <>
                  <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-32 rounded-sm absolute -top-8 right-5 py-1 px-2 text-white transition- duration-300">
                    Visualizar alerta
                  </span>
                  <ViewMyAlert
                    id={id}
                    status={status}
                    handleDeviceRecovery={handleDeviceRecovery}
                  />
                </>
              ) : (
                <>
                  <h2 className="font-bold">Preencha as informações</h2>
                  <MarkAsStolenForm
                    id={id}
                    isStolen={isStolen}
                    setDevices={setDevices}
                    setIsDialogOpen={setIsAlertModalOpen}
                    isPopup
                  />
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger>
              <button
                type="button"
                className="flex rounded-lg w-10 h-10 bg-white ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
              >
                <ImPencil size={20} />
              </button>
            </DialogTrigger>
            <DialogContent className="h-[95%] w-[90%] overflow-scroll flex flex-col">
              <DialogTitle className="hidden">Editar dispositivo</DialogTitle>
              <DeviceForm
                device={device}
                isPopover
                setModalOpen={setIsEditModalOpen}
              />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger>
              <button
                type="button"
                className="flex rounded-lg w-10 h-10 bg-white group relative items-center justify-center gap-2 ring-1 ring-zinc-300 hover:bg-red-200 hover:ring-red-600 text-red-600 hover:opacity-90"
              >
                <Trash2 size={20} />
              </button>
            </DialogTrigger>
            <DialogContent className="h-[95%] w-[100%] flex bg-transparent border-none">
              <DeleteDeviceModal
                id={id}
                handleDeleteDevice={handleDeleteDevice}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex w-full h-full">
          <div className="flex flex-col items-start justify-center gap-2 bg-procura-ai-zinc/10 px-4 pt-4 pb-6">
            <span className="">Modelo</span>
            <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

            <span className="">Fabricante</span>
            <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

            <span className="">IMEI</span>
            <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

            <span className="">Status</span>
          </div>

          <div className="flex flex-col items-start justify-center gap-2 px-4 pt-4 pb-4 w-full h-full">
            <span className="font-semibold">{phone_model}</span>
            <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

            <span className="font-semibold">{brand}</span>
            <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

            <span className="font-semibold">
              {`${imei.slice(0, 1)} ${imei.slice(1, 8)} ${imei.slice(9, 15)}`}
            </span>
            <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

            <span
              className={cn(
                'rounded-md w-20 flex items-center justify-center capitalize',
                status === 'Roubado' && 'bg-robbery-bg text-robbery-text p-1',
                status === 'Recuperado' &&
                  'bg-regular-bg text-regular-text p-1',
                status === 'Regular' && 'bg-regular-bg text-regular-text p-1',
                status === 'Furtado' && 'bg-theft-bg text-theft-text p-1',
                status === 'Perdido' && 'bg-lost-bg text-lost-text p-1'
              )}
            >
              {status === 'Recuperado' ? 'Regular' : status.replace(' ', '')}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

interface DeleteDeviceModalProps {
  id: string
  handleDeleteDevice: (id: string) => void
  setModalOpen?: (value: boolean) => void
}

function DeleteDeviceModal({
  id,
  handleDeleteDevice,
  setModalOpen,
}: DeleteDeviceModalProps) {
  return (
    <>
      <div className="fixed inset-0 m-auto bg-black/50 p-6 z-50 flex flex-col items-center justify-center">
        <div className="flex flex-col gap-3 bg-white rounded-xl p-4">
          <h2 className="font-bold">
            Tem certeza que deseja excluir esse dispositivo?
          </h2>
          <p className="text-zinc-600 ">
            Essa ação não pode ser desfeita. Isso excluirá permanentemente o
            dispositivo e removerá seus dados de nossos servidores.
          </p>

          <div className="flex gap-4 items-center justify-center">
            <DialogClose asChild>
              <Button
                variant="white"
                // onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
            </DialogClose>

            <DialogClose asChild>
              <Button variant="red" onClick={() => handleDeleteDevice(id)}>
                Confirmar
              </Button>
            </DialogClose>
          </div>
        </div>
      </div>
    </>
  )
}
