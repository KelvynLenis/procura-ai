"use client";

import type { DeviceProps } from "@/types";
import { DeviceItem } from "./DeviceItem";
import { Skeleton } from "../../ui/skeleton";
import Link from "next/link";
import Button from "../../Button";
import { useStatus } from "@/hooks/useStatus";

interface DevicesListProps {
  devices: DeviceProps[];
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>;
  page: number;
  limit: number;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  deviceNotificationId?: string;
}

export function DevicesList({
  devices,
  setDevices,
  page,
  limit,
  isLoading,
  setIsLoading,
  deviceNotificationId,
}: DevicesListProps) {
  const { userStatus } = useStatus();

  function showLoadingToast() {
    if (userStatus !== "Ativo") {
      return;
    }

    setIsLoading(true);
  }

  return (
    <>
      <div className="flex w-full flex-col gap-2 self-center rounded-xl bg-[#F9F9F9] ring-1 ring-zinc-300">
        <div className="flex w-full justify-between gap-2 rounded-t-xl bg-zinc-200/50 px-2.5 py-3 drop-shadow-sm">
          <span>Modelo</span>
          <div className="-ml-10 flex">
            <span className="text-left mobile-sm:w-20 mobile:w-24">Status</span>
            <span className="text-left mobile-sm:w-20 mobile:w-20">Ações</span>
          </div>
        </div>
        <div className="flex w-full flex-col gap-1 self-center px-1 py-2">
          {isLoading ? (
            <div className="flex h-fit w-full flex-col rounded-lg bg-white ring-1 ring-zinc-200">
              <div className="flex w-full justify-end gap-5 px-2.5 py-3">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="ml-6 h-6 w-16" />
                <div className="ml-3 flex gap-1">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-6" />
                </div>
              </div>
            </div>
          ) : (
            devices.map((device, index) => (
              <DeviceItem
                key={device.$id}
                index={index + 1 * ((page - 1) * limit)}
                id={device.$id!}
                phone_number={device.phone_number}
                phone_model={device.phone_model}
                brand={device.brand}
                operator_id={device.operator_id}
                imei={device.imei}
                isStolen={device.is_stolen!}
                status={device.status!}
                setDevices={setDevices}
                deviceNotificationId={deviceNotificationId}
              />
            ))
          )}
          <Link
            href={userStatus === "Ativo" ? "/cadastrar-dispositivo" : "#"}
            className="self-end"
            onClick={(event) => {
              if (userStatus !== "Ativo") {
                event.preventDefault();
              }
            }}
          >
            <Button
              onClick={showLoadingToast}
              variant={userStatus === "Ativo" ? "blue" : "disabled"}
              disabled={userStatus !== "Ativo"}
              className="my-3 text-sm"
            >
              Cadastrar dispositivo
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
