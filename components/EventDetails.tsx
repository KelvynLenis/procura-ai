import { cn, formatDateTime } from '@/lib/utils'
import { DeviceProps, type OccurrencesProps } from '@/types'
import { X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface EventDetailsProps {
  occurence: OccurrencesProps
  closePopup: () => void
  styles?: string
}

export function EventDetails({
  occurence,
  closePopup,
  styles,
}: EventDetailsProps) {
  const pathname = usePathname().slice(1)

  const fullScreenMap = pathname === 'map/ocorrencias'

  const lastLocation = occurence.event?.last_location
  const googleMapsUrl = `https://www.google.com/maps?q=${lastLocation[0]},${lastLocation[1]}`

  function formatType(type: string) {
    if (type === 'Furto' || type === 'Furto simples') {
      return 'Furto simples'
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else if (type === 'Perda' || type === 'Extravio ou Perda') {
      return 'Extravio ou Perda'
    }
    return type
  }

  return (
    <div
      className={cn('w-2/5 flex ring-1 ring-zinc-200 rounded-md gap-2', styles)}
    >
      <span className="w-1 h-full bg-procura-ai-blue" />

      <div
        className={cn(
          'flex flex-col py-6 px-4 gap-4 h-fit w-full',
          fullScreenMap && 'gap-2 py-4 px-1'
        )}
      >
        <div className="flex flex-col gap-2 items-end justify-end">
          <div className="flex w-full justify-between items-center">
            {fullScreenMap ? (
              <div className="flex w-full justify-center">
                <Link
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-500"
                >
                  Veja no google maps
                </Link>
              </div>
            ) : (
              <span className="w-full h-full flex flex-col text-3xl text-procura-ai-blue font-semibold">
                #{occurence.event.$id.slice(0, 5)}
              </span>
            )}

            <button type="button" onClick={closePopup}>
              <X className="w-6 h-6 cursor-pointer" />
            </button>
          </div>
          <span className="w-full h-0.5 bg-zinc-300" />
        </div>

        <div className={cn('flex flex-col gap-4', fullScreenMap && 'gap-1')}>
          <div className="flex w-96">
            <span className="lg:w-24 xl:w-32">Tipo: </span>
            <span className="font-semibold flex w-1/3 xl:w-1/2 1.5xl:w-3/5 2xl:flex-1">
              {formatType(occurence.event.type)}
            </span>
          </div>

          <div className="flex w-96">
            <span className="lg:w-24 xl:w-32">Modelo:</span>
            <span className="font-semibold w-1/3 flex">
              {occurence.device.phone_model}
            </span>
          </div>

          <div className="flex w-96">
            <span className="lg:w-24 xl:w-32">Fabricante:</span>
            <span className="font-semibold flex w-1/3 xl:w-1/2 1.5xl:w-3/5 2xl:flex-1">
              {occurence.device.brand}
            </span>
          </div>

          <div className="flex w-96">
            <span className="lg:w-24 xl:w-32">Proprietário:</span>
            <span
              className={cn(
                occurence.user.name === 'Usuário excluído'
                  ? 'italic text-zinc-500'
                  : 'font-semibold flex w-1/3 xl:w-1/2 1.5xl:w-3/5 2xl:flex-1'
              )}
            >
              {occurence.user.name}
            </span>
          </div>

          <div className="flex w-96">
            <span className="lg:w-24 xl:w-32">Data e hora:</span>
            <span className="font-semibold flex w-1/3 xl:w-1/2 1.5xl:w-3/5 2xl:flex-1">
              {formatDateTime(occurence.event.time_event)}
            </span>
          </div>

          <div className="flex w-96">
            <span className="lg:w-24 xl:w-32">Detalhe:</span>
            <span
              className={cn(
                occurence.event.description
                  ? 'font-semibold flex w-1/3 xl:w-1/2 1.5xl:w-3/5 2xl:flex-1 text-justify'
                  : 'italic text-zinc-500'
              )}
            >
              {occurence.event.description
                ? occurence.event.description
                : 'Sem detalhes'}
            </span>
          </div>
        </div>
        {/* <div className="flex gap-4">
          <div
            className={cn('flex flex-col gap-4', fullScreenMap && 'gap-1')}
          ></div>
        </div> */}
      </div>
    </div>
  )
}
