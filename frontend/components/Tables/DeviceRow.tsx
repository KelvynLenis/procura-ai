'use client'

import { TableCell, TableRow } from "../ui/table";
import { IoIosWarning } from "react-icons/io";
import { ImPencil } from "react-icons/im";
import Link from "next/link";
import { DeviceProps } from "@/utils/types";
import { cn } from "@/lib/utils";
import { Eye, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import { MarkAsStolenForm } from "../Forms/MarkAsStolenForm";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid'
import { useState } from "react";
import { AlertForm } from "../Forms/AlertForm";

interface DeviceRowProps {
  id: string; // ID do dispositivo
  phone_number: string; // Número de telefone
  phone_model: string; // Modelo do telefone
  brand: string; // Marca do telefone
  imei: string; // IMEI do telefone
  isStolen: boolean; // Status de "roubado" (true/false)
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>;
  index: number;
  status: string;
}

export function DeviceRow({ id, phone_number, phone_model, brand, imei, isStolen, status, setDevices, index }: DeviceRowProps) {
  const [isLoading, setIsLoading] = useState(false)

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
        try {
          const createEvent = await fetch(
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
                data: {
                  is_stolen: false,
                  status: "Recuperado"
                },
              }),
            }
          );

          return true; // Return success flag
        } catch (error) {
          console.error("Ocorreu um erro em uma das operações:", error);
          return false; // Return failure flag
        }
      }

      // setDevices((prevDevices) => prevDevices.map((device) => device.$id === id ? { ...device,  } : device));

      const success = await toast.promise(callFunction, {
        pending: 'Recuperando Dispositivo...',
        success: 'Recuperado',
        error: 'Erro ao recuperar'
      })

      if (success) {
        setDevices((prevDevices) => prevDevices.map((device) => device.$id === id ? { ...device, is_stolen: false, status: "Recuperado" } : device));

      }
    } catch (error) {
      console.error(error)
    }
  }

  function showLoadingToast() {
    setIsLoading(true)
  }


  return (
    <>
      <TableRow className="text-base">
        <TableCell className="font-bold text-zinc-800 pl-5 hidden lg:table-cell">{index + 1}</TableCell>
        <TableCell className="font-bold text-zinc-800 lg:flex">{phone_model}</TableCell>
        <TableCell className="font-bold capitalize hidden md:table-cell">{brand}</TableCell>
        <TableCell className="font-bold hidden md:table-cell">{imei.slice(0, 1) + ' ' + imei.slice(1, 8) + ' ****** **'}</TableCell>
        <TableCell className="w-24">
          <span className={cn("rounded-md w-20 flex items-center justify-center capitalize",
            status === "Roubado" && "bg-robbery-bg text-robbery-text p-1",
            status === "Recuperado" && "bg-regular-bg text-regular-text p-1",
            status === "Regular" && "bg-regular-bg text-regular-text p-1",
            status === "Furtado" && "bg-theft-bg text-theft-text p-1",
            status === "Perdido" && "bg-lost-bg text-lost-text p-1",
            // status === "Perdido" && "bg-violet-500/20 text-violet-700 p-1",
          )}>{status === 'Recuperado' ? "Regular" : status.replace(' ', '')}</span>
        </TableCell>
        <TableCell className="flex gap-2 items-center h-20 py-28 md:py-10 mdflex-wrap md:my-3">
          <div className="flex flex-col md:flex-row items-center w-full gap-2">

            <Dialog>
              <DialogTrigger asChild>
                <button className="rounded-lg w-10 h-10 flex ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90">
                  <Eye size={26} />
                  <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                    Exibir informações
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="flex flex-col py-10 gap-10">
                <DialogHeader>
                  <DialogTitle>Detalhes do dispositivo</DialogTitle>
                </DialogHeader>

                <div className="flex gap-8">

                  <div className="flex flex-col items-start justify-center">
                    <span className="font-bold">Número</span>
                    <span className="break-words">{phone_number}</span>
                  </div>

                  <div className="flex flex-col items-start justify-center">
                    <span className="font-bold">Modelo</span>
                    <span>{phone_model}</span>
                  </div>

                  <div className="flex flex-col gap-2 items-center justify-start">
                    <span className="font-bold">Marca</span>
                    <span>{brand}</span>
                  </div>


                  <div className="flex flex-col gap-2 items-center justify-start">
                    <span className="font-bold">IMEI</span>
                    <span>{imei}</span>
                  </div>


                  <div className="flex flex-col gap-2 items-center justify-start">
                    <span className="font-bold">Status</span>
                    <span>{status}</span>
                  </div>

                </div>

              </DialogContent>
            </Dialog>



            <Link href={`meus-dispositivos/edit/${id}`}>
              <button onClick={showLoadingToast} className="rounded-lg w-10 h-10 flex ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90">
                <ImPencil size={16} />
                <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                  Editar dispositivo
                </span>
              </button>
            </Link>

            <AlertDialog>
              <AlertDialogTrigger>
                <button className="rounded-lg w-10 h-10 flex group relative items-center justify-center gap-2 ring-1 ring-zinc-300 hover:bg-red-200 hover:ring-red-600 text-red-600 hover:opacity-90">
                  <Trash2 size={20} />
                  <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                    Deletar dispositivo
                  </span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja excluir o dispositivo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o dispositivo e removerá seus dados de nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white mr-2">Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-500" onClick={() => handleDeleteDevice(id)}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>


            {
              isStolen
                ?

                <Dialog>
                  <DialogTrigger asChild>
                    <button title="Desativar alerta" className={cn(
                      "w-10 h-10 group relative rounded-lg flex flex-col md:flex-row items-center justify-center hover:bg-white",
                      status === "Roubado" && "bg-robbery-bg text-red-600 p-1 ring-1 ring-red-500",
                      status === "Furtado" && "bg-theft-bg text-orange-600 p-1 ring-1 ring-orange-500",
                      status === "Perdido" && "bg-lost-bg text-yellow-600 p-1 ring-1 ring-yellow-500",
                      status === "Recuperado" && "bg-lime-500/30 text-lime-600 p-1 ring-1 ring-lime-500",
                      status === "Regular" && "bg-lime-500/30 text-lime-600 p-1 ring-1 ring-lime-500",
                    )}>
                      <IoIosWarning size={28} />
                      <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-32 rounded-sm absolute -top-8 right-5 py-1 px-2 text-white transition- duration-300">
                        Visualizar alerta
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="flex flex-col h-4/5 md:h-fit overflow-y-scroll w-fit py-8">
                    <DialogHeader>
                      <DialogTitle>Detalhes do alerta</DialogTitle>
                    </DialogHeader>
                    <AlertForm id={id} status={status} handleDeviceRecovery={handleDeviceRecovery} />
                  </DialogContent>
                </Dialog>

                :
                <Dialog>
                  <DialogTrigger asChild>
                    <button className={cn("rounded-lg group relative w-10 h-10 ring-1 ring-zinc-300 flex flex-col md:flex-row items-center justify-center text-red-600 hover:bg-red-300 hover:ring-red-500")}>
                      <IoIosWarning size={28} />
                      <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-28 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                        Acionar alerta
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="flex flex-col h-4/5 md:h-fit overflow-y-scroll w-fit py-8">

                    <DialogHeader>
                      <DialogTitle>Preencha as informações</DialogTitle>
                    </DialogHeader>
                    <MarkAsStolenForm id={id} isStolen={isStolen} setDevices={setDevices} />
                  </DialogContent>
                </Dialog>
            }
          </div>
        </TableCell>
      </TableRow>
    </>
  )
}