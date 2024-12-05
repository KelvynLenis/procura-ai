"use client"

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "./Input"
import { databases, ID } from "@/lib/appwrite"
import { z } from "zod"
import DeviceSchema from "@/utils/deviceSchema"
import { DeviceProps } from "@/utils/types"
import { twMerge } from "tailwind-merge"


type Device = z.infer<typeof DeviceSchema>;

interface AddDeviceFormProps {
  device?: Device;
}

export function AddDeviceForm({ device }: AddDeviceFormProps) {

  const form = useForm({
    defaultValues: {
      phone_number: device?.phoneNumber || '',
      phone_model: device?.phoneModel || '',
      brand: device?.brand || '',
      imei: device?.imei || '',
      latitude: device?.latitude || 0,
      longitude: device?.longitude || 0
    }
  })

  async function onSubmit(values: DeviceProps) {

    try {

      if (device) {
        const promise = await databases.updateDocument(
          '673f3e7f002ac721c7f6',
          '673f3e8a0001a6d9233f',
          device.$id,
          {
            phoneNumber: values.phone_number,
            phoneModel: values.phone_model,
            brand: values.brand,
            imei: values.imei,
            latitude: Number(values.latitude),
            longitude: Number(values.longitude),
            isStolen: false
          }
        );

        console.log(promise)
        return
      }

      const promise = await databases.createDocument(
        '673f3e7f002ac721c7f6',
        '673f3e8a0001a6d9233f',
        ID.unique(),
        {
          phoneNumber: values.phone_number,
          phoneModel: values.phone_model,
          brand: values.brand,
          imei: values.imei,
          latitude: Number(values.latitude),
          longitude: Number(values.longitude),
          isStolen: false
        }
      );

      // if (newContact) {
      //   form.reset()
      // }

      console.log(promise)

      // setDevices((prev) => [...prev, promise])

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={twMerge(
          "flex flex-col p-10 py-4 gap-4 text-zinc-900 self-center items-center justify-center rounded-lg",
          !device && "shadow-form" // Adiciona "shadow-form" apenas se device estiver presente
        )}>
        <div>
          {
            device ? (
              <h1 className="text-2xl font-bold">Editar Dispositivo</h1>

            ) : (
              <h1 className="text-2xl">Novo Dispositivo</h1>
            )
          }
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="phone_model"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <label className="">Modelo do celular</label>
                  <FormControl>
                    <Input type="text" placeholder="Modelo do celular" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <label className="">Número do celular</label>
                  <FormControl>
                    <Input type="text" placeholder="Número do celular" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <label className="">Marca</label>
                  <FormControl>
                    <Input type="text" placeholder="Marca" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imei"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <label className="">IMEI</label>
                  <FormControl>
                    <Input type="text" placeholder="IMEI" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>


          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <label className="">Latidude</label>
                <FormControl>
                  <Input type="number" placeholder="Latitude" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <label className="">Longitude</label>
                <FormControl>
                  <Input type="number" placeholder="Longitude" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {
          !device && (
            <button type="submit" className="w-full h-10 flex items-center justify-center text-xl text-white self-center rounded-xl bg-primary  hover:opacity-60">Adicionar</button>
          )
        }
      </form>
    </Form>
  )
}