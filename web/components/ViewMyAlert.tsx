import type { DeviceProps, Event, User } from '@/types'
import { useEffect, useState } from 'react'
import { ViewOccurrenceMap } from './Maps/ViewOccurrenceMap'
import { cn, formatDateTime } from '@/lib/utils'
import { IoIosWarning } from 'react-icons/io'
import ClipLoader from 'react-spinners/ClipLoader'
import { ConfirmationDialog } from './ConfirmationDialog'
import { getAllDeviceEvents, getDeviceEvents } from '@/functions/event/get-device-events'
import { toast } from 'react-toastify'
import { getDeviceById } from '@/functions/device/get-device-by-id'
import { getUserId } from '@/functions/user/get-user-id'
import { getUserById } from '@/functions/user/get-user-by-id'

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
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isShowAllEventsOn, setIsShowAllEventsOn] = useState(false)
  const [user, setUser] = useState<User>({} as User)
  const [device, setDevice] = useState<DeviceProps>({} as DeviceProps)

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
          const device = await getDeviceById(id)
          const userId = await getUserId()
          const userResponse = await getUserById(userId)
  
          setUser(userResponse)
          setDevice(device)
  
          // console.log('Detalhes do dispositivo:', device)
          console.log('Detalhes do usuário:', userResponse)
          // console.log('Detalhes do alerta:', events)
  
          setEvents(events)
        } catch (error) {
          console.error('Erro ao buscar eventos:', error)
          toast.error('Erro ao buscar detalhes do alerta. Tente novamente.')
        } finally {
          setIsLoading(false)
        }
      }
  
      fetchData()
    }, [])

  return (
    <>
      {isLoading ? (
        <div className="flex w-full h-full items-center justify-center">
          <ClipLoader color="#002E72" loading={isLoading} size={50} />
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-3">
          <div>
              {
                status === 'Recuperado' 
                ? <span>Seu dispositivo <span className='font-bold'>{device.phone_model}</span>, recuperado pela polícia <span className='font-bold'>já se encontra disponível para retirada</span> .</span>
                : <span>Seu dispositivo <span className='font-bold'>{device.phone_model}</span> foi registrado como <span className='font-bold'>{device.status}.</span></span>
              }
              
            </div>

            <p>
              {
                status === 'Recuperado'
                ? <span>Para fazer a retirada do dispositivo dirija-se ao local indicado abaixo portando <span className='font-bold'>um documento oficial com foto.</span></span>
                : 'Assim que o dispositivo for recuperado você será notificado através do aplicativo e via e-mail para orientação sobre os próximos passos.'
              }
            </p>

            {
              status === 'Recuperado'
              ? (
                <div className='flex flex-col'>
                  <h2 className='text-lg font-medium'>Local de retirada</h2>

                  <span className='font-medium'>{events[0]?.retrieval_location?.split(')')[1]}</span>
                  <span>Endereço: {events[0]?.address}</span>
                </div>
              )
              : (
                <p>
                  Informaremos também aos seus contatos de confiança.
                </p>
              )
            }

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

            {/* <div className='bg-zinc-200/50 w-full flex flex-col items-center p-4 gap-4'>
              <span className='text-primary font-medium'>Atualizações da ocorrência</span>

              <div className='w-full flex justify-around'>
                <div className='w-60 flex flex-col items-center'>
                  <span className={cn('w-10 h-10 border-2 border-primary rounded-full')} />
                  <span className='text-primary font-medium'>Ocorrência criada</span>
                  <span className='text-primary text-sm'>{formatDateTime(events[0].time_event)}</span>
                </div>

                <div className='w-60 flex flex-col items-center'>
                  <span className={cn('w-10 h-10 border-2 rounded-full', status === 'Recuperado' ? 'border-primary' : 'border-zinc-500')} />
                  <span className={cn('font-medium', status === 'Recuperado' ? 'text-primary' : 'text-zinc-500')}>Dispositivo recuperado</span>
                  <span className={cn('text-sm', status === 'Recuperado' ? 'text-primary' : 'text-zinc-500')}>{ status === 'Recuperado' && formatDateTime(events[1].time_event)}</span>
                </div>
              </div>

              <div className='flex w-full items-center justify-center'>
                <span className='w-3 h-3 bg-primary rounded-full' />
                <span className={cn('w-80 h-0.5', status === 'Recuperado' ? 'bg-primary' : 'bg-zinc-500')} />
                <span className={cn('w-3 h-3 rounded-full', status === 'Recuperado' ? 'bg-primary' : 'bg-zinc-500')} />
              </div>
            </div> */}

            <div className="rounded-lg flex flex-col gap-2 p-4">
              <h2 className="font-medium text-lg">Detalhes da ocorrência</h2>
              <div className="flex flex-col gap-5">

                <div className="flex">
                  <span className="font-medium w-44">Dispositivo</span>
                  <span className="w-full">
                    {device.phone_model} /{' '}
                    {device.brand}
                  </span>
                </div>

                <div className="flex">
                  <span className="font-medium w-44">Proprietário</span>
                  <span className="w-full">{user.name}</span>
                </div>

                <div className="flex">
                  <span className="font-medium w-44">Data e hora</span>
                  <span className="w-full">{status === 'Recuperado' ? formatDateTime(events[1].time_event) : formatDateTime(events[0].time_event)}</span>
                </div>

                <div className="flex">
                  <span className="font-medium w-44">Descrição</span>
                  <span className="w-full">
                    {events[0].description || 'Sem descrição'}
                  </span>
                </div>

                <div className="flex">
                  <span className="font-medium w-44">Status</span>
                  <div className="w-full">
                    <span
                      className={cn(
                        'w-fit rounded-sm flex items-center justify-center hover:bg-white',
                        device.status === 'Roubado' &&
                          'bg-robbery-bg text-red-600 p-1 ring-1 ring-red-500',
                        device.status === 'Furtado' &&
                          'bg-theft-bg text-orange-600 p-1 ring-1 ring-orange-500',
                        device.status === 'Perdido' &&
                          'bg-lost-bg text-yellow-600 p-1 ring-1 ring-yellow-500',
                        device.status === 'Recuperado' &&
                          'bg-lime-500/30 text-recovered-text p-1',
                        device.status === 'Regular' &&
                          'bg-lime-500/30 text-regular-text p-1'
                      )}
                    >
                      {device.status}
                    </span>

                  </div>
                </div>
              </div>
              <ConfirmationDialog
                title="Tem certeza que deseja marcar o dispositivo como regular?"
                description="Ao concordar com esta ação, o dispositivo será marcado como regular e os dados da recuperação serão perdidos.
                Tenha certeza que já tem o aparelho em mãos antes de prosseguir."
                onConfirm={handleConfirmDialog}
              >
                <button
                  type="button"
                  className={cn(
                    'w-full top-5 gap-2 group relative rounded-lg flex flex-col md:flex-row items-center justify-center hover:bg-white',
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
                      ? 'Confirmar recebimento'
                      : 'Desativar alerta'}
                  </span>
                </button>
              </ConfirmationDialog>
            </div>
        </div>
      )}
    </>
  )
}
