"use client";

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "../Input";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { MarkAsStolenMap } from "../Maps/MarkAsStolenMap";
import { v4 as uuidv4 } from "uuid";

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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 text-zinc-900 items-center justify-between rounded-lg"
      >
        <div className="w-full flex justify-between gap-4">
          {/* Inputs de Data e Descrição */}
          <div className="flex flex-col gap-2 w-1/2">
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
                    <Input type="text" placeholder="Uma descrição breve" {...field} />
                  </FormControl>
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
                  <FormLabel>Clique no mapa o local do furto</FormLabel>
                  <FormControl>
                    <MarkAsStolenMap setPosition={(coordinates: [number, number]) => form.setValue("coordinates", coordinates)} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Botão de envio */}
        <button
          type="submit"
          className="w-full h-10 flex items-center justify-center text-xl text-white rounded-xl bg-primary hover:opacity-80"
        >
          Salvar
        </button>
      </form>
    </Form>
  );
}
