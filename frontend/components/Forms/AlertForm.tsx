

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
} from "@/components/ui/alert-dialog"
import { ChevronDown } from "lucide-react"
import { toast } from "react-toastify"
import { v4 as uuidv4 } from 'uuid'
import { DialogClose } from "../ui/dialog"
import { DeviceProps, Event, EventProps } from "@/utils/types"
import { Textarea } from "../ui/textarea"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { ViewOccurrenceMap } from "../Maps/ViewOccurrenceMap"
import { cn, formatDateTime } from "@/lib/utils"
import { IoIosWarning } from "react-icons/io"
import ClipLoader from "react-spinners/ClipLoader"

interface MarkAsStolenFormProps {
  id: string
  status: string
  handleDeviceRecovery: (id: string) => Promise<void>
}

export function AlertForm({ id, status, handleDeviceRecovery }: MarkAsStolenFormProps) {
  const [event, setEvent] = useState({} as Event)
  const [isLoading, setIsLoading] = useState(true)

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
      id_district: 0
    }
  })

  function handleSetPosition(coordinates: [number, number]) {
    form.setValue('coordinates', coordinates)
  }

  function handleSetNeighborhood(districtId: number) {
    form.setValue('id_district', districtId)
  }

  async function getNeighborhood(districtId: string) {

    console.log(districtId)

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

      console.log(neighborhood)

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
        try {
          const [createdEvent, updatedDeviceStatus, updatedDistrict] = await Promise.all([
            fetch(
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
                    description: values.description,
                    type: values.type,
                    is_alert_on: true,
                    last_location: values.coordinates,
                    id_district: values.id_district,
                  }
                })
              }
            ),

            fetch(
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
            ),
            updateDistrict(values.id_district)
          ]);

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

      // if (success) {
      //   setDevices((prevDevices) =>
      //     prevDevices.map((device) =>
      //       device.$id === id
      //         ? { ...device, is_stolen: true, status: getStatus(values.type) }
      //         : device
      //     )
      //   );
      // }

      console.log(values)
    } catch (error) {
      console.error(error)
    }
  }

  async function fetchEvent(): Promise<Event[]> {
    const event: Event[] = [];

    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "id_device",
        values: [id],
      })
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Appwrite-Project": process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || "",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${await response.text()}`);
      }

      const { documents } = await response.json();
      event.push(documents[0]);

    } catch (error) {
      console.error(error);
    }
    return event;
  }

  useEffect(() => {
    const fetchData = async () => {
      const events = await fetchEvent();
      setEvent(events[0]);
      setIsLoading(false);
    };
    fetchData();

  }, []);

  return (
    <>
      {/* <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 text-zinc-900 self-center items-center justify-between rounded-lg">
          <div className="w-full flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col gap-5 w-full md:w-44">
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
                      <MarkAsStolenMap setPosition={handleSetPosition} setNeighborhoodId={handleSetNeighborhood} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button variant="blue" type="submit" className="w-full h-10 flex items-center justify-center text-xl text-white self-center rounded-xl">Salvar</Button>
        </form>
      </Form> */}

      {
        isLoading ? (
          <div className="flex w-full h-full items-center justify-center">
            <ClipLoader color="#002E72" loading={isLoading} size={50} />

          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex">
              <div className="flex flex-col gap-2 w-full">
                <span className="font-bold">Tipe de alerta: <span className="font-normal">{event.type}</span></span>
                <span className="font-bold">Descrição do alerta: <span className="font-normal">{event.description}</span></span>
                <span className="font-bold">Data e hora da ocorrência: <span className="font-normal">{formatDateTime(event.time_event)}</span></span>
              </div>

              <div className="flex flex-col w-1/3 items-end">

                <AlertDialog>
                  <AlertDialogTrigger>
                    <span title="Desativar alerta" className={cn(
                      "w-fit gap-2 group relative rounded-lg flex flex-col md:flex-row items-center justify-center hover:bg-white",
                      status === "Roubado" && "bg-robbery-bg text-red-600 p-1 ring-1 ring-red-500",
                      status === "Furtado" && "bg-theft-bg text-orange-600 p-1 ring-1 ring-orange-500",
                      status === "Perdido" && "bg-lost-bg text-yellow-600 p-1 ring-1 ring-yellow-500",
                      status === "Recuperado" && "bg-lime-500/30 text-lime-600 p-1 ring-1 ring-lime-500",
                      status === "Regular" && "bg-lime-500/30 text-lime-600 p-1 ring-1 ring-lime-500",
                    )}>
                      <IoIosWarning size={28} />
                      <span className="hidden opacity-0 group-hover:block group-hover:md:hidden group-hover:opacity-100 bg-black/60 w-32 rounded-sm absolute -top-8 right-5 py-1 px-2 text-white transition- duration-300">
                        Desativar alerta
                      </span>
                      <span className="hidden md:block">
                        Desativar alerta
                      </span>
                    </span>

                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza que deseja marcar o dispositivo como recuperado?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ao concordar com esta ação, o dispositivo será removido da lista de alertas. Caso a policia encontre o dispositivo não será possível saber a quem ele pertence e nem te alertar de sua recuperação.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white mr-2">Cancelar</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-500" onClick={() => handleDeviceRecovery(id)}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div>
              <ViewOccurrenceMap position={event.last_location} />
            </div>
          </div>
        )
      }
    </>
  )
}