'use client'

import { useRouter } from "next/navigation"
import { account, client, databases, functions } from "@/lib/appwrite"
import { AddDeviceForm } from "./AddDeviceForm"
import { useEffect, useState } from "react"
import { z } from "zod"
import DeviceSchema from "@/utils/deviceSchema"
import { NotificationButton } from "./NotificationButton"

type Device = z.infer<typeof DeviceSchema>;

export function Board() {
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
    <main className="py-10">
      <div className="absolute flex flex-row-reverse gap-3 right-5 top-4 w-full">
        <button onClick={logout} className="h-10 px-2 bg-red-500 text-white rounded-md  hover:bg-red-600 drop-shadow-md">Log Out</button>
        {/* <button className="h-10 px-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 drop-shadow-md">Mapa de ocorrências</button> */}
        <NotificationButton />
      </div>
      <div className="w-full h-full flex justify-around px-4">
        <div className="w-1/3">
          <AddDeviceForm setDevices={setDevices} />
        </div>
        <div className="bg-zinc-500 w-3/5 h-[580px] rounded-md flex flex-col gap-2">
          {
            devices.map((device) => (
              <div key={device.$id} className="flex flex-row gap-2 p-2 bg-slate-700 rounded-lg justify-between">
                <div className="flex flex-col gap-2">
                  <span className="text-lg text-zinc-100">Modelo: {device.phoneModel}</span>
                  <span className="text-lg text-zinc-100">Marca: {device.brand}</span>
                  <span className="text-lg text-zinc-100">IMEI: {device.imei}</span>
                  <span className="text-lg text-zinc-100">Telefone: {device.phoneNumber}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-lg text-zinc-100">Latitude: {device.latitude}</span>
                  <span className="text-lg text-zinc-100">Longitude: {device.longitude}</span>
                  <span className="text-lg text-zinc-100">Roubado: {device.isStolen ? 'Sim' : 'Não'}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => markAsStolen(device)} className="bg-yellow-500 text-zinc-100 rounded-lg flex items-center h-fit p-2 self-center hover:bg-yellow-700 transition-all duration-200">Marcar como roubado</button>
                  <button onClick={() => handleDelete(device.$id)} className="w-44 bg-red-500 text-zinc-100 rounded-lg flex items-center justify-center h-fit p-2 self-center hover:bg-red-700 transition-all duration-200">Excluir</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </main>
  )
}