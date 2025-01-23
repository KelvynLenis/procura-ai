"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "../Input"
import { MarkAsStolenMap } from "../Maps/MarkAsStolenMap"
import Button from "../Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { toast } from "react-toastify"

interface MarkAsStolenFormProps {
  id: string;
  isStolen: boolean
}

export function MarkAsStolenForm({ id, isStolen }: MarkAsStolenFormProps) {
  const { toast } = useToast();

  // React Hook Form setup
  const form = useForm({
    defaultValues: {
      datetime: "",
      description: "",
      coordinates: [0, 0] as [number, number],
    },
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID;
  const COLLECTION_EVENTS = process.env.NEXT_PUBLIC_COLLECTION_EVENTS;
  const COLLECTION_DEVICE = process.env.NEXT_PUBLIC_COLLECTION_DEVICE;
  const PROJECT_ID = process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID;

  const headers = {
    "Content-Type": "application/json",
    "X-Appwrite-Project": PROJECT_ID!,
  };

  // Função para criar o evento
  const createEvent = async (values: any, eventId: string) => {
    const response = await fetch(
      `${API_URL}/databases/${DATABASE_ID}/collections/${COLLECTION_EVENTS}/documents/`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          documentId: eventId,
          data: {
            id_device: id,
            date_time: values.datetime,
            last_location: values.coordinates,
            description: values.description,
            type: "stolen",
            is_alert_on: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creating event: ${error}`);
    }

    return response.json();
  };

  // Função para atualizar o status do dispositivo
  const updateDeviceStatus = async () => {
    const response = await fetch(
      `${API_URL}/databases/${DATABASE_ID}/collections/${COLLECTION_DEVICE}/documents/${id}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          data: { isStolen: !isStolen },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error updating device status: ${error}`);
    }

    return response.json();
  };

  // Função de envio do formulário
  const onSubmit = async (values: any) => {
    const eventId = uuidv4();
    try {
      await createEvent(values, eventId);
      await updateDeviceStatus();

      toast({
        title: "Sucesso!",
        description: "Evento salvo e status do dispositivo atualizado.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Erro!",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "error",
      });
    }
  };

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
                  <FormLabel>Data e hora do furto</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Uma descrição breve" {...field} className="text-sm" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="">Tipo de ocorrência</FormLabel>
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
                          >
                            {occurrenceType.label}
                          </DropdownMenuItem>
                        ))
                      }
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormItem>
              )}
            />
          </div>

          {/* Mapa para selecionar coordenadas */}
          <div className="flex flex-col gap-2 w-1/2 items-center justify-center">
            <FormField
              control={form.control}
              name="coordinates"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="">Clique no mapa o local da ocorrência</FormLabel>
                  <FormControl>
                    <MarkAsStolenMap setPosition={(coordinates: [number, number]) => form.setValue("coordinates", coordinates)} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button variant="blue" type="submit" className="w-full h-10 flex items-center justify-center text-xl text-white self-center rounded-xl">Salvar</Button>
      </form>
    </Form>
  );
}
