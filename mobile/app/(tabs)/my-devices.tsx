import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Header from '@/components/Header'
import { Stack } from 'expo-router'
import { Eye, TriangleAlert } from 'lucide-react-native'
import DevicesTable from '@/components/DevicesTable'

export default function MyDevices() {
  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <Header title="Meus dispositivos" />
          ),
        }}
      />
      <View className='bg-[#F2F8FD] w-screen h-screen p-2'>
        <DevicesTable />
      </View>
    </>
  )
}