import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import NotificationRow from './NotificationRow'

function NotificationTable() {
  const [notifications, setNotifications] = useState([])

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