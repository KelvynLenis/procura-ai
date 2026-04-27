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
import { ca } from "date-fns/locale";

interface ConfirmationDialogProps {
  onConfirm: () => void;
  onCancel?: () => void;
  cancelText?: string;
  confirmText?: string;
  isOpen?: boolean;
  title: string;
  description: string;
  children?: React.ReactNode;
  disabled?: boolean;
  disabledStyles?: string;
}

export function ConfirmationDialog({
  onConfirm,
  onCancel,
  isOpen,
  title,
  description,
  children,
  disabled,
  disabledStyles,
  cancelText,
  confirmText,
}: ConfirmationDialogProps) {
  return (
    <>
      <AlertDialog open={isOpen}>
        <AlertDialogTrigger disabled={disabled}>{children}</AlertDialogTrigger>
        <AlertDialogContent className="mr-10 w-[90%]">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex w-full flex-row items-center justify-between gap-4">
            <AlertDialogCancel
              onClick={onCancel}
              className="flex w-full flex-1 items-center justify-center rounded-full border-[0.5px] border-red-500 bg-white px-2 py-2 text-center text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white"
            >
              {cancelText || "Cancelar"}
            </AlertDialogCancel>
            <AlertDialogAction
              className="flex w-full flex-1 items-center justify-center self-end rounded-full border-[0.5px] border-secondary bg-secondary px-2 py-2 text-center text-white transition-all duration-300 hover:bg-white hover:text-secondary"
              onClick={() => onConfirm()}
            >
              {confirmText || "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
