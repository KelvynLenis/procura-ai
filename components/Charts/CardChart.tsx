import { cn } from '@/lib/utils'
import registeredIcon from '../../assets/icons/registered-icon.png'
import recoveredIcon from '../../assets/icons/recovered-icon.png'
import theftIcon from '../../assets/icons/theft-icon.png'
import lostIcon from '../../assets/icons/lost-icon.png'
import robIcon from '../../assets/icons/rob-icon.png'
import cities from '../../assets/icons/cities.png'
import Image from 'next/image'
import { TiDeviceTablet } from 'react-icons/ti'

interface CardChartProps {
  variant: 'blue' | 'green' | 'red' | 'yellow' | 'city' | 'orange'
  number: number
  title: string
  className?: string
}

export function CardChart({
  variant,
  number,
  title,
  className,
}: CardChartProps) {
  function getIcon() {
    if (variant === 'blue') {
      return (
        <Image
          src={registeredIcon}
          alt="registered-icon"
          className="size-10 "
        />
      )
    } else if (variant === 'green') {
      return (
        <Image
          src={recoveredIcon}
          alt="recovered-icon"
          className="size-10 xl:size-11"
        />
      )
    } else if (variant === 'red') {
      return (
        <Image
          src={robIcon}
          alt="recovered-icon"
          className="size-10 xl:size-11"
        />
      )
    } else if (variant === 'city') {
      return (
        <Image src={cities} alt="cities-icon" className="size-10 xl:size-11" />
      )
    } else if (variant === 'yellow') {
      return (
        <Image src={lostIcon} alt="theft-icon" className="size-10 xl:size-11" />
      )
    } else if (variant === 'orange') {
      return (
        <Image
          src={theftIcon}
          alt="theft-icon"
          className="size-10 xl:size-11"
        />
      )
    }
  }

  return (
    <>
      <div
        className={cn(
          'flex justify-between w-40 h-24 gap-1 xl:gap-2 xl:w-64 2xl:w-72 rounded-xl items-center bg-white p-2 xl:p-4 text-procura-ai-blue ring-1 ring-zinc-300',
          className
        )}
      >
        {/* <div className={cn(
          "rounded-full p-2 ",
          variant === 'blue' && "bg-procura-ai-blue/10 text-procura-ai-blue",
          variant === 'green' && "bg-lime-400/20 text-lime-600",
          variant === 'red' && "bg-red-400/20 text-red-600",
          variant === 'yellow' && "bg-yellow-400/20 text-yellow-600"
        )}>
        </div> */}
        {getIcon()}

        <span className="flex font-bold xl:text-3xl text-2xl">{number}</span>
        <span className="flex w-32 font-semibold text-sm">{title}</span>
      </div>
    </>
  )
}
