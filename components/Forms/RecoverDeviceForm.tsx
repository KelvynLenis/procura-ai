"use client";

import recoveryIcon from "../../assets/icons/recover.png";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import Button from "../Button";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { OccurrencesProps } from "@/types";
import { createEvent } from "@/functions/event/create-event";
import { updateDeviceStatus } from "@/functions/device/update-device-status";
import { toast } from "react-toastify";
import { emailClient } from "@/services/email-client";
import { getUser } from "@/functions/user/get-user";
import { account, ID } from "@/lib/appwrite";
import { getUserInfo } from "@/functions/user/get-user-info";
import { createNotification } from "@/functions/notification/create-notification";

interface RecoverDeviceFormProps {
  occurrence: OccurrencesProps;
  setOccurrences: React.Dispatch<React.SetStateAction<OccurrencesProps[]>>;
}

export function RecoverDeviceForm({
  occurrence,
  setOccurrences,
}: RecoverDeviceFormProps) {
  const [isRecoverDeviceDialogOpen, setIsRecoverDeviceDialogOpen] =
    useState(false);

  const formSchema = z.object({
    description: z.string(),
    location: z.string().min(1, "Selecione uma opção"),
    shouldNotify: z.boolean().default(false),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      location: "",
      shouldNotify: false,
    },
  });

  const options = [
    {
      label: "Central da Policia Civil",
      value: [-7.171597790141487, -34.87325528291976],
      address:
        "R. Manoel Rufino da Silva, 500 - Ernesto Geisel, João Pessoa - PB, 58076-005",
    },
    {
      label: "DRF de Campina Grande",
      value: [-7.21587149685039, -35.8800659651219],
      address:
        "R. Janúncio Ferreira, 680 - Santo Antônio, Campina Grande - PB, 58102-555",
    },
    {
      label: "DRF de Patos",
      value: [-7.028485393244931, -37.288017090181285],
      address: "Adélia Urquiza,179, bairro Liberdade, Patos/PB",
    },
    {
      label: "Central de Policia de Guarabira",
      value: [-6.849307249237192, -35.5038465361273],
      address:
        "Tv. Lodônio de Bulhões, 36-112 - Alto Boa Vista, Guarabira - PB, 58200-000",
    },
  ];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const callFunction = async () => {
        const user = await account.get();
        // fetch('api/create-notification', { method: 'POST', body: JSON.stringify({
        //   documentId: ID.unique(),
        //   data: {
        //     sender_id: user.$id,
        //     receiver_id: occurrence?.device.auth_id,
        //     message: `O dispositivo ${occurrence?.device.phone_model} foi recuperado!`,
        //     read: false,
        //     type: 'Recuperado',
        //     event_id: ID.unique(),
        //   }
        // }) });

        const location = options.find(
          (option) => option.label === values.location,
        );
        try {
          const authUser = await account.get();

          const user = await getUserInfo(authUser.$id);

          const eventRequest = await createEvent({
            id_device: occurrence?.device.$id!,
            time_event: new Date().toISOString(),
            last_location: location?.value as [number, number],
            retrieval_location: `Retirar o dispositivo no(a) ${values.location}`,
            description: `${values.description.length > 0 ? values.description : "Dispositivo recuperado pela polícia"}`,
            address: `${location?.address}`,
            admin_id: `${user[0].user_id}`,
            type: "Recuperado",
            is_alert_on: false,
            id_district: "",
          });

          await createNotification({
            sender_id: authUser.$id,
            receiver_id: occurrence?.device.auth_id,
            message: `O dispositivo ${occurrence?.device.phone_model} foi recuperado!`,
            is_read: false,
            type: "Recuperado",
            event_id: eventRequest.$id,
            id_device: occurrence.device.$id,
          });

          await updateDeviceStatus(occurrence?.device.$id!, {
            is_stolen: false,
            status: "Recuperado",
          });

          if (values.shouldNotify && occurrence.user.email) {
            try {
              await emailClient.sendDeviceRecoveryEmail({
                userName: occurrence.user.name,
                userEmail: occurrence.user.email,
                deviceModel: occurrence.device.phone_model,
                deviceBrand: occurrence.device.brand,
                location: values.location,
                description: values.description,
                emergencyContacts: occurrence.user.emergency_contacts?.map(
                  (contact) => ({
                    name: contact.name,
                    email: contact.email,
                  }),
                ),
              });

              toast.success("Email de notificação enviado com sucesso!");
            } catch (error) {
              console.error("Erro ao enviar email:", error);
              toast.error(
                "Não foi possível enviar o email de notificação. Tente novamente.",
              );
            }
          }

          setOccurrences((prevOccurrences) =>
            prevOccurrences.map((prevOccurrence) =>
              prevOccurrence.device.$id === occurrence.device.$id
                ? {
                    ...prevOccurrence,
                    device: {
                      ...prevOccurrence.device,
                      is_stolen: false,
                      status: "Recuperado",
                    },
                  }
                : prevOccurrence,
            ),
          );

          setIsRecoverDeviceDialogOpen(false);

          return true;
        } catch (error) {
          console.error("Ocorreu um erro em uma das operações:", error);
          return false;
        }
      };

      const success = await toast.promise(callFunction, {
        pending: "Recuperando Dispositivo...",
        success: "Recuperado",
        error: "Erro ao recuperar",
      });
    } catch (error) {
      console.error("Erro ao recuperar dispositivo:", error);
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
            className="group relative hidden h-10 w-10 items-center justify-center rounded-lg ring-1 ring-zinc-300 hover:bg-sky-100 hover:text-blue-900 hover:opacity-90 hover:ring-blue-700 md:flex"
          >
            <Image alt="recuperar dispositivo" src={recoveryIcon} />
            <span className="transition- absolute -top-8 right-5 hidden w-36 rounded-sm bg-black/60 py-1 text-white opacity-0 duration-300 group-hover:block group-hover:opacity-100">
              Recuperar dispositivo
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="flex h-[680px] w-[840px] flex-col gap-0 overflow-y-scroll p-0">
          {/* <DialogClose asChild>
                  <button
                    type="button"
                    className="absolute top-4 right-4 ring-1 ring-zinc-300"
                  >
                    <X size={24} />
                  </button>
                </DialogClose> */}
          <DialogHeader>
            <DialogTitle className="rounded-md bg-sky-100/40 px-6 py-5 text-xl text-procura-ai-blue">
              Dispositivo recuperado
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4 p-4"
            >
              <div className="flex flex-col gap-2 rounded-lg bg-zinc-200/60 p-4">
                <h2 className="text-lg font-medium">Resumo da ocorrência</h2>
                <div className="flex flex-col gap-5">
                  <div className="flex gap-2">
                    <span className="w-44 font-medium">Dispositivo</span>

                    <span className="w-full">
                      {occurrence?.device.phone_model} /{" "}
                      {occurrence?.device.brand}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-44 font-medium">Proprietário</span>

                    <span className="w-full">{occurrence?.user.name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-44 font-medium">Descrição</span>

                    <span className="w-full">
                      {occurrence?.event.description || "Sem descrição"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-44 font-medium">Status</span>

                    <div className="w-full">
                      <span
                        className={cn(
                          "flex w-fit items-center justify-center rounded-sm hover:bg-white",
                          occurrence?.device.status === "Roubado" &&
                            "bg-robbery-bg p-1 text-red-600 ring-1 ring-red-500",
                          occurrence?.device.status === "Furtado" &&
                            "bg-theft-bg p-1 text-orange-600 ring-1 ring-orange-500",
                          occurrence?.device.status === "Perdido" &&
                            "bg-lost-bg p-1 text-yellow-600 ring-1 ring-yellow-500",
                          occurrence?.device.status === "Recuperado" &&
                            "bg-lime-500/30 p-1 text-lime-600 ring-1 ring-lime-500",
                          occurrence?.device.status === "Regular" &&
                            "bg-lime-500/30 p-1 text-lime-600 ring-1 ring-lime-500",
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
                      <FormLabel className="text-base font-medium">
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

              <div className="grid grid-cols-2 justify-between gap-x-20 gap-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel className="text-base font-medium">
                        Local para retirada do dispositivo
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 w-full rounded-md bg-zinc-100 px-2 font-medium ring-1 ring-zinc-300">
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
                <FormField
                  control={form.control}
                  name="shouldNotify"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="rounded-sm border-[#232323]/90 font-medium shadow-none"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 font-medium">
                        Notificar proprietário através de e-mail e SMS
                      </FormLabel>
                    </FormItem>
                  )}
                />
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

              <div className="flex w-full justify-between">
                <Button variant="blue">Salvar Alterações</Button>
                <Button
                  onClick={() => setIsRecoverDeviceDialogOpen(false)}
                  variant="white"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
