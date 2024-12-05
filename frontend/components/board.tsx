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
import { account, client, databases, functions } from "@/lib/appwrite"
import { useEffect, useState } from "react"
import { z } from "zod"
import DeviceSchema from "@/utils/deviceSchema"
import { NotificationButton } from "./NotificationButton"
import { AddDeviceForm } from "./AddDeviceForm"
import { OpenSidebarTrigger } from "./OpenSidebarTrigger"
import { Input } from "./Input"
import { DeviceProps } from "@/utils/types"
import { Label } from "./ui/label"
import { Form, FormControl, FormField, FormItem } from "./ui/form"
import { useForm } from "react-hook-form"

type Device = z.infer<typeof DeviceSchema>;

export function Board() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [contact, setContact] = useState<Device>()
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])

  useEffect(() => {

    const getDevices = async () => {
      let promise = await databases.listDocuments(
        "673f3e7f002ac721c7f6",
        "673f3e8a0001a6d9233f"
      );

      console.log(promise.documents)

      setDevices(promise.documents)
    }

    getDevices()

  }, [])

  function openModal(contact: Device) {
    setIsModalOpen(!isModalOpen)
    setContact(contact)
  }

  async function logout() {
    await account.deleteSession('current')

    router.push('/')
  }

  async function markAsStolen(device: Device) {
    // const promise = await databases.updateDocument(
    //   "673f3e7f002ac721c7f6",
    //   "673f3e8a0001a6d9233f",
    //   device.$id,
    //   {
    //     isStolen: !device.isStolen
    //   }
    // )
    try {
      await functions.createExecution(
        '673b86eb001411b8173d',
        JSON.stringify({
          deviceId: device.$id,
          isStolen: !device.isStolen
        })
      )

    } catch (error) {
      console.error(error)
    }

    // console.log(promise)
  }

  async function handleDelete(deviceId: string) {
    try {
      const promise = await databases.deleteDocument(
        "673f3e7f002ac721c7f6",
        "673f3e8a0001a6d9233f",
        deviceId
      )

      // console.log(promise)

      setDevices((prev) => prev.filter(device => device.$id !== deviceId))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className="py-5 w-full flex">

        {/* <div className="absolute flex flex-row-reverse gap-3 right-5 top-4 w-full">
          <button onClick={logout} className="h-10 px-2 bg-red-500 text-white rounded-md  hover:bg-red-600 drop-shadow-md">Log Out</button>
          <button className="h-10 px-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 drop-shadow-md">Mapa de ocorrências</button>
          <NotificationButton />
        </div> */}

        <div className="w-full h-full flex justify-around px-4">
          <div className=" w-full h-[580px] rounded-md flex flex-col gap-5">
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
