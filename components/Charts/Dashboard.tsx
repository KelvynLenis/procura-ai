'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'react-toastify'
import Button from '@/components/Button'

import RechartChart from './RechartChart'
import { CardChart } from './CardChart'

// import Map from "./Map/Map";
import { OccurrencesMap } from '../Maps/OccurrencesMap'
import { OccurrencesHeatMap } from '../Maps/OccurrencesHeatMap'
import { MapTiler2 } from '../Maps/MapTiler2'
import { GoogleMapsEmbed } from '@next/third-parties/google'

import { BiExpandAlt } from 'react-icons/bi'

import type { Device, District, Event, EventProps } from '@/types'
import { useRouter } from 'next/navigation'
import { LoadingToast } from '../LoadingToast'
import PieChartRechart from './PieChartRechart'
import { NotificationButton } from '../NotificationButton'

interface User {
  $id?: string
  name?: string
  cpf?: string
  email?: string
  type: string
  accessed_at?: string
  $createdAt?: string
}
interface Events {
  $id?: string
  time_event?: string
  description?: string
  type?: string
  is_alert_on?: boolean
  id_device?: string
  last_location?: []
  id_district?: string
}

export function Dashboard() {
  const [occurrences, setOccurrences] = useState<EventProps[]>([])
  const [numberOfDevicesRegistered, setNumberOfDevicesRegistered] = useState(0)
  const [numberOfDevicesRecovered, setNumberOfDevicesRecovered] = useState(0)
  const [numberOfDevicesRobbed, setNumberOfDevicesRobbed] = useState(0)
  const [numberOfDevicesLost, setNumberOfDevicesLost] = useState(0)
  const [numbeOfDevicesTheft, setNumbeOfDevicesTheft] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const [notifications, setNotifications] = useState([])
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    users: true,
    alerts: false,
  })
  const [isExporting, setIsExporting] = useState(false)

  // let districts: District[] = []

  const router = useRouter()

  async function getNumberOfRecoveredDevices() {
    const allEvents: Event[] = []
    let offset = 0
    const limit = 25
    let total = Number.POSITIVE_INFINITY
    while (offset < total) {
      const params = new URLSearchParams({
        'queries[0]': JSON.stringify({
          method: 'equal',
          attribute: 'type',
          values: ['Recuperado'],
        }),
        'queries[1]': JSON.stringify({
          method: 'limit',
          values: [limit],
        }),
        'queries[2]': JSON.stringify({
          method: 'offset',
          values: [offset],
        }),
      })

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${await response.text()}`)
        }

        const { documents, total: fetchedTotal } = await response.json()
        allEvents.push(...documents)
        total = fetchedTotal
        offset += limit

        setNumberOfDevicesRecovered(fetchedTotal)
      } catch (error) {
        console.error(error)
        break
      }
    }
    return allEvents
  }
  async function getNumberOfLostDevices() {
    const allDevices: Device[] = []
    let offset = 0
    const limit = 25
    let total = Number.POSITIVE_INFINITY
    while (offset < total) {
      const params = new URLSearchParams({
        'queries[0]': JSON.stringify({
          method: 'equal',
          attribute: 'status',
          values: ['Perdido'],
        }),
        'queries[1]': JSON.stringify({
          method: 'limit',
          values: [limit],
        }),
        'queries[2]': JSON.stringify({
          method: 'offset',
          values: [offset],
        }),
      })
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch stolen devices: ${await response.text()}`
          )
        }

        const { documents, total: fetchedTotal } = await response.json()

        allDevices.push(...documents)
        total = fetchedTotal
        offset += limit
        setNumberOfDevicesLost(fetchedTotal)
      } catch (error) {
        console.error(error)
        break
      }
    }
    return allDevices
  }

  async function getNumberOfRobbedDevices() {
    const allEvents: Event[] = []
    let offset = 0
    const limit = 25
    let total = Number.POSITIVE_INFINITY

    while (offset < total) {
      const params = new URLSearchParams({
        'queries[0]': JSON.stringify({
          method: 'equal',
          attribute: 'status',
          values: ['Roubado'],
        }),
        'queries[1]': JSON.stringify({
          method: 'limit',
          values: [limit],
        }),
        'queries[2]': JSON.stringify({
          method: 'offset',
          values: [offset],
        }),
      })

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${await response.text()}`)
        }

        const { documents, total: fetchedTotal } = await response.json()
        allEvents.push(...documents)
        total = fetchedTotal
        offset += limit
        setNumberOfDevicesRobbed(fetchedTotal)
      } catch (error) {
        console.error(error)
        break
      }
    }
    return allEvents
  }

  async function getNumberOfTheftDevices() {
    const allEvents: Event[] = []
    let offset = 0
    const limit = 25
    let total = Number.POSITIVE_INFINITY

    while (offset < total) {
      const params = new URLSearchParams({
        'queries[0]': JSON.stringify({
          method: 'equal',
          attribute: 'status',
          values: ['Furtado'],
        }),
        'queries[1]': JSON.stringify({
          method: 'limit',
          values: [limit],
        }),
        'queries[2]': JSON.stringify({
          method: 'offset',
          values: [offset],
        }),
      })

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${await response.text()}`)
        }

        const { documents, total: fetchedTotal } = await response.json()
        allEvents.push(...documents)
        total = fetchedTotal
        offset += limit
        setNumbeOfDevicesTheft(fetchedTotal)
      } catch (error) {
        console.error(error)
        break
      }
    }
    return allEvents
  }

  async function getAllDistricts() {
    let offset = 0
    const limit = 25
    let total = Number.POSITIVE_INFINITY

    const allDistricts: District[] = []

    while (offset < total) {
      const params = new URLSearchParams({
        'queries[0]': JSON.stringify({
          method: 'equal',
          attribute: 'name_municipality',
          values: ['João Pessoa'],
        }),
        'queries[1]': JSON.stringify({
          method: 'limit',
          values: [limit],
        }),
        'queries[2]': JSON.stringify({
          method: 'offset',
          values: [offset],
        }),
      })

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DISTRICT}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${await response.text()}`)
        }

        const { documents, total: fetchedTotal } = await response.json()

        allDistricts.push(...documents)
        total = fetchedTotal
        offset += limit
      } catch (error) {
        console.error(error)
        break
      }
    }

    setDistricts(allDistricts)
  }

  async function fetchStolenDevices() {
    const allDevices: Device[] = []
    let offset = 0
    const limit = 25
    let total = Number.POSITIVE_INFINITY
    while (offset < total) {
      const params = new URLSearchParams({
        'queries[0]': JSON.stringify({
          method: 'equal',
          attribute: 'is_stolen',
          values: [true],
        }),
        'queries[1]': JSON.stringify({
          method: 'limit',
          values: [limit],
        }),
        'queries[2]': JSON.stringify({
          method: 'offset',
          values: [offset],
        }),
      })
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch stolen devices: ${await response.text()}`
          )
        }

        const { documents, total: fetchedTotal } = await response.json()

        allDevices.push(...documents)
        total = fetchedTotal
        offset += limit
      } catch (error) {
        console.error(error)
        break
      }
    }
    return allDevices
  }
  async function fetchEvents(): Promise<Event[]> {
    const allEvents: Event[] = []
    let offset = 0
    const limit = 25
    let total = Number.POSITIVE_INFINITY

    while (offset < total) {
      const params = new URLSearchParams({
        'queries[0]': JSON.stringify({
          method: 'equal',
          attribute: 'is_alert_on',
          values: [true],
        }),
        'queries[1]': JSON.stringify({
          method: 'limit',
          values: [limit],
        }),
        'queries[2]': JSON.stringify({
          method: 'offset',
          values: [offset],
        }),
      })

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project':
                process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || '',
            },
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${await response.text()}`)
        }

        const { documents, total: fetchedTotal } = await response.json()
        allEvents.push(...documents)
        total = fetchedTotal
        offset += limit
      } catch (error) {
        console.error(error)
        break
      }
    }
    return allEvents
  }

  async function fetchOwnerInfo(auth_id: string) {
    const allUsers = []
    let offset = 0
    const limit = 25
    let total = Number.POSITIVE_INFINITY

    while (offset < total) {
      const params = new URLSearchParams({
        'queries[0]': JSON.stringify({
          method: 'equal',
          attribute: 'user_id',
          values: [auth_id],
        }),
        'queries[1]': JSON.stringify({
          method: 'limit',
          values: [limit],
        }),
        'queries[2]': JSON.stringify({
          method: 'offset',
          values: [offset],
        }),
      })
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          const error = await response.text()
          throw new Error(`Failed to fetch user info: ${error}`)
        }
        const { documents, total: fetchedTotal } = await response.json()
        allUsers.push(...documents)
        total = fetchedTotal
        offset += limit
      } catch (error) {
        console.error(error)
        break
      }
    }
    return allUsers
  }

  async function getDashboardData() {
    try {
      const devicesData = await fetchStolenDevices()

      if (devicesData.length === 0) return []

      const events = await fetchEvents()

      const enrichedDevices = await Promise.all(
        devicesData.map(async device => {
          const recentEvent = events
            .filter(event => event.id_device === device.$id)
            .sort(
              (a, b) =>
                new Date(b.$createdAt).getTime() -
                new Date(a.$createdAt).getTime()
            )[0]

          const ownerResponse = await fetchOwnerInfo(device.auth_id!)
          const ownerInfo = ownerResponse?.[0]
          return {
            device: { ...device },
            event: recentEvent,
            user: {
              name: ownerInfo?.name || 'Usuário excluído',
              email: ownerInfo?.email || 'N/A',
            },
          }
        })
      )

      return enrichedDevices
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      throw error
    }
  }

  async function fetchAllDevices() {
    const allDevices: Device[] = []
    let offset = 0
    const limit = 25
    let total = Number.POSITIVE_INFINITY
    while (offset < total) {
      const params = new URLSearchParams({
        'queries[0]': JSON.stringify({
          method: 'limit',
          values: [limit],
        }),
        'queries[1]': JSON.stringify({
          method: 'offset',
          values: [offset],
        }),
      })
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch stolen devices: ${await response.text()}`
          )
        }

        const { documents, total: fetchedTotal } = await response.json()

        allDevices.push(...documents)
        total = fetchedTotal
        offset += limit
        setNumberOfDevicesRegistered(fetchedTotal)
      } catch (error) {
        console.error(error)
        break
      }
    }
    return allDevices
  }

  function showLoadingToast(url: string) {
    setIsLoading(true)
    router.push(`${url}`)
  }

  useEffect(() => {
    const fetchOccurrences = async () => {
      try {
        const dashboardData = await getDashboardData()

        setOccurrences(dashboardData)
      } catch (error) {}
    }

    fetchOccurrences()
    fetchStolenDevices()
    getNumberOfRecoveredDevices()
    getNumberOfLostDevices()
    getNumberOfRobbedDevices()
    getNumberOfTheftDevices()
    getAllDistricts()
    fetchAllDevices()
  }, [notifications])

  const handleExportOptionChange = (option: 'users' | 'alerts') => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }))
  }

  const handleExportClick = () => {
    setIsExportDialogOpen(true)
  }

  const handleConfirmExport = async () => {
    if (exportOptions.users) {
      await handleUsersExportCSV()
    }
    if (exportOptions.alerts) {
      await handleAlertsExportCSV()
    }
    setIsExportDialogOpen(false)
  }

  const handleAlertsExportCSV = async () => {
    try {
      setIsExporting(true)
      const allAlerts: Events[] = []
      let offset = 0
      const limit = 25
      let total = Number.POSITIVE_INFINITY

      while (offset < total) {
        const params = new URLSearchParams({
          'queries[0]': JSON.stringify({
            method: 'limit',
            values: [limit],
          }),
          'queries[1]': JSON.stringify({
            method: 'offset',
            values: [offset],
          }),
        })

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project':
                process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || '',
            },
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(`Falha ao buscar alertas: ${await response.text()}`)
        }

        const { documents, total: fetchedTotal } = await response.json()
        allAlerts.push(...documents)
        total = fetchedTotal
        offset += limit
      }

      const headers = [
        'ID',
        'type',
        'description',
        'time_event',
        'is_alert_on',
        'id_device',
        'last_location',
        'id_district',
      ]
      const csvData = allAlerts.map(alert => [
        alert.$id || '',
        alert.type || '',
        alert.description || '',
        alert.time_event || '',
        alert.is_alert_on || '',
        alert.id_device || '',
        alert.last_location
          ? `${alert.last_location[0]},${alert.last_location[1]}`
          : '',
        alert.id_district || '',
      ])

      const csvContent = [
        headers.join(';'),
        ...csvData.map(row => row.join(';')),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', 'alertas.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setIsExporting(false)
      toast.success('Alertas exportados com sucesso!', {
        autoClose: 3000,
      })
    } catch (error) {
      setIsExporting(false)
      console.error('Erro ao exportar CSV:', error)
      toast.error('Erro ao exportar CSV. Tente novamente.', {
        autoClose: 3000,
      })
    }
  }

  const handleUsersExportCSV = async () => {
    try {
      const allUsers: User[] = []
      let offset = 0
      const limit = 25
      let total = Number.POSITIVE_INFINITY

      while (offset < total) {
        const params = new URLSearchParams({
          'queries[0]': JSON.stringify({
            method: 'limit',
            values: [limit],
          }),
          'queries[1]': JSON.stringify({
            method: 'offset',
            values: [offset],
          }),
        })

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project':
                process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || '',
            },
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(`Falha ao buscar usuários: ${await response.text()}`)
        }

        const { documents, total: fetchedTotal } = await response.json()
        allUsers.push(...documents)
        total = fetchedTotal
        offset += limit
      }

      const headers = [
        'ID',
        'CPF',
        'NOME',
        'EMAIL',
        'PERFIL',
        'ACESSADO EM',
        'CRIADO EM',
      ]
      const csvData = allUsers.map(user => [
        user.$id || '',
        user.cpf || '',
        user.name || '',
        user.email || '',
        user.type || '',
        user.accessed_at
          ? new Date(user.accessed_at).toLocaleString('pt-BR', {
              timeZone: 'UTC',
            })
          : '',
        user.$createdAt
          ? new Date(user.$createdAt).toLocaleString('pt-BR', {
              timeZone: 'UTC',
            })
          : '',
      ])

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(',')),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', 'usuarios.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setIsExporting(false)
      toast.success('Usuários exportados com sucesso!', {
        autoClose: 3000,
      })
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      toast.error('Erro ao exportar CSV. Tente novamente.')
    }
  }

  return (
    <>
      {isExporting && <LoadingToast isReactToastifyComponent={false} />}
      <div className="absolute top-0 right-5 z-10">
        <NotificationButton
          notifications={notifications}
          setNotifications={setNotifications}
        />
      </div>

      <div className="w-full h-full flex flex-col py-5 justify-start items-center gap-5">
        {/* <div className="flex justify-between items-center w-full px-8">
          <Button
            variant="blue"
            className="w-44"
            onClick={handleExportClick}
          >
            Exportar planilha
          </Button>
        </div> */}

        {/* <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Selecione os arquivos para exportar</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.users}
                  onChange={() => handleExportOptionChange('users')}
                  className="w-4 h-4"
                />
                Emitir Usuarios.csv
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.alerts}
                  onChange={() => handleExportOptionChange('alerts')}
                  className="w-4 h-4"
                />
                Emitir Alertas.csv
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="white"
                onClick={() => setIsExportDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="blue"
                onClick={handleConfirmExport}
                disabled={!exportOptions.users && !exportOptions.alerts}
              >
                Exportar
              </Button>
            </div>
          </DialogContent>
        </Dialog> */}

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
            <OccurrencesMap occurences={occurrences} />
          </div>
        </div>

        <div className="flex justify-around w-full">
          <div className="grid grid-cols-2 w-1/2 self-start gap-1">
            <CardChart
              variant="blue"
              number={numberOfDevicesRegistered}
              title="Dispositivos cadastrados"
              className="mb-10"
            />
            <CardChart
              variant="green"
              number={numberOfDevicesRecovered}
              title="Dispositivos recuperados"
              className="mb-10"
            />
            <CardChart
              variant="red"
              number={numberOfDevicesRobbed}
              title="Dispositivos Roubados"
              className="mb-10"
            />
            <CardChart
              variant="orange"
              number={numbeOfDevicesTheft}
              title="Dispositivos Furtados"
              className="mb-10"
            />
            <CardChart
              variant="yellow"
              number={numberOfDevicesLost}
              title="Dispositivos Perdidos"
            />
            <CardChart
              variant="city"
              number={1}
              title="Municípios monitoriados"
            />
          </div>

          <div className="flex flex-col gap-2 w-1/2 h-[380px] text-sm bg-white items-center justify-center  ring-1 ring-zinc-300 rounded-lg self-start">
            <span className="flex flex-col w-full items-start px-4 pt-3 font-semibold text-procura-ai-blue">
              Dispositivos cadastrados
              <span className="font-medium">Status</span>
            </span>
            <PieChartRechart
              numberOfDevicesRegistered={numberOfDevicesRegistered}
              numberOfDevicesLost={numberOfDevicesLost}
              numberOfDevicesRecovered={numberOfDevicesRecovered}
              numberOfDevicesRobbed={numberOfDevicesRobbed}
              numbeOfDevicesTheft={numbeOfDevicesTheft}
            />
          </div>
        </div>

        {/* <div className="flex w-full justify-around flex-wrap gap-5"></div> */}
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
