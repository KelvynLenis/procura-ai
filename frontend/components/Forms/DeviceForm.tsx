"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from 'react-toastify';

import { z } from "zod"
import { v4 as uuidv4 } from 'uuid';

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"


import Button from "../Button"
import { Button as ButtonShadcn } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../ui/input-otp"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

import { account } from "@/lib/appwrite"
import { phoneBrands } from "@/utils/ChartData"
import { Device, DeviceProps } from "@/utils/types"
import { cn, validateIMEI, validatePhoneNumber } from "@/lib/utils"

import { Check, ChevronDown, Search } from "lucide-react"

interface AddDeviceFormProps {
  device?: DeviceProps;
}

const formSchema = z.object({
  phone_model: z.string().min(1, {
    message: "O modelo do dispositivo é obrigatório.",
  }),
  phone_number: z.string().min(11, {
    message: "O número de celular deve conter exatamente 11 dígitos numéricos.",
  }),
  brand: z.string().min(1, {
    message: "A marca do dispositivo é obrigatória.",
  }),
  imei: z.string().min(15, {
    message: "O IMEI deve conter exatamente 15 dígitos numéricos.",
  })
})
  .refine((data) => validateIMEI(data.imei), {
    path: ["imei"], // Indica onde mostrar o erro
    message: "O IMEI deve conter exatamente 15 dígitos numéricos.",
  })
  .refine((data) => validatePhoneNumber(data.phone_number), {
    path: ["phone_number"], // Indica onde mostrar o erro
    message: "O número de celular deve conter exatamente 11 dígitos numéricos.",
  })

