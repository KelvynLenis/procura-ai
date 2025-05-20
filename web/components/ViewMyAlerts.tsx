import type { Event } from '@/types'
import { useEffect, useState } from 'react'
import { ViewOccurrenceMap } from './Maps/ViewOccurrenceMap'
import { cn, formatDateTime } from '@/lib/utils'
import { IoIosWarning } from 'react-icons/io'
import ClipLoader from 'react-spinners/ClipLoader'
import { ConfirmationDialog } from './ConfirmationDialog'
import { getAllDeviceEvents } from '@/functions/event/get-device-events'
import { toast } from 'react-toastify'



interface ViewMyAlertProps {
  id: string
  status: string
  handleDeviceRecovery: (id: string) => Promise<void>
  setModalOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

export function ViewMyAlerts({
  id,
  status,
  handleDeviceRecovery,
  setModalOpen,
}: ViewMyAlertProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isShowAllEventsOn, setIsShowAllEventsOn] = useState(false)
  

  async function handleConfirmDialog() {
    await handleDeviceRecovery(id)
    if (setModalOpen) {
      setModalOpen(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {

        const events = await getAllDeviceEvents(id)

        setEvents(events)
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
        <div className="flex flex-col gap-5 overflow-y-auto max-h-[500px] pr-2">
          <div className="flex">
            <div className="flex flex-col gap-2 w-full">
              <div className="font-bold">
                Tipo de alerta:{' '}
                <span className="font-normal">
                  {events[0]?.type ? events[0]?.type : 'Tipo de alerta não registrado'}
                </span>
              </div>
              <div className="font-bold">
                Descrição do alerta:{' '}
                <span className="font-normal">
                  {events[0]?.description
                    ? events[0]?.description
                    : 'Descrição não registrada teste'}
                </span>
              </div>
              <div className="font-bold">
                Data e hora da ocorrência:{' '}
                <span className="font-normal">
                  {events[0].time_event
                    ? formatDateTime(events[0].time_event)
                    : 'Data não registrada'}
                </span>
              </div>

              <div className="font-bold">
                Local de recuperação:{' '}
                <span className="font-normal">
                  {status === 'Recuperado'
                    ? events[0]?.retrieval_location
                      ? events[0].retrieval_location
                      : 'Local não registrado'
                    : 'Esse dispositivo ainda não foi recuperado'}
                </span>
              </div>

              <div className="font-bold">
                Endereço:{' '}
                <span className="font-normal">
                  {status === 'Recuperado'
                    ? events[0]?.address
                      ? events[0]?.address
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
            {events[0]?.last_location ? (
              <ViewOccurrenceMap position={events[0]?.last_location} />
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

          {events.length > 0 && (
                <div
                  className={cn(
                    'w-full flex justify-center border-x pt-4 pb-1 ',
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
              {isShowAllEventsOn && (
                <div className="max-h-[300px]">

                { events.map((prevEvent, index) => (
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
                          prevEvent?.type === 'Extravio ou Perda' &&
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
        )}
        </div>
      )}
    </>
  )
}
