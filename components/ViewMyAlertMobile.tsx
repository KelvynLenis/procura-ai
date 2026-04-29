import type { DeviceProps, Event, User } from "@/types";
import { useEffect, useState } from "react";
import { ViewOccurrenceMap } from "./Maps/ViewOccurrenceMap";
import { cn, formatDateTime } from "@/lib/utils";
import { IoIosWarning } from "react-icons/io";
import ClipLoader from "react-spinners/ClipLoader";
import { ConfirmationDialog } from "./ConfirmationDialog";
import {
  getAllDeviceEvents,
  getDeviceEvents,
} from "@/functions/event/get-device-events";
import { toast } from "react-toastify";
import { getDeviceById } from "@/functions/device/get-device-by-id";
import { getUserId } from "@/functions/user/get-user-id";
import { getUserById } from "@/functions/user/get-user-by-id";
import ViewOccurenceGoogleMap from "./Maps/ViewOccurenceGoogleMap";
import Button from "./Button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import policeDepartmentLogo from "../assets/images/police-department-logo.png";

interface ViewMyAlertProps {
  id: string;
  status: string;
  handleDeviceRecovery: (id: string) => Promise<void>;
  setModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ViewMyAlertMobile({
  id,
  status,
  handleDeviceRecovery,
  setModalOpen,
}: ViewMyAlertProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowAllEventsOn, setIsShowAllEventsOn] = useState(false);
  const [user, setUser] = useState<User>({} as User);
  const [device, setDevice] = useState<DeviceProps>({} as DeviceProps);

