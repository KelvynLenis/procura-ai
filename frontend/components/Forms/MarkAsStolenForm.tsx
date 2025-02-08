

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "../Input"
import { MarkAsStolenMap } from "../Maps/MarkAsStolenMap"
import Button from "../Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { toast } from "react-toastify"
import { v4 as uuidv4 } from 'uuid'
import { DialogClose } from "../ui/dialog"
import { DeviceProps } from "@/utils/types"
import { Textarea } from "../ui/textarea"
import { revalidateTag } from "next/cache"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface MarkAsStolenFormProps {
  id: string
  isStolen: boolean
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>
}

const formSchema = z.object({
  datetime: z.string().min(1, { message: "Data e hora são obrigatórios" }),
  description: z.any().optional(),
  type: z.string().min(1, { message: "Tipo de ocorrência é obrigatório" }),
  coordinates: z.tuple([z.number(), z.number()]), // Fixed to exactly two numbers
  cod_neighborhood: z.number().min(1, { message: "Bairro é obrigatório" })
})

export function MarkAsStolenForm({ id, isStolen, setDevices }: MarkAsStolenFormProps) {

  const occurrenceTypes = [
    { label: "Furto simples", value: "Furto simples" },
    { label: "Extravio ou Perda", value: "Extravio ou Perda" },
    { label: "Roubo", value: "Roubo" },
  ] as const

  const form = useForm({
    defaultValues: {
      datetime: '',
      description: '',
      type: '',
      coordinates: [0, 0],
      cod_neighborhood: 0
    }
  })

  function handleSetPosition(coordinates: [number, number]) {
    form.setValue('coordinates', coordinates)
  }

  function handleSetNeighborhood(codBairro: number) {
    form.setValue('cod_neighborhood', codBairro)
  }

  async function onSubmit(values: any) {
    console.log(values)



    const getStatus = (type: string) => {
      if (type === 'Furto simples') {
        return 'Furtado'
      } else if (type === 'Extravio ou Perda') {
        return 'Perdido'
      } else if (type === 'Roubo') {
        return 'Roubado'
      }
    }

    try {

      if (values.datetime === '') {
        form.setError('datetime', { message: 'Data e hora são obrigatórios' })
        toast.error('Data e hora são obrigatórios')
        throw new Error('Data e hora são obrigatórios')
      }

      if (values.type === '') {
        form.setError('type', { message: 'Tipo de ocorrência é obrigatório' })
        toast.error('Tipo de ocorrência é obrigatório')
        throw new Error('Tipo de ocorrência é obrigatório')
      }

      if (values.coordinates[0] === 0 || values.coordinates[1] === 0) {
        form.setError('coordinates', { message: 'Selecione um ponto no mapa' })
        toast.error('Coordenadas são obrigatórias')
        throw new Error('Coordenadas são obrigatórias')
      }

      const eventId = uuidv4();
      const callFunction = async () => {
        const promise = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`
            },
            body: JSON.stringify({
              documentId: eventId,
              data: {
                id_device: id,
                time_event: values.datetime,
                last_location: values.coordinates,
                description: values.description,
                type: values.type,
                is_alert_on: true
              }
            })
          })

        const updateDeviceStatus = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents/${id}`,
          {
            method: "PATCH",
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`
            },
            body: JSON.stringify({
              data: {
                is_stolen: true,
                status: getStatus(values.type)
              },
            }),
          }
        );

      }
      setDevices((prevDevices) => prevDevices.map((device) => device.$id === id ? { ...device, is_stolen: true, status: getStatus(values.type) } : device));
      // setDevices((prevDevices) => prevDevices.map((device) => device.$id === id ? { ...device,  } : device));

      toast.promise(callFunction, {
        pending: `Marcando como ${values.type}...`,
        success: `Marcado como ${values.type}!`,
        error: `Erro ao marcar como ${values.type}!`
      })

      console.log(values)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 text-zinc-900 self-center items-center justify-between rounded-lg">
        <div className="w-full flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col gap-5 w-full md:w-44">
            <FormField
              control={form.control}
              name="datetime"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="w-fit text-center items-center flex">
                    <span className="text-red-500 text-3xl h-6 flex align-text-bottom">*</span>
                    Data e hora do furto
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} className="ring-1 ring-zinc-300" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="">Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Uma descrição breve" {...field} className="resize-none text-start h-36 ring-1 ring-zinc-300" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="w-fit text-center items-center flex">
                    <span className="text-red-500 text-3xl h-6 flex align-text-bottom">*</span>

                    Tipo de ocorrência
                  </FormLabel>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full flex items-center rounded-lg text-xs gap-0 p-2 md:text-base lg:gap-2 justify-between bg-zinc-100">
                      <span className="w-full text-sm">
                        {
                          form.getValues('type') === '' ?
                            'Selecione o tipo de ocorrência' :
                            occurrenceTypes.find((occurrenceType) => occurrenceType.value === form.getValues('type'))?.label
                        }
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {
                        occurrenceTypes.map((occurrenceType) => (
                          <DropdownMenuItem
                            key={occurrenceType.value}
                            onClick={() => form.setValue('type', occurrenceType.value)}
                            className="hover:bg-primary hover:text-procura-ai-white"
                          >
                            {occurrenceType.label}
                          </DropdownMenuItem>
                        ))
                      }
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-2 w-full items-center justify-center">
            <FormField
              control={form.control}
              name="coordinates"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="w-fit text-center items-center flex">
                    <span className="text-red-500 text-3xl h-6 flex align-text-bottom">*</span>
                    Clique no mapa o local da ocorrência
                  </FormLabel>
                  <FormControl>
                    <MarkAsStolenMap setPosition={handleSetPosition} setBairro={handleSetNeighborhood} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button variant="blue" type="submit" className="w-full h-10 flex items-center justify-center text-xl text-white self-center rounded-xl">Salvar</Button>
      </form>
    </Form>
  )
}