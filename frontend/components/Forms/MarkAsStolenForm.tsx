'use client'

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
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../ui/input-otp"
import { MarkAsStolenMapWithGeocoding } from "../Maps/MarkAsStolenMapWithGeocoding"
import dynamic from "next/dynamic"
import { validateCoordinates } from "@/lib/utils"

interface MarkAsStolenFormProps {
  id: string
  isStolen: boolean
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>
  setModalOpen?: (value: boolean) => void
  setIsDialogOpen?: (value: boolean) => void
}

const formSchema = z.object({
  datetime: z.string()
    .min(1, {
      message: "A data e hora da ocorrência é obrigatória.",
    })
    .refine((date) => new Date(date) <= new Date(), {
      message: "A data não pode ser no futuro.",
    }),
  description: z.string().optional(),
  type: z.string().min(1, {
    message: "O tipo da ocorrência é obrigatório.",
  }),
  coordinates: z.array(z.number()).min(2, {
    message: "Selecione um local no mapa.",
  }),
  id_district: z.string().optional(),
})
  .refine((data) => validateCoordinates(data.coordinates), {
    path: ["coordinates"],
    message: "Selecione um local no mapa.",
  })

const Map = dynamic(() => import('../Maps/Map/DynamicMap'), {
  ssr: false,
});

export function MarkAsStolenForm({ id, isStolen, setDevices, setModalOpen, setIsDialogOpen }: MarkAsStolenFormProps) {
  const size = useWindowSize()
  const [mapPositionByCep, setMapPositionByCep] = useState<[number, number]>()

  function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: 0,
      height: 0,
    })

    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }

      window.addEventListener("resize", handleResize)
      handleResize()
      return () => window.removeEventListener("resize", handleResize)
    }, [])

    return windowSize
  }

  const occurrenceTypes = [
    { label: "Furto simples", value: "Furto simples" },
    { label: "Extravio ou Perda", value: "Extravio ou Perda" },
    { label: "Roubo", value: "Roubo" },
  ] as const

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      datetime: '',
      description: '',
      type: '',
      coordinates: [0, 0],
      id_district: '',
    }
  })

  function handleSetPosition(coordinates: [number, number]) {
    form.setValue('coordinates', coordinates)
  }

  function handleSetNeighborhood(districtId: string) {
    form.setValue('id_district', districtId)
  }

  async function getNeighborhood(districtId: string) {
    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "$id",
        values: [districtId],
      }),
    })

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DISTRICT}/documents?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch stolen devices: ${await response.text()}`);
      }

      const result = await response.json();

      return result.documents[0]
    } catch (error) {
      console.error(error);
    }
  }

  async function updateDistrict(districtId: string) {
    try {

      const neighborhood = await getNeighborhood(districtId)
      let data

      if (form.getValues('type') === 'Furto simples') {
        data = {
          theft_counter: neighborhood.theft_counter + 1,
        }
      } else if (form.getValues('type') === 'Extravio ou Perda') {
        data = {
          lost_counter: neighborhood.lost_counter + 1,
        }
      } else if (form.getValues('type') === 'Roubo') {
        data = {
          robbery_counter: neighborhood.robbery_counter + 1,
        }
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DISTRICT}/documents/${neighborhood.$id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
          },
          body: JSON.stringify({
            data,
          }),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch stolen devices: ${await response.text()}`);
      }

      const result = await response.json();
      return result
    } catch (error) {
      console.error(error);
    }
  }

  async function onSubmit(values: any) {
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
      const dataAtual = new Date();
      const dataEvento = new Date(values.datetime);

      if (dataEvento > dataAtual) {
        form.setError('datetime', { message: 'Não é possível cadastrar alertas com data futura' });
        toast.error('Não é possível cadastrar alertas com data futura');
        throw new Error('Não é possível cadastrar alertas com data futura');
      }

      const eventId = uuidv4();
      const callFunction = async () => {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents/`,
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
                  description: values.description,
                  type: values.type,
                  is_alert_on: true,
                  last_location: values.coordinates,
                  id_district: values.id_district.toString(),
                }
              })
            }
          )

          await fetch(
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
          )

          if (values.id_district !== '') {
            await updateDistrict(values.id_district)
          }

          return true; // Return success flag
        } catch (error) {
          console.error("Ocorreu um erro em uma das operações:", error);
          return false; // Return failure flag
        }
      }

      const success = await toast.promise(callFunction, {
        pending: `Marcando como ${getStatus(values.type)}...`,
        success: `Marcado como ${getStatus(values.type)}!`,
        error: `Erro ao marcar como ${getStatus(values.type)}!`
      });

      if (success) {
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.$id === id
              ? { ...device, is_stolen: true, status: getStatus(values.type) }
              : device
          )
        );

        setIsDialogOpen && setIsDialogOpen(false)
      }

      if (setModalOpen) {
        setModalOpen(false)
      }

    } catch (error) {

    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 text-zinc-900 self-center items-center justify-between rounded-lg">
        <div className="w-full flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col gap-5 w-full md:w-48 lg:w-56">
            <FormField
              control={form.control}
              name="datetime"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="w-fit text-center items-center flex">
                    <span className="text-red-500 h-6 flex align-text-bottom">*</span>
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
                    <span className="text-red-500 h-6 flex align-text-bottom">*</span>

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
                    <span className="text-red-500 h-6 flex align-text-bottom">*</span>
                    Clique no mapa o local da ocorrência
                  </FormLabel>
                  <FormControl>
                    {/* <MarkAsStolenMap position={cep.length === 8 ? mapPositionByCep : undefined} setPosition={handleSetPosition} setNeighborhoodId={handleSetNeighborhood} /> */}
                    <MarkAsStolenMapWithGeocoding setPosition={handleSetPosition} setNeighborhoodId={handleSetNeighborhood} />
                    {/* <Map /> */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>


        {
          size.width <= 768 ? (
            <Button variant="blue" type="submit" className="w-full h-10 flex items-center justify-center text-xl text-white self-center rounded-xl">Salvar</Button>
          ) : (
            <Button variant="blue" type="submit" className="w-1/2 h-10 flex items-center justify-center text-xl text-white self-center rounded-xl">Salvar</Button>
          )
        }

      </form>
    </Form>
  )
}