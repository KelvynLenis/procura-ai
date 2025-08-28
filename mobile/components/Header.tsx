import { View, Text, Image } from 'react-native'
import React from 'react'
import { images } from '@/contants/images'
import ClientNotificationButton from './ClientNotificationButton'


const Header = ({ title }: { title: string}) => {
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