  async function handleConfirmDialog() {
    await handleDeviceRecovery(id);
    if (setModalOpen) {
      setModalOpen(false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const events = await getAllDeviceEvents(id);
        const device = await getDeviceById(id);
        const userId = await getUserId();
        const userResponse = await getUserById(userId);

        setUser(userResponse);
        setDevice(device);
        setEvents(events);

        // console.log('Detalhes do dispositivo:', device)
        // console.log('Detalhes do usuário:', userResponse)
        // console.log('Detalhes do alerta:', events)
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        toast.error("Erro ao buscar detalhes do alerta. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <ClipLoader color="#002E72" loading={isLoading} size={50} />
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-3">
          <div>
            {status === "Recuperado" ? (
              <span>
                Seu dispositivo{" "}
                <span className="font-bold">{device.phone_model}</span>,
                recuperado pela polícia{" "}
                <span className="font-bold">
                  já se encontra disponível para retirada
                </span>{" "}
                .
              </span>
            ) : (
              <span>
                Seu dispositivo{" "}
                <span className="font-bold">{device.phone_model}</span> foi
                registrado como{" "}
                <span className="font-bold">{device.status}.</span>
              </span>
            )}
          </div>

          <p>
            {status === "Recuperado" ? (
              <span>
                Para fazer a retirada do dispositivo dirija-se ao local indicado
                abaixo portando{" "}
                <span className="font-bold">
                  um documento oficial com foto.
                </span>
              </span>
            ) : (
              "Assim que o dispositivo for recuperado você será notificado através do aplicativo e via e-mail para orientação sobre os próximos passos."
            )}
          </p>

          {status === "Recuperado" ? (
            <div className="flex flex-col">
              <h2 className="text-lg font-medium">Local de retirada</h2>

              <span className="font-medium">
                {events[0]?.retrieval_location?.split(")")[1]}
              </span>
              <span>Endereço: {events[0]?.address}</span>
            </div>
          ) : (
            <p>Informaremos também aos seus contatos de confiança.</p>
          )}

          <div>
            {events[0]?.last_location ? (
              <ViewOccurenceGoogleMap position={events[0]?.last_location} />
            ) : (
              <div>
                <span className="font-bold">
                  Localização da ocorrência:{" "}
                  <span className="font-normal">
                    Localização não registrada
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* <div className='bg-zinc-200/50 w-full flex flex-col items-center p-4 gap-4'>
              <span className='text-primary font-medium'>Atualizações da ocorrência</span>

              <div className='w-full flex justify-around'>
                <div className='w-60 flex flex-col items-center'>
                  <span className={cn('w-10 h-10 border-2 border-primary rounded-full')} />
                  <span className='text-primary font-medium'>Ocorrência criada</span>
                  <span className='text-primary text-sm'>{formatDateTime(events[0].time_event)}</span>
                </div>

                <div className='w-60 flex flex-col items-center'>
                  <span className={cn('w-10 h-10 border-2 rounded-full', status === 'Recuperado' ? 'border-primary' : 'border-zinc-500')} />
                  <span className={cn('font-medium', status === 'Recuperado' ? 'text-primary' : 'text-zinc-500')}>Dispositivo recuperado</span>
                  <span className={cn('text-sm', status === 'Recuperado' ? 'text-primary' : 'text-zinc-500')}>{ status === 'Recuperado' && formatDateTime(events[1].time_event)}</span>
                </div>
              </div>

              <div className='flex w-full items-center justify-center'>
                <span className='w-3 h-3 bg-primary rounded-full' />
                <span className={cn('w-80 h-0.5', status === 'Recuperado' ? 'bg-primary' : 'bg-zinc-500')} />
                <span className={cn('w-3 h-3 rounded-full', status === 'Recuperado' ? 'bg-primary' : 'bg-zinc-500')} />
              </div>
            </div> */}

          <div className="flex flex-col gap-2 rounded-lg py-4">
            <h2 className="text-lg font-medium">Detalhes da ocorrência</h2>
            <div className="flex flex-col gap-5">
              <div className="flex">
                <span className="w-44 font-medium">Dispositivo</span>
                <span className="w-full">
                  {device.phone_model} / {device.brand}
                </span>
              </div>

              <div className="flex">
                <span className="w-44 font-medium">Proprietário</span>
                <span className="w-full">{user.name}</span>
              </div>

              <div className="flex">
                <span className="w-44 font-medium">Data e hora</span>
                <span className="w-full">
                  {status === "Recuperado"
                    ? formatDateTime(events[1].time_event)
                    : formatDateTime(events[0].time_event)}
                </span>
              </div>

              <div className="flex">
                <span className="w-44 font-medium">Descrição</span>
                <span className="w-full">
                  {events[0].description || "Sem descrição"}
                </span>
              </div>

              <div className="flex">
                <span className="w-44 font-medium">Status</span>
                <div className="w-full">
                  <span
                    className={cn(
                      "flex w-fit items-center justify-center rounded-sm hover:bg-white",
                      device.status === "Roubado" &&
                        "bg-robbery-bg p-1 text-red-600 ring-1 ring-red-500",
                      device.status === "Furtado" &&
                        "bg-theft-bg p-1 text-orange-600 ring-1 ring-orange-500",
                      device.status === "Perdido" &&
                        "bg-lost-bg p-1 text-yellow-600 ring-1 ring-yellow-500",
                      device.status === "Recuperado" &&
                        "bg-recovered-bg p-1 text-recovered-text",
                      device.status === "Regular" &&
                        "bg-regular-bg p-1 text-regular-text",
                    )}
                  >
                    {device.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col bg-zinc-100 p-4">
                <Image
                  src={policeDepartmentLogo}
                  alt="Logo da policia civil"
                  className="w-1/2 self-center"
                />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">
                    Deseja criar um boletim de ocorrência na delegacia online da
                    Polícia Civil?
                  </span>
                  <p className="text-justify text-sm">
                    Em casos de perda, ou furto simples é possível criar um
                    boletim de ocorrência online, feito diretamente pelo site da
                    delegacia online da polícia civil da Paraíba. O boletim
                    criado será analisado pela Polícia Civil e a certidão será
                    enviada para o e-mail informado. Em caso de roubos, onde
                    houve ameaça à vida, é necessário se dirigir à uma delegacia
                    presencialmente.
                  </p>
                  <Link
                    href={
                      "https://delegaciaonline.pc.pb.gov.br/tipo-ocorrencia"
                    }
                    className="flex items-center self-end text-secondary underline"
                    target="_blank"
                  >
                    Criar boletim online
                    <ChevronRight className="h-6 w-6" />
                  </Link>
                </div>
              </div>
            </div>
            <ConfirmationDialog
              title="Tem certeza que deseja marcar o dispositivo como regular?"
              description="Ao concordar com esta ação, o dispositivo será marcado como regular e os dados da recuperação serão perdidos.
                Tenha certeza que já tem o aparelho em mãos antes de prosseguir."
              onConfirm={handleConfirmDialog}
            >
              {/* <button
                  type="button"
                  className={cn(
                    'w-full top-5 gap-2 group relative rounded-lg flex flex-row md:flex-row items-center justify-center hover:bg-white',
                    status === 'Roubado' &&
                      'bg-robbery-bg text-red-600 p-1 ring-1 ring-red-500',
                    status === 'Furtado' &&
                      'bg-theft-bg text-orange-600 p-1 ring-1 ring-orange-500',
                    status === 'Perdido' &&
                      'bg-lost-bg text-yellow-600 p-1 ring-1 ring-yellow-500',
                    status === 'Recuperado' &&
                      'bg-lime-500/30 text-lime-600 p-1 ring-1 ring-lime-500 animate-pulse',
                    status === 'Regular' &&
                      'bg-lime-500/30 text-lime-600 p-1 ring-1 ring-lime-500'
                  )}
                >
                  <IoIosWarning size={28} />
                  <span className="">
                    {status === 'Recuperado'
                      ? 'Confirmar recebimento'
                      : 'Desativar alerta'}
                  </span>
                </button> */}

              <Button
                variant={status === "Recuperado" ? "blue" : "red"}
                className="mx-auto mt-4 gap-2 mobile-sm:w-full lg:w-fit"
              >
                <IoIosWarning size={28} />
                <span className="">
                  {status === "Recuperado"
                    ? "Confirmar recebimento"
                    : "Desativar alerta"}
                </span>
              </Button>
            </ConfirmationDialog>
          </div>
        </div>
      )}
    </>
  );
}
