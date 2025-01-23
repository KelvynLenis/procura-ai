'use client'

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
import { useRouter } from "next/navigation"
import { account, databases, functions } from "@/lib/appwrite"
import { useEffect, useState } from "react"
import { AddDeviceForm } from "./Forms/DeviceForm"
import { Device } from "@/utils/types"


export function Board() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [contact, setContact] = useState<Device>()
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])

  useEffect(() => {

    const getDevices = async () => {
      const promise = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`
          },
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

      setDevices(promise.documents)
    }

    getDevices()

  }, [])

  function openModal(contact: Device) {
    setIsModalOpen(!isModalOpen)
    setContact(contact)
  }

  async function markAsStolen(device: Device) {

    try {
      const promise = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents/${device.$id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`
          },
          body: JSON.stringify({
            data: {
              isStolen: !device.isStolen
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

    } catch (error) {
      console.error(error)
    }

  }

  async function handleDelete(deviceId: string) {
    try {
      const promise = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents/${deviceId}`,
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
          return response.json();
        }).catch((err) => {
          console.log(`Fetch error: ${err.message}`);
          return null;
        });


      setDevices((prev) => prev.filter(device => device.$id !== deviceId))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className=" w-full flex overflow-y-scroll">

        <div className="w-full h-full flex justify-around px-4 py-5">
          <div className=" w-full h-full rounded-md flex flex-col gap-5">
            {
              devices.map((device) => (
                <div key={device.$id} className="flex flex-row gap-2 p-4 shadow-form bg-zinc-100 rounded-xl justify-between text-zinc-900">
                  <div className="flex flex-col gap-2">
                    <span className="text-lg">Modelo: {device.phoneModel}</span>
                    <span className="text-lg">Marca: {device.brand}</span>
                    <span className="text-lg">IMEI: {device.imei}</span>
                    <span className="text-lg">Telefone: {device.phoneNumber}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-lg">Latitude: {device.latitude}</span>
                    <span className="text-lg">Longitude: {device.longitude}</span>
                    <span className="text-lg">Roubado: {device.isStolen ? 'Sim' : 'Não'}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger className="bg-secondary text-zinc-100 rounded-xl flex items-center justify-center w-full h-fit p-2 self-center hover:bg-white hover:ring-1 hover:text-secondary hover:ring-secondary transition-all duration-200">Editar</AlertDialogTrigger>
                      <AlertDialogHeader className="hidden">
                        <AlertDialogTitle>Editar dispositivo</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogDescription className="hidden">
                        Edite os dados do dispositivo
                      </AlertDialogDescription>
                      <AlertDialogContent>
                        {/* <Modal contact={device} /> */}
                        <AddDeviceForm device={device} />
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-secondary px-2 rounded-xl duration-150 transition-all ease-in">Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {/* <button onClick={() => openModal(device)} className="bg-secondary text-zinc-100 rounded-xl flex items-center justify-center w-full h-fit p-2 self-center hover:bg-white hover:ring-1 hover:text-secondary hover:ring-secondary transition-all duration-200">Editar</button> */}
                    <button onClick={() => markAsStolen(device)} className="bg-yellow-500 text-zinc-100 rounded-xl flex items-center h-fit p-2 self-center hover:bg-yellow-700 transition-all duration-200">Marcar como roubado</button>
                    <button onClick={() => handleDelete(device.$id)} className="w-44 bg-red-500 text-zinc-100 rounded-xl flex items-center justify-center h-fit p-2 self-center hover:bg-red-700 transition-all duration-200">Excluir</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  )
}
