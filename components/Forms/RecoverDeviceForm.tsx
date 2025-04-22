'use client'

import recoveryIcon from '../../assets/icons/recover.png'
import { cn } from '@/lib/utils'
import { CloudUpload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import Button from '../Button'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import type { OccurrencesProps } from '@/types'
import { createEvent } from '@/functions/event/create-event'
import { updateDeviceStatus } from '@/functions/device/update-device-status'
import { toast } from 'react-toastify'

interface RecoverDeviceFormProps {
  occurrence: OccurrencesProps
  setOccurrences: React.Dispatch<React.SetStateAction<OccurrencesProps[]>>
}

export function RecoverDeviceForm({
  occurrence,
  setOccurrences,
}: RecoverDeviceFormProps) {
  const [isRecoverDeviceDialogOpen, setIsRecoverDeviceDialogOpen] =
    useState(false)

  const formSchema = z.object({
    description: z.string(),
    location: z.string(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      location: '',
    },
  })

  const options = [
    { label: 'Central da Policia Civil', value: [-7.1717726, -34.8739053] },
    { label: '2° DP da Policia Civil', value: [-7.1186101, -34.8746099] },
    { label: '9° DP da Policia Civil', value: [-7.1713252, -34.8392121] },
  ]

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const callFunction = async () => {
        const location = options.find(
          option => option.label === values.location
        )
        try {
          await createEvent({
            id_device: occurrence?.device.$id!,
            time_event: new Date().toISOString(),
            last_location: location?.value as [number, number],
            description: `Retirar o dispositivo no(a) ${values.location}`,
            type: 'Recuperado',
            is_alert_on: true,
            id_district: '',
          })

          await updateDeviceStatus(occurrence?.device.$id!, {
            is_stolen: false,
            status: 'Recuperado',
          })

          setOccurrences(prevOccurrences =>
            prevOccurrences.map(prevOccurrence =>
              prevOccurrence.device.$id === occurrence.device.$id
                ? {
                    ...prevOccurrence,
                    device: {
                      ...prevOccurrence.device,
                      is_stolen: false,
                      status: 'Recuperado',
                    },
                  }
                : prevOccurrence
            )
          )

          return true
        } catch (error) {
          console.error('Ocorreu um erro em uma das operações:', error)
          return false
        }
      }

      const success = await toast.promise(callFunction, {
        pending: 'Recuperando Dispositivo...',
        success: 'Recuperado',
        error: 'Erro ao recuperar',
      })
    } catch (error) {
      console.error('Erro ao recuperar dispositivo:', error)
    }
  }

  return (
    <>
      <Dialog
        open={isRecoverDeviceDialogOpen}
        onOpenChange={setIsRecoverDeviceDialogOpen}
      >
        <DialogTrigger asChild>
          <button
            type="button"
            className="hidden md:flex rounded-lg w-10 h-10 ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90"
          >
            <Image alt="recuperar dispositivo" src={recoveryIcon} />
            <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
              Recuperar dispositivo
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="flex flex-col gap-0 p-0 w-[840px] h-[680px] overflow-y-scroll">
          {/* <DialogClose asChild>
                  <button
                    type="button"
                    className="absolute top-4 right-4 ring-1 ring-zinc-300"
                  >
                    <X size={24} />
                  </button>
                </DialogClose> */}
          <DialogHeader>
            <DialogTitle className="text-xl text-procura-ai-blue bg-sky-100/40 rounded-md py-5 px-6">
              Dispositivo recuperado
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4 p-4"
            >
              <div className="bg-zinc-200/60 rounded-lg flex flex-col gap-2 p-4">
                <h2 className="font-medium text-lg">Resumo da ocorrência</h2>
                <div className="flex flex-col gap-5">
                  <div className="flex gap-2">
                    <span className="font-medium w-44">Dispositivo</span>

                    <span className="w-full">
                      {occurrence?.device.phone_model} /{' '}
                      {occurrence?.device.brand}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-44">Proprietário</span>

                    <span className="w-full">{occurrence?.user.name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-44">Descrição</span>

                    <span className="w-full">
                      {occurrence?.event.description || 'Sem descrição'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-44">Status</span>

                    <div className="w-full">
                      <span
                        className={cn(
                          'w-fit rounded-sm flex items-center justify-center hover:bg-white',
                          occurrence?.device.status === 'Roubado' &&
                            'bg-robbery-bg text-red-600 p-1 ring-1 ring-red-500',
                          occurrence?.device.status === 'Furtado' &&
                            'bg-theft-bg text-orange-600 p-1 ring-1 ring-orange-500',
                          occurrence?.device.status === 'Perdido' &&
                            'bg-lost-bg text-yellow-600 p-1 ring-1 ring-yellow-500',
                          occurrence?.device.status === 'Recuperado' &&
                            'bg-lime-500/30 text-lime-600 p-1 ring-1 ring-lime-500',
                          occurrence?.device.status === 'Regular' &&
                            'bg-lime-500/30 text-lime-600 p-1 ring-1 ring-lime-500'
                        )}
                      >
                        {occurrence?.device.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-base">
                        Informações gerais / Descrição da recuperação
                      </FormLabel>

                      <FormControl>
                        <Textarea className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-x-20 gap-y-4 justify-between">
                <FormField
                  control={form.control}
                  name="location"
                  className="flex flex-col gap-2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-base">
                        Local para retirada do dispositivo
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-zinc-100 w-full h-12 rounded-md ring-1 ring-zinc-300 px-2 font-medium">
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {options.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 font-medium">
                  <Checkbox className="shadow-none rounded-sm border-[#232323]/90 font-medium" />
                  Notificar proprietário através de e-mail e SMS
                </div>
                {/* <div className="flex items-center text-base gap-2 font-medium">
                  <Checkbox className="shadow-none rounded-sm border-[#232323]/90 font-medium" />
                  <span className="text-base">
                    Notificar contatos de confiança
                  </span>
                </div> */}
              </div>
              {/* <div className="flex flex-col gap-2">
                <Label className="font-medium text-base">
                  Anexar documentos
                </Label>
                <div className="flex flex-col w-full h-32 bg-zinc-100 items-center justify-center rounded-md cursor-pointer hover:bg-zinc-300 transition-colors duration-200 ease-in">
                  <CloudUpload size={60} className="text-zinc-500" />
                  <span className="text-zinc-500">
                    Clique aqui ou arraste e solte arquivos para anexá-los
                  </span>
                </div>
              </div> */}

              <div className="flex justify-between w-full">
                <Button variant="blue">Salvar Alterações</Button>
                <Button
                  onClick={() => setIsRecoverDeviceDialogOpen(false)}
                  variant="red"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
