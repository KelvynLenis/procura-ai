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

import {
  Dialog,
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
  brand: string // Marca do telefone
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
      const eventId = uuidv4()
      const x = new Date().toISOString()

      const callFunction = async () => {
        try {
          const createEvent = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents/`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
              },
              body: JSON.stringify({
                documentId: eventId,
                data: {
                  id_device: id,
                  time_event: new Date().toISOString(),
                  last_location: [0, 0],
                  description: 'Recuperado',
                  type: 'Recuperado',
                  is_alert_on: false,
                },
              }),
            }
          )
            .then(async response => {
              if (!response.ok) {
                const error = await response.text()
                throw new Error(`Error: ${error}`)
              }
              return response.json()
            })
            .catch(err => {
              console.error(`Fetch error: ${err.message}`)
              return null
            })

          const updateDeviceStatus = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents/${id}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
              },
              body: JSON.stringify({
                data: {
                  is_stolen: false,
                  status: 'Recuperado',
                },
              }),
            }
          )

          return true // Return success flag
        } catch (error) {
          console.error('Ocorreu um erro em uma das operações:', error)
          return false // Return failure flag
        }
      }

      // setDevices((prevDevices) => prevDevices.map((device) => device.$id === id ? { ...device,  } : device));

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
      console.error(error)
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
          <Dialog>
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
            <DialogContent className="h-[90%] overflow-scroll flex flex-col w-[85%]">
              {isStolen ? (
                <>
                  <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-32 rounded-sm absolute -top-8 right-5 py-1 px-2 text-white transition- duration-300">
                    Visualizar alerta
                  </span>
                  <AlertDetails
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
      {isViewDeviceDetailsCardOpen && (
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
      )}
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
