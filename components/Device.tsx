import Button from './Button'
import { Device as DeviceProps } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DeviceForm } from './Forms/DeviceForm'
import { useToast } from '@/hooks/use-toast'
import { Trash } from 'lucide-react'
import { deleteDevice } from '@/functions/device/delete-device'

export function Device({
  phone_model,
  phone_number,
  brand,
  imei,
  $id,
  setDevices,
}: DeviceProps & {
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>
}) {
  const { toast } = useToast()

  async function handleDeleteDevice(id: string) {
    try {
      await deleteDevice(id)
      setDevices(prevDevices => prevDevices.filter(device => device.$id !== id))
      toast({
        title: 'Dispositivo excluído com sucesso!',
        variant: 'default',
      })
    } catch (error) {
      console.error('Erro ao deletar dispositivo:', error)
      toast({
        title: 'Erro ao excluir dispositivo',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <div className="flex bg-zinc-100 rounded-3xl px-3 py-3 justify-between max-w-[700px]">
        <div className="flex flex-col gap-1.5 w-1/2 text-lg">
          <span>
            Modelo: <span className="font-semibold">{phone_model}</span>
          </span>
          <span>
            Fabricante: <span className="font-semibold">{brand}</span>
          </span>
          <span>
            IMEI: <span className="font-semibold">{imei}</span>
          </span>
          <span>
            Status: <span className="font-semibold">ativo</span>
          </span>
        </div>

        <div className="flex flex-col justify-between w-1/2 ">
          <Dialog>
            <DialogTrigger className="self-end font-medium hover:opacity-50">
              Editar
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar contato</DialogTitle>
                <DeviceForm
                  device={{ phone_model, phone_number, brand, imei }}
                />
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Button
            variant="red"
            className="self-end w-fit py-2 max-w-52"
            onClick={() => handleDeleteDevice($id)}
          >
            <Trash className="w-5 h-5" />
          </Button>
          <Button
            variant="orange"
            className="self-end w-full py-1 max-w-52 text-xs md:text-base"
          >
            Marcar como roubado
          </Button>
        </div>
      </div>
    </>
  )
}
