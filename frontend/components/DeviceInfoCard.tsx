import { cn } from "@/lib/utils";
import { DeviceProps, EventProps } from "@/utils/types";
import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DeviceInfoCardProps {
  occurence: EventProps;
  closePopup: () => void;
  styles?: string;
}

export function DeviceInfoCard({ occurence, closePopup, styles }: DeviceInfoCardProps) {
  const pathname = usePathname().slice(1)

  const fullScreenMap = pathname === 'map/ocorrencias'

  const lastLocation = occurence.event?.last_location;
  const googleMapsUrl = `https://www.google.com/maps?q=${lastLocation[0]},${lastLocation[1]}`;

  console.log(occurence)

  function formatType(type: string) {
    switch (type) {
      case 'Furto':
        return 'Furto simples'
      case 'Roubo':
        return 'Furto simples'
      case 'Perda':
        return 'Extravio ou Perda'
      default:
        break;
    }
  }

  return (
    <div className={cn("w-2/5 h-90 flex ring-1 ring-zinc-200 rounded-md gap-2", styles)}>
      <span className="w-1 h-full bg-procura-ai-blue" />

      <div className={cn("flex flex-col py-6 px-4 gap-6 h-fit w-full", fullScreenMap && "gap-2 py-4 px-1")}>
        <div className="flex flex-col gap-2 items-end justify-end">
          <div className="flex w-full justify-between items-center">
            {
              fullScreenMap ? (
                <Link href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-500 flex w-full justify-center">
                  Veja no google maps
                </Link>
              ) : (
                <span className="w-full h-full flex flex-col text-3xl text-procura-ai-blue font-semibold">#{occurence.event.$id.slice(0, 5)}</span>
              )
            }

            <button type="button" onClick={closePopup}>
              <X className="w-6 h-6 cursor-pointer" />
            </button>
          </div>
          <span className="w-full h-0.5 bg-zinc-300" />

        </div>

        <div className="flex gap-4">
          <div className={cn("flex flex-col gap-4", fullScreenMap && "gap-1")}>
            <span>Tipo: </span>
            <span>Modelo:</span>
            <span>Marca:</span>
            <span>Proprietário:</span>
            <span>Detalhe:</span>
          </div>

          <div className={cn("flex flex-col gap-4", fullScreenMap && "gap-1")}>
            <span className="font-semibold">{formatType(occurence.event.type)}</span>
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