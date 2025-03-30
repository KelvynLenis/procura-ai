'use client'

import { OccurrencesMap } from '@/components/Maps/OccurrencesMap'
import { Device, Event, OccurrencesProps } from '@/types'
import Link from 'next/link'
import { TbArrowsMinimize } from 'react-icons/tb'
import { NotificationButton } from '@/components/NotificationButton'
import { useEffect, useState } from 'react'
import { joinDevicesEventsUsers } from '@/functions/occurences/get-occurrences'
import { toast } from 'react-toastify'
import { account } from '@/lib/appwrite'
import { listDevicesByStatus } from '@/functions/device/list-devices-by-status'
import { listDevices } from '@/functions/device/list-devices'

interface Notification {
  $id: string
  type: string
  description: string
  time_event: string
  id_device: string
  is_alert_on: boolean
}

export default function Dashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [occurencesData, setOccurencesData] = useState<OccurrencesProps[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUser = await account.get()
        const userId = authUser.$id
        const isAdmin = authUser.labels?.[0] === 'admin'

        const [
          dashboardData,
          recoveredDevices,
          lostDevices,
          robbedDevices,
          theftDevices,
          allDevices,
        ] = await Promise.all([
          joinDevicesEventsUsers(),
          listDevicesByStatus({ status: 'Recuperado', userId, isAdmin }),
          listDevicesByStatus({ status: 'Perdido', userId, isAdmin }),
          listDevicesByStatus({ status: 'Roubado', userId, isAdmin }),
          listDevicesByStatus({ status: 'Furtado', userId, isAdmin }),
          listDevices({ userId, limit: 100, page: 1, isAdmin }),
        ])

        setOccurencesData(dashboardData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados do mapa')
      }
    }

    fetchData()
  }, [notifications])

  return (
    <div className="flex flex-col">
      <div className="absolute top-0 right-16 z-10">
        <NotificationButton
          notifications={notifications}
          setNotifications={setNotifications}
        />
      </div>
      <OccurrencesMap 
        occurences={occurencesData} 
        notifications={notifications}
        setNotifications={setNotifications}
      />
      <Link href={'/dashboard'}>
        <TbArrowsMinimize
          size={38}
          className="absolute top-4 right-5 z-10 hover:animate-pulse bg-white rounded-xl p-1 shadow"
        />
      </Link>
    </div>
  )
}
