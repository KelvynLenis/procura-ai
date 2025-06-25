import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import Header from '@/components/Header'
import ProfileForm from '@/components/Forms/ProfileForm'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Profile() {
  return (
    <>
      <ProtectedRoute>
        <Stack.Screen
          options={{
            header: () => (
              <Header title="Editar Perfil" />
            ),
          }}
        />
        <View className='bg-[#F2F8FD] w-screen h-screen p-2'>
          <ProfileForm />
        </View>
      </ProtectedRoute>
    </>
  )
}