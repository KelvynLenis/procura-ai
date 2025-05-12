import type { Event } from '@/types'
import { useEffect, useState } from 'react'
import { ViewOccurrenceMap } from './Maps/ViewOccurrenceMap'
import { cn, formatDateTime } from '@/lib/utils'
import { IoIosWarning } from 'react-icons/io'
import ClipLoader from 'react-spinners/ClipLoader'
import { ConfirmationDialog } from './ConfirmationDialog'
import { getDeviceEvents } from '@/functions/event/get-device-events'
import { toast } from 'react-toastify'

interface ViewMyAlertProps {
  id: string
  status: string
  handleDeviceRecovery: (id: string) => Promise<void>
  setModalOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

export function ViewMyAlert({
  id,
  status,
  handleDeviceRecovery,
  setModalOpen,
}: ViewMyAlertProps) {
  const [event, setEvent] = useState<Event | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  async function handleConfirmDialog() {
    await handleDeviceRecovery(id)
    if (setModalOpen) {
      setModalOpen(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (status === 'Recuperado') {
          const events = await getDeviceEvents(id, false)

          setEvent(events[0])
          return
        }

        const events = await getDeviceEvents(id, true)

        setEvent(events[0])
      } catch (error) {
        console.error('Erro ao buscar eventos:', error)
        toast.error('Erro ao buscar detalhes do alerta. Tente novamente.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  return (
    <>
      {isLoading ? (
        <div className="flex w-full h-full items-center justify-center">
          <ClipLoader color="#002E72" loading={isLoading} size={50} />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex">
            <div className="flex flex-col gap-2 w-full">
              <div className="font-bold">
                Tipo de alerta:{' '}
                <span className="font-normal">
                  {event?.type ? event?.type : 'Tipo de alerta não registrado'}
                </span>
              </div>
              <div className="font-bold">
                Descrição do alerta:{' '}
                <span className="font-normal">
                  {event?.description
                    ? event?.description
                    : 'Descrição não registrada'}
                </span>
              </div>
              <div className="font-bold">
                Data e hora da ocorrência:{' '}
                <span className="font-normal">
                  {event?.time_event
                    ? formatDateTime(event.time_event)
                    : 'Data não registrada'}
                </span>
              </div>

              <div className="font-bold">
                Local de recuperação:{' '}
                <span className="font-normal">
                  {status === 'Recuperado'
                    ? event?.retrieval_location
                      ? event?.retrieval_location
                      : 'Local não registrado'
                    : 'Esse dispositivo ainda não foi recuperado'}
                </span>
              </div>

              <div className="font-bold">
                Endereço:{' '}
                <span className="font-normal">
                  {status === 'Recuperado'
                    ? event?.address
                      ? event?.address
                      : 'Endereço não registrado'
                    : 'Esse dispositivo ainda não foi recuperado'}
                </span>
              </div>
            </div>

            <div className="flex flex-col w-1/3 items-end">
              <ConfirmationDialog
                title="Tem certeza que deseja marcar o dispositivo como regular?"
                description="Ao concordar com esta ação, o dispositivo será marcado como regular e os dados da recuperação serão perdidos.
                 Tenha certeza que já tem o aparelho em mãos antes de prosseguir."
                onConfirm={handleConfirmDialog}
              >
                <button
                  type="button"
                  className={cn(
                    'w-fit top-5 gap-2 group relative rounded-lg flex flex-col md:flex-row items-center justify-center hover:bg-white',
                    status === 'Roubado' &&
                      'bg-robbery-bg text-red-600 p-1 ring-1 ring-red-500',
                    status === 'Furtado' &&
                      'bg-theft-bg text-orange-600 p-1 ring-1 ring-orange-500',
                    status === 'Perdido' &&
                      'bg-lost-bg text-yellow-600 p-1 ring-1 ring-yellow-500',
                    status === 'Recuperado' &&
                      'bg-lime-500/30 text-lime-600 p-1 ring-1 ring-lime-500 animate-pulse',
                    status === 'Regular' &&
                      'bg-lime-500/30 text-lime-600 p-1 ring-1 ring-lime-500'
                  )}
                >
                  <IoIosWarning size={28} />
                  <span className="hidden md:block">
                    {status === 'Recuperado'
                      ? 'Já busquei'
                      : 'Desativar alerta'}
                  </span>
                </button>
              </ConfirmationDialog>
            </div>
          </div>

          <div>
            {event?.last_location ? (
              <ViewOccurrenceMap position={event?.last_location} />
            ) : (
              <div>
                <span className="font-bold">
                  Localização da ocorrência:{' '}
                  <span className="font-normal">
                    Localização não registrada
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
