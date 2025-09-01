import { View, Text, useWindowDimensions, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import Header from '@/components/Header'
import ProtectedRoute from '@/components/ProtectedRoute'
import AlertForm from '@/components/Forms/AlertForm'
import { getDeviceById } from '@/functions/device/get-device-by-id'
import { Device } from '@/interfaces'
import ViewMyAlerts from '@/components/ViewMyAlerts'

export default function ViewAlert() {
  const params = useLocalSearchParams();
  const id = params.id
  console.log('ID do dispositivo:', id);
  const [device, setDevice] = useState<Device>({} as Device);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const device = await getDeviceById(id);
        setDevice(device);


        if(device.status === 'Regular') {
          Alert.alert('Info', 'O dispositivo já foi recuperado.')
          router.replace('/(tabs)/my-devices')
        }
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
              <Header title="Acompanhamento" />
            ),
          }}
        />
        <View className='bg-[#F2F8FD] w-screen h-screen px-3 py-2'>
          <ViewMyAlerts 
            setIsModalVisible={() => {}} 
            device={device} 
            onSuccess={() => router.push('/(tabs)/my-devices')}
          />
        </View>
      </ProtectedRoute>
    </>
  )
}