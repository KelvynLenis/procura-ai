import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import Header from '@/components/Header'

export default function Profile() {
  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <Header title="Editar Perfil" />
          ),
        }}
      />
      <View>
        <Text>Perfil</Text>
      </View>
    </>
  )
}