import { cn } from "@/lib/utils";


interface CardChartProps {
  Icon: React.ElementType;
  variant: 'blue' | 'green';
  number: number;
  title: string;
}

export function CardChart({ Icon, variant, number, title }: CardChartProps) {

  return (
    <>
      <div className="flex justify-between w-80 h-24 rounded-xl items-center bg-white p-3 text-procura-ai-blue ring-1 ring-zinc-300">
        <div className={cn(
          "rounded-full p-2 ",
          variant === 'blue' && "bg-procura-ai-blue/10 text-procura-ai-blue",
          variant === 'green' && "bg-lime-400/20 text-lime-600"
        )}>
          <Icon size={44} />
        </div>

        <span className="flex font-bold text-3xl">
          {number}
        </span>
        <span className="flex w-32 font-semibold text-sm">
          {title}
        </span>
      </div>
    </>
  )
}