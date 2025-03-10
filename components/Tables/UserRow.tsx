'use client'

import { useEffect, useState } from 'react'
import type { DeviceProps } from '@/utils/types'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Info, Trash, UserX } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { toast } from 'react-toastify'
import { account } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { deleteUser } from '@/functions/delete-user'

interface UserRowProps {
  $id?: string
  name?: string
  cpf?: string
  email?: string
  user_id?: string
  type?: string
  accessed_at?: string
  $createdAt?: string
}

export function UserRow({
  user,
  index,
}: { user: UserRowProps; index: number }) {
  const [devices, setDevices] = useState<DeviceProps[]>([] as DeviceProps[])
  const [isLoading, setIsLoading] = useState(true)
  const [color, setColor] = useState('')

  async function buildParams() {
    const userId = user.user_id
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: 'equal',
        attribute: 'auth_id',
        values: [userId],
      }),
    })
    return params
  }

  async function handleDeleteUser(userAuthid: string, userDocumentId: string) {
    try {
      await deleteUser(userAuthid)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents/${userDocumentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project':
              process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || '',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${await response.text()}`)
      }

      toast.success('Usuário deletado com sucesso!')
    } catch (error) {
      toast.error('Erro ao deletar usuário. Tente novamente.')
      console.error('Erro ao deletar usuário:', error)
    }
  }

  async function handleDeactivateUser(userId: string) {
    const updatedUser = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents/${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        body: JSON.stringify({
          data: {
            status: 'inactive',
          },
        }),
      }
    )
  }

  useEffect(() => {
    const getDevices = async () => {
      setIsLoading(true)
      try {
        const params = await buildParams()
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
          }
        )

        if (!response.ok) {
          const error = await response.text()
          throw new Error(`Error: ${error}`)
        }

        const result = await response.json()

        setDevices(result.documents || [])
      } catch (err) {
        console.error(`Fetch error: ${err}`)
      } finally {
        setIsLoading(false)
      }
    }

    getDevices()

    getRandomProfileColor()
  }, [])

  function getRandomProfileColor() {
    const colors = [
      '#FF5733',
      '#33FF57',
      '#3357FF',
      '#FF33A8',
      '#FFC300',
      '#A833FF',
      '#33FFF6',
      '#FF8C33',
      '#57FF33',
      '#33A8FF',
    ]

    setColor(colors[Math.floor(Math.random() * colors.length)])
  }

  return (
    <>
      <TableRow>
        <TableCell className="text-center py-8 font-bold">
          {index + 1}
        </TableCell>
        <TableCell className="break-words">
          <div className="flex  items-center">
            <span
              className={cn(
                'text-xl text-white font-bold uppercase rounded-full w-10 h-10 px-1 flex items-center justify-center mr-3 bg-procura-ai-blue'
              )}
            >
              {user.name!.split(' ').length > 1
                ? user.name!.split(' ')[0][0] + user.name!.split(' ')[1][0]
                : user.name!.split(' ')[0][0]}
            </span>
            <span className="text-lg font-bold">{user.name || 'N/A'}</span>
          </div>
        </TableCell>
        <TableCell className="font-bold text-lg break-words">
          {user.email || 'N/A'}
        </TableCell>
        <TableCell className={cn('font-bold break-words')}>
          <span
            className={cn(
              'font-bold text-lg break-words p-2 rounded-md capitalize',
              user.type === 'Usuario'
                ? 'bg-sky-400/40 text-sky-700'
                : 'bg-blue-500/30 text-blue-700'
            )}
          >
            {user.type === 'Usuario' ? 'Usuário' : user.type || 'N/A'}
          </span>
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="rounded-lg w-10 h-10 flex ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
                >
                  <Eye size={26} />
                  <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                    Exibir informações
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="flex flex-col py-10 gap-10 w-[70%]">
                <DialogHeader>
                  <DialogTitle>Detalhes do usuários</DialogTitle>
                </DialogHeader>

                <div className="flex flex-wrap gap-10">
                  <span
                    className={cn(
                      'text-3xl text-white capitalize font-bold rounded-full w-14 h-14 px-1 flex items-center justify-center mr-3 bg-procura-ai-blue'
                    )}
                  >
                    {user.name!.split(' ').length > 1
                      ? user.name!.split(' ')[0][0] +
                        user.name!.split(' ')[1][0]
                      : user.name!.split(' ')[0][0]}
                  </span>

                  <div className="flex flex-col items-start justify-center">
                    <span className="font-bold">Nome completo</span>
                    <span className="break-words">{user.name}</span>
                  </div>

                  <div className="flex flex-col items-start justify-center">
                    <span className="font-bold">Email</span>
                    <span>{user.email}</span>
                  </div>

                  <div className="flex flex-col gap-2 items-center justify-start">
                    <span className="font-bold">CPF</span>
                    <span>{user.cpf}</span>
                  </div>

                  <div className="flex flex-col items-start justify-center">
                    <span className="font-bold">Último acesso</span>
                    <span>
                      {user.accessed_at
                        ? format(
                            new Date(user.accessed_at),
                            'dd/MM/yyyy - HH:mm',
                            { locale: ptBR }
                          )
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="flex flex-col items-start justify-center">
                    <span className="font-bold">Registrado em</span>
                    <span>
                      {user.$createdAt
                        ? format(
                            new Date(user.$createdAt),
                            'dd/MM/yyyy - HH:mm',
                            { locale: ptBR }
                          )
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="font-bold">Dispositivos</span>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">IMEI</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead className="text-right">Número</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devices.map((device, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {device.imei}
                          </TableCell>
                          <TableCell className="capitalize">
                            {device.brand}
                          </TableCell>
                          <TableCell className="capitalize">
                            {device.phone_model}
                          </TableCell>
                          <TableCell className="text-right">
                            {device.phone_number}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="rounded-lg w-10 h-10 flex ring-1 ring-zinc-300 group relative hover:bg-red-100 hover:ring-red-700 hover:text-red-700 items-center justify-center hover:opacity-90"
                >
                  <UserX size={26} />
                  <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                    Desativar usuário
                  </span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Tem certeza que deseja desativar o usuário?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Os dados do usuáiro permaneceram na base de dados,
                    entretanto seu acesso será revogado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full text-center items-center justify-center flex w-fit px-2 py-2 drop-shadow-lg transition-all duration-300 disabled:bg-zinc-300 disabled:text-zinc-400 disabled:ring-0 bg-procura-ai-blue text-white hover:bg-white hover:text-procura-ai-blue hover:ring-1 hover:ring-procura-ai-blue">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeactivateUser(user.$id!)}
                    className="rounded-full text-center items-center justify-center flex w-fit px-2 py-2 drop-shadow-lg transition-all duration-300 disabled:bg-zinc-300 disabled:text-zinc-400 disabled:ring-0 bg-red-500 border-[0.5px] border-red-500 text-white hover:bg-white hover:text-red-500"
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="rounded-lg w-10 h-10 flex ring-1 ring-zinc-300 group relative hover:bg-red-100 hover:ring-red-700 hover:text-red-700 items-center justify-center hover:opacity-90"
                >
                  <Trash size={26} />
                  <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                    Excluir usuário
                  </span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Tem certeza que deseja excluir o usuário?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Os dados do usuáiro serão removidos da base de dados,
                    entretanto seu histórico de alertas será mantido.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full text-center items-center justify-center flex w-fit px-2 py-2 drop-shadow-lg transition-all duration-300 disabled:bg-zinc-300 disabled:text-zinc-400 disabled:ring-0 bg-procura-ai-blue text-white hover:bg-white hover:text-procura-ai-blue hover:ring-1 hover:ring-procura-ai-blue">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteUser(user.user_id!, user.$id!)}
                    className="rounded-full text-center items-center justify-center flex w-fit px-2 py-2 drop-shadow-lg transition-all duration-300 disabled:bg-zinc-300 disabled:text-zinc-400 disabled:ring-0 bg-red-500 border-[0.5px] border-red-500 text-white hover:bg-white hover:text-red-500"
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
    </>
  )
}
