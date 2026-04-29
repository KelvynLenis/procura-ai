"use client";

import { cn } from "@/lib/utils";
import { IoIosWarning } from "react-icons/io";
import { AlertForm } from "../../Forms/AlertForm";
import type { DeviceProps } from "@/types";
import { Eye, X } from "lucide-react";
import { ViewMyAlertMobile } from "../../ViewMyAlertMobile";
import { useEffect, useState } from "react";
import { DeviceDetailsCard } from "./DeviceDetailsCard";
import { createEvent } from "@/functions/event/create-event";
import { updateDeviceStatus } from "@/functions/device/update-device-status";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface DeviceItemProps {
  id: string; // ID do dispositivo
  phone_number: string; // Número de telefone
  phone_model: string; // Modelo do telefone
  brand: string; // Fabricante do telefone
  operator_id: string | undefined; // ID do operador
  imei: string; // IMEI do telefone
  isStolen: boolean; // Status de "roubado" (true/false)
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>;
  index: number;
  status: string;
  deviceNotificationId?: string;
}

export function DeviceItem({
  id,
  phone_number,
  phone_model,
  brand,
  imei,
  operator_id,
  isStolen,
  status,
  setDevices,
  index,
  deviceNotificationId,
}: DeviceItemProps) {
  const [isViewDeviceDetailsCardOpen, setIsViewDeviceDetailsCardOpen] =
    useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const router = useRouter();

  const isRegular = status === "Regular" || status === "Recuperado";

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

  function handleViewDevice() {
    setIsViewDeviceDetailsCardOpen(true);
  }

  useEffect(() => {
    // console.log(deviceNotificationId, id);

    if (window.innerWidth >= 1080) {
      return;
    }

    if (deviceNotificationId && deviceNotificationId === id) {
      setIsAlertModalOpen(true);
    }
  }, []);

  return (
    <>
      <div className="flex h-[60px] w-full items-center justify-between gap-4 rounded-xl border border-zinc-300 bg-white px-2 py-2 text-sm">
        <span className="w-28">{phone_model}</span>
        {/* <div className="self-center flex justify-end">
        </div> */}
        <div className="flex justify-center gap-2">
          <span
            className={cn(
              "mobile: flex items-center justify-center self-center rounded-md font-medium capitalize mobile-sm:w-20 mobile-sm:text-xs mobile:w-24 mobile:text-sm",
              status === "Roubado" && "bg-robbery-bg p-2 text-robbery-text",
              status === "Recuperado" &&
                "bg-recovered-bg p-2 text-recovered-text",
              status === "Regular" && "bg-regular-bg p-2 text-regular-text",
              status === "Furtado" && "bg-theft-bg p-2 text-theft-text",
              status === "Perdido" && "bg-lost-bg p-2 text-lost-text",
            )}
          >
            {status.replace(" ", "")}
          </span>

          <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  "group relative flex h-8 w-8 flex-col items-center justify-center rounded-lg ring-1 md:flex-row",
                  status === "Recuperado"
                    ? "bg-recovered-bg text-recovered-text"
                    : status === "Regular"
                      ? "bg-white text-red-600 ring-zinc-300 hover:bg-red-300 hover:ring-red-500"
                      : "bg-red-600 text-white ring-red-700 hover:bg-red-100 hover:text-red-600",
                )}
              >
                <IoIosWarning size={28} />
              </button>
            </DialogTrigger>
            <DialogContent className="flex h-[95%] w-[93%] flex-col overflow-scroll px-0 pt-0">
              {status !== "Regular" ? (
                <>
                  <span className="flex w-full items-center bg-secondary/10 px-2 py-4">
                    <h2 className="text-lg font-medium text-secondary">
                      Informações da ocorrência
                    </h2>
                  </span>
                  <ViewMyAlertMobile
                    id={id}
                    status={status}
                    handleDeviceRecovery={handleDeviceRecovery}
                    setModalOpen={setIsAlertModalOpen}
                  />
                </>
              ) : (
                <div className="px-3 py-2">
                  <h2 className="font-bold">Preencha as informações</h2>
                  <AlertForm
                    id={id}
                    isStolen={isStolen}
                    setDevices={setDevices}
                    setIsDialogOpen={setIsAlertModalOpen}
                    isPopup
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="group relative flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-zinc-300 hover:bg-sky-100 hover:text-blue-900 hover:opacity-90 hover:ring-blue-700"
              >
                <Eye size={28} />
              </button>
            </DialogTrigger>
            <DialogContent
              className="ml-5 w-full border-none bg-transparent p-0 ring-0"
              canClose={false}
            >
              <DeviceDetailsCard
                id={id}
                isStolen={isStolen}
                setDevices={setDevices}
                index={index}
                phone_model={phone_model}
                phone_number={phone_number}
                operator_id={operator_id}
                brand={brand}
                imei={imei}
                status={status}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}

interface ModalProps {
  phone_number: string;
  phone_model: string;
  brand: string;
  imei: string;
  status: string;
  setModalOpen: (value: boolean) => void;
  operator_id: string;
  id: string; // ID do dispositivo
  isStolen: boolean; // Status de "roubado" (true/false)
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>;
  index: number;
}

function ViewDeviceInfoModal({
  phone_number,
  phone_model,
  brand,
  imei,
  status,
  setModalOpen,
  operator_id,
  id,
  isStolen,
  setDevices,
  index,
}: ModalProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(false)}
        className="relative inset-0 z-50 flex items-center justify-center bg-black/50 px-3"
      >
        <X
          size={24}
          className="absolute right-4 top-4 cursor-pointer rounded-full border border-white p-0.5 text-white"
          onClick={() => setModalOpen(false)}
        />
      </button>
      <div className="absolute z-[100] flex w-full items-center">
        <DeviceDetailsCard
          id={id}
          isStolen={isStolen}
          setDevices={setDevices}
          index={index}
          phone_model={phone_model}
          phone_number={phone_number}
          operator_id={operator_id}
          brand={brand}
          imei={imei}
          status={status}
        />
      </div>
    </>
  );
}
