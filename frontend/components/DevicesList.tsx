'use client'

import { DeviceProps } from "@/utils/types";
import { DeviceItem } from "./DeviceItem";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import Button from "./Button";

interface DevicesListProps {
  devices: DeviceProps[];
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>
  page: number
  limit: number
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export function DevicesList({ devices, setDevices, page, limit, isLoading, setIsLoading }: DevicesListProps) {
  console.log(devices)

  function showLoadingToast() {
    setIsLoading(true)
  }

  return (
    <>

      <div className="flex flex-col w-full ml-1 self-center gap-2 bg-[#F9F9F9] ring-1 ring-zinc-300 rounded-xl">
        <div className="grid grid-cols-3 gap-2 px-2.5 bg-zinc-200/50 rounded-t-xl py-3 drop-shadow-sm">
          <span>Modelo</span>
          <span className="ml-9 text-center">Status</span>
          <span className="ml-1 text-center">Ações</span>
        </div>
        <div className="flex flex-col w-full self-center gap-1 px-1 py-2">
          {
            isLoading ? (
              <div className="flex flex-col w-full h-fit bg-white rounded-lg ring-1 ring-zinc-200">
                <div className="grid grid-cols-3 justify-end gap-5 px-2.5 py-3">
                  <Skeleton className="w-20 h-6" />
                  <Skeleton className="w-16 h-6 ml-6" />
                  <div className="flex gap-1 ml-3">
                    <Skeleton className="w-6 h-6" />
                    <Skeleton className="w-6 h-6" />

                  </div>
                </div>
              </div>
            ) : (
              devices.map((device, index) => (
                <DeviceItem
                  key={device.$id}
                  index={(index + 1 * ((page - 1) * limit))}
                  id={device.$id!}
                  phone_number={device.phone_number}
                  phone_model={device.phone_model}
                  brand={device.brand}
                  imei={device.imei}
                  isStolen={device.is_stolen!}
                  status={device.status!}
                  setDevices={setDevices}
                />
              ))
            )
          }
          <Link href={'/cadastrar-dispositivo'} className="self-end">
            <Button onClick={showLoadingToast} variant="blue" className="self-end w-44 my-3">Cadastrar dispositivo</Button>
          </Link>
        </div>
      </div>
    </>
  )
}