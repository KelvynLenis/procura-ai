"use client";

import { TableCell, TableRow } from "../../ui/table";
import { IoIosWarning } from "react-icons/io";
import { ImPencil } from "react-icons/im";
import Link from "next/link";
import type { DeviceProps, Operator } from "@/types";
import { cn } from "@/lib/utils";
import { Eye, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertForm } from "../../Forms/AlertForm";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { ViewMyAlerts } from "../../ViewMyAlerts";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { deleteDevice } from "@/functions/device/delete-device";
import { recoverDevice } from "@/functions/device/recover-device";
import { getOperator } from "@/functions/operators/get-operator";
import deviceInfo from "../../../assets/icons/device-info.png";
import Image from "next/image";
import { updateDeviceStatus } from "@/functions/device/update-device-status";
import { createEvent } from "@/functions/event/create-event";

interface DeviceRowProps {
  // key: string
  id: string; // ID do dispositivo
  device: DeviceProps;
  // phone_number: string // Número de telefone
  // phone_model: string // Modelo do telefone
  // brand: string // Fabricante do telefone
  // imei: string // IMEI do telefone
  // isStolen: boolean // Status de "roubado" (true/false)
  // operator_id: string | undefined // ID do operador
  // status: string
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>;
  index: number;
  deviceNotificationId?: string;
}

