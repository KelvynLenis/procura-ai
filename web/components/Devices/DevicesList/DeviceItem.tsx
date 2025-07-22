'use client'

import { cn } from '@/lib/utils'
import { IoIosWarning } from 'react-icons/io'
import { MarkAsStolenForm } from '../../Forms/MarkAsStolenForm'
import type { DeviceProps } from '@/types'
import { Eye, X } from 'lucide-react'
import { ViewMyAlert } from '../../ViewMyAlert'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { DeviceDetailsCard } from './DeviceDetailsCard'
import { createEvent } from '@/functions/event/create-event'
import { updateDeviceStatus } from '@/functions/device/update-device-status'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ViewMyAlerts } from '@/components/ViewMyAlerts'
import { useRouter } from 'next/navigation'

interface DeviceItemProps {
  id: string // ID do dispositivo
  phone_number: string // Número de telefone
  phone_model: string // Modelo do telefone
  brand: string // Fabricante do telefone
  operator_id: string | undefined // ID do operador
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
  operator_id,
  isStolen,
  status,
  setDevices,
  index,
}: DeviceItemProps) {
  const [isViewDeviceDetailsCardOpen, setIsViewDeviceDetailsCardOpen] =
    useState(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)

  const router = useRouter()

  const isRegular = status === 'Regular' || status === 'Recuperado'

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

  function handleViewDevice() {
    setIsViewDeviceDetailsCardOpen(true)
  }

  return (
    <>
      <div className="text-sm grid grid-cols-3 gap-4 h-[60px] bg-white px-2 py-2 rounded-xl border border-zinc-300 items-center justify-center">
        <span className="w-28">{phone_model}</span>
        <div className="self-center flex justify-end">
          <span
            className={cn(
              'rounded-md mobile:w-24 mobile:text-sm mobile-sm:w-16 mobile-sm:text-xs flex self-center items-center justify-center capitalize font-medium',
              status === 'Roubado' && 'bg-robbery-bg text-robbery-text p-1',
              status === 'Recuperado' && 'bg-recovered-bg text-recovered-text p-1',
              status === 'Regular' && 'bg-regular-bg text-regular-text p-1',
              status === 'Furtado' && 'bg-theft-bg text-theft-text p-1',
              status === 'Perdido' && 'bg-lost-bg text-lost-text p-1'
            )}
          >
            {status.replace(' ', '')}
          </span>
        </div>
        <div className="flex justify-center gap-2">
          <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  'rounded-lg group relative w-8 h-8 ring-1 flex flex-col md:flex-row items-center justify-center',
                  isRegular
                    ? 'ring-zinc-300 bg-white text-red-600 hover:bg-red-300 hover:ring-red-500'
                    : 'ring-red-700 text-white bg-red-600 hover:bg-red-100 hover:text-red-600'
                )}
              >
                <IoIosWarning size={18} />
              </button>
            </DialogTrigger>
            <DialogContent className="h-[95%] overflow-scroll flex flex-col w-[93%] px-0 pt-0">
              {status !== 'Regular' ? (
                <>
                  <span className="w-full flex bg-secondary/10 py-4 items-center px-2">
                    <h2 className='text-lg font-medium text-secondary'>Informações da ocorrência</h2>
                  </span>
                  <ViewMyAlert
                    id={id}
                    status={status}
                    handleDeviceRecovery={handleDeviceRecovery}
                    setModalOpen={setIsAlertModalOpen}
                  />
                </>
              ) : (
                <div className='px-3 py-2'>
                  <h2 className="font-bold">Preencha as informações</h2>
                  <MarkAsStolenForm
                    id={id}
                    isStolen={isStolen}
                    setDevices={setDevices}
                    setIsDialogOpen={setIsAlertModalOpen}
                    isPopup
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="rounded-lg w-8 h-8 flex ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
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
                operator_id={operator_id}
                brand={brand}
                imei={imei}
                status={status}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
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
  operator_id: string
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
  operator_id,
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
          operator_id={operator_id}
          brand={brand}
          imei={imei}
          status={status}
        />
      </div>
    </>
  )
}
