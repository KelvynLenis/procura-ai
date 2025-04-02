'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { Input } from '../Input'
import Button from '../Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, CircleHelp, Triangle } from 'lucide-react'
import { toast } from 'react-toastify'
import type { DeviceProps } from '@/types'
import { Textarea } from '../ui/textarea'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { MarkAsStolenMapWithGeocoding } from '../Maps/MarkAsStolenMapWithGeocoding'
import dynamic from 'next/dynamic'
import { validateCoordinates } from '@/lib/utils'
import { getNeighborhood } from '@/functions/district/get-neighborhood'
// biome-ignore lint/style/useImportType: <explanation>
import {
  updateDistrict,
  UpdateDistrictData,
} from '@/functions/district/update-district'
import { createEvent } from '@/functions/event/create-event'
import {
  updateDeviceStatus,
  getDeviceStatus,
} from '@/functions/device/update-device-status'
import { DialogClose } from '@radix-ui/react-dialog'

interface MarkAsStolenFormProps {
  id: string
  isStolen: boolean
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>
  setModalOpen?: (value: boolean) => void
  setIsDialogOpen?: (value: boolean) => void
  isPopup?: boolean
}

const formSchema = z
  .object({
    datetime: z
      .string()
      .min(1, {
        message: 'A data e hora da ocorrência é obrigatória.',
      })
      .refine(date => new Date(date) <= new Date(), {
        message: 'A data não pode ser no futuro.',
      }),
    description: z.string().optional(),
    type: z.string().min(1, {
      message: 'O tipo da ocorrência é obrigatório.',
    }),
    coordinates: z.array(z.number()).min(2, {
      message: 'Selecione um local no mapa.',
    }),
    id_district: z.string().optional(),
  })
  .refine(data => validateCoordinates(data.coordinates), {
    path: ['coordinates'],
    message: 'Selecione um local no mapa.',
  })

// const Map = dynamic(() => import('../Maps/Map/DynamicMap'), {
//   ssr: false,
// })

