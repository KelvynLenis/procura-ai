import React, { Dispatch, useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import NotificationRow from './NotificationRow'
import { getPushNotificationHistory } from '@/functions/notification/getPushNotificationHistory'
import { Notification } from '@/types'
import { z } from 'zod'
import { useForm, UseFormProps } from 'react-hook-form'

const formSchema = z
  .object({
    title: z.string().min(1, {
      message: 'O título é obrigatório.',
    })
    .max(65, 'O título deve ter no máximo 65 caracteres'),
    description: z.string().min(1, {
      message: 'O corpo da notificação é obrigatória.',
    })
    .max(240, 'O corpo da notificação deve ter no máximo 240 caracteres'),
  })

interface NotificationTableProps {
  form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>
  refresh: boolean
}


function NotificationTable({ form, refresh }: NotificationTableProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const fetchNotifications = async () => {
      const notifications = await getPushNotificationHistory()
      setNotifications(notifications)
    }

    fetchNotifications()
  }, [refresh])

  return (
    <Table className="bg-white shadow-lg rounded-lg w-full">
      <TableHeader className="bg-zinc-100/80">
        <TableRow>
          <TableHead className="text-black/80 text-lg font-medium text-center">
            Título
          </TableHead>
          <TableHead className="text-black/80 text-lg font-medium ">
            Descrição
          </TableHead>
          <TableHead className="text-black/80 text-lg font-medium ">
            Público
          </TableHead>
          <TableHead className="text-black/80 text-lg font-medium ">
            Data de publicação
          </TableHead>
          <TableHead className="text-black/80 text-lg font-medium ">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <NotificationRow
              key={index}
              notification={notification}
              form={form}
            />
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              Nenhuma notificação cadastrada.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default NotificationTable