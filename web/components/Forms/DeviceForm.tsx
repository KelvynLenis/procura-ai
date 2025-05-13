'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Button from '../Button'
import { Button as ButtonShadcn } from '../ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '../ui/input-otp'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

import { account } from '@/lib/appwrite'
import { phoneBrands } from '@/utils/PhoneBrands'
import type { Device, DeviceProps } from '@/types'
import {
  cn,
  validatePhoneNumber,
  validateImeiFormat,
  validateImeiWithLuhn,
} from '@/lib/utils'

import { Check, ChevronDown, Search } from 'lucide-react'
import { DialogClose } from '@radix-ui/react-dialog'

import { createDevice } from '@/functions/device/create-device'
import { updateDevice } from '@/functions/device/update-device'
import { checkImei } from '@/functions/device/check-imei'
import { LoadingToast } from '../LoadingToast'
import { listOperators } from '@/functions/operators/list-operators'
import type { Operator } from '@/types'

async function getOperatorOptions(): Promise<
  { label: string; value: string }[]
> {
  try {
    const operators = await listOperators()
    return operators.map((operator: Operator) => ({
      label: operator.name_operator,
      value: operator.$id,
    }))
  } catch (error) {
    console.error('Failed to fetch operator options:', error)

    return []
  }
}

interface AddDeviceFormProps {
  device?: DeviceProps
  setModalOpen?: (value: boolean) => void
  isPopover?: boolean
}

