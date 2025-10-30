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
} from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
  onConfirm: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
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
          <AlertDialogFooter className="flex flex-row items-center justify-between w-full gap-4">
            <AlertDialogCancel className="rounded-full text-center items-center justify-center flex flex-1 w-full px-2 py-2 transition-all duration-300 bg-white border-[0.5px] border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full text-center items-center self-end justify-center flex flex-1 w-full px-2 py-2 transition-all duration-300 bg-secondary border-[0.5px] border-secondary text-white hover:bg-white hover:text-secondary"
              onClick={() => onConfirm()}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
