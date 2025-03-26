import { OccurrencesMap } from '@/components/Maps/OccurrencesMap'
import { Device, Event } from '@/types'
import Link from 'next/link'
import { TbArrowsMinimize } from 'react-icons/tb'
import { listStolenDevices } from '@/functions/device/list-stolen-devices'
import { listEvents } from '@/functions/event/list-events'
import { getUserInfo } from '@/functions/user/get-user-info'

export default async function Dashboard() {
  async function getDashboardData() {
    try {
      const [devicesData, fetchedEvents] = await Promise.all([
        listStolenDevices(),
        listEvents()
      ])

      if (devicesData.length === 0) return []

      const enrichDevice = async (device: Device) => {
        const recentEvent = fetchedEvents
          .filter((event: Event) => event.id_device === device.$id)
          .sort((a: Event, b: Event) =>
            new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
          )[0]

        const ownerResponse = await getUserInfo(device.auth_id!)
        const ownerInfo = ownerResponse?.[0]

        return {
          device: { ...device },
          event: recentEvent,
          user: {
            name: ownerInfo?.name || 'Usuário excluído',
            email: ownerInfo?.email || 'N/A',
          },
        }
      }

      return await Promise.all(devicesData.map(enrichDevice))
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      throw error
    }
  }

  let occurencesData

  try {
    const dashboardData = await getDashboardData()
    occurencesData = dashboardData
  } catch (error) {
    console.error(error)
  }

  return (
    <div className="flex flex-col">
      <OccurrencesMap occurences={occurencesData} />
      <Link href={'/dashboard'}>
        <TbArrowsMinimize
          size={38}
          className="absolute top-4 right-5 z-10 hover:animate-pulse bg-white rounded-xl p-1 shadow"
        />
      </Link>
    </div>
  )
}
