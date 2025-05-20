import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import Header from '@/components/Header'
import DeviceForm from '@/components/Forms/DeviceForm'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AddNew() {
  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <Header title="Cadastrar dispositivo" />
          ),
        }}
      />

      <View className='w-screen h-screen bg-[#F2F8FD] px-4' style={{ paddingTop: 10 }}>
        <DeviceForm />
      </View>
    </>
  )
}