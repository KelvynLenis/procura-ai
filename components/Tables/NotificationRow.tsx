'use client'

import { TableCell, TableRow } from '@/components/ui/table'
import { Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useState } from 'react'

function NotificationRow() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  return (
    <TableRow>
      <TableCell className="text-center py-8 font-bold">
        titulo
      </TableCell>
      <TableCell className="break-words">
        <div className="flex items-center font-medium">
          descrição
        </div>
      </TableCell>
      <TableCell className="font-medium break-words">
        publico
      </TableCell>
      <TableCell className={cn('font-medium break-words')}>
        data
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
        </div>
      </TableCell>
    </TableRow>
  )
}

export default NotificationRow