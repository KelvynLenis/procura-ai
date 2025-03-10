'use client'

import { cn } from '@/lib/utils'
import { IoIosWarning } from 'react-icons/io'
import { MarkAsStolenForm } from './Forms/MarkAsStolenForm'
import type { DeviceProps } from '@/utils/types'
import { ArrowLeft, Trash2, X } from 'lucide-react'
import { AlertDetails } from './AlertDetails'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { ImPencil } from 'react-icons/im'
import { useState } from 'react'
import Link from 'next/link'
import Button from './Button'
import { DeviceForm } from './Forms/DeviceForm'
import { Modal } from './Modal'

interface DeviceDetailsCardProps {
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

export function DeviceDetailsCard({
  id,
  phone_number,
  phone_model,
  brand,
  imei,
  isStolen,
  status,
  setDevices,
  index,
}: DeviceDetailsCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const device = {
    id,
    phone_number,
    phone_model,
    brand,
    imei,
    isStolen,
    status,
  }

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

  function showLoadingToast() {
    setIsLoading(true)
  }

  async function handleDeleteDevice(id: string) {
    try {
      const callFunction = async () => {
        const promise = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents/${id}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
          }
        )
          .then(async response => {
            if (!response.ok) {
              const error = await response.text()
              throw new Error(`Error: ${error}`)
            }
            setDevices(prevDevices =>
              prevDevices.filter(device => device.$id !== id)
            )

            return response
          })
          .catch(err => {
            console.error(`Fetch error: ${err}`)
            return null
          })
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

  return (
    <>
      <div className="flex flex-col w-full h-fit bg-white rounded-xl shadow-md">
        <div className="flex items-center justify-end w-full h-16 bg-primary rounded-t-xl px-4 gap-3">
          <button
            type="button"
            onClick={() => setIsAlertModalOpen(true)}
            className={cn(
              'rounded-lg group relative w-10 h-10 ring-1 flex flex-col md:flex-row items-center justify-center',
              isRegular
                ? 'ring-zinc-300 bg-white text-red-600 hover:bg-red-300 hover:ring-red-500'
                : 'ring-red-700 text-white bg-red-600 hover:bg-red-100 hover:text-red-600'
            )}
          >
            <IoIosWarning size={28} />
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex rounded-lg w-10 h-10 bg-white ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
          >
            <ImPencil size={20} />
          </button>
          {/* <Link href={`meus-dispositivos/edit/${id}`}>
          </Link> */}

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex rounded-lg w-10 h-10 bg-white group relative items-center justify-center gap-2 ring-1 ring-zinc-300 hover:bg-red-200 hover:ring-red-600 text-red-600 hover:opacity-90"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex w-full h-full">
          <div className="flex flex-col items-start justify-center gap-2 bg-procura-ai-zinc/10 px-4 pt-4 pb-6 h-full">
            <span className="">Modelo</span>
            <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

            <span className="">Marca</span>
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

      {isEditModalOpen && (
        <Modal setModalOpen={setIsEditModalOpen} title="Editar dispositivo">
          <DeviceForm
            device={device}
            isPopover
            setModalOpen={setIsEditModalOpen}
          />
        </Modal>
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
                />
              </>
            ) : (
              <>
                <h2 className="font-bold">Preencha as informações</h2>
                <MarkAsStolenForm
                  id={id}
                  isStolen={isStolen}
                  setDevices={setDevices}
                />
              </>
            )}
          </div>
        </Modal>
      )}

      {isDeleteModalOpen && (
        <DeleteDeviceModal
          id={id}
          handleDeleteDevice={handleDeleteDevice}
          setModalOpen={setIsDeleteModalOpen}
        />
      )}
    </>
  )
}

interface DeleteDeviceModalProps {
  id: string
  handleDeleteDevice: (id: string) => void
  setModalOpen: (value: boolean) => void
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
            <Button
              variant="white"
              className="rounded-lg ring-zinc-200 hover:ring-zinc-200"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="red"
              className="rounded-lg"
              onClick={() => handleDeleteDevice(id)}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
