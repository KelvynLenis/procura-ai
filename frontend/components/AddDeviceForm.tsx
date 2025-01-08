"use client"

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "./Input"
import { account, databases, ID } from "@/lib/appwrite"
import { z } from "zod"
import DeviceSchema from "@/schemas/deviceSchema"
import { DeviceProps } from "@/utils/types"
import Button from "./Button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation"



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

  const router = useRouter()


  async function onSubmit(values: DeviceProps) {
    try {
      const { $id: userId } = await account.get()

      if (device) {
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
                auth_id: userId,
                phoneNumber: values.phone_number,
                phoneModel: values.phone_model,
                brand: values.brand,
                imei: values.imei,
                isStolen: false
              },

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

        return
      }

      const deviceId = uuidv4();
      const promise = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`
          },
          body: JSON.stringify({
            documentId: deviceId,
            data: {
              phoneNumber: values.phone_number,
              phoneModel: values.phone_model,
              brand: values.brand,
              imei: values.imei,
              isStolen: false,
              auth_id: userId

            }
          })
        }).then(async (response) => {
          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Error: ${error}`);
          }
          form.reset()
          router.push('/home')

          return response.json();
        }).catch((err) => {
          console.log(`Fetch error: ${err.message}`);
          return null;
        });


    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "w-full flex flex-col p-10 py-4 gap-8 text-zinc-900 self-center items-center justify-center rounded-lg",
          // !device && "shadow-form" // Adiciona "shadow-form" apenas se device estiver presente
        )}>
        {/* <div>
          {
            device ? (
              <h1 className="text-2xl font-bold">Editar Dispositivo</h1>

            ) : (
              <div className="w-full bg-tertiary">
                <h1 className="text-2xl">Cadastrar Dispositivo</h1>

              </div>
            )
          }
        </div> */}
        <FormField
          control={form.control}
          name="phone_model"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <label className="font-medium">Modelo do celular</label>
              <FormControl>
                <Input type="text" placeholder="Modelo do celular" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <label className="font-medium">Marca</label>
              <FormControl>
                <Input type="text" placeholder="Marca" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <label className="font-medium">Número do celular</label>
              <FormControl>
                <Input type="text" placeholder="Número do celular" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imei"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <label className="font-medium">IMEI</label>
              <FormControl>
                <Input type="text" placeholder="IMEI" {...field} />
              </FormControl>
            </FormItem>
          )}
        />


        {/* <FormField
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
          /> */}

        {
          !device && (
            <div className="flex justify-between w-full">
              <Link href={'/home'}>
                <Button type="button" variant="white" isLoader>Cancelar</Button>
              </Link>
              <Button type="submit" variant="orange" className="px-1">Cadastrar dispositivo</Button>
            </div>
            // <button type="submit" className="w-full h-10 flex items-center justify-center text-xl text-white self-center rounded-xl bg-primary  hover:opacity-60">Adicionar</button>
          )
        }
      </form>
    </Form>
  )
}