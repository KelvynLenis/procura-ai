import * as ExcelJS from 'exceljs'
import { Device, Event, User } from '@/types'
import { listAllEvents } from '../event/list-all-events'
import { getDevices } from '../devices/list-devices'
import { listAllUsers } from '../user/list-all-users'
import { toast } from 'react-toastify'

export async function exportAlerts() {
  try {
    const [allEvents, devices, users] = await Promise.all([
      listAllEvents(),
      getDevices(),
      listAllUsers(),
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
    const data = allEvents.map(alert => {
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
    console.error('Erro ao exportar XLSX:', error)
    toast.error('Erro ao exportar XLSX. Tente novamente.')
    throw error
  }
} 