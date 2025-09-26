'use client'

import { TableCell, TableRow } from '@/components/ui/table'
import { Pencil, SendHorizonal } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn, formatDateTime } from '@/lib/utils'
import { useState } from 'react'
import { Notification } from '@/types'
import { z } from 'zod'
import { useForm } from 'react-hook-form'

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

interface NotificationRowProps {
  notification: Notification
  form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>
}

function NotificationRow({ notification, form }: NotificationRowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  function handleFillForm() {
    form.setValue('title', notification.title!)
    form.setValue('description', notification.message)
    window.scrollTo(0, 0)
  }
  
  return (
    <TableRow>
      <TableCell className="text-center py-8 font-bold">
        {notification.title}
      </TableCell>
      <TableCell className="break-words">
        <div className="flex items-center font-medium">
          {notification.message}
        </div>
      </TableCell>
      <TableCell className="font-medium break-words">
        Todos os usuários
      </TableCell>
      <TableCell className={cn('font-medium break-words')}>
        {formatDateTime(notification.$createdAt!)}
      </TableCell>
      <TableCell className="w-28 p-0 m-0">
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="rounded-lg w-10 h-10 flex ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
              >
                <Pencil size={26} />
                <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                  Editar contato
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className='rounded-xl p-0'>
              <DialogHeader className='bg-secondary/10 p-2'>
                <DialogTitle className='text-secondary text-left w-full'>Editar contato</DialogTitle>
                <DialogDescription className='text-secondary'>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <button
            type='button'
            className='rounded-lg w-10 h-10 flex ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90'
            onClick={handleFillForm}
          >
            <SendHorizonal size={26} />
          </button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default NotificationRow