import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import Header from '@/components/Header'
import ProfileForm from '@/components/Forms/ProfileForm'
import ProtectedRoute from '@/components/ProtectedRoute'
import AlertForm from '@/components/Forms/AlertForm'
import { getDeviceById } from '@/functions/device/get-device-by-id'
import { Device } from '@/interfaces'

export default function Alert() {
  const params = useLocalSearchParams();
  const id = params.id
  const [device, setDevice] = useState<Device>({} as Device);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const device = await getDeviceById(id);
        console.log('Detalhes do dispositivo:', id);
        setDevice(device);
      } catch (error) {
        console.error('Erro ao buscar dispositivo:', error);
      }
    };

    fetchDevice();
  }, []) 

  return (
    <>
      <ProtectedRoute>
        <Stack.Screen
          options={{
            header: () => (
              <Header title="Acionar Alerta" />
            ),
          }}
        />
        <View className='bg-[#F2F8FD] w-screen h-screen pb-40 px-5 pt-2'>
          <AlertForm 
            setIsModalVisible={() => {}} 
            device={device}
            onSuccess={() => router.push('/(tabs)/my-devices')}
          />
        </View>
      </ProtectedRoute>
    </>
  )
}