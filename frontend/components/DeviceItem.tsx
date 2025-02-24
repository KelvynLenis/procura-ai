'use client'

import { cn } from "@/lib/utils";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { IoIosWarning } from "react-icons/io";
import { MarkAsStolenForm } from "./Forms/MarkAsStolenForm";
import { DialogHeader } from "./ui/dialog";
import { DeviceProps } from "@/utils/types";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { EllipsisVertical, Eye, Trash2, Triangle, X } from "lucide-react";
import { AlertForm } from "./Forms/AlertForm";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid'
import { ImPencil } from "react-icons/im";
import { useState } from "react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@radix-ui/react-alert-dialog";
import { AlertDialogHeader, AlertDialogFooter } from "./ui/alert-dialog";
import Link from "next/link";
import Button from "./Button";

interface DeviceItemProps {
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

export function DeviceItem({ id, phone_number, phone_model, brand, imei, isStolen, status, setDevices, index }: DeviceItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isViewAlertModalOpen, setIsViewAlertModalOpen] = useState(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

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

  function handleOpenAlertModal() {
    const isRegular = status === "Regular" || status === "Recuperado"
    !isRegular ? setIsAlertModalOpen(true) : setIsAlertModalOpen(false)
  }

  function handleViewDevice() {
    const isRegular = status === "Regular" || status === "Recuperado"
    setIsViewAlertModalOpen(true)
  }

  return (
    <>
      <div className="flex flex-col w-full h-fit bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-end w-full h-16 bg-primary rounded-t-xl px-4 gap-3">
          <button onClick={() => setIsAlertModalOpen(true)} className={cn("rounded-lg group w-10 h-10 ring-1 bg-white ring-zinc-300 flex flex-col md:flex-row items-center justify-center text-red-600 hover:bg-red-300 hover:ring-red-500")}>
            <IoIosWarning size={28} />
          </button>

          {/* <Dialog>
            <DialogTrigger asChild>
              <button className={cn("rounded-lg group w-10 h-10 ring-1 bg-white ring-zinc-300 flex flex-col md:flex-row items-center justify-center text-red-600 hover:bg-red-300 hover:ring-red-500")}>
                <IoIosWarning size={28} />
              </button>
            </DialogTrigger>
            <DialogContent className="flex flex-col h-4/5 md:h-fit overflow-y-scroll w-fit py-8">

              <DialogHeader>
                <DialogTitle>Preencha as informações</DialogTitle>
              </DialogHeader>
              <MarkAsStolenForm id={id} isStolen={isStolen} setDevices={setDevices} />
            </DialogContent>
          </Dialog> */}

          <Popover>
            <PopoverTrigger asChild>
              <button className={cn("rounded-lg group w-10 h-10 ring-1 bg-white ring-zinc-300 flex flex-col md:flex-row items-center justify-center text-procura-ai-black")}>
                <EllipsisVertical size={28} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="flex absolute flex-col items-start gap-2 justify-center bg-white py-2 w-40 px-3 rounded-lg ring-1 ring-zinc-300 -right-5 top-4">
              <Triangle className="fill-white text-white absolute -top-3.5 right-2" />

              <button onClick={handleViewDevice} className="rounded-lg gap-2 flex group hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90">
                <Eye size={24} />
                Ver detalhes
              </button>

              {/* <Dialog>
                <DialogTrigger asChild>
                  <button className="rounded-lg gap-2 flex group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90">
                    <Eye size={24} />
                    Ver detalhes
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Detalhes do usuários</DialogTitle>
                  </DialogHeader>

                  <div className="flex flex-col gap-8">

                    <div className="flex flex-col items-start justify-center">
                      <span className="font-bold">Número</span>
                      <span className="break-words">{phone_number}</span>
                    </div>

                    <div className="flex flex-col items-start justify-center">
                      <span className="font-bold">Modelo</span>
                      <span>{phone_model}</span>
                    </div>

                    <div className="flex flex-col gap-2 items-center justify-start">
                      <span className="font-bold">Brand</span>
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
              </Dialog> */}

              <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

              <Link href={`meus-dispositivos/edit/${id}`}>
                <button onClick={showLoadingToast} className="rounded-lg flex gap-3 ml-1 group hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90">
                  <ImPencil size={18} />
                  Editar
                </button>
              </Link>

              <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

              <button onClick={() => setIsDeleteModalOpen(true)} className="rounded-lg flex ml-0.5 gap-3 group items-center justify-center hover:bg-red-200 hover:ring-red-600 text-red-600 hover:opacity-90">
                <Trash2 size={19} />
                Excluir
              </button>
              {/* <AlertDialog>
                <AlertDialogTrigger>
                  <button className="rounded-lg flex ml-0.5 gap-3 group items-center justify-center hover:bg-red-200 hover:ring-red-600 text-red-600 hover:opacity-90">
                    <Trash2 size={19} />
                    Excluir
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
              </AlertDialog> */}
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex w-full h-full">
          <div className="flex flex-col items-start justify-center gap-2 bg-procura-ai-zinc/10 px-4 pt-4 pb-6 h-full">
            <span className="">Modelo</span>
            <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

            <span className="">Marca</span>
            <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

            <span className="">IMEI</span>
            <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

            <span className="">Status</span>
          </div>

          <div className="flex flex-col items-start justify-center gap-2 px-4 pt-4 pb-4 w-full h-full">
            <span className="font-semibold">{phone_model}</span>
            <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

            <span className="font-semibold">{brand}</span>
            <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

            <span className="font-semibold">{imei.slice(0, 1) + ' ' + imei.slice(1, 8) + ' ****** **'}</span>
            <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

            <span className={cn("rounded-md w-20 flex items-center justify-center capitalize",
              status === "Roubado" && "bg-robbery-bg text-robbery-text p-1",
              status === "Recuperado" && "bg-regular-bg text-regular-text p-1",
              status === "Regular" && "bg-regular-bg text-regular-text p-1",
              status === "Furtado" && "bg-theft-bg text-theft-text p-1",
              status === "Perdido" && "bg-lost-bg text-lost-text p-1",
              // status === "Perdido" && "bg-violet-500/20 text-violet-700 p-1",
            )}>{status === 'Recuperado' ? "Regular" : status.replace(' ', '')}</span>
          </div>
        </div>
      </div>

      {
        isViewAlertModalOpen && <ViewAlerteModal phone_model={phone_model} phone_number={phone_number} brand={brand} imei={imei} status={status} setModalOpen={setIsViewAlertModalOpen} />
      }

      {
        isAlertModalOpen && <AlertFormModal id={id} isStolen={isStolen} status={status} handleDeviceRecovery={handleDeviceRecovery} setDevices={setDevices} setModalOpen={setIsAlertModalOpen} />
      }

      {
        isDeleteModalOpen && <DeleteDeviceModal id={id} handleDeleteDevice={handleDeleteDevice} setModalOpen={setIsDeleteModalOpen} />
      }
    </>
  )
}

interface ModalProps {
  phone_number: string
  phone_model: string
  brand: string
  imei: string
  status: string
  setModalOpen: (value: boolean) => void
}

function ViewAlerteModal({ phone_number, phone_model, brand, imei, status, setModalOpen }: ModalProps) {
  return (
    <>
      <div className="flex flex-col gap-4 bg-white  p-6 z-50 fixed inset-0 m-auto">
        <X size={24} className="absolute top-4 right-4 cursor-pointer" onClick={() => setModalOpen(false)} />

        <h2 className="font-bold text-xl">Detalhes do dispositivo</h2>

        <div className="flex flex-col items-start justify-center">
          <span className="font-bold">Número</span>
          <span className="break-words">{phone_number}</span>
        </div>

        <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

        <div className="flex flex-col items-start justify-center">
          <span className="font-bold">Modelo</span>
          <span>{phone_model}</span>
        </div>

        <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

        <div className="flex flex-col gap-2 items-start justify-start">
          <span className="font-bold">Marca</span>
          <span>{brand}</span>
        </div>

        <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

        <div className="flex flex-col gap-2 items-start justify-start">
          <span className="font-bold">IMEI</span>
          <span>{imei}</span>
        </div>

        <span className="w-full h-[0.5px] bg-procura-ai-zinc/70 rounded-full" />

        <div className="flex flex-col gap-2 items-start justify-start">
          <span className="font-bold">Status</span>
          <span>{status}</span>
        </div>

      </div>
    </>
  )
}

interface AlertFormModalProps {
  id: string
  isStolen: boolean
  status: string
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>
  handleDeviceRecovery: (id: string) => Promise<void>
  setModalOpen: (value: boolean) => void
}

function AlertFormModal({ id, isStolen, setDevices, status, setModalOpen, handleDeviceRecovery }: AlertFormModalProps) {
  return (
    <div className="fixed inset-0 m-auto bg-white p-6 z-50 flex flex-col gap-4 overflow-y-auto">
      <X size={24} className="absolute top-4 right-4 cursor-pointer z-50" onClick={() => setModalOpen(false)} />
      <div className="flex flex-col gap-1 mt-7">
        {
          isStolen ? (
            <>
              <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-32 rounded-sm absolute -top-8 right-5 py-1 px-2 text-white transition- duration-300">
                Visualizar alerta
              </span>
              <AlertForm id={id} status={status} handleDeviceRecovery={handleDeviceRecovery} />
            </>
          ) : (
            <>
              <h2 className="font-bold">Preencha as informações</h2>
              <MarkAsStolenForm id={id} isStolen={isStolen} setDevices={setDevices} />
            </>

          )}
      </div>

    </div >
  )
}

interface DeleteDeviceModalProps {
  id: string
  handleDeleteDevice: (id: string) => void
  setModalOpen: (value: boolean) => void
}

function DeleteDeviceModal({ id, handleDeleteDevice, setModalOpen }: DeleteDeviceModalProps) {
  return (
    <div className="fixed inset-0 m-auto bg-black/50 p-6 z-50 flex flex-col items-center justify-center">
      <div className="flex flex-col gap-8 bg-white rounded-xl p-4">
        <div className="flex flex-col">
          <X size={18} className=" self-end top-4 right-4 cursor-pointer z-50" onClick={() => setModalOpen(false)} />
          <h2 className="font-bold">Tem certeza que deseja excluir esse dispositivo?</h2>
        </div>
        <p className="text-zinc-600 ">
          Essa ação não pode ser desfeita. Isso excluirá permanentemente o dispositivo e removerá seus dados de nossos servidores.
        </p>

        <div className="flex gap-4 items-center justify-center">
          <Button variant="white" className="rounded-lg ring-zinc-200 hover:ring-zinc-200" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button variant="red" className="rounded-lg" onClick={() => handleDeleteDevice(id)}>Confirmar</Button>
        </div>
      </div>
    </div>
  )
}