export function DeviceForm({
  device,
  setModalOpen,
  isPopover,
}: AddDeviceFormProps) {
  const [open, setOpen] = useState(false)
  const [isBrandsPopoverOpen, setIsBrandsPopoverOpen] = useState(false)
  const [isOperatorPopoverOpen, setIsOperatorPopoverOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imeiError, setImeiError] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [operatorOptions, setOperatorOptions] = useState<
    { label: string; value: string }[]
  >([])
  const route = useRouter()

  const formSchema = z
    .object({
      phone_model: z.string().min(1, {
        message: 'O modelo do dispositivo é obrigatório.',
      }),
      phone_number: z.string().min(11, {
        message:
          'O número de celular deve conter exatamente 11 dígitos numéricos.',
      }),
      brand: z.string().min(1, {
        message: 'O fabricante do dispositivo é obrigatório.',
      }),
      operator_id: z.string().optional(),
      imei: z.string().min(15, {
        message: 'O IMEI deve conter exatamente 15 dígitos numéricos.',
      }),
    })
    .refine(data => validateImeiFormat(data.imei), {
      path: ['imei'],
      message: 'O IMEI deve conter exatamente 15 dígitos numéricos.',
    })
    .refine(data => validateImeiWithLuhn(data.imei), {
      path: ['imei'],
      message: 'IMEI inválido. Por favor, verifique o número.',
    })
    .refine(data => validatePhoneNumber(data.phone_number), {
      path: ['phone_number'],
      message:
        'O número de celular deve conter exatamente 11 dígitos numéricos.',
    })

  const brands = [
    { label: 'Apple', value: 'apple' },
    { label: 'Samsung', value: 'samsung' },
    { label: 'Xiaomi', value: 'xiaomi' },
    { label: 'Oppo', value: 'oppo' },
    { label: 'Vivo', value: 'vivo' },
    { label: 'Motorola', value: 'motorola' },
    { label: 'Realme', value: 'realme' },
    { label: 'Asus', value: 'asus' },
    { label: 'Huawei', value: 'huawei' },
    { label: 'Sony', value: 'sony' },
  ] as const

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: device?.phone_number || '',
      phone_model: device?.phone_model || '',
      // operator_id: '',
      brand: device?.brand || '',
      imei: device?.imei || '',
    },
  })

  useEffect(() => {
    const loadOperators = async () => {
      const options = await getOperatorOptions()
      setOperatorOptions(options)

      if (device?.operator_id) {
        form.setValue('operator_id', device.operator_id)
      }
    }

    loadOperators()
  }, [device, form])

  useEffect(() => {
    const imeiValue = form.watch('imei')

    if (imeiValue && imeiValue.length === 15) {
      const validateAndFillForm = async () => {
        try {
          setIsLoading(true)
          const response = await fetch(
            `https://alpha.imeicheck.com/api/modelBrandName?imei=${imeiValue}&format=json`
          )

          if (!response.ok) {
            toast.error('Erro ao validar IMEI. Por favor, tente novamente.')
            return
          }

          const data = await response.json()

          if (data.status === 'succes' && data.object) {
            form.setValue('brand', data.object.brand)
            form.setValue('phone_model', data.object.name)
          } else {
            toast.error('Não foi possível obter informações do IMEI.')
          }
        } catch (error) {
          console.error('Erro ao validar IMEI:', error)
          toast.error('Erro ao validar IMEI. Por favor, tente novamente.')
        } finally {
          setIsLoading(false)
        }
      }

      validateAndFillForm()
    }
  }, [form.watch('imei')])

  const router = useRouter()

  function goBack() {
    router.back()
  }

  async function onSubmit(values: DeviceProps) {
    try {
      setIsLoading(true)
      setImeiError('')
      const { $id: userId } = await account.get()

      if (device) {
        await handleEditDevice(device.$id!, values)
        return
      }

      const imeiValidation = await checkImei(
        values.imei,
        values.brand,
        values.phone_model
      )
      if (!imeiValidation.isValid) {
        setImeiError(imeiValidation.error || 'Erro ao validar IMEI')
        setIsLoading(false)
        return
      }
      const deviceId = uuidv4()

      const callFunction = async () => {
        try {
          await createDevice(deviceId, values as Device, userId)
          form.reset()
          router.push('/meus-dispositivos')
        } catch (error) {
          console.error(`Erro ao criar dispositivo: ${error}`)
          throw error
        }
      }

      toast.promise(callFunction(), {
        pending: 'Criando dispositivo...',
        success: 'Dispositivo criado com sucesso!',
        error: 'Erro ao criar dispositivo.',
      })
    } catch (error) {
      console.error(error)
      toast.error('Erro ao processar a operação.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEditDevice(id: string, values: DeviceProps) {
    try {
      const { $id: userId } = await account.get()

      const callFunction = async () => {
        try {
          await updateDevice(id, values as Device, userId)
          route.push('/meus-dispositivos')
        } catch (error) {
          console.error('Erro ao atualizar dispositivo:', error)
          throw error
        }
      }

      await toast.promise(callFunction(), {
        pending: 'Atualizando dispositivo...',
        success: 'Dispositivo atualizado com sucesso!',
        error: 'Erro ao atualizar dispositivo.',
      })
    } catch (error) {
      console.error('Erro ao atualizar dispositivo:', error)
      toast.error('Erro ao atualizar dispositivo. Tente novamente.')
    }
  }

  return (
    <>
      {isLoading && <LoadingToast isReactToastifyComponent={false} />}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            'w-fit md:w-10/12 lg:w-full bg-white flex flex-col px-5 md:px-10 py-4 gap-8 text-zinc-900 self-center items-center justify-center rounded-3xl shadow-md'
            // !device && "shadow-form" // Adiciona "shadow-form" apenas se device estiver presente
          )}
        >
          {!device && (
            <div className="flex flex-col w-full gap-8">
              <span className="font-medium">Insira os dados abaixo:</span>
              <div className="flex flex-col w-full gap-1">
                <span className="h-0.5 w-full bg-zinc-400" />
                <span className="text-red-500 text-sm flex items-start">
                  *Campos obrigatórios
                </span>
              </div>
            </div>
          )}

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
                    <InputOTP
                      maxLength={15}
                      {...field}
                      className="w-full flex justify-center items-center"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 border-t-0 border-r-0 border-black  shadow-transparent"
                          index={0}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={1}
                        />
                      </InputOTPGroup>
                      <span />
                      <InputOTPGroup>
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={2}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={3}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 border-t-0 border-r-0 border-black shadow-transparent"
                          index={4}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={5}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={6}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={7}
                        />
                      </InputOTPGroup>
                      <InputOTPGroup>
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={8}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={9}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={10}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={11}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={12}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={13}
                        />
                      </InputOTPGroup>
                      <InputOTPGroup>
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                          index={14}
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage>{imeiError}</FormMessage>
                </div>
                <span className="w-64 md:w-80 bg-[#D8A912]/30 text-procura-ai-black/60 font-medium py-2 px-4 rounded-xl">
                  🛈 O IMEI é composto por 15 números e pode ser encontrado na
                  embalagem do aparelho ou digitando *#06# no teclado do
                  aparelho.
                </span>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full md:w-fit self-start">
                <FormLabel className="text-lg w-fit text-center items-start flex">
                  Fabricante
                </FormLabel>
                <Popover
                  open={isBrandsPopoverOpen}
                  onOpenChange={setIsBrandsPopoverOpen}
                >
                  <PopoverTrigger asChild disabled>
                    <div className="self-start w-full md:w-fit">
                      <FormControl>
                        <ButtonShadcn
                          variant="outline"
                          role="combobox"
                          type="button"
                          disabled
                          className={cn(
                            'w-full md:w-96 text-xs gap-0 p-2 md:p-4 md:text-base lg:gap-2 justify-between bg-zinc-100',
                            !field.value &&
                              'text-muted-foreground text-zinc-500',
                            'cursor-not-allowed opacity-50'
                          )}
                        >
                          {field.value || 'Aguardando IMEI...'}
                        </ButtonShadcn>
                      </FormControl>
                      <FormMessage />
                    </div>
                  </PopoverTrigger>
                </Popover>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_model"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full md:w-fit self-start">
                <FormLabel className="text-lg w-fit text-center items-start flex">
                  Modelo do dispositivo
                </FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild disabled>
                    <div className="self-start w-full md:w-fit">
                      <FormControl>
                        <ButtonShadcn
                          variant="outline"
                          role="combobox"
                          type="button"
                          disabled
                          className={cn(
                            'w-full md:w-96 text-xs gap-0 p-2 md:p-4 md:text-base lg:gap-2 justify-between bg-zinc-100',
                            !field.value &&
                              'text-muted-foreground text-zinc-500',
                            'cursor-not-allowed opacity-50'
                          )}
                        >
                          {field.value || 'Aguardando IMEI...'}
                        </ButtonShadcn>
                      </FormControl>
                      <FormMessage />
                    </div>
                  </PopoverTrigger>
                </Popover>
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
                  <InputOTP
                    maxLength={11}
                    {...field}
                    className="w-full flex justify-center items-center"
                  >
                    <InputOTPGroup>
                      <span>(</span>
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 border-t-0 border-r-0 border-black  shadow-transparent"
                        index={0}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={1}
                      />
                      <span>)</span>
                    </InputOTPGroup>
                    <span />
                    <InputOTPGroup>
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={2}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={3}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 border-t-0 border-r-0 border-black shadow-transparent"
                        index={4}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={5}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={6}
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator data-dash />
                    <InputOTPGroup>
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={7}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={8}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={9}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5  border-t-0 border-r-0 border-black shadow-transparent"
                        index={10}
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="operator_id"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full md:w-fit self-start">
                <FormLabel className="text-lg w-fit text-center items-start flex">
                  Operadora do dispositivo
                </FormLabel>
                <Popover
                  open={isOperatorPopoverOpen}
                  onOpenChange={setIsOperatorPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <div className="self-start w-full md:w-fit">
                      <FormControl>
                        <ButtonShadcn
                          variant="outline"
                          role="combobox"
                          type="button"
                          className={cn(
                            'w-full md:w-96 text-xs gap-0 p-2 md:p-4 md:text-base lg:gap-2 justify-between bg-zinc-100',
                            !field.value &&
                              'text-muted-foreground text-zinc-500'
                          )}
                        >
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                          {field.value
                            ? operatorOptions.find(
                                op => op.value === field.value
                              )?.label
                            : 'Pesquise a operadora do dispositivo'}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </ButtonShadcn>
                      </FormControl>
                      <FormMessage />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Digite a operadora."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          Nenhuma operadora encontrada.
                        </CommandEmpty>
                        <CommandGroup>
                          {operatorOptions
                            .filter(operator =>
                              operator.label
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                            )
                            .map(operator => (
                              <CommandItem
                                value={operator.label}
                                key={operator.value}
                                onSelect={() => {
                                  form.setValue('operator_id', operator.value)
                                  setIsOperatorPopoverOpen(false)
                                }}
                              >
                                {operator.label}
                                <Check
                                  className={cn(
                                    'ml-auto',
                                    operator.value === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
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

          {device ? (
            <div className="flex justify-between w-full">
              <Button type="submit" variant="blue" className="px-2">
                Salvar alterações
              </Button>
              {isPopover ? (
                <DialogClose asChild>
                  <Button
                    onClick={() => setModalOpen!(false)}
                    type="button"
                    variant="red"
                  >
                    Cancelar
                  </Button>
                </DialogClose>
              ) : (
                <Link href={'/meus-dispositivos'}>
                  <Button onClick={() => goBack()} type="button" variant="red">
                    Cancelar
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <Button type="submit" variant="blue">
                Cadastrar dispositivo
              </Button>
              {isPopover ? (
                <Button
                  onClick={() => setModalOpen!(false)}
                  type="button"
                  variant="red"
                >
                  Cancelar
                </Button>
              ) : (
                <Link href={'/meus-dispositivos'}>
                  <Button onClick={() => goBack()} type="button" variant="red">
                    Cancelar
                  </Button>
                </Link>
              )}
            </div>
          )}
        </form>
      </Form>
    </>
  )
}
