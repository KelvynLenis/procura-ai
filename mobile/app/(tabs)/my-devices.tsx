import { View } from 'react-native'
import React from 'react'
import Header from '@/components/Header'
import { Stack } from 'expo-router'
import DevicesTable from '@/components/DevicesTable'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function MyDevices() {
  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  )
}