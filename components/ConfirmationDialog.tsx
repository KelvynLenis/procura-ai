import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ConfirmationDialogProps {
  onConfirm: () => void
  title: string
  description: string
  children: React.ReactNode
}

export function ConfirmationDialog({
  onConfirm,
  title,
  description,
  children,
}: ConfirmationDialogProps) {
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger>{children}</AlertDialogTrigger>
        <AlertDialogContent className="w-[90%] mr-10">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-between w-full">
            <AlertDialogAction
              className="rounded-full text-center items-center self-end justify-center flex w-fit px-2 py-2 transition-all duration-300 bg-red-500 border-[0.5px] border-red-500 text-white hover:bg-white hover:text-red-500"
              onClick={() => onConfirm()}
            >
              Confirmar
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full text-center items-center justify-center flex w-fit px-2 py-2 transition-all duration-300 bg-white border-[0.5px] border-primary text-primary hover:bg-primary hover:text-white">
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
