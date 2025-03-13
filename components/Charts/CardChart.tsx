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
}

export function CardChart({ variant, number, title }: CardChartProps) {
  function getIcon() {
    if (variant === 'blue') {
      return (
        <Image
          src={registeredIcon}
          alt="registered-icon"
          width={44}
          height={44}
        />
      )
    } else if (variant === 'green') {
      return (
        <Image
          src={recoveredIcon}
          alt="recovered-icon"
          width={44}
          height={44}
        />
      )
    } else if (variant === 'red') {
      return <Image src={robIcon} alt="recovered-icon" width={44} height={44} />
    } else if (variant === 'city') {
      return <Image src={cities} alt="cities-icon" width={44} height={44} />
    } else if (variant === 'yellow') {
      return <Image src={lostIcon} alt="theft-icon" width={44} height={44} />
    } else if (variant === 'orange') {
      return <Image src={theftIcon} alt="theft-icon" width={44} height={44} />
    }
  }

  return (
    <>
      <div className="flex justify-between w-72 h-24 rounded-xl items-center bg-white p-3 text-procura-ai-blue ring-1 ring-zinc-300">
        {/* <div className={cn(
          "rounded-full p-2 ",
          variant === 'blue' && "bg-procura-ai-blue/10 text-procura-ai-blue",
          variant === 'green' && "bg-lime-400/20 text-lime-600",
          variant === 'red' && "bg-red-400/20 text-red-600",
          variant === 'yellow' && "bg-yellow-400/20 text-yellow-600"
        )}>
        </div> */}
        {getIcon()}

        <span className="flex font-bold text-3xl">{number}</span>
        <span className="flex w-32 font-semibold text-sm">{title}</span>
      </div>
    </>
  )
}
