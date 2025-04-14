'use client'

import { cn } from '@/lib/utils'
import { IoIosWarning } from 'react-icons/io'
import { MarkAsStolenForm } from './Forms/MarkAsStolenForm'
import type { DeviceProps } from '@/types'
import { Eye, X } from 'lucide-react'
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

interface DeviceItemProps {
  id: string // ID do dispositivo
  phone_number: string // Número de telefone
  phone_model: string // Modelo do telefone
  brand: string // Fabricante do telefone
  imei: string // IMEI do telefone
  isStolen: boolean // Status de "roubado" (true/false)
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>
  index: number
  status: string
}

export function DeviceItem({
  id,
  phone_number,
  phone_model,
  brand,
  imei,
  isStolen,
  status,
  setDevices,
  index,
}: DeviceItemProps) {
  const [isViewDeviceDetailsCardOpen, setIsViewDeviceDetailsCardOpen] =
    useState(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)

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

  function handleViewDevice() {
    setIsViewDeviceDetailsCardOpen(true)
  }

  return (
    <>
      <div className="text-xs grid grid-cols-3 gap-4 bg-white px-2 py-2 rounded-xl border border-zinc-300 items-center justify-center">
        <span className="w-28">{phone_model}</span>
        <div className="self-end flex justify-end">
          <span
            className={cn(
              'rounded-md w-14 flex self-center items-center justify-center capitalize',
              status === 'Roubado' && 'bg-robbery-bg text-robbery-text p-1',
              status === 'Recuperado' && 'bg-regular-bg text-regular-text p-1',
              status === 'Regular' && 'bg-regular-bg text-regular-text p-1',
              status === 'Furtado' && 'bg-theft-bg text-theft-text p-1',
              status === 'Perdido' && 'bg-lost-bg text-lost-text p-1'
            )}
          >
            {status === 'Recuperado' ? 'Regular' : status.replace(' ', '')}
          </span>
        </div>
        <div className="flex justify-center gap-2">
          <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  'rounded-lg group relative w-6 h-6 ring-1 flex flex-col md:flex-row items-center justify-center',
                  isRegular
                    ? 'ring-zinc-300 bg-white text-red-600 hover:bg-red-300 hover:ring-red-500'
                    : 'ring-red-700 text-white bg-red-600 hover:bg-red-100 hover:text-red-600'
                )}
              >
                <IoIosWarning size={18} />
              </button>
            </DialogTrigger>
            <DialogContent className="h-fit max-h-[90%] overflow-scroll flex flex-col w-[93%] rounded-md py-6 px-4">
              {isStolen ? (
                <>
                  <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-32 rounded-sm absolute -top-8 right-5 py-1 px-2 text-white transition- duration-300">
                    Visualizar alerta
                  </span>
                  <AlertDetails
                    id={id}
                    status={status}
                    handleDeviceRecovery={handleDeviceRecovery}
                    setModalOpen={setIsAlertModalOpen}
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
          {/* {isRegular ? (
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(true)}
              className={cn(
                'rounded-lg group relative w-6 h-6 ring-1 ring-zinc-300 flex flex-col md:flex-row items-center justify-center text-red-600 hover:bg-red-300 hover:ring-red-500'
              )}
            >
              <IoIosWarning size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(true)}
              className={cn(
                'rounded-lg group relative w-6 h-6 ring-1 ring-red-700 flex flex-col md:flex-row items-center justify-center text-white bg-red-600 hover:bg-red-100 hover:text-red-600'
              )}
            >
              <IoIosWarning size={18} />
            </button>
          )} */}

          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="rounded-lg w-6 h-6 flex ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
              >
                <Eye size={18} />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-transparent ml-5 p-0 border-none ring-0 w-full">
              <DeviceDetailsCard
                id={id}
                isStolen={isStolen}
                setDevices={setDevices}
                index={index}
                phone_model={phone_model}
                phone_number={phone_number}
                brand={brand}
                imei={imei}
                status={status}
              />
            </DialogContent>
          </Dialog>
          {/* <button
            type="button"
            onClick={handleViewDevice}
            className="rounded-lg w-6 h-6 flex ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
          >
            <Eye size={18} />
          </button> */}
        </div>
      </div>
      {/* {isViewDeviceDetailsCardOpen && (
        <ViewDeviceInfoModal
          id={id}
          isStolen={isStolen}
          setDevices={setDevices}
          index={index}
          phone_model={phone_model}
          phone_number={phone_number}
          brand={brand}
          imei={imei}
          status={status}
          setModalOpen={setIsViewDeviceDetailsCardOpen}
        />
      )}
      {isAlertModalOpen && (
        <Modal
          setModalOpen={setIsAlertModalOpen}
          title={isStolen ? 'Detalhes do alerta' : 'Criar alerta'}
        >
          <div className="py-5 pl-4">
            {isStolen ? (
              <>
                <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-32 rounded-sm absolute -top-8 right-5 py-1 px-2 text-white transition- duration-300">
                  Visualizar alerta
                </span>
                <AlertDetails
                  id={id}
                  status={status}
                  handleDeviceRecovery={handleDeviceRecovery}
                  setModalOpen={setIsAlertModalOpen}
                />
              </>
            ) : (
              <>
                <h2 className="font-bold">Preencha as informações</h2>
                <MarkAsStolenForm
                  id={id}
                  isStolen={isStolen}
                  setDevices={setDevices}
                  setModalOpen={setIsAlertModalOpen}
                />
              </>
            )}
          </div>
        </Modal>
      )} */}
    </>
  )
}

interface ModalProps {
  phone_number: string
  phone_model: string
  brand: string
  imei: string
  status: string
  setModalOpen: (value: boolean) => void

  id: string // ID do dispositivo
  isStolen: boolean // Status de "roubado" (true/false)
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>
  index: number
}

function ViewDeviceInfoModal({
  phone_number,
  phone_model,
  brand,
  imei,
  status,
  setModalOpen,
  id,
  isStolen,
  setDevices,
  index,
}: ModalProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(false)}
        className="fixed px-3 z-50 bg-black/50 inset-0 flex items-center justify-center"
      >
        <X
          size={24}
          className="text-white absolute top-4 right-4 cursor-pointer border border-white rounded-full p-0.5"
          onClick={() => setModalOpen(false)}
        />
      </button>
      <div className="z-[100] w-full absolute flex items-center">
        <DeviceDetailsCard
          id={id}
          isStolen={isStolen}
          setDevices={setDevices}
          index={index}
          phone_model={phone_model}
          phone_number={phone_number}
          brand={brand}
          imei={imei}
          status={status}
        />
      </div>
    </>
  )
}