export function DeviceRow({
  // key,
  id,
  device,
  // phone_number,
  // phone_model,
  // brand,
  // imei,
  // isStolen,
  // status,
  // operator_id,
  setDevices,
  index,
  deviceNotificationId,
}: DeviceRowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(
    deviceNotificationId === id ? true : false,
  );
  const [isViewAlertModalOpen, setIsViewAlertModalOpen] = useState(false);
  const [operator, setOperator] = useState<Operator>();

  async function handleDeleteDevice(id: string) {
    try {
      const callFunction = async () => {
        const response = await deleteDevice(id);
        if (response) {
          setDevices((prevDevices) =>
            prevDevices.filter((device) => device.$id !== id),
          );
        }
      };

      toast.promise(callFunction(), {
        pending: "Deletando dispositivo...",
        success: "Dispositivo deletado com sucesso",
        error: "Erro ao deletar dispositivo",
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDeviceRecovery(id: string) {
    try {
      await createEvent({
        id_device: id,
        time_event: new Date().toISOString(),
        last_location: [0, 0],
        description: "Evento Cancelado pelo usuário",
        type: "Regular",
        is_alert_on: false,
        id_district: "",
      });
      const success = await updateDeviceStatus(id, {
        is_stolen: false,
        status: "Regular",
      });

      if (success) {
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.$id === id
              ? { ...device, is_stolen: false, status: "Regular" }
              : device,
          ),
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchOperator() {
    try {
      const operator = await getOperator(device.operator_id);

      setOperator(operator);

      return operator;
    } catch (error) {
      console.error(error);
    }
  }

  function showLoadingToast() {
    setIsLoading(true);
  }

  useEffect(() => {
    fetchOperator();

    if (typeof window === "undefined") return;

    // Detecta se a navegação atual foi um "reload"
    let isReload = false;

    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries && navEntries.length > 0) {
      // Moderno
      isReload =
        (navEntries[0] as PerformanceNavigationTiming).type === "reload";
    } else if ("navigation" in performance) {
      // Fallback (API antiga / Safari)
      // @ts-ignore
      isReload = performance.navigation.type === 1; // 1 === reload
    }

    if (isReload) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState(null, "", cleanUrl);
      setIsDialogOpen(false);
      return;
    }

    if (deviceNotificationId && deviceNotificationId === id) {
      setIsDialogOpen(true);
    }
  }, []);

  useEffect(() => {}, []);

  return (
    <>
      <TableRow className="text-base" key={device.$id}>
        <TableCell className="hidden pl-5 font-medium text-zinc-800 lg:table-cell">
          {index + 1}
        </TableCell>
        <TableCell className="font-medium text-zinc-800 md:table-cell">
          {device.phone_model}
        </TableCell>
        <TableCell className="hidden font-medium capitalize md:table-cell">
          {device.brand}
        </TableCell>
        <TableCell className="hidden font-medium md:table-cell">
          {`${device.imei.slice(0, 1)} ${device.imei.slice(1, 8)} ****** **`}
        </TableCell>
        <TableCell className="w-24">
          <span
            className={cn(
              "flex w-24 items-center justify-center rounded-md font-medium capitalize",
              device.status === "Roubado" &&
                "bg-robbery-bg p-1 text-robbery-text",
              device.status === "Recuperado" &&
                "bg-recovered-bg p-1 text-recovered-text",
              device.status === "Regular" &&
                "bg-regular-bg p-1 text-regular-text",
              device.status === "Furtado" && "bg-theft-bg p-1 text-theft-text",
              device.status === "Perdido" && "bg-lost-bg p-1 text-lost-text",
            )}
          >
            {device.status}
          </span>
        </TableCell>
        <TableCell className="mdflex-wrap flex h-20 items-center gap-2 py-28 md:my-3 md:py-10">
          <div className="flex w-full flex-col items-center gap-2 md:flex-row">
            <Dialog>
              <DialogTrigger asChild>
                <div
                  // type="button"
                  className="group relative flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-zinc-300 hover:bg-sky-100 hover:text-blue-900 hover:opacity-90 hover:ring-blue-700"
                >
                  <Eye size={26} />
                  <span className="transition- absolute -top-8 right-5 hidden w-36 rounded-sm bg-black/60 py-1 text-white opacity-0 duration-300 group-hover:block group-hover:opacity-100">
                    Exibir informações
                  </span>
                </div>
              </DialogTrigger>
              <DialogContent className="flex h-fit w-[30rem] flex-col gap-0 p-0">
                <DialogHeader className="flex h-16 w-full items-start justify-center gap-3 rounded-t-lg border-zinc-200 bg-[#E7F2FE] px-5 text-lg font-medium">
                  <DialogTitle className="flex items-center justify-start gap-2">
                    {/* <Image
                      src={deviceInfo}
                      alt="device-info"
                      className="w-12 h-12"
                    /> */}
                    Informações do dispositivo
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col">
                    <div className="flex flex-col gap-2 rounded-b-lg border border-zinc-200 p-4 drop-shadow-sm">
                      <div className="flex">
                        <span className="w-56 font-medium">Número</span>
                        <span className="w-full">{`(${device.phone_number.slice(0, 2)}) ${device.phone_number.slice(2, 7)}-${device.phone_number.slice(7, 11)}`}</span>
                      </div>
                      <div className="flex">
                        <span className="w-56 font-medium">Operadora</span>
                        <span className="w-full">
                          {operator?.name_operator ?? "Não informado"}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-56 font-medium">Modelo</span>
                        <span className="w-full">{device.phone_model}</span>
                      </div>
                      <div className="flex">
                        <span className="w-56 font-medium">Fabricante</span>
                        <span className="w-full">{device.brand}</span>
                      </div>
                      <div className="flex">
                        <span className="w-56 font-medium">IMEI</span>
                        <span className="w-full">{device.imei}</span>
                      </div>
                      <div className="flex">
                        <span className="w-56 font-medium">Status</span>
                        <div className="w-full">
                          <span
                            className={cn(
                              "flex w-fit items-center justify-center rounded-md px-2 hover:bg-white",
                              device.status === "Roubado" &&
                                "bg-robbery-bg px-3 py-1 text-red-600 ring-red-500",
                              device.status === "Furtado" &&
                                "bg-theft-bg px-3 py-1 text-orange-600 ring-orange-500",
                              device.status === "Perdido" &&
                                "bg-lost-bg px-3 py-1 text-yellow-600 ring-yellow-500",
                              device.status === "Recuperado" &&
                                "text-recovered-textx-3 bg-recovered-bg py-1 ring-lime-500",
                              device.status === "Regular" &&
                                "bg-lime-500/30 px-3 py-1 text-regular-text ring-lime-500",
                            )}
                          >
                            {device.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Link href={`meus-dispositivos/edit/${id}`}>
              <button
                type="button"
                onClick={showLoadingToast}
                className="group relative hidden h-10 w-10 items-center justify-center rounded-lg ring-1 ring-zinc-300 hover:bg-sky-100 hover:text-blue-900 hover:opacity-90 hover:ring-blue-700 md:flex"
              >
                <ImPencil size={16} />
                <span className="transition- absolute -top-8 right-5 hidden w-36 rounded-sm bg-black/60 py-1 text-white opacity-0 duration-300 group-hover:block group-hover:opacity-100">
                  Editar dispositivo
                </span>
              </button>
            </Link>

            <ConfirmationDialog
              title="Deseja deletar este dispositivo?"
              description="Essa ação não pode ser desfeita. Isso excluirá
                    permanentemente o dispositivo e removerá seus dados de
                    nossos servidores."
              onConfirm={() => {
                handleDeleteDevice(id);
              }}
            >
              <div
                // type="button"
                className="group relative hidden h-10 w-10 items-center justify-center gap-2 rounded-lg text-red-600 ring-1 ring-zinc-300 hover:bg-red-200 hover:opacity-90 hover:ring-red-600 md:flex"
              >
                <Trash2 size={20} />
                <span className="transition- absolute -top-8 right-5 hidden w-36 rounded-sm bg-black/60 py-1 text-white opacity-0 duration-300 group-hover:block group-hover:opacity-100">
                  Deletar dispositivo
                </span>
              </div>
            </ConfirmationDialog>

            {device.status !== "Regular" ? (
              <>
                <ViewMyAlerts
                  id={id}
                  status={device.status!}
                  handleDeviceRecovery={handleDeviceRecovery}
                  isDialogOpen={isDialogOpen}
                  setIsDialogOpen={setIsDialogOpen}
                  setModalOpen={setIsDialogOpen}
                />
              </>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <div
                    // type="button"
                    className={cn(
                      "group relative flex h-10 w-10 flex-col items-center justify-center rounded-lg text-red-600 ring-1 ring-zinc-300 hover:bg-red-300 hover:ring-red-500 md:flex-row",
                    )}
                  >
                    <IoIosWarning size={28} />
                    <span className="transition- absolute -top-8 right-5 hidden w-28 rounded-sm bg-black/60 py-1 text-white opacity-0 duration-300 group-hover:block group-hover:opacity-100">
                      Acionar alerta
                    </span>
                  </div>
                </DialogTrigger>
                <DialogContent className="flex h-4/5 w-fit flex-col rounded-xl p-0 md:h-fit">
                  <DialogHeader className="w-full bg-[#E7F2FE] px-4 py-5">
                    <DialogTitle>Criar ocorrência</DialogTitle>
                  </DialogHeader>
                  <AlertForm
                    id={id}
                    isStolen={device.is_stolen!}
                    setDevices={setDevices}
                    setIsDialogOpen={setIsDialogOpen}
                    isPopup
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