export function MarkAsStolenForm({
  id,
  isStolen,
  setDevices,
  setModalOpen,
  setIsDialogOpen,
  isPopup,
}: MarkAsStolenFormProps) {
  const size = useWindowSize()
  const [isHintOpen, setIsHintOpen] = useState(false)

  const occurrenceTypes = [
    { label: 'Furto simples', value: 'Furto simples' },
    { label: 'Extravio ou Perda', value: 'Extravio ou Perda' },
    { label: 'Roubo', value: 'Roubo' },
  ] as const

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      datetime: '',
      description: '',
      type: '',
      coordinates: [0, 0],
      id_district: '',
    },
  })

  function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: 0,
      height: 0,
    })

    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }

      window.addEventListener('resize', handleResize)
      handleResize()
      return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowSize
  }

  function handleSetPosition(coordinates: [number, number]) {
    form.setValue('coordinates', coordinates)
  }

  function handleSetNeighborhood(districtId: string) {
    form.setValue('id_district', districtId)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const dataAtual = new Date()
      const dataEvento = new Date(values.datetime)

      if (dataEvento > dataAtual) {
        form.setError('datetime', {
          message: 'Não é possível cadastrar alertas com data futura',
        })
        toast.error('Não é possível cadastrar alertas com data futura')
        throw new Error('Não é possível cadastrar alertas com data futura')
      }

      const callFunction = async () => {
        try {
          await createEvent({
            id_device: id,
            time_event: values.datetime,
            description: values.description ?? '',
            type: values.type,
            is_alert_on: true,
            last_location: values.coordinates as [number, number],
            id_district: values.id_district || '',
          })

          await updateDeviceStatus(id, {
            is_stolen: true,
            status: getDeviceStatus(values.type),
          })

          if (values.id_district) {
            const neighborhood = await getNeighborhood(values.id_district)
            let data: UpdateDistrictData = {}

            if (values.type === 'Furto simples') {
              data = {
                theft_counter: neighborhood.theft_counter + 1,
              }
            } else if (values.type === 'Extravio ou Perda') {
              data = {
                lost_counter: neighborhood.lost_counter + 1,
              }
            } else if (values.type === 'Roubo') {
              data = {
                robbery_counter: neighborhood.robbery_counter + 1,
              }
            }

            if (Object.keys(data).length > 0) {
              await updateDistrict(values.id_district, data)
            }
          }

          return true
        } catch (error) {
          console.error('Ocorreu um erro em uma das operações:', error)
          return false
        }
      }

      const success = await toast.promise(callFunction, {
        pending: `Marcando como ${getDeviceStatus(values.type)}...`,
        success: `Marcado como ${getDeviceStatus(values.type)}!`,
        error: `Erro ao marcar como ${getDeviceStatus(values.type)}!`,
      })

      if (success) {
        setDevices(prevDevices =>
          prevDevices.map(device =>
            device.$id === id
              ? {
                  ...device,
                  is_stolen: true,
                  status: getDeviceStatus(values.type),
                }
              : device
          )
        )

        setIsDialogOpen?.(false)
      }

      if (setModalOpen) {
        setModalOpen(false)
      }
    } catch (error) {
      console.error('Ocorreu um erro:', error)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4 text-zinc-900 self-center items-center justify-between rounded-lg"
      >
        <div className="w-full flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col gap-5 w-full md:w-48 lg:w-56">
            <FormField
              control={form.control}
              name="datetime"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="w-fit text-center items-center flex">
                    <span className="text-red-500 h-6 flex align-text-bottom">
                      *
                    </span>
                    Data e hora do furto
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      className="ring-1 ring-zinc-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="">Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Uma descrição breve"
                      {...field}
                      className="resize-none text-start h-36 ring-1 ring-zinc-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="w-full text-center items-center flex flex-col">
                    <div className="flex justify-between w-full relative">
                      <div className="flex items-center">
                        <span className="text-red-500 h-6 flex align-text-bottom">
                          *
                        </span>
                        Tipo de ocorrência
                      </div>
                      <button type="button" className="text-xs group">
                        <CircleHelp
                          size={22}
                          className="fill-primary text-white"
                          onClick={() => setIsHintOpen(!isHintOpen)}
                        />
                        {/* <div className="group hidden flex-col md:group-hover:absolute md:group-hover:flex group-hover:z-[100] group-hover:-right-[21rem] group-hover:w-80 md:-top-[10rem] md:bg-[#D8A912] gap-2 bg-[#D8A912]/30 font-normal p-2 rounded-md text-justify leading-5">
                          <Triangle className="hidden md:absolute top-[45%] -rotate-90 -left-4 fill-[#D8A912] text-[#D8A912]" />
                          <p>
                            Entenda a diferença entre{' '}
                            <span className="font-semibold">
                              os tipos de ocorrência
                            </span>
                          </p>
                          <p>
                            O <span className="font-semibold">furto</span>{' '}
                            ocorre quando há a subtração de coisas alheias
                            móveis, sem o consentimento do proprietário, com o
                            intuito de ficar com elas para si, porém{' '}
                            <span className="font-semibold underline">
                              sem violência ou grave ameaça
                            </span>
                            .
                            <br /> Exemplo: subtrair um telefone celular de uma
                            bolsa enquanto a dona não estava vendo
                          </p>
                          <p>
                            Já o <span className="font-semibold">roubo</span>{' '}
                            ocorre com a subtração de coisas alheias móveis{' '}
                            <span className="font-semibold underline">
                              com a utilização de violência ou grave ameaça
                              contra a pessoa
                            </span>
                            .
                            <br /> Exemplo: um indivíduo com a intenção de
                            subtrair um telefone celular, aponta uma arma de
                            fogo contra a vítima e ameaça atirar contra ela caso
                            o aparelho não seja entregue.
                          </p>
                          <p>
                            Entretanto,{' '}
                            <span className="font-semibold">
                              o extravio ou perda
                            </span>{' '}
                            é caracterizado pelo{' '}
                            <span className="font-semibold underline">
                              desaparecimento ou sumiço de algo
                            </span>
                            .{' '}
                          </p>
                        </div> */}
                      </button>
                    </div>
                    {isHintOpen && (
                      <div className="flex w-full flex-col md:absolute md:flex z-[100] md:right-[8rem] -right-[21rem] md:top-[5rem] md:bg-[#D8A912] lg:z-[100] lg:left-1/3 lg:w-80 lg:top-20 gap-2 bg-[#D8A912]/30 lg:bg-[#D8A912]/100 font-normal p-2 rounded-md text-justify leading-5">
                        <Triangle className="hidden md:flex md:absolute md:top-[16.5rem] md:-left-[1rem] z-[100] top-[45%] -rotate-90 -left-4 fill-[#D8A912] text-[#D8A912]" />
                        <p>
                          Entenda a diferença entre{' '}
                          <span className="font-semibold">
                            os tipos de ocorrência
                          </span>
                        </p>
                        <p>
                          O <span className="font-semibold">furto</span> ocorre
                          quando há a subtração de coisas alheias móveis, sem o
                          consentimento do proprietário, com o intuito de ficar
                          com elas para si, porém{' '}
                          <span className="font-semibold underline">
                            sem violência ou grave ameaça
                          </span>
                          .
                          <br /> Exemplo: subtrair um telefone celular de uma
                          bolsa enquanto a dona não estava vendo
                        </p>
                        <p>
                          Já o <span className="font-semibold">roubo</span>{' '}
                          ocorre com a subtração de coisas alheias móveis{' '}
                          <span className="font-semibold underline">
                            com a utilização de violência ou grave ameaça contra
                            a pessoa
                          </span>
                          .
                          <br /> Exemplo: um indivíduo com a intenção de
                          subtrair um telefone celular, aponta uma arma de fogo
                          contra a vítima e ameaça atirar contra ela caso o
                          aparelho não seja entregue.
                        </p>
                        <p>
                          Entretanto,{' '}
                          <span className="font-semibold">
                            o extravio ou perda
                          </span>{' '}
                          é caracterizado pelo{' '}
                          <span className="font-semibold underline">
                            desaparecimento ou sumiço de algo
                          </span>
                          .{' '}
                        </p>
                      </div>
                    )}
                  </FormLabel>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full flex items-center rounded-lg text-xs gap-0 p-2 md:text-base lg:gap-2 justify-between bg-zinc-100">
                      <span className="w-full text-sm">
                        {form.getValues('type') === ''
                          ? 'Selecione o tipo de ocorrência'
                          : occurrenceTypes.find(
                              occurrenceType =>
                                occurrenceType.value === form.getValues('type')
                            )?.label}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {occurrenceTypes.map(occurrenceType => (
                        <DropdownMenuItem
                          key={occurrenceType.value}
                          onClick={() =>
                            form.setValue('type', occurrenceType.value)
                          }
                          className="hover:bg-primary hover:text-procura-ai-white"
                        >
                          {occurrenceType.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-2 w-full items-center justify-center">
            <FormField
              control={form.control}
              name="coordinates"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="w-fit text-center items-center flex">
                    <span className="text-red-500 h-6 flex align-text-bottom">
                      *
                    </span>
                    Clique no mapa o local da ocorrência
                  </FormLabel>
                  <FormControl>
                    {/* <MarkAsStolenMap setPosition={handleSetPosition} setNeighborhoodId={handleSetNeighborhood} /> */}
                    <MarkAsStolenMapWithGeocoding
                      setPosition={handleSetPosition}
                      setNeighborhoodId={handleSetNeighborhood}
                    />
                    {/* <Map /> */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-between w-full">
          <Button
            variant="blue"
            type="submit"
            className="w-fit px-5 h-10 flex items-center justify-center text-xl text-white self-center"
          >
            Salvar
          </Button>
          {isPopup && (
            <DialogClose asChild>
              <Button type="button" variant="red">
                Cancelar
              </Button>
            </DialogClose>
          )}
        </div>
      </form>
    </Form>
  )
}
