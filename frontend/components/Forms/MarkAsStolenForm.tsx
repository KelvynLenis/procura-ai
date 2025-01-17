"use client"

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "../Input"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { MarkAsStolenMap } from "../Maps/MarkAsStolenMap"


export function MarkAsStolenForm() {
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      datetime: '',
      description: '',
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
        <div className="w-full flex justify-between gap-4">
          <div className="flex flex-col gap-2">
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
                    <Input type="text" placeholder="Uma descrição breve" {...field} />
                  </FormControl>
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
                  <FormLabel className="">Clique no mapa o local do furto</FormLabel>
                  <FormControl>
                    <MarkAsStolenMap setPosition={handleSetPosition} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <button type="submit" className="w-full h-10 flex items-center justify-center text-xl text-white self-center rounded-xl bg-primary  hover:opacity-60">Salvar</button>
      </form>
    </Form>
  )
}