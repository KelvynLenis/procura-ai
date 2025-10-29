"use client";

import { cn } from "@/lib/utils";
import { IoIosWarning } from "react-icons/io";
import { AlertForm } from "../../Forms/AlertForm";
import type { DeviceProps, Operator } from "@/types";
import { Trash2 } from "lucide-react";
import { ViewMyAlert } from "../../ViewMyAlert";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { ImPencil } from "react-icons/im";
import { useEffect, useState } from "react";
import Button from "../../Button";
import { DeviceForm } from "../../Forms/DeviceForm";
import { deleteDevice } from "@/functions/device/delete-device";
import { createEvent } from "@/functions/event/create-event";
import { updateDeviceStatus } from "@/functions/device/update-device-status";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getOperator } from "@/functions/operators/get-operator";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

interface DeviceDetailsCardProps {
  id: string; // ID do dispositivo
  phone_number: string; // Número de telefone
  phone_model: string; // Modelo do telefone
  brand: string; // Fabricante  do telefone
  imei: string; // IMEI do telefone
  isStolen: boolean; // Status de "roubado" (true/false)
  operator_id: string | undefined; // ID do operador
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>;
  index: number;
  status: string;
}

export function DeviceDetailsCard({
  id,
  phone_number,
  phone_model,
  operator_id,
  brand,
  imei,
  isStolen,
  status,
  setDevices,
  index,
}: DeviceDetailsCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [operator, setOperator] = useState<Operator>();

  const device = {
    id,
    phone_number,
    phone_model,
    brand,
    operator_id,
    imei,
    isStolen,
    status,
  };

  const isRegular = status === "Regular" || status === "Recuperado";

  async function handleDeviceRecovery(id: string) {
    try {
      const callFunction = async () => {
        try {
          await createEvent({
            id_device: id,
            time_event: new Date().toISOString(),
            last_location: [0, 0],
            description: "Recuperado",
            type: "Recuperado",
            is_alert_on: false,
            id_district: "",
          });

          await updateDeviceStatus(id, {
            is_stolen: false,
            status: "Recuperado",
          });

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

      if (success) {
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.$id === id
              ? { ...device, is_stolen: false, status: "Recuperado" }
              : device,
          ),
        );
      }
    } catch (error) {
      console.error("Erro ao recuperar dispositivo:", error);
    }
  }

  function showLoadingToast() {
    setIsLoading(true);
  }

  async function handleDeleteDevice(id: string) {
    try {
      const callFunction = async () => {
        try {
          await deleteDevice(id);
          setDevices((prevDevices) =>
            prevDevices.filter((device) => device.$id !== id),
          );
          return true;
        } catch (error) {
          console.error("Erro ao deletar dispositivo:", error);
          return false;
        }
      };

      toast.promise(callFunction(), {
        pending: "Deletando dispositivo...",
        success: "Dispositivo deletado com sucesso",
        error: "Erro ao deletar dispositivo",
      });
    } catch (error) {
      console.error("Erro ao deletar dispositivo:", error);
    }
  }

  async function fetchOperator() {
    try {
      const operator = await getOperator(operator_id);

      setOperator(operator);

      return operator;
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchOperator();
  }, []);

  return (
    <>
      <div className="flex h-fit w-[88%] flex-col rounded-xl bg-white shadow-md">
        <div className="flex h-16 w-full items-center justify-end gap-3 rounded-t-xl bg-primary px-4">
          <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  "group relative flex h-10 w-10 flex-col items-center justify-center rounded-lg ring-1 md:flex-row",
                  isRegular
                    ? "bg-white text-red-600 ring-zinc-300 hover:bg-red-300 hover:ring-red-500"
                    : "bg-red-600 text-white ring-red-700 hover:bg-red-100 hover:text-red-600",
                )}
              >
                <IoIosWarning size={28} />
              </button>
            </DialogTrigger>
            <DialogContent className="flex h-[95%] w-[93%] flex-col overflow-scroll">
              <DialogTitle className="hidden">
                Marcar como roubado ou visualisar alerta
              </DialogTitle>

              {isStolen ? (
                <>
                  <span className="transition- absolute -top-8 right-5 hidden w-32 rounded-sm bg-black/60 px-2 py-1 text-white opacity-0 duration-300 group-hover:block group-hover:opacity-100">
                    Visualizar alerta
                  </span>
                  <ViewMyAlert
                    id={id}
                    status={status}
                    handleDeviceRecovery={handleDeviceRecovery}
                  />
                </>
              ) : (
                <>
                  <h2 className="font-bold">Preencha as informações</h2>
                  <AlertForm
                    id={id}
                    isStolen={isStolen}
                    setDevices={setDevices}
                    setIsDialogOpen={setIsAlertModalOpen}
                    isPopup
                  />
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger>
              <button
                type="button"
                className="group relative flex h-10 w-10 items-center justify-center rounded-lg bg-white ring-1 ring-zinc-300 hover:bg-sky-100 hover:text-blue-900 hover:opacity-90 hover:ring-blue-700"
              >
                <ImPencil size={20} />
              </button>
            </DialogTrigger>
            <DialogContent className="flex h-[95%] w-[90%] flex-col overflow-scroll">
              <DialogTitle className="hidden">Editar dispositivo</DialogTitle>
              <DeviceForm
                device={device}
                isPopover
                setModalOpen={setIsEditModalOpen}
              />
            </DialogContent>
          </Dialog>

          <ConfirmationDialog
            onConfirm={() => handleDeleteDevice(id)}
            title="Tem certeza que deseja excluir esse dispositivo?"
            description="Essa ação não pode ser desfeita. Isso excluirá permanentemente o
            dispositivo e removerá seus dados de nossos servidores."
          >
            <button
              type="button"
              className="group relative flex h-10 w-10 items-center justify-center gap-2 rounded-lg bg-white text-red-600 ring-1 ring-zinc-300 hover:bg-red-200 hover:opacity-90 hover:ring-red-600"
            >
              <Trash2 size={20} />
            </button>
          </ConfirmationDialog>

          {/* <Dialog>
            <DialogTrigger>
              <button
                type="button"
                className="flex rounded-lg w-10 h-10 bg-white group relative items-center justify-center gap-2 ring-1 ring-zinc-300 hover:bg-red-200 hover:ring-red-600 text-red-600 hover:opacity-90"
              >
                <Trash2 size={20} />
              </button>
            </DialogTrigger>
            <DialogContent className="h-[95%] w-[100%] flex bg-transparent border-none">
              <DeleteDeviceModal
                id={id}
                handleDeleteDevice={handleDeleteDevice}
              />
            </DialogContent>
          </Dialog> */}
        </div>

        <div className="flex h-full w-full">
          <div className="flex flex-col items-start justify-center gap-2 bg-procura-ai-zinc/10 px-4 pb-6 pt-4">
            <span className="">Modelo</span>
            <span className="h-[0.5px] w-full rounded-full bg-procura-ai-zinc/70" />

            <span className="">Fabricante</span>
            <span className="h-[0.5px] w-full rounded-full bg-procura-ai-zinc/70" />

            <span className="">IMEI</span>
            <span className="h-[0.5px] w-full rounded-full bg-procura-ai-zinc/70" />

            <span className="">Número</span>
            <span className="h-[0.5px] w-full rounded-full bg-procura-ai-zinc/70" />

            <span className="">Status</span>
          </div>

          <div className="flex h-full w-full flex-col items-start justify-center gap-2 px-4 pb-4 pt-4">
            <span className="font-semibold">{phone_model}</span>
            <span className="h-[0.5px] w-full rounded-full bg-procura-ai-zinc/70" />

            <span className="font-semibold">{brand}</span>
            <span className="h-[0.5px] w-full rounded-full bg-procura-ai-zinc/70" />

            <span className="font-semibold">
              {`${imei.slice(0, 1)} ${imei.slice(1, 8)} ${imei.slice(9, 15)}`}
            </span>
            <span className="h-[0.5px] w-full rounded-full bg-procura-ai-zinc/70" />

            <span className="font-semibold">
              {`(${phone_number.slice(0, 2)}) ${phone_number.slice(2, 7)}-${phone_number.slice(7, 11)}`}
            </span>
            <span className="h-[0.5px] w-full rounded-full bg-procura-ai-zinc/70" />

            <span
              className={cn(
                "flex w-20 items-center justify-center rounded-md capitalize",
                status === "Roubado" && "bg-robbery-bg p-1 text-robbery-text",
                status === "Recuperado" &&
                  "bg-recovered-bg p-1 text-recovered-text",
                status === "Regular" && "bg-regular-bg p-1 text-regular-text",
                status === "Furtado" && "bg-theft-bg p-1 text-theft-text",
                status === "Perdido" && "bg-lost-bg p-1 text-lost-text",
              )}
            >
              {status === "Recuperado" ? "Regular" : status.replace(" ", "")}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

interface DeleteDeviceModalProps {
  id: string;
  handleDeleteDevice: (id: string) => void;
  setModalOpen?: (value: boolean) => void;
}

function DeleteDeviceModal({
  id,
  handleDeleteDevice,
  setModalOpen,
}: DeleteDeviceModalProps) {
  return (
    <>
      <div className="fixed inset-0 z-50 m-auto flex flex-col items-center justify-center bg-black/50 p-6">
        <div className="flex flex-col gap-3 rounded-xl bg-white p-4">
          <h2 className="font-bold">
            Tem certeza que deseja excluir esse dispositivo?
          </h2>
          <p className="text-zinc-600">
            Essa ação não pode ser desfeita. Isso excluirá permanentemente o
            dispositivo e removerá seus dados de nossos servidores.
          </p>

          <div className="flex items-center justify-center gap-4">
            <DialogClose asChild>
              <Button
                variant="white"
                // onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
            </DialogClose>

            <DialogClose asChild>
              <Button variant="red" onClick={() => handleDeleteDevice(id)}>
                Confirmar
              </Button>
            </DialogClose>
          </div>
        </div>
      </div>
    </>
  );
}