export function DeviceForm({ device }: AddDeviceFormProps) {
  const [open, setOpen] = useState(false)
  const [isBrandsPopoverOpen, setIsBrandsPopoverOpen] = useState(false)

  const route = useRouter()

  const brands = [
    { label: "Apple", value: "apple" },
    { label: "Samsung", value: "samsung" },
    { label: "Xiaomi", value: "xiaomi" },
    { label: "Oppo", value: "oppo" },
    { label: "Vivo", value: "vivo" },
    { label: "Motorola", value: "motorola" },
    { label: "Realme", value: "realme" },
    { label: "Asus", value: "asus" },
    { label: "Huawei", value: "huawei" },
    { label: "Sony", value: "sony" },
  ] as const

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: device?.phone_number || '',
      phone_model: device?.phone_model || '',
      brand: device?.brand || '',
      imei: device?.imei || '',
    }
  })

  const router = useRouter()

  function goBack() {
    router.back()
  }

  async function onSubmit(values: DeviceProps) {
    console.log(values)
    try {
      const imei = values.imei.trim();
      const number = values.phone_number.trim();

      const isValidIMEI = /^[0-9]{15}$/.test(imei);
      const isValidPhoneNumber = /^[0-9]{11}$/.test(number);

      if (values.phone_model === '') {
        toast.error("O modelo do dispositivo é obrigatório.")
        return
      }

      if (values.brand === '') {
        toast.error("O modelo do dispositivo é obrigatório.")
        return
      }

      if (!isValidIMEI) {
        toast.error("O IMEI deve conter exatamente 15 dígitos numéricos.")
        return
      }

      if (!isValidPhoneNumber) {
        toast.error("O número de telefone deve conter exatamente 11 dígitos numéricos.")
        return
      }

      const { $id: userId } = await account.get()
      //@glaymar vai ser removido esse codigo ? 
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
                is_stolen: false
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

      const callFunction = async () => {

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
                is_stolen: false,
                auth_id: userId

              }
            })
          }).then(async (response) => {
            if (!response.ok) {
              const error = await response.text();
              throw new Error(`Error: ${error}`);
            }
            form.reset()

            return response.json();
          }).catch((err) => {
            console.log(`Fetch error: ${err.message}`);
            return null;
          });

        return
      }

      toast.promise(callFunction(), {
        pending: 'Criando dispositivo...',
        success: 'Dispositivo criado com sucesso!',
        error: "Erro ao atualizar dispositivo.",
      })


      router.push('/meus-dispositivos')
    } catch (error) {
      console.error(error)
    }
  }


  async function handleEditDevice(id: string, values: DeviceProps) {
    console.log({ id, values })
    try {

      const imei = values.imei.trim();
      const number = values.phone_number.trim();

      const isValidIMEI = /^[0-9]{15}$/.test(imei);
      const isValidPhoneNumber = /^[0-9]{11}$/.test(number);

      if (values.phone_model === '') {
        toast.error("O modelo do dispositivo é obrigatório.")
        return
      }

      if (values.brand === '') {
        toast.error("O modelo do dispositivo é obrigatório.")
        return
      }


      if (!isValidIMEI) {
        toast.error("O IMEI deve conter exatamente 15 dígitos numéricos.")
        return
      }

      if (!isValidPhoneNumber) {
        toast.error("O número de telefone deve conter exatamente 11 dígitos numéricos.")
        return
      }

      const { $id: userId } = await account.get();

      const callFunction = async () => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents/${id}`,
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
                is_stolen: false
              }
            })
          }
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Error: ${error}`);
        }
        const updatedDevice = await response.json();

        console.log("Device updated successfully");
        console.log(updatedDevice);

        return response
      }


      toast.promise(
        callFunction,
        {
          pending: 'Atualizando dispositivo...',
          success: 'Dispositivo atualizado com sucesso!',
          error: 'Erro ao atualizar dispositivo.'
        }
      )

      route.push('/meus-dispositivos')
    } catch (err) {
      console.log(`Fetch error: ${err}`);
      return null;
    }
  }


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "w-fit md:w-10/12 lg:w-full bg-white flex flex-col px-5 mr-20 md:mr-7 xl:mr-14 my-5 md:px-10 py-4 gap-8 text-zinc-900 self-center items-center justify-center rounded-3xl shadow-md",
          // !device && "shadow-form" // Adiciona "shadow-form" apenas se device estiver presente
        )}>
        <div className="flex flex-col w-full gap-8">
          <span className="font-medium">Insira os dados abaixo:</span>
          <div className="flex flex-col w-full gap-1">
            <span className="h-0.5 w-full bg-zinc-400" />
            <span className="text-red-500 text-sm flex items-start">*Campos obrigatórios</span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem className="flex flex-col w-fit self-start">
              <FormLabel className="text-lg w-fit text-center items-start flex">
                <span className="text-red-500 text-base">*</span>
                Marca
              </FormLabel>
              <Popover open={isBrandsPopoverOpen} onOpenChange={setIsBrandsPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="self-start">
                    <FormControl>
                      <ButtonShadcn
                        variant="outline"
                        role="combobox"
                        type="button"
                        className={cn(
                          "w-full md:w-96 text-xs gap-0 p-2 md:p-4 md:text-base lg:gap-2 justify-between bg-zinc-100",
                          !field.value && "text-muted-foreground text-zinc-500"
                        )}
                      >
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                        {field.value
                          ? brands.find(
                            (brand) => brand.label === field.value
                          )?.label
                          : "Pesquise a marca do dispositivo"}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </ButtonShadcn>
                    </FormControl>
                    <FormMessage />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Digite a marca" />
                    <CommandList>
                      <CommandEmpty>Nenhuma marca encontrada.</CommandEmpty>
                      <CommandGroup>
                        {brands.map((brand) => (
                          <CommandItem
                            value={brand.label}
                            key={brand.value}
                            onSelect={() => {
                              form.setValue("brand", brand.label)
                              form.setValue("phone_model", '')
                              setIsBrandsPopoverOpen(false)
                            }}
                          >
                            {brand.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                brand.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_model"
          render={({ field }) => (
            <FormItem className="flex flex-col w-fit self-start">
              <FormLabel className="text-lg w-fit text-center items-start flex">
                <span className="text-red-500 text-base">*</span>
                Modelo do dispositivo
              </FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div className="self-start">

                    <FormControl>
                      <ButtonShadcn
                        variant="outline"
                        role="combobox"
                        type="button"
                        className={cn(
                          "w-full md:w-96 text-xs gap-0 p-2 md:p-4 md:text-base lg:gap-2 justify-between bg-zinc-100",
                          !field.value && "text-muted-foreground text-zinc-500"
                        )}
                      >
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                        {field.value
                          ? phoneBrands.find(
                            (model) => model.brand === form.control._formValues.brand
                          )?.models.find((model) => model === field.value)
                          : "Pesquise o modelo do dispositivo"}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </ButtonShadcn>
                    </FormControl>
                    <FormMessage />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Digite o modelo." />
                    <CommandList>
                      <CommandEmpty>Nenhum modelo encontrado.</CommandEmpty>
                      <CommandGroup>
                        {phoneBrands.find((brand) => brand.brand === form.control._formValues.brand) && phoneBrands.find((brand) => brand.brand === form.control._formValues.brand)!.models.map((model: string) => (
                          <CommandItem
                            value={model}
                            key={model}
                            onSelect={() => {
                              form.setValue("phone_model", model)
                              setOpen(false)
                            }}
                          >
                            {model}
                            <Check
                              className={cn(
                                "ml-auto",
                                model === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="imei"
          render={({ field }) => (
            <FormItem className="flex flex-col md:flex-row gap-5 w-full">
              <div>
                <FormLabel className="text-lg w-fit text-center items-start flex">
                  <span className="text-red-500 text-base">*</span>
                  IMEI
                </FormLabel>
                <FormControl>
                  <InputOTP maxLength={15} {...field} className="w-full flex justify-center items-center" >
                    <InputOTPGroup >
                      <InputOTPSlot className="w-3 md:w-4 h-5 border-t-0 border-r-0 border-black  shadow-transparent" index={0} />
                      <InputOTPSlot className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={1} />
                    </InputOTPGroup>
                    <span />
                    <InputOTPGroup>
                      <InputOTPSlot className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={2} />
                      <InputOTPSlot className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={3} />
                      <InputOTPSlot className="w-3 md:w-4 h-5 border-t-0 border-r-0 border-black shadow-transparent" index={4} />
                      <InputOTPSlot className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={5} />
                      <InputOTPSlot className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={6} />
                      <InputOTPSlot className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={7} />
                    </InputOTPGroup>
                    <InputOTPGroup>
                      <InputOTPSlot className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={8} />
                      <InputOTPSlot className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={9} />
                      <InputOTPSlot className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={10} />
                      <InputOTPSlot className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={11} />
                      <InputOTPSlot className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={12} />
                      <InputOTPSlot className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={13} />
                    </InputOTPGroup>
                    <InputOTPGroup>
                      <InputOTPSlot className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={14} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </div>
              <span className="w-64 md:w-80 bg-[#D8A912]/30 text-procura-ai-black/60 font-medium py-2 px-4 rounded-xl">
                🛈 O IMEI é composto por 15 números e pode ser encontrado na embalagem do aparelho ou digitando *#06# no teclado do aparelho.
              </span>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem className="flex flex-col md:w-fit self-start">
              <FormLabel className="text-lg w-fit text-center items-start flex">
                <span className="text-red-500 text-base">*</span>
                Número do celular
              </FormLabel>
              <FormControl>
                <InputOTP maxLength={11} {...field} className="w-full flex justify-center items-center" >
                  <InputOTPGroup>
                    <span>(</span>
                    <InputOTPSlot className="w-4 md:w-5 h-5 border-t-0 border-r-0 border-black  shadow-transparent" index={0} />
                    <InputOTPSlot className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={1} />
                    <span>)</span>
                  </InputOTPGroup>
                  <span />
                  <InputOTPGroup>
                    <InputOTPSlot className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={2} />
                    <InputOTPSlot className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={3} />
                    <InputOTPSlot className="w-4 md:w-5 h-5 border-t-0 border-r-0 border-black shadow-transparent" index={4} />
                    <InputOTPSlot className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={5} />
                    <InputOTPSlot className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={6} />
                  </InputOTPGroup>
                  <InputOTPSeparator data-dash />
                  <InputOTPGroup>
                    <InputOTPSlot className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={7} />
                    <InputOTPSlot className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={8} />
                    <InputOTPSlot className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={9} />
                    <InputOTPSlot className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent" index={10} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        {
          device ? (
            <div className="flex justify-between w-full">
              {/* <DialogClose className="bg-white border-[0.5px] border-primary text-primary hover:bg-primary hover:text-white rounded-full text-center items-center justify-center flex w-fit px-2 py-2 shadow transition-all duration-300" type="button">Cancelar</DialogClose> */}
              <Button type="submit" onClick={() => handleEditDevice(device.$id!, form.getValues())} variant="blue" className="px-2">Salvar alterações</Button>
              <Button onClick={() => goBack()} type="button" variant="red" >Cancelar</Button>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <Button type="submit" variant="blue" className="px-3">Cadastrar dispositivo</Button>
              <Link href={'/meus-dispositivos'}>
                <Button onClick={() => goBack()} type="button" variant="red">Cancelar</Button>
              </Link>
            </div>
          )
        }
      </form>
    </Form>
  )
}