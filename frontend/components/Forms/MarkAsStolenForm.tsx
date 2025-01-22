"use client"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "../Input"
import { useToast } from "@/hooks/use-toast"
import { MarkAsStolenMap } from "../Maps/MarkAsStolenMap"
import Button from "../Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"


export function MarkAsStolenForm() {
  const { toast } = useToast()

  const occurrenceTypes = [
    { label: "Roubo", value: "Roubo" },
    { label: "Furto", value: "Furto" },
    { label: "Perda", value: "Perda" },
  ] as const

  const form = useForm({
    defaultValues: {
      datetime: '',
      description: '',
      type: '',
      coordinates: [0, 0]
    }
  })

  function handleSetPosition(coordinates: [number, number]) {
    form.setValue('coordinates', coordinates)
  }

  async function onSubmit(values: any) {

    try {
      // @Glaymar TODO
      // Lógica para marcar como roubado

      toast({
        variant: 'warning',
        title: 'TODO',
        description: 'Lógica para marcar como roubado',
        duration: 3000
      })

      console.log(values)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 text-zinc-900 self-center items-center justify-between rounded-lg">
        <div className="w-full flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col gap-5 w-full md:w-44">
            <FormField
              control={form.control}
              name="datetime"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="">Data e hora do furto</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
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
                    <Input type="text" placeholder="Uma descrição breve" {...field} className="text-sm" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="">Tipo de ocorrência</FormLabel>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full flex items-center rounded-lg text-xs gap-0 p-2 md:text-base lg:gap-2 justify-between bg-zinc-100">
                      <span className="w-full text-sm">
                        {
                          form.getValues('type') === '' ?
                            'Selecione o tipo de ocorrência' :
                            occurrenceTypes.find((occurrenceType) => occurrenceType.value === form.getValues('type'))?.label
                        }
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {
                        occurrenceTypes.map((occurrenceType) => (
                          <DropdownMenuItem
                            key={occurrenceType.value}
                            onClick={() => form.setValue('type', occurrenceType.value)}
                          >
                            {occurrenceType.label}
                          </DropdownMenuItem>
                        ))
                      }
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                  <FormLabel className="">Clique no mapa o local da ocorrência</FormLabel>
                  <FormControl>
                    <MarkAsStolenMap setPosition={handleSetPosition} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button variant="blue" type="submit" className="w-full h-10 flex items-center justify-center text-xl text-white self-center rounded-xl">Salvar</Button>
      </form>
    </Form>
  )
}