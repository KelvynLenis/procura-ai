import { View, Text } from 'react-native'
import React from 'react'


const Header = ({ title }: { title: string}) => {
  return (
    <View className='h-16 px-4 w-full flex flex-row items-center gap-2 bg-primary'>
      <Text className='text-white font-semibold text-xl'>{title}</Text>
    </View>
  )
}

export default Header