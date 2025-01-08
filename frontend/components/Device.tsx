import Button from "./Button";
import { Device as DeviceProps } from "@/utils/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddDeviceForm } from "./Forms/AddDeviceForm";
import { useToast } from "@/hooks/use-toast";
import { Trash } from "lucide-react";

export function Device({ phoneModel, phoneNumber, brand, imei, latitude, longitude }: DeviceProps) {
  const { toast } = useToast()

  async function handleDeleteDevice(id: string) {
    // @Glaymar TODO
    // Lógica para deletar o dispositivo

    console.log(id)
    toast({
      variant: 'warning',
      title: 'TODO',
      description: 'Lógica para deletar o dispositivo',
      duration: 3000
    })

  }

  return (
    <>
      <div className="flex bg-zinc-100 rounded-3xl px-3 py-3 justify-between max-w-[700px]">
        <div className="flex flex-col gap-1.5 w-1/2 text-lg">
          <span>Modelo: <span className="font-semibold">{phoneModel}</span></span>
          <span>Marca:  <span className="font-semibold">{brand}</span></span>
          <span>IMEI:  <span className="font-semibold">{imei}</span></span>
          <span>Status:  <span className="font-semibold">ativo</span></span>
        </div>

        <div className="flex flex-col justify-between w-1/2">
          <Dialog>
            <DialogTrigger className="self-end font-medium hover:opacity-50">Editar</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar contato</DialogTitle>
                <AddDeviceForm device={{ phoneModel, phoneNumber, brand, imei, latitude, longitude }} />
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Button variant="red" className="self-end w-fit py-2 max-w-52" onClick={() => handleDeleteDevice('id')}>
            <Trash className="w-5 h-5" />
          </Button>
          <Button variant="orange" className="self-end w-full py-1 max-w-52">Marcar como roubado</Button>
        </div>
      </div>
    </>
  )
}