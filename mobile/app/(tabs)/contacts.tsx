import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import Header from '@/components/Header'

export default function Contacts() {
  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <Header title="Contatos de confiança" />
          ),
        }}
      />
      <View>
        <Text>Contatos de confiança</Text>
      </View>
    </>
  )
}