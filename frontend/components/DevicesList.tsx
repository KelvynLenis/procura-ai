'use client'

import { DeviceProps } from "@/utils/types";
import { DeviceItem } from "./DeviceItem";
import { Skeleton } from "./ui/skeleton";

interface DevicesListProps {
  devices: DeviceProps[];
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>
  page: number
  limit: number
  isLoading: boolean
}

export function DevicesList({ devices, setDevices, page, limit, isLoading }: DevicesListProps) {

  return (
    <>
      <div className="flex flex-col w-full ml-1 self-center gap-5 bg-zinc-200 ring-1 ring-zinc-300 rounded-xl">
        {
          isLoading ? (
            <div className="flex flex-col w-full h-fit bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-end w-full h-20 bg-primary rounded-t-xl px-4 gap-3">
                <Skeleton className="w-10 h-10 ring-1 bg-zinc-500 ring-zinc-200"></Skeleton>

                <Skeleton className="w-10 h-10 ring-1 bg-zinc-500 ring-zinc-200"></Skeleton>
              </div>

              <div className="flex w-full h-full">
                <div className="flex flex-col items-start justify-center gap-2 bg-procura-ai-zinc/10 px-4 pt-4 pb-6 h-full">
                  <Skeleton className="w-14 h-6"></Skeleton>
                  <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

                  <Skeleton className="w-14 h-6"></Skeleton>
                  <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

                  <Skeleton className="w-14 h-6"></Skeleton>
                  <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

                  <Skeleton className="w-14 h-6"></Skeleton>
                </div>

                <div className="flex flex-col items-start justify-center gap-2 px-4 pt-4 pb-6 w-full h-full">
                  <Skeleton className="w-32 h-6"></Skeleton>

                  <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />
                  <Skeleton className="w-32 h-6"></Skeleton>

                  <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

                  <Skeleton className="w-32 h-6"></Skeleton>
                  <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />
                  <Skeleton className="w-32 h-6"></Skeleton>

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
      </div>
    </>
  )
}