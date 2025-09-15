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
import { Input } from '../ui/input'
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

import { account } from '@/lib/appwrite'
import type { Device, DeviceProps } from '@/types'
import {
  cn,
  validatePhoneNumber,
  validateImeiFormat,
  validateImeiWithLuhn,
} from '@/lib/utils'

import { Check, ChevronDown } from 'lucide-react'
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
    
    if (!operators || !Array.isArray(operators)) {
      throw new Error('Dados inválidos da API')
    }
    
    const mappedOperators = operators.map((operator: Operator) => ({
      label: operator.name_operator,
      value: operator.$id,
    }))
    
    return mappedOperators
  } catch (error) {
    console.error('Erro ao buscar operadoras:', error)
    // Retornar algumas operadoras padrão caso haja erro
    return [
      { label: 'Vivo', value: 'vivo' },
      { label: 'Claro', value: 'claro' },
      { label: 'TIM', value: 'tim' },
      { label: 'Oi', value: 'oi' },
    ]
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
  const [isLoading, setIsLoading] = useState(false)
  const [imeiError, setImeiError] = useState<string>('')
  const [operatorOptions, setOperatorOptions] = useState<
    { label: string; value: string }[]
  >([])
  const [operatorsLoaded, setOperatorsLoaded] = useState(false)
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
      try {
        setOperatorsLoaded(false)
        const options = await getOperatorOptions()
        setOperatorOptions(options)
        setOperatorsLoaded(true)

        if (device?.operator_id) {
          form.setValue('operator_id', device.operator_id)
        }
      } catch (error) {
        console.error('Erro ao carregar operadoras:', error)
        setOperatorsLoaded(true)
        // Define operadoras fallback para teste
        setOperatorOptions([
          { label: 'Vivo', value: 'vivo' },
          { label: 'Claro', value: 'claro' },
          { label: 'TIM', value: 'tim' },
          { label: 'Oi', value: 'oi' },
        ])
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
            `https://alpha.imeicheck.com/api/free_with_key/modelBrandName?key=${process.env.NEXT_PUBLIC_API_KEY_IMEICHECK}&imei=${imeiValue}&format=json`

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

  // Função para formatar IMEI (apenas mobile)
  const formatImei = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 15)
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 8) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`
    if (numbers.length <= 14) return `${numbers.slice(0, 2)} ${numbers.slice(2, 8)} ${numbers.slice(8)}`
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 8)} ${numbers.slice(8, 14)} ${numbers.slice(14)}`
  }

  // Função para formatar telefone (apenas mobile)
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11)
    if (numbers.length <= 2) return numbers.length === 0 ? '' : `(${numbers}`
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
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
      
      {/* Layout Desktop - mantém o formato original */}
      <div className="hidden md:block">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
              'w-full md:w-10/12 lg:w-full bg-white flex flex-col px-5 md:px-10 py-4 gap-8 text-zinc-900 self-center items-center justify-center rounded-3xl shadow-md'
            )}
          >
            {!device && (
              <div className="flex flex-col w-full gap-2">
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
                          className="w-3 md:w-4 h-5 xl:w-6 border-t-0 border-r-0 border-black  shadow-transparent"
                          index={0}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                          index={1}
                        />
                      </InputOTPGroup>
                      <span />
                      <InputOTPGroup>
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                          index={2}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                          index={3}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6 border-t-0 border-r-0 border-black shadow-transparent"
                          index={4}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                          index={5}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                          index={6}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                          index={7}
                        />
                      </InputOTPGroup>
                      <InputOTPGroup>
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                          index={8}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                          index={9}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                          index={10}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                          index={11}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                          index={12}
                        />
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                          index={13}
                        />
                      </InputOTPGroup>
                      <InputOTPGroup>
                        <InputOTPSlot
                          className="w-3 md:w-4 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                          index={14}
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage>{imeiError}</FormMessage>
                </div>
                <span className="w-64 md:w-80 bg-[#C4F3F2] text-procura-ai-black/60 font-medium py-2 px-4 rounded-xl">
                  🛈 O IMEI é composto por 15 números e pode ser encontrado na
                  embalagem do aparelho ou digitando *#06# no teclado do
                  aparelho.
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
                  <InputOTP
                    maxLength={11}
                    {...field}
                    className="w-full flex justify-center items-center"
                  >
                    <InputOTPGroup>
                      <span>(</span>
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 xl:w-6 border-t-0 border-r-0 border-black  shadow-transparent"
                        index={0}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                        index={1}
                      />
                      <span>)</span>
                    </InputOTPGroup>
                    <span />
                    <InputOTPGroup>
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                        index={2}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                        index={3}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 xl:w-6 border-t-0 border-r-0 border-black shadow-transparent"
                        index={4}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                        index={5}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                        index={6}
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator data-dash />
                    <InputOTPGroup>
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                        index={7}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                        index={8}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
                        index={9}
                      />
                      <InputOTPSlot
                        className="w-4 md:w-5 h-5 xl:w-6  border-t-0 border-r-0 border-black shadow-transparent"
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
                            'w-full md:w-96 text-xs gap-0 p-2 md:p-4 md:text-base lg:gap-2 justify-between bg-zinc-100 xl:w-[25.5rem]',
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
                            'w-full md:w-96 text-xs gap-0 p-2 md:p-4 md:text-base lg:gap-2 justify-between bg-zinc-100 xl:w-[25.5rem]',
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
              name="operator_id"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full md:w-fit self-start">
                  <FormLabel className="text-lg w-fit text-center items-start flex">
                    Operadora do dispositivo
                  </FormLabel>
                  
                  {/* Versão alternativa usando select nativo */}
                  <div className="self-start w-full md:w-fit relative">
                    <FormControl>
                      <select
                        {...field}
                        disabled={!operatorsLoaded || operatorOptions.length === 0}
                        className={cn(
                          'w-full md:w-96 xl:w-[25.5rem] h-10 px-3 pr-10 text-sm md:text-base bg-zinc-100 border border-input rounded-md shadow-sm appearance-none',
                          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                          !field.value && 'text-muted-foreground text-zinc-500',
                          (!operatorsLoaded || operatorOptions.length === 0) && 'cursor-not-allowed opacity-50'
                        )}
                        onChange={(e) => {
                          field.onChange(e.target.value)
                        }}
                      >
                        <option value="" disabled>
                          {!operatorsLoaded 
                            ? 'Carregando operadoras...' 
                            : operatorOptions.length === 0 
                              ? 'Nenhuma operadora disponível'
                              : 'Selecione a operadora do dispositivo'
                          }
                        </option>
                        {operatorOptions.map((operator) => (
                          <option key={operator.value} value={operator.value}>
                            {operator.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

          {device ? (
            <div className="flex justify-between w-full">
              {isPopover ? (
                <DialogClose asChild>
                  <Button
                    onClick={() => setModalOpen!(false)}
                    type="button"
                    variant="white"
                    className="!w-60"
                  >
                    Cancelar
                  </Button>
                </DialogClose>
              ) : (
                <Link href={'/meus-dispositivos'}>
                  <Button onClick={() => goBack()} type="button" variant="white" className="!w-60">
                    Cancelar
                  </Button>
                </Link>
              )}
              <Button type="submit" variant="blue" className="!w-60">
                Salvar alterações
              </Button>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              {isPopover ? (
                <Button
                  onClick={() => setModalOpen!(false)}
                  type="button"
                  variant="white"
                  className="!w-60"
                >
                  Cancelar
                </Button>
              ) : (
                <Link href={'/meus-dispositivos'}>
                  <Button onClick={() => goBack()} type="button" variant="white" className="!w-60">
                    Cancelar
                  </Button>
                </Link>
              )}
              <Button type="submit" variant="blue" className="!w-60">
                Cadastrar
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>

    {/* Layout Mobile - nova estilização baseada na imagem */}
    <div className="block md:hidden min-h-screen bg-gray-50">
      <div className="bg-white">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200">
          <h1 className="text-lg font-medium text-gray-900">
            {device ? 'Editar dispositivo' : 'Cadastrar dispositivo'}
          </h1>
          {!device && (
            <p className="text-sm text-gray-600 mt-1">Insira os dados abaixo:</p>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
            
            {/* IMEI Field */}
            <FormField
              control={form.control}
              name="imei"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    IMEI (obrigatório)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="12 345678 901234 5"
                        value={formatImei(field.value || '')}
                        maxLength={19} // 15 números + 4 espaços
                        className="h-12 bg-gray-50 border-gray-200 rounded-lg text-base placeholder:text-gray-400 text-center font-mono tracking-wider"
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, '').slice(0, 15);
                          field.onChange(rawValue);
                        }}
                      />
                    </div>
                  </FormControl>
                  
                  {/* Info Box */}
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                    <p className="text-xs text-cyan-800 flex items-start gap-2">
                      <span className="text-cyan-600 text-sm shrink-0">ℹ</span>
                      O IMEI é composto por 15 números e pode ser encontrado na embalagem do aparelho ou digitando *#06# no teclado do aparelho.
                    </p>
                  </div>
                  
                  <FormMessage />
                  {imeiError && (
                    <p className="text-sm text-red-600">{imeiError}</p>
                  )}
                </FormItem>
              )}
            />

            {/* Phone Number Field */}
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Número do celular (obrigatório)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={formatPhone(field.value || '')}
                      maxLength={15} // (11) 99999-9999
                      className="h-12 bg-gray-50 border-gray-200 rounded-lg text-base placeholder:text-gray-400 text-center font-mono tracking-wide"
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '').slice(0, 11);
                        field.onChange(rawValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brand Field */}
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Fabricante
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pesquise o fabricante do dispositivo"
                      {...field}
                      disabled
                      className="h-12 bg-gray-100 border-gray-200 rounded-lg text-base placeholder:text-gray-400 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Model Field */}
            <FormField
              control={form.control}
              name="phone_model"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Modelo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Selecione o modelo do dispositivo"
                      {...field}
                      disabled
                      className="h-12 bg-gray-100 border-gray-200 rounded-lg text-base placeholder:text-gray-400 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Operator Field */}
            <FormField
              control={form.control}
              name="operator_id"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Operadora
                  </FormLabel>
                  
                  {/* Versão simplificada usando select nativo */}
                  <div className="relative">
                    <FormControl>
                      <select
                        {...field}
                        disabled={!operatorsLoaded || operatorOptions.length === 0}
                        className={cn(
                          'w-full h-12 px-3 pr-10 text-base bg-gray-50 border-gray-200 rounded-lg appearance-none',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                          !field.value && 'text-gray-400',
                          (!operatorsLoaded || operatorOptions.length === 0) && 'cursor-not-allowed opacity-50'
                        )}
                        onChange={(e) => {
                          field.onChange(e.target.value)
                        }}
                      >
                        <option value="" disabled>
                          {!operatorsLoaded 
                            ? 'Carregando operadoras...' 
                            : operatorOptions.length === 0 
                              ? 'Nenhuma operadora disponível'
                              : 'Selecione a operadora'
                          }
                        </option>
                        {operatorOptions.map((operator) => (
                          <option key={operator.value} value={operator.value}>
                            {operator.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 w-full pt-6">
              {device ? (
                <>
                  {isPopover ? (
                    <DialogClose asChild>
                      <Button
                        onClick={() => setModalOpen!(false)}
                        type="button"
                        variant="white"
                        className="!w-40"
                      >
                        Cancelar
                      </Button>
                    </DialogClose>
                  ) : (
                    <Link href={'/meus-dispositivos'}>
                      <Button
                        onClick={() => goBack()}
                        type="button"
                        variant="white"
                        className="!w-40"
                      >
                        Cancelar
                      </Button>
                    </Link>
                  )}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="blue"
                    className="!w-40"
                  >
                    {isLoading ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                </>
              ) : (
                <>
                  {isPopover ? (
                    <Button
                      onClick={() => setModalOpen!(false)}
                      type="button"
                      variant="white"
                      className="!w-40"
                    >
                      Cancelar
                    </Button>
                  ) : (
                    <Link href={'/meus-dispositivos'}>
                      <Button
                        onClick={() => goBack()}
                        type="button"
                        variant="white"
                        className="!w-40"
                      >
                        Cancelar
                      </Button>
                    </Link>
                  )}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="blue"
                    className="!w-40"
                  >
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>

    </>
  )
}
