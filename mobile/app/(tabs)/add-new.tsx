import { View } from 'react-native'
import React from 'react'
import DeviceForm from '@/components/Forms/DeviceForm'
import { router, Stack } from 'expo-router'
import { listDevices } from '@/functions/device/list-devices'
import { account } from '@/lib/appwrite'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'

export default function AddNew() {
  const handleSuccess = async () => {
    try {
      // Força um refresh dos dados antes de navegar
      const user = await account.get();
      await listDevices({ userId: user.$id, limit: 100, page: 1 });
      
      // Navega de volta para a lista
      router.replace('/(tabs)/my-devices');
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
      router.replace('/(tabs)/my-devices');
    }
  };

  return (
    <ProtectedRoute>
      <Stack.Screen
        options={{
          header: () => (
            <Header title="Cadastrar dispositivo" />
          ),
        }}
      />
      <View className='flex-1 bg-zinc-100 px-3 py-5'>
        <DeviceForm onSuccess={handleSuccess} />
      </View>
    </ProtectedRoute>
  )
}