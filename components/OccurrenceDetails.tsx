"use client";

import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import deviceInfo from "../assets/icons/device-info.png";
import occurrenceInfo from "../assets/icons/occurrence-info.png";
import ownerInfo from "../assets/icons/owner-info.png";
import { cn, formatDateTime } from "@/lib/utils";

import type { Contact, Event, OccurrencesProps, Operator } from "@/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { listContacts } from "@/functions/contact/list-contacts";
import { getOperator } from "@/functions/operators/get-operator";
import { listAllEvents } from "@/functions/event/list-all-events";

interface RecoverDeviceFormProps {
  occurrence?: OccurrencesProps;
}
export function OccurrenceDetails({ occurrence }: RecoverDeviceFormProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [operator, setOperator] = useState<Operator>();
  const [events, setEvents] = useState<Event[]>([]);
  const [isShowAllEventsOn, setIsShowAllEventsOn] = useState(false);

  async function getContacts() {
    const contacts = await listContacts({
      userIdParam: occurrence?.device.auth_id,
    });

    setContacts(contacts);

    return contacts;
  }

  async function fetchEvents() {
    try {
      const events = await listAllEvents(occurrence?.device.$id!);

      setEvents(events);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchOperator() {
    try {
      const operator = await getOperator(occurrence?.device.operator_id);

      setOperator(operator);

      return operator;
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getContacts();
    fetchEvents();
    fetchOperator();
  }, []);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group relative flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-zinc-300 hover:bg-sky-100 hover:text-blue-900 hover:opacity-90 hover:ring-blue-700"
          >
            <Eye size={26} />
            <span className="transition- absolute -top-8 right-5 hidden w-36 rounded-sm bg-black/60 py-1 text-white opacity-0 duration-300 group-hover:block group-hover:opacity-100">
              Exibir informações
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="flex max-h-[75%] w-[840px] flex-col gap-3 p-0">
          <DialogHeader className="rounded-md bg-sky-100/40 px-6 py-5 text-xl text-procura-ai-blue">
            <DialogTitle className="text-xl">
              Detalhes da ocorrência
            </DialogTitle>
          </DialogHeader>
          <div className="custom-scroll flex flex-col gap-2 overflow-y-scroll px-4 pb-4">
            <div className="flex flex-col">
              <div className="flex h-20 w-full items-center gap-3 rounded-t-lg border-zinc-200 bg-zinc-100 px-5 text-lg font-medium">
                <Image
                  src={deviceInfo}
                  alt="device-info"
                  className="h-12 w-12"
                />
                Informações do dispositivo
              </div>
              <div className="flex flex-col gap-2 rounded-b-3xl border border-zinc-200 p-4 drop-shadow-sm">
                <div className="flex">
                  <span className="w-28 font-medium">Número</span>
                  <span className="w-full">
                    {occurrence?.device.phone_number}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">Operadora</span>
                  <span className="w-full">
                    {operator?.name_operator ?? "Não informado"}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">Modelo</span>
                  <span className="w-full">
                    {occurrence?.device.phone_model}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">Fabricante</span>
                  <span className="w-full">{occurrence?.device.brand}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">IMEI</span>
                  <span className="w-full">{occurrence?.device.imei}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">Status</span>
                  <div className="w-full">
                    <span
                      className={cn(
                        "flex w-fit items-center justify-center rounded-sm",
                        occurrence?.device.status === "Roubado" &&
                          "bg-robbery-bg px-3 py-1 text-red-600 ring-red-500",
                        occurrence?.device.status === "Furtado" &&
                          "bg-theft-bg px-3 py-1 text-orange-600 ring-orange-500",
                        occurrence?.device.status === "Perdido" &&
                          "bg-lost-bg px-3 py-1 text-yellow-600 ring-yellow-500",
                        occurrence?.device.status === "Recuperado" &&
                          "bg-lime-500/30 px-3 py-1 text-lime-600 ring-lime-500",
                        occurrence?.device.status === "Regular" &&
                          "bg-lime-500/30 px-3 py-1 text-lime-600 ring-lime-500",
                      )}
                    >
                      {occurrence?.device.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex h-20 w-full items-center gap-3 rounded-t-lg border-zinc-200 bg-zinc-100 px-5 text-lg font-medium">
                <Image
                  src={occurrenceInfo}
                  alt="device-info"
                  className="h-12 w-12"
                />
                <span>Informações da ocorrência</span>
              </div>
              <div
                className={cn(
                  "flex flex-col gap-2 rounded-none border-x border-zinc-200 p-4 drop-shadow-sm",
                )}
              >
                <div className="flex">
                  <span className="w-40 font-medium">ID</span>
                  <span className="w-full">
                    {occurrence?.event
                      ? "#" + occurrence?.event?.$id.slice(0, 5)
                      : "Este evento não existe."}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-40 font-medium">Data e horário</span>
                  <span className="w-full">
                    {occurrence?.event
                      ? formatDateTime(occurrence?.event?.time_event!)
                      : "Este evento não existe."}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-40 font-medium">Tipo</span>
                  <span className="w-full">{occurrence?.event?.type}</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-medium">Descrição</span>
                  <span className="w-full">
                    {occurrence?.event
                      ? occurrence?.event?.description || "Não informado"
                      : "Este evento não existe."}
                  </span>
                </div>
              </div>
              {events.length > 0 && (
                <div
                  className={cn(
                    "flex w-full justify-center border-x pb-1 pt-4",
                    isShowAllEventsOn
                      ? "border-b-0 bg-zinc-100/90"
                      : "rounded-b-3xl border-b",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setIsShowAllEventsOn(!isShowAllEventsOn)}
                    className={"text-primary underline hover:text-blue-400"}
                  >
                    {isShowAllEventsOn
                      ? "Ocultar histórico de ocorrências"
                      : "Ver ocorrências anteriores"}
                  </button>
                </div>
              )}
              {isShowAllEventsOn &&
                events.map((prevEvent, index) => (
                  <div
                    key={prevEvent.$id}
                    className={cn(
                      "flex flex-col gap-2 border border-zinc-200 bg-zinc-100/90 p-4 drop-shadow-sm",
                      index === events.length - 1 && "rounded-b-3xl",
                      index === 0 && "border-t-0",
                    )}
                  >
                    <div className="flex">
                      <span className="w-40 font-medium">ID</span>
                      <span className="w-full">
                        {prevEvent
                          ? prevEvent?.$id.slice(0, 5)
                          : "Este evento não existe."}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-40 font-medium">Data e horário</span>
                      <span className="w-full">
                        {prevEvent
                          ? formatDateTime(prevEvent?.time_event!)
                          : "Este evento não existe."}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-medium">Tipo</span>
                      <span
                        className={cn(
                          "flex w-fit items-start justify-start rounded-sm",
                          prevEvent?.type === "Roubo" &&
                            "bg-robbery-bg px-3 py-1 text-red-600 ring-red-500",
                          prevEvent?.type === "Furto simples" &&
                            "bg-theft-bg px-3 py-1 text-orange-600 ring-orange-500",
                          prevEvent?.type === "Extravio ou Perda" &&
                            "bg-lost-bg px-3 py-1 text-yellow-600 ring-yellow-500",
                          prevEvent?.type === "Recuperado" &&
                            "bg-lime-500/30 px-3 py-1 text-lime-600 ring-lime-500",
                          prevEvent?.type === "Regular" &&
                            "bg-lime-500/30 px-3 py-1 text-lime-600 ring-lime-500",
                        )}
                      >
                        {prevEvent?.type}
                      </span>
                      {/* <span className="w-full">{prevEvent?.type}</span> */}
                    </div>
                    <div className="flex">
                      <span className="w-40 font-medium">Descrição</span>
                      <span className="w-full">
                        {prevEvent
                          ? prevEvent?.description || "Não informado"
                          : "Este evento não existe."}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex flex-col">
              <div className="flex h-20 w-full items-center rounded-t-lg border-zinc-200 bg-zinc-100 px-5 text-lg font-medium">
                <Image
                  src={ownerInfo}
                  alt="device-info"
                  className="h-12 w-12"
                />
                Informações do proprietário
              </div>
              <div className="flex flex-col gap-2 rounded-b-3xl border border-zinc-200 p-4 drop-shadow-sm">
                <div className="flex">
                  <span className="w-28 font-medium">Nome</span>
                  <span className="w-full">{occurrence?.user.name}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">CPF</span>
                  <span className="w-full">{occurrence?.user.cpf}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">E-mail</span>
                  <span className="w-full">{occurrence?.user.email}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">IMEI</span>
                  <span className="w-full">{occurrence?.device.imei}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium">
                    Contatos de confiança
                  </span>
                  <div className="flex w-full gap-14">
                    {contacts.length > 0 ? (
                      contacts.map((contact) => (
                        <div key={contact.$id} className="flex flex-col">
                          <span>{contact.name_contact}</span>
                          <span>{contact.number_contact}</span>
                          <span>
                            {contact.email_contact || "Não informado"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span>Não informado</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
