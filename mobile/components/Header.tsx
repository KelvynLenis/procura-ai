import { View, Text, Image, Alert } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { images } from '@/contants/images'
import ClientNotificationButton from './ClientNotificationButton'
import { account, client } from '@/lib/appwrite'
import { NotificationProps } from '@/interfaces'
import { listUserDevices } from '@/functions/device/list-user-devices'
import { NotificationContext } from '@/contexts/NotificationContext'


const Header = ({ title }: { title: string}) => {
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const [notifications, setNotifications] = useState<NotificationProps[]>([])

  const useNotification = useContext(NotificationContext)

  if (useNotification === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }

  // useEffect(() => {
    
  //   const handleNewNotification = async (response: any) => {
  //     Alert.alert('Notificação', response.payload.type)
  //     const { payload } = response
  //     const relevantTypes =['Recuperado']

  //     if (relevantTypes.includes(payload.type)) {

  //       const idDevice = payload.id_device
        
  //       const userAuth = await account.get()
  //       const userDevices = await listUserDevices(userAuth.$id)
        
  //       if (!userDevices.some(device => device.$id === idDevice)) {
  //         // console.log('Contexto: Ignorando notificação de um dispositivo que o usuário não possui')
  //         return
  //       }

  //       setNotifications(prevNotifications => {
  //         const exists = prevNotifications.some(n => n.$id === payload.$id)
  //         if (!exists) {
  //           // console.log('Contexto: Adicionando nova notificação para admin')
  //           setUpdateTrigger(prev => prev + 1)
  //           return [...prevNotifications, payload]
  //         }
  //         // console.log('Contexto: Notificação já existe, ignorando')
  //         return prevNotifications
  //       })
  //     }
  //   }

  //   const unsubscribe = client.subscribe(
  //     `databases.${process.env.NEXT_PUBLIC_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}.documents`,
  //     handleNewNotification
  //   )

  //   return () => {
  //     // console.log('Contexto: Cancelando subscription do Appwrite...')
  //     unsubscribe()
  //   }
  // }, [])

  return (
    <View className='h-16 px-4 w-full flex flex-row items-center bg-primary justify-between'>
      <View className='flex flex-row items-center'>
        <Image source={images.logo} style={{ width: 50, height: 50 }} />
        <Text className='text-white font-semibold text-xl -ml-2 mb-2'>{title}</Text>
      </View>

      <ClientNotificationButton />
    </View>
  )
}

export default Header