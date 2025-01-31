
import { cn } from "@/lib/utils"
import ClipLoader from "react-spinners/ClipLoader"

interface LoadingToastProps {
  isReactToastifyComponent?: boolean
}

export function LoadingToast({ isReactToastifyComponent }: LoadingToastProps) {

  return (
    <>
      <div className={cn("bg-white flex w-fit gap-5 text-zinc-700  rounded-xl opacity-70 items-end justify-end ", isReactToastifyComponent ? "py-4" : "absolute translate-x-1/2 top-4 left-1/3 px-5 py-5 shadow")}>
        Carregando requisição, aguarde.
        <ClipLoader color='#0F2498' size={25} />
      </div>
    </>
  )
}