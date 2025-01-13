"use client"

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "../Input"
import { account } from "@/lib/appwrite"
import { z } from "zod"
import { Device, DeviceProps } from "@/utils/types"
import Button from "../Button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation"
import { DialogClose } from "../ui/dialog"
import { useToast } from "@/hooks/use-toast"


interface AddDeviceFormProps {
  device?: Device;
}

export function AddDeviceForm({ device }: AddDeviceFormProps) {
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      phone_number: device?.phone_number || '',
      phone_model: device?.phone_model || '',
      brand: device?.brand || '',
      imei: device?.imei || '',
      latitude: device?.latitude || 0,
      longitude: device?.longitude || 0
    }
  })

  const router = useRouter()


  async function onSubmit(values: DeviceProps) {
    console.log(values)
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
                phone_number: values.phone_number,
                phone_model: values.phone_model,
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
              phone_number: values.phone_number,
              phone_model: values.phone_model,
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


  async function handleEditDevice(id: string) {

    // @Glaymar TODO
    // Lógica para editar o dispositivo

    toast({
      variant: 'warning',
      title: 'TODO',
      description: 'Lógica para editar o dispositivo',
      duration: 3000
    })

  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "w-full flex flex-col p-10 py-4 gap-8 text-zinc-900 self-center items-center justify-center rounded-lg",
          // !device && "shadow-form" // Adiciona "shadow-form" apenas se device estiver presente
        )}>
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

        {
          device ? (
            <div className="flex justify-between w-full">
              <DialogClose className="bg-white border-[0.5px] border-primary text-primary hover:bg-primary hover:text-white rounded-full text-center items-center justify-center flex w-fit px-2 py-2 shadow transition-all duration-300" type="button">Cancelar</DialogClose>
              <Button type="button" onClick={() => handleEditDevice(device.$id)} variant="orange" className="px-2">Editar dispositivo</Button>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <Link href={'/home'}>
                <Button type="button" variant="white" isLoader>Cancelar</Button>
              </Link>
              <Button type="submit" variant="orange" className="px-1">Cadastrar dispositivo</Button>
            </div>
          )
        }
      </form>
    </Form>
  )
}