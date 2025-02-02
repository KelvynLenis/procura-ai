import { DeviceProps, EventProps } from "@/utils/types";
import { X } from "lucide-react";

interface DeviceInfoCardProps {
  occurence: EventProps;
  closePopup: () => void
}

export function DeviceInfoCard({ occurence, closePopup }: DeviceInfoCardProps) {

  console.log(occurence)
  return (
    <div className="w-2/5 h-90 flex ring-1 ring-zinc-200 rounded-md gap-2">
      <span className="w-1 h-full bg-procura-ai-blue" />

      <div className="flex flex-col py-6 px-4 gap-6 h-fit w-full">
        <div className="flex flex-col gap-4 items-end justify-end">
          <div className="flex w-full justify-between items-center">
            <span className="w-full h-full flex flex-col text-3xl text-procura-ai-blue font-semibold">#{occurence.event.$id.slice(0, 5)}</span>

            <button type="button" onClick={closePopup}>
              <X className="w-6 h-6 cursor-pointer" />
            </button>
          </div>
          <span className="w-full h-0.5 bg-zinc-300" />

        </div>

        <div className="flex gap-4">

          <div className="flex flex-col gap-4">
            <span>Tipo: </span>
            <span>Modelo:</span>
            <span>Marca:</span>
            <span>Proprietário:</span>
            <span>Detalhe:</span>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-semibold">{occurence.event.type}</span>
            <span className="font-semibold">{occurence.device.phone_model}</span>
            <span className="font-semibold">{occurence.device.brand}</span>
            <span className="font-semibold">{occurence.user.name}</span>
            <span className="font-semibold">{occurence.event.description}</span>
          </div>
        </div>

      </div>
    </div>
  )
}