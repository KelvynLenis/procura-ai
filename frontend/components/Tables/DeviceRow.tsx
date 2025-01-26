import { TableCell, TableRow } from "../ui/table";
import { IoIosWarning } from "react-icons/io";
import { ImPencil } from "react-icons/im";
import Link from "next/link";
import { DeviceProps } from "@/utils/types";
import { cn } from "@/lib/utils";
import { Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MarkAsStolenForm } from "../Forms/MarkAsStolenForm";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid'


interface DeviceRowProps {
  id: string; // ID do dispositivo
  phone_number: string; // Número de telefone
  phone_model: string; // Modelo do telefone
  brand: string; // Marca do telefone
  imei: string; // IMEI do telefone
  isStolen: boolean; // Status de "roubado" (true/false)
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>
}

export function DeviceRow({ id, phone_number, phone_model, brand, imei, isStolen, setDevices }: DeviceRowProps) {

  async function handleDeleteDevice(id: string) {
    try {
      const callFunction = async () => {
        const promise = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents/${id}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`
            },
          }).then(async (response) => {
            if (!response.ok) {
              const error = await response.text();
              throw new Error(`Error: ${error}`);
            }
            setDevices((prevDevices) => prevDevices.filter((device) => device.$id !== id));

            return response;
          }).catch((err) => {
            console.log(`Fetch error: ${err}`);
            return null;
          });
      }

      toast.promise(callFunction(), {
        pending: 'Deletando dispositivo...',
        success: 'Dispositivo deletado com sucesso',
        error: 'Erro ao deletar dispositivo'
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDeviceRecovery(id: string) {

    try {
      const eventId = uuidv4();
      const x = new Date().toISOString()


      console.log(x)
      const callFunction = async () => {

        const promise = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`
            },
            body: JSON.stringify({
              documentId: eventId,
              data: {
                id_device: id,
                time_event: new Date().toISOString(),
                last_location: [0, 0],
                description: "Recuperado",
                type: "Recuperado",
                is_alert_on: false
              }
            })
          }).then(async (response) => {

            if (!response.ok) {
              const error = await response.text();
              throw new Error(`Error: ${error}`);
            }
            return response.json();
          }).catch((err) => {
            console.log(`Fetch error: ${err.message}`);
            return null;
          });

        const updateDeviceStatus = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents/${id}`,
          {
            method: "PATCH",
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`
            },
            body: JSON.stringify({
              data: { isStolen: false },
            }),
          }
        );
      }

      setDevices((prevDevices) => prevDevices.map((device) => device.$id === id ? { ...device, isStolen: false } : device));


      toast.promise(callFunction, {
        pending: 'Recuperando Dispositivo...',
        success: 'Recuperado',
        error: 'Erro ao recuperar'
      })

    } catch (error) {
      console.error(error)
    }
  }


  return (
    <TableRow>
      <TableCell className="font-medium text-zinc-800">{phone_model}</TableCell>
      <TableCell>{brand}</TableCell>
      <TableCell>{imei.slice(0, 1) + ' ' + imei.slice(1, 8) + ' ****** **'}</TableCell>
      <TableCell>
        <span className={cn(isStolen ? "bg-red-500/20 text-red-700 p-1" : "bg-lime-500/20 text-lime-700 p-1")}>{isStolen ? 'Roubado' : 'Regular'}</span>
      </TableCell>
      <TableCell className="flex flex-col gap-2">
        <Link href={`meus-dispositivos/edit/${id}`}>
          <button className="rounded-xl flex bg-sky-100/70 text-blue-900 py-1 px-2 gap-2 items-center w-fit hover:opacity-70">
            <ImPencil size={16} />
            Editar
          </button>
        </Link>

        <button className="flex self-start w-20 items-center justify-center bg-red-500 rounded-xl p-1 text-white hover:opacity-50" onClick={() => handleDeleteDevice(id)}>
          <Trash size={20} />
        </button>

        {
          isStolen
            ? <button className={cn("rounded-xl flex flex-col md:flex-row  py-1 px-2 gap-2 items-center w-fit hover:opacity-70", 'bg-yellow-200 text-yellow-600')} onClick={() => handleDeviceRecovery(id)}>
              <IoIosWarning size={20} />
              Desativar alerta
            </button>

            :
            <Dialog>
              <DialogTrigger asChild>
                <button className={cn("rounded-xl flex flex-col md:flex-row  py-1 px-2 gap-2 items-center w-fit hover:opacity-70", 'bg-red-200 text-red-600')}>
                  <IoIosWarning size={20} />
                  Acionar alerta

                </button>
              </DialogTrigger>
              < DialogContent className="flex flex-col h-4/5 md:h-fit overflow-y-scroll w-fit py-8">

                <DialogHeader>
                  <DialogTitle>Preencha as informações</DialogTitle>
                </DialogHeader>
                <MarkAsStolenForm id={id} isStolen={isStolen} setDevices={setDevices} />
              </DialogContent>
            </Dialog>

        }




      </TableCell>
    </TableRow >
  )
}