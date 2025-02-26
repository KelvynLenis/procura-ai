

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

  async function fetchEvent(): Promise<Event[]> {
    const event: Event[] = [];

    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "id_device",
        values: [`${id}`],
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

      console.log(documents)
      event.push(documents.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())[0]);

      console.log(event)
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
                        Desativar
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
                      <AlertDialogAction className="bg-red-500" onClick={() => handleDeviceRecovery(id)}>
                        <DialogClose>
                          Confirmar
                        </DialogClose>
                      </AlertDialogAction>
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