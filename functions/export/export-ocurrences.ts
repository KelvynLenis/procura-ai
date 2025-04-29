import * as ExcelJS from 'exceljs'
import { OccurrencesProps } from '@/types'
import { toast } from 'react-toastify'

export async function exportOccurrences(occurrences: OccurrencesProps[]) {
  try {
    const headers = [
      'ID',
      'DISPOSITIVO',
      'MARCA',
      'MODELO',
      'IMEI',
      'PROPRIETÁRIO',
      'EMAIL',
      'TIPO',
      'STATUS',
      'DESCRIÇÃO',
      'DATA',
      'LOCALIZAÇÃO',
    ]

    const data = occurrences.map((occurrence, index) => {
      return [
        index + 1,
        occurrence.device.phone_model || '',
        occurrence.device.brand || '',
        occurrence.device.phone_model || '',
        occurrence.device.imei || '',
        occurrence.user.name || '',
        occurrence.user.email || '',
        occurrence.event.type || '',
        occurrence.device.status || '',
        occurrence.event.description || '',
        occurrence.event.time_event
          ? new Date(occurrence.event.time_event).toLocaleString('pt-BR', {
              timeZone: 'UTC',
            })
          : '',
        Array.isArray(occurrence.event.last_location)
          ? `${occurrence.event.last_location[0]},${occurrence.event.last_location[1]}`
          : '',
      ]
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Ocorrências')

    worksheet.addRow(headers).font = {
      name: 'Arial',
      bold: true,
      color: { argb: 'FFFFFF' },
    }

    data.forEach(row => {
      worksheet.addRow(row).font = { name: 'Arial' }
    })

    worksheet.columns = [
      { header: 'ID', width: 10 },
      { header: 'DISPOSITIVO', width: 30 },
      { header: 'MARCA', width: 20 },
      { header: 'MODELO', width: 30 },
      { header: 'IMEI', width: 25 },
      { header: 'PROPRIETÁRIO', width: 30 },
      { header: 'EMAIL', width: 35 },
      { header: 'TIPO', width: 20 },
      { header: 'STATUS', width: 20 },
      { header: 'DESCRIÇÃO', width: 40 },
      { header: 'DATA', width: 25 },
      { header: 'LOCALIZAÇÃO', width: 30 },
    ]

    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '002e72' },
    }

    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length },
    }

    const xlsxBuffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([xlsxBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `ocorrencias_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Ocorrências exportadas com sucesso!', {
      autoClose: 3000,
    })
  } catch (error) {
    console.error('Erro ao exportar XLSX:', error)
    toast.error('Erro ao exportar XLSX. Tente novamente.')
    throw error
  }
}

