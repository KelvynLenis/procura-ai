'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '../ui/skeleton'
import { UserRow } from './UserRow'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Pagination, PaginationContent, PaginationItem } from '../ui/pagination'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '../Button'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { LoadingToast } from '@/components/LoadingToast'
import type { Device } from '@/types'
import * as ExcelJS from 'exceljs'

interface User {
  $id: string
  user_id: string
  name?: string
  cpf?: string
  email?: string
  type: string
  status: string
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

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [totalUsers, setTotalUsers] = useState(0)
  const limit = 10

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    users: true,
    alerts: false,
  })

  const [isExporting, setIsExporting] = useState(false)

  async function buildParams() {
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: 'limit',
        values: [limit],
      }),
      'queries[1]': JSON.stringify({
        method: 'offset',
        values: [(page - 1) * limit],
      }),
    })
    return params
  }

  function handleGoToNextPage() {
    if (page < pages) {
      setPage(page + 1)
    }
  }

  function handleGoToPage(pageNumber: number) {
    setPage(pageNumber)
  }

  function handleGoToPreviousPage() {
    if (page > 0) {
      setPage(page - 1)
    }
  }

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

      const [devices, users] = await Promise.all([
        fetchAllDevices(),
        fetchAllUsers(),
      ])

      const deviceMap = devices.reduce(
        (acc, device) => {
          acc[device.$id] = device
          return acc
        },
        {} as Record<string, Device>
      )

      const userMap = users.reduce(
        (acc, user) => {
          acc[user.user_id] = user
          return acc
        },
        {} as Record<string, User>
      )

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
        'TIPO',
        'DESCRIÇÃO',
        'DATA',
        'ALERTA ATIVO',
        'ID DISPOSITIVO',
        'MODELO',
        'ID USUÁRIO',
        'NOME USUÁRIO',
        'LOCALIZAÇÃO',
        'ID DISTRITO',
      ]
      const data = allAlerts.map(alert => {
        const device = deviceMap[alert.id_device!]
        const user = device ? userMap[device.auth_id] : null

        return [
          alert.$id || '',
          alert.type || '',
          alert.description || '',
          alert.time_event
            ? new Date(alert.time_event).toLocaleString('pt-BR', {
                timeZone: 'UTC',
              })
            : '',
          alert.is_alert_on ? 'Sim' : 'Não',
          alert.id_device || '',
          device?.phone_model || '',
          device?.auth_id || '',
          user?.name || '',
          Array.isArray(alert.last_location)
            ? `${alert.last_location[0]},${alert.last_location[1]}`
            : '',
          alert.id_district || '',
        ]
      })

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Alertas')

      worksheet.addRow(headers).font = {
        name: 'Arial',
        bold: true,
        color: { argb: 'FFFFFF' },
      }

      data.forEach(row => {
        worksheet.addRow(row).font = { name: 'Arial' }
      })

      worksheet.columns = [
        { header: 'ID', width: 40 },
        { header: 'TIPO', width: 20 },
        { header: 'DESCRIÇÃO', width: 35 },
        { header: 'DATA', width: 20 },
        { header: 'ALERTA ATIVO', width: 15 },
        { header: 'ID DISPOSITIVO', width: 40 },
        { header: 'MODELO', width: 30 },
        { header: 'ID USUÁRIO', width: 40 },
        { header: 'NOME USUÁRIO', width: 30 },
        { header: 'LOCALIZAÇÃO', width: 40 },
        { header: 'ID DISTRITO', width: 40 },
      ]

      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '002e72' },
      }

      worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

      worksheet.autoFilter = 'A1:G1'

      const xlsxBuffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([xlsxBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)

      setIsExporting(false)
      const link = document.createElement('a')
      link.href = url
      link.download = 'alertas.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Alertas exportados com sucesso!', {
        autoClose: 3000,
      })
    } catch (error) {
      setIsExporting(false)
      console.error('Erro ao exportar XLSX:', error)
      toast.error('Erro ao exportar XLSX. Tente novamente.', {
        autoClose: 3000,
      })
    }
  }

  const handleUsersExportCSV = async () => {
    try {
      const allUsers = await fetchAllUsers()

      const headers = [
        'ID',
        'CPF',
        'NOME',
        'EMAIL',
        'PERFIL',
        'ACESSADO EM',
        'CRIADO EM',
      ]
      const data = allUsers.map(user => [
        user.user_id || '',
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

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Usuários')

      worksheet.addRow(headers).font = {
        name: 'Arial',
        bold: true,
        color: { argb: 'FFFFFF' },
      }

      data.forEach(row => {
        worksheet.addRow(row).font = { name: 'Arial' }
      })

      worksheet.columns = [
        { header: 'ID', width: 40 },
        { header: 'CPF', width: 15 },
        { header: 'NOME', width: 30 },
        { header: 'EMAIL', width: 35 },
        { header: 'PERFIL', width: 20 },
        { header: 'ACESSADO EM', width: 20 },
        { header: 'CRIADO EM', width: 20 },
      ]

      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '002e72' },
      }

      worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

      worksheet.autoFilter = 'A1:G1'

      const xlsxBuffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([xlsxBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'usuarios.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Usuários exportados com sucesso!', {
        autoClose: 3000,
      })
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error)
      toast.error('Erro ao exportar XLSX. Tente novamente.')
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
      } catch (error) {
        console.error(error)
        break
      }
    }
    return allDevices
  }

  async function fetchAllUsers() {
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

    return allUsers
  }

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)

      try {
        const params = await buildParams()
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project':
                process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || '',
            },
          }
        )

        if (!response.ok) {
          const error = await response.text()
          throw new Error(`Error: ${error}`)
        }

        const result = await response.json()
        const totalPages = Math.ceil(result.total / limit)

        setUsers(result.documents || [])
        setTotalUsers(result.total || 0)
        setPages(totalPages)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [page])

  return (
    <>
      {isExporting && <LoadingToast isReactToastifyComponent={false} />}
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="blue"
            className="w-44"
            onClick={handleExportClick}
            disabled={users.length === 0 || loading}
          >
            Exportar planilha
          </Button>
        </div>

        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
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
        </Dialog>

        <Table className="bg-white shadow-lg rounded-lg w-full">
          <TableHeader className="bg-zinc-200/60">
            <TableRow>
              <TableHead className="text-black/80 text-lg font-medium text-center">
                ID
              </TableHead>
              <TableHead className="text-black/80 text-lg font-medium ">
                Nome
              </TableHead>
              <TableHead className="text-black/80 text-lg font-medium ">
                Email
              </TableHead>
              <TableHead className="text-black/80 text-lg font-medium ">
                Perfil
              </TableHead>
              <TableHead className="text-black/80 text-lg font-medium ">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="w-full  gap-5 px-7 pt-7">
                <TableCell className="w-1/4">
                  <Skeleton className="h-8 w-full" />
                </TableCell>

                <TableCell className="w-1/4">
                  <Skeleton className="h-8 w-full" />
                </TableCell>

                <TableCell className="w-1/4">
                  <Skeleton className="h-8 w-full" />
                </TableCell>

                <TableCell className="w-1/4">
                  <Skeleton className="h-8 w-full" />
                </TableCell>

                <TableCell className="w-1/4">
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user, index) => (
                <UserRow
                  key={user.$id}
                  user={user}
                  index={index + 1 * ((page - 1) * limit)}
                  setUsers={setUsers}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell colSpan={6} className="text-center">
                <Pagination className="flex items-center justify-center w-full">
                  <PaginationContent className="py-1">
                    <PaginationItem>
                      <button
                        type="button"
                        disabled={page === 1}
                        className="flex items-center gap-1 hover:bg-zinc-200 rounded-md p-2 disabled:text-zinc-500 disabled:hover:bg-transparent"
                        onClick={handleGoToPreviousPage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Anterior</span>
                      </button>
                    </PaginationItem>
                    {[...Array(pages)].map((_, index) => (
                      <PaginationItem key={index}>
                        <button
                          type="button"
                          onClick={() => handleGoToPage(index + 1)}
                          className={cn(
                            'rounded-full px-3 py-1',
                            index === page - 1
                              ? 'bg-zinc-200 hover:bg-zinc-300'
                              : 'hover:bg-zinc-200'
                          )}
                        >
                          {index + 1}
                        </button>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <button
                        type="button"
                        disabled={page * limit >= totalUsers}
                        className="flex items-center gap-1 hover:bg-zinc-200 rounded-md p-2 disabled:text-zinc-500 disabled:hover:bg-transparent"
                        onClick={handleGoToNextPage}
                      >
                        Próximo
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  )
}
