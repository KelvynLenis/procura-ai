'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Button from '@/components/Button'
import RechartChart from './RechartChart'
import { CardChart } from './CardChart'
import { OccurrencesMap } from '../Maps/OccurrencesMap'
import { OccurrencesHeatMap } from '../Maps/OccurrencesHeatMap'
import { BiExpandAlt } from 'react-icons/bi'

import type { Device, District, Event, Notification, OccurrencesProps } from '@/types'
import { LoadingToast } from '../LoadingToast'
import PieChartRechart from './PieChartRechart'
import { NotificationButton } from '../AdminNotificationButton'
import { listStolenDevices } from '@/functions/device/list-stolen-devices'
import { listEvents } from '@/functions/event/list-events'
import { getUserInfo } from '@/functions/user/get-user-info'
import { listDevicesByStatus } from '@/functions/device/list-devices-by-status'
import { listDevices } from '@/functions/device/list-devices'
import { listDistricts } from '@/functions/district/list-districts'
import { account } from '@/lib/appwrite'
import { joinDevicesEventsUsers } from '@/functions/occurences/get-occurrences'
import { useNotification } from '@/contexts/NotificationContext'


export function Dashboard() {
  const [deviceStats, setDeviceStats] = useState({
    total: 0,
    recovered: 0,
    robbed: 0,
    lost: 0,
    theft: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])

  const {
    notifications,
    selectedLocation,
    selectedOccurrence,
    occurrences,
    refreshOccurrences,
    clearSelection,
  } = useNotification()

  const router = useRouter()

  async function getDashboardData(): Promise<OccurrencesProps[]> {
    try {
      const [devicesData, fetchedEvents] = await Promise.all([
        listStolenDevices(),
        listEvents(),
      ])

      console.log('fetchedEvents', fetchedEvents)

      if (devicesData.length === 0) return []

      const enrichDevice = async (device: Device) => {
        const recentEvent = fetchedEvents
          .filter((event: Event) => event.id_device === device.$id)
          .sort(
            (a: Event, b: Event) =>
              new Date(b.$createdAt).getTime() -
              new Date(a.$createdAt).getTime()
          )[0]

        const ownerResponse = await getUserInfo(device.auth_id!)
        const ownerInfo = ownerResponse?.[0]

        return {
          device: { ...device },
          event: recentEvent,
          user: {
            name: ownerInfo?.name || 'Usuário excluído',
            email: ownerInfo?.email || 'N/A',
            cpf: ownerInfo?.cpf || 'N/A',
          },
        }
      }

      return await Promise.all(devicesData.map(enrichDevice))
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      toast.error('Erro ao carregar dados do dashboard')
      throw error
    }
  }

  function showLoadingToast(url: string) {
    setIsLoading(true)
    router.push(url)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUser = await account.get()
        const userId = authUser.$id
        const isAdmin = authUser.labels?.[0] === 'admin'

        const [
          recoveredDevices,
          lostDevices,
          robbedDevices,
          theftDevices,
          allDevices,
          allDistricts,
        ] = await Promise.all([
          listDevicesByStatus({ status: 'Recuperado', userId, isAdmin }),
          listDevicesByStatus({ status: 'Perdido', userId, isAdmin }),
          listDevicesByStatus({ status: 'Roubado', userId, isAdmin }),
          listDevicesByStatus({ status: 'Furtado', userId, isAdmin }),
          listDevices({ userId, limit: 100, page: 1, isAdmin }),
          listDistricts(),
        ])

        setDeviceStats({
          total: allDevices.total || 0,
          recovered: recoveredDevices.length,
          robbed: robbedDevices.length,
          lost: lostDevices.length,
          theft: theftDevices.length,
        })
        setDistricts(allDistricts)

        await refreshOccurrences()
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados do dashboard')
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (selectedLocation && selectedOccurrence) {
      console.log('Dashboard: Nova notificação selecionada', { 
        selectedLocation, 
        selectedOccurrence: selectedOccurrence.device.$id,
        eventType: selectedOccurrence.event?.type
      })
    }
  }, [selectedLocation, selectedOccurrence])

  useEffect(() => {
    console.log('Dashboard: Ocorrências atualizadas', occurrences.length)
    if (selectedOccurrence && !occurrences.find(occ => occ.device.$id === selectedOccurrence.device.$id)) {
      console.log('Dashboard: Ocorrência selecionada não encontrada, limpando seleção')
      clearSelection()
    }
  }, [occurrences, selectedOccurrence, clearSelection])

  return (
    <>
      {isLoading && <LoadingToast isReactToastifyComponent={false} />}

      <div className="w-full h-full flex flex-col py-5 justify-start items-center gap-5">
        <div className="relative flex flex-col md:mr-2 self-start w-[100%] 2xl:w-[100%] bg-white rounded-xl ring-1 ring-zinc-300 p-4 justify-center gap-4">
          <div className="flex justify-between">
            <h2 className="text-3xxl font-black text-procura-ai-blue">
              Localização de ocorrências
            </h2>
            <button
              type="button"
              onClick={() => showLoadingToast('/map/ocorrencias')}
              title="Clique para expandir"
              className="flex text-procura-ai-blue items-center gap-1 text-sm hover:opacity-50"
            >
              Expandir
              <BiExpandAlt size={18} />
            </button>
          </div>

          <div className="flex w-full gap-4">
            <OccurrencesMap
              occurences={occurrences}
              selectedLocation={selectedLocation}
              selectedOccurrence={selectedOccurrence}
            />
          </div>
        </div>

        <div className="flex justify-around w-full">
          <div className="grid grid-cols-2 w-1/2 self-start gap-1">
            <CardChart
              variant="blue"
              number={deviceStats.total}
              title="Dispositivos cadastrados"
              className="mb-10"
            />
            <CardChart
              variant="green"
              number={deviceStats.recovered}
              title="Dispositivos recuperados"
              className="mb-10"
            />
            <CardChart
              variant="red"
              number={deviceStats.robbed}
              title="Dispositivos Roubados"
              className="mb-10"
            />
            <CardChart
              variant="orange"
              number={deviceStats.theft}
              title="Dispositivos Furtados"
              className="mb-10"
            />
            <CardChart
              variant="yellow"
              number={deviceStats.lost}
              title="Dispositivos Perdidos"
            />
            <CardChart
              variant="city"
              number={1}
              title="Municípios monitoriados"
            />
          </div>

          <div className="flex flex-col gap-2 w-1/2 h-[380px] text-sm bg-white items-center justify-center ring-1 ring-zinc-300 rounded-lg self-start">
            <span className="flex flex-col w-full items-start px-4 pt-3 font-semibold text-procura-ai-blue">
              Dispositivos cadastrados
              <span className="font-medium">Status</span>
            </span>
            <PieChartRechart
              numberOfDevicesRegistered={deviceStats.total}
              numberOfDevicesLost={deviceStats.lost}
              numberOfDevicesRecovered={deviceStats.recovered}
              numberOfDevicesRobbed={deviceStats.robbed}
              numbeOfDevicesTheft={deviceStats.theft}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full h-fit p-3 text-sm bg-white items-center justify-center ring-1 ring-zinc-300 rounded-lg self-start">
          <div className="flex justify-between w-full">
            <span className="flex flex-col w-full items-start self-start font-semibold text-procura-ai-blue">
              Ocorrências distribuídas nos bairros de João Pessoa
            </span>
            <button
              type="button"
              onClick={() => showLoadingToast('map/bairros')}
              title="Clique para expandir"
              className="flex text-procura-ai-blue items-center gap-1 text-sm hover:opacity-50"
            >
              Expandir
              <BiExpandAlt size={18} />
            </button>
          </div>

          <div className="w-full h-full flex items-center justify-center bg-zinc-200 rounded-sm relative">
            <OccurrencesHeatMap districts={districts} />
          </div>
        </div>
      </div>

      {isLoading && <LoadingToast />}
    </>
  )
}
