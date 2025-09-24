'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../Button'
import { Checkbox } from '../ui/checkbox'
import { Textarea } from '../ui/textarea'
import NotificationTable from '../Tables/NotificationTable'
import { useEffect, useState } from 'react'
import { User } from '@/types'
import AddUserToPushNotificationList from '../AddUserToPushNotificationList'
import { getDevices } from '@/functions/devices/list-devices'
import { getUser } from '@/functions/user/get-user'

function NotificationForm() {
  const [allUsers, setAllUsers] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [statusOptions, setStatusOptions] = useState({
    'Regular': false,
    'Roubado': false,
    'Furtado': false,
    'Perdido': false,
    'Recuperado': false
  })
  const [locationOptions, setLocationOptions] = useState({
    'JoaoPessoa': false,
    'Cabedelo': false,
    'CampinaGrande': false,
    'Bayeux': false,
    'SantaRita': false
  })  

  const formSchema = z
  .object({
    title: z.string().min(1, {
      message: 'O título é obrigatório.',
    })
    .max(65, 'O título deve ter no máximo 65 caracteres'),
    description: z.string().min(1, {
      message: 'O corpo da notificação é obrigatória.',
    })
    .max(240, 'O corpo da notificação deve ter no máximo 240 caracteres'),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: ''
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const statusTarget = Object.keys(statusOptions).filter(key => statusOptions[key] === true)

    const queryFiltersDevices = statusTarget.length > 0
      ? [{
          method: 'equal',
          attribute: 'status',
          values: statusTarget
        }]
      : []

    const allStatusDeviceSource = await getDevices({ filters: queryFiltersDevices })

    const deviceUserTargets = allStatusDeviceSource.map(device => device.auth_id)

    const queryFiltersUsers = deviceUserTargets.length > 0
      ? [{
          method: 'equal',
          attribute: 'user_id',
          values: deviceUserTargets
        }]
      : []
    
    const targetUsersFromStatusOptions = await getUser({ filters: queryFiltersUsers })

    const mergeTargets = [...selectedUsers, ...targetUsersFromStatusOptions]

    const removeDuplicated = mergeTargets.filter((value, index) => {
      const _value = JSON.stringify(value)
      return index === mergeTargets.findIndex(obj => {
        return JSON.stringify(obj) === _value
      })
    })

    const targets = removeDuplicated.map(user => user.push_token)

    const response = await fetch("/api/send-push-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pushToken: "ExponentPushToken[_VFcvcCCGvdKT4jQ3L3K45]",
        statusOptions: statusOptions,
        locationOptions: locationOptions,
        allUsers: allUsers,
        targets: targets,
        title: values.title,
        message: values.description,
      }),
    });

    const data = await response.json();
    console.log(data);
  }

  function toggleAllStatusOptions() {
    if (statusOptions['Regular'] && statusOptions['Roubado'] && statusOptions['Furtado'] && statusOptions['Perdido'] && statusOptions['Recuperado'] ) {
      setStatusOptions({
        'Regular': false,
        'Roubado': false,
        'Furtado': false,
        'Perdido': false,
        'Recuperado': false
      })
      return
    }

    setStatusOptions({
      'Regular': true,
      'Roubado': true,
      'Furtado': true,
      'Perdido': true,
      'Recuperado': true
    })
  }

  function toggleAllLocationsOptions() {
    if (locationOptions['JoaoPessoa'] && locationOptions['Cabedelo'] && locationOptions['CampinaGrande'] && locationOptions['Bayeux'] && locationOptions['SantaRita'] ) {
      setLocationOptions({
        'JoaoPessoa': false,
        'Cabedelo': false,
        'CampinaGrande': false,
        'Bayeux': false,
        'SantaRita': false
      })
      return
    }

    setLocationOptions({
      'JoaoPessoa': true,
      'Cabedelo': true,
      'CampinaGrande': true,
      'Bayeux': true,
      'SantaRita': true
    })
  }

  useEffect(() => {
    if (selectedUsers.length > 0) {
      setAllUsers(false)
    }

    if (selectedUsers.length === 0) {
      setAllUsers(true)
    }
  }, [selectedUsers])

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 text-zinc-900 self-center items-center justify-between rounded-xl bg-white pb-4 w-full"
        >
          <div className='w-full bg-[#E6F1FD] flex justify-start px-4 py-2 rounded-t-xl font-medium'>
            {
              true 
                ? 'Criar notificação'
                : 'Editar notificação'
            }

          </div>

          <div className='px-2 w-full flex flex-col gap-4'>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="w-fit text-center items-center flex">
                    <span className="text-red-500 h-6 flex align-text-bottom">
                      *
                    </span>
                    Título
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
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
                  <FormLabel className="w-fit text-center items-center flex">
                    <span className="text-red-500 h-6 flex align-text-bottom">
                      *
                    </span>
                    Descrição
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="ring-1 ring-zinc-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='bg-zinc-100 rounded-lg w-full px-8 py-4 flex justify-between'>
              <div className='flex flex-col gap-2'>
                <h3 className='font-medium'>Usuários</h3>

                <div className='flex gap-2 items-center'>
                  <Checkbox checked={allUsers} onClick={() => setAllUsers(!allUsers)} className='drop-shadow-sm shadow-sm bg-white' />
                  Todos os usuários
                </div>
                <span>Ou selecione  usuários específicos</span>


                <AddUserToPushNotificationList targets={selectedUsers} setTargets={setSelectedUsers} />
                {/* <div className='flex flex-col'>
                  <div className='ring-1 ring-zinc-300 flex items-center gap-2 bg-white px-4 py-2 w-fit'>
                    <Search className='w-6 h-6' />
                    <input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder='Pesquise por nome ou CPF' className='px-4 py-1 w-56 focus:outline-none' />
                  </div>
                  {predictions.length > 0 && (
                    <ul className="w-full h-20 flex flex-col bg-zinc-100 ring-1 ring-zinc-300 max-h-32 overflow-auto">
                      {predictions && predictions.map((user: User) => (
                        <li
                          key={user.$id}
                          className="px-4 py-2 cursor-pointer hover:bg-white ring-1 ring-zinc-300 italic"
                          onClick={() => handlePredictionSelect(user.push_token)}
                        >
                          {user.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div> */}
              </div>

              <div className='flex flex-col gap-2'>
                <h3 className='font-medium'>Status de dispositivo</h3>
                <div className='flex gap-2 items-center'>
                  <Checkbox onClick={toggleAllStatusOptions} className='drop-shadow-sm shadow-sm bg-white' />
                  Todos
                </div>

                <div className='flex gap-2 items-start flex-col pl-4'>
                  <div className='flex gap-2 items-center'>
                    <Checkbox checked={statusOptions.Regular} onClick={() => setStatusOptions({ ...statusOptions, 'Regular': !statusOptions['Regular'] })} className='drop-shadow-sm shadow-sm bg-white' />
                    Regular
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Checkbox checked={statusOptions.Roubado} onClick={() => setStatusOptions({ ...statusOptions, 'Roubado': !statusOptions['Roubado'] })} className='drop-shadow-sm shadow-sm bg-white' />
                    Roubado
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Checkbox checked={statusOptions.Furtado} onClick={() => setStatusOptions({ ...statusOptions, 'Furtado': !statusOptions['Furtado'] })} className='drop-shadow-sm shadow-sm bg-white' />
                    Furtado
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Checkbox checked={statusOptions.Perdido} onClick={() => setStatusOptions({ ...statusOptions, 'Perdido': !statusOptions['Perdido'] })} className='drop-shadow-sm shadow-sm bg-white' />
                    Perdido
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Checkbox checked={statusOptions.Recuperado} onClick={() => setStatusOptions({ ...statusOptions, 'Recuperado': !statusOptions['Recuperado'] })} className='drop-shadow-sm shadow-sm bg-white' />
                    Recuperado
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-2'>
                <h3 className='font-medium'>Localidade ou região</h3>
                <div className='flex gap-2 items-center text-zinc-500'>
                  <Checkbox disabled onClick={toggleAllLocationsOptions} className='drop-shadow-sm shadow-sm bg-white' />
                  Todos
                </div>

                <div className='flex gap-2 items-start flex-col pl-4'>
                  <div className='flex gap-2 items-center text-zinc-500'>
                    <Checkbox disabled checked={locationOptions.JoaoPessoa} onClick={() => setLocationOptions({ ...locationOptions, 'JoaoPessoa': !locationOptions['JoaoPessoa'] })} className='drop-shadow-sm shadow-sm bg-white' />
                    João Pessoa
                  </div>
                  <div className='flex gap-2 items-center text-zinc-500'>
                    <Checkbox disabled checked={locationOptions.Cabedelo} onClick={() => setLocationOptions({ ...locationOptions, 'Cabedelo': !locationOptions['Cabedelo'] })} className='drop-shadow-sm shadow-sm bg-white' />
                    Cabedelo
                  </div>
                  <div className='flex gap-2 items-center text-zinc-500'>
                    <Checkbox disabled checked={locationOptions.CampinaGrande} onClick={() => setLocationOptions({ ...locationOptions, 'CampinaGrande': !locationOptions['CampinaGrande'] })} className='drop-shadow-sm shadow-sm bg-white' />
                    Campina Grande
                  </div>
                  <div className='flex gap-2 items-center text-zinc-500'>
                    <Checkbox disabled checked={locationOptions.Bayeux} onClick={() => setLocationOptions({ ...locationOptions, 'Bayeux': !locationOptions['Bayeux'] })} className='drop-shadow-sm shadow-sm bg-white' />
                    Bayeux
                  </div>
                  <div className='flex gap-2 items-center text-zinc-500'>
                    <Checkbox disabled checked={locationOptions.SantaRita} onClick={() => setLocationOptions({ ...locationOptions, 'SantaRita': !locationOptions['SantaRita'] })} className='drop-shadow-sm shadow-sm bg-white' />
                    Santa Rita
                  </div>
                </div>
              </div>
            </div>

            <div className='flex justify-between w-full'>
              <Button
                variant="white"
                type="button"
                className="xl:text-base"
              >
                Cancelar
              </Button>
              <Button
                variant="blue"
                type="submit"
                className="xl:text-base"
              >
                Enviar notificação
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <div className='w-full h-full bg-white rounded-xl flex flex-col gap-2'>
        <div className='w-full bg-[#E6F1FD] rounded-t-xl px-4 py-2 font-medium'>
          Historico de notificações
        </div>
        
        <NotificationTable />
      </div>
    </>
  )
}

export default NotificationForm