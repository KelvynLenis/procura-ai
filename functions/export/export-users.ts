import * as ExcelJS from 'exceljs'
import { User } from '@/types'
import { listAllUsers } from '../user/list-all-users'
import { toast } from 'react-toastify'
import { formatDateTime } from '@/lib/utils'

export async function exportUsers() {
  try {
    const allUsers = await listAllUsers()

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
      user.accessed_at ? formatDateTime(user.accessed_at) : '',
      user.$createdAt ? formatDateTime(user.$createdAt) : '',
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
    throw error
  }
} 