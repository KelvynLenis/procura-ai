"use client"

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "./Input"
import { databases, ID } from "@/lib/appwrite"
import { z } from "zod"
import DeviceSchema from "@/utils/deviceSchema"

type Device = z.infer<typeof DeviceSchema>;
interface CreateDeviceProps {
  phone_number: string
  phone_model: string
  brand: string
  imei: string
  latitude: number
  longitude: number
}

interface AddDeviceFormProps {
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
}

export function AddDeviceForm({ setDevices }: AddDeviceFormProps) {

  const form = useForm({
    defaultValues: {
      phone_number: '',
      phone_model: '',
      brand: '',
      imei: '',
      latitude: 0,
      longitude: 0
    }
  })

  async function onSubmit(values: CreateDeviceProps) {

    try {
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

      setDevices((prev) => [...prev, promise])

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col p-10 py-4 gap-4 w-full h-full items-center justify-center bg-zinc-500 rounded-md">
        <h1 className="text-2xl text-zinc-100">Novo Dispositivo</h1>
        <FormField
          control={form.control}
          name="phone_model"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <label className="text-zinc-100">Modelo do celular</label>
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
              <label className="text-zinc-100">Número do celular</label>
              <FormControl>
                <Input type="text" placeholder="Número do celular" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <label className="text-zinc-100">Marca</label>
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
              <label className="text-zinc-100">IMEI</label>
              <FormControl>
                <Input type="text" placeholder="IMEI" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="latitude"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <label className="text-zinc-100">Latidude</label>
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
              <label className="text-zinc-100">Longitude</label>
              <FormControl>
                <Input type="number" placeholder="Longitude" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <button type="submit" className="w-72 h-10 self-cente rounded-md bg-green-400 text-zinc-100 hover:opacity-90">Adicionar</button>
      </form>
    </Form>
  )
}