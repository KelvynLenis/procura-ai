
import { useEffect, useState } from 'react'
import DeviceCheck from '../assets/icons/device-check.svg'
import { getDeviceById } from "@/functions/device/get-device-by-id"
import { account } from "@/lib/appwrite"
import { FlatList, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Device, Notification, NotificationProps } from '@/interfaces'
import { Bell, ChevronRight, X } from 'lucide-react-native'
import { getNotificationsUnread } from '@/functions/notification/get-notifications-unread'
import { markNotificationsAsRead } from '@/functions/notification/mark-as-read'
import { formatISODateString } from '@/lib/utils'
import { cn } from '@/utils/cn'
import { router } from 'expo-router'
import { getNotifications } from '@/functions/notification/get-notifications'
import { getNotificationsRead } from '@/functions/notification/get-notifications-read'
import { images } from '@/contants/images'


function RenderNotification({ notification, setIsDialogOpen } : {notification: Notification, setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const isRecovered = notification.type === 'Recuperado'
  const [device, setDevice] = useState<Device>()
  const [isLoading, setIsLoading] = useState(true)

  async function markAsReadAndRedirect() {
    await markNotificationsAsRead(notification.$id!)
    
    setIsDialogOpen(false)
    router.push(`/device/${device?.$id}/view-alert`)
  }

  useEffect(() => {
    const fetchDevice = async () => {
    try {
      const device = await getDeviceById(notification.id_device!)
      setDevice(device)
    } catch (err) {
      console.error("Erro ao buscar device:", err)
    }
    setIsLoading(false)
  }
  fetchDevice()
  }, [notification.id_device])
  
  return (
    <View className={cn('flex flex-row items-center gap-4 p-2 rounded-xl', notification.is_read ? 'bg-zinc-100' : 'bg-[#F2F8FD]')}>
      <DeviceCheck className="w-6 h-6 self-center" />

      <View className='flex gap-2 w-[25rem]'>
        <View className='flex flex-row justify-between items-center w-full'>
          <Text className='font-bold flex text-sm text-primary'>Seu dispositivo foi recuperado</Text>
          {!notification.is_read && <View className='w-2 h-2 flex rounded-full bg-secondary'></View>}
        </View>
        <Text className='text-justify'>Informamos que o seu dispositivo {device?.phone_model}, foi localizado e recuperado pela polícia.</Text>
        <Text className='self-start'>{formatISODateString(notification.$createdAt!)}</Text>
        <TouchableOpacity className='self-end flex flex-row gap-1' onPress={markAsReadAndRedirect}>
          <Text className='text-secondary underline self-end'>Ir para página de recuperação</Text>
          <ChevronRight size={20} color={'#0B7AF5'} />
        </TouchableOpacity>
      </View>

    </View>
  )
}

interface ClientNotificationButtonProps {
  notifications?: NotificationProps[]
  setNotifications?: React.Dispatch<React.SetStateAction<NotificationProps[]>>
  onNotificationClick?: (notification: NotificationProps) => void
}

function ClientNotificationButton({
  notifications,
  setNotifications,
  onNotificationClick,
}: ClientNotificationButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notificationsCount, setNotificationsCount] = useState(0)
  const [databaseNotificationsUnread, setDatabaseNotificationsUnread] = useState<Notification[]>([])
  const [databaseNotificationsRead, setDatabaseNotificationsRead] = useState<Notification[]>([])
  
  // const sortedNotifications = [...notifications].sort((a, b) => {
  //   const dateA = new Date(a.time_event).getTime()
  //   const dateB = new Date(b.time_event).getTime()
    
  //   // Debug: verificar ordenação
  //   console.log('NotificationButton: Ordenando notificações', {
  //     a: { id: a.$id.slice(0, 8), date: a.time_event, timestamp: dateA },
  //     b: { id: b.$id.slice(0, 8), date: b.time_event, timestamp: dateB },
  //     result: dateB - dateA
  //   })
    
  //   // Retorna a diferença para ordenação decrescente (mais recente primeiro)
  //   return dateB - dateA
  // })

  useEffect(() => {
    const fetchNotificationsUnread = async () => {
      const user = await account.get()
      
      const { documents: notificationsUnread, total } = await getNotificationsUnread(user.$id)

      const { documents: notificationsRead } = await getNotificationsRead(user.$id)

      setDatabaseNotificationsRead(notificationsRead)
      setDatabaseNotificationsUnread(notificationsUnread)
      setNotificationsCount(total)
    }

    fetchNotificationsUnread()
  }, [notifications])

  return (
    <View>
      <TouchableOpacity onPress={() => setIsDialogOpen(!isDialogOpen)} className='bg-white text-primary rounded-full w-10 h-10 flex items-center justify-center'>
        <Bell size={24} color={'#212A38'} />

        {
          notificationsCount > 0 && (
            <View className='absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full text-center flex items-center justify-center'>
              <Text className='text-white text-sm'>{notificationsCount}</Text>
            </View>
          )
        }
      </TouchableOpacity>

      <Modal visible={isDialogOpen} onRequestClose={() => setIsDialogOpen(false)}>
        <View 
          className=" bg-white rounded-sm w-screen flex-1" 
        >
          <ScrollView contentContainerStyle={{ minHeight: '100%', paddingBottom: 10 }}>
            <View className='flex flex-row items-center h-16 px-4 bg-primary mb-2'>
              <Image source={images.logo} style={{ width: 50, height: 50 }} />
              <Text className="text-white text-xl font-medium">Notificações</Text>
            </View>
            <View className="flex flex-row justify-between px-2">
              <Text className="font-bold text-lg">Notificações não lidas</Text>
              <X className="self-end" color={'#212A38'} size={24} onPress={() => setIsDialogOpen(false)} />
            </View>

            <View className='px-2 gap-2'>
              {databaseNotificationsUnread.map((item) => (
                <RenderNotification key={item.$id} notification={item} setIsDialogOpen={setIsDialogOpen} />
              ))}
            </View>

            <View className="flex flex-row mt-4 px-2">
              <Text className="font-bold text-lg">Notificações lidas</Text>
            </View>

            <View className='px-2 gap-2'>
              {databaseNotificationsRead.map((item) => (
                <RenderNotification key={item.$id} notification={item} setIsDialogOpen={setIsDialogOpen} />
              ))}
            </View>

            {databaseNotificationsUnread.length === 0 && databaseNotificationsRead.length === 0 && (
              <View className="h-full flex items-center justify-center">
                <Text className="text-zinc-500 text-sm">Nenhuma notificação encontrada</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* {
        isDialogOpen && (
        )
      } */}
    </View>
  )
}

export default ClientNotificationButton