import { View, Text, ActivityIndicator, ScrollView, Modal, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { DeviceProps, Event } from '@/interfaces'
import { getAllDeviceEvents, getDeviceEvents } from '@/functions/event/get-device-events'
import { formatISODateString } from '@/lib/utils'
import MapView, { Marker } from 'react-native-maps'
import Button from './Button'
import { updateDeviceStatus } from '@/functions/device/update-device-status'
import { TriangleAlert, X } from 'lucide-react-native'
import ConfirmationDialog from './ConfirmationDialog'
import { cn } from '@/utils/cn'

interface ViewMyAlertsProps {
  setIsModalVisible?: React.Dispatch<React.SetStateAction<boolean>>
  device: DeviceProps
}

const ViewMyAlerts = ({ setIsModalVisible, device }: ViewMyAlertsProps) => {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirmationDialogVisible, setIsConfirmationDialogVisible] = useState(false)

  async function handleDeviceRecovery() {
    try {
      const success = await updateDeviceStatus(device.$id!, {
        is_stolen: false,
        status: 'Regular',
      })

      if (success) {
        setIsModalVisible!(false)
        Alert.alert('Sucesso', 'Dispositivo recuperado com sucesso!')
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await getAllDeviceEvents(device.$id!)
      setEvents(events)

      setIsLoading(false)
    }
    fetchEvents()
  }, [device.$id])

  if (isLoading) {
    return (
      <ActivityIndicator 
        size='large'
        color={'#0000ff'}
        className="mt-0 self-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    )
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: '100%', paddingBottom: 20 }}>
      <View className='gap-2 w-full'>
        <View className='w-full h-20 bg-blue-100 flex-row justify-between p-5'>
          <Text className='font-semibold text-2xl'>Informações da ocorrência</Text>
          <X size={30} color={'#000'} onPress={() => setIsModalVisible!(false)}/>
        </View>

        <View className='px-5 py-1 gap-1'>
          <View className='gap-1 flex-row'>
            <Text className='font-semibold text-lg'>
              Tipo de alerta:
            </Text>
            <View className={cn(
              'w-fitrounded-md p-1',
              device.status === 'Roubado' && 'bg-robbery-bg text-robbery-text',
              device.status === 'Recuperado' && 'bg-regular-bg text-regular-text',
              device.status === 'Regular' && 'bg-regular-bg text-regular-text',
              device.status === 'Furtado' && 'bg-theft-bg text-theft-text',
              device.status === 'Perdido' && 'bg-lost-bg text-lost-text'
              )}
            >
              <Text className={cn(
                  device.status === 'Roubado' && 'text-robbery-text',
                  device.status === 'Recuperado' && 'text-regular-text',
                  device.status === 'Regular' && 'text-regular-text',
                  device.status === 'Furtado' && 'text-theft-text',
                  device.status === 'Perdido' && 'text-lost-text'
                )}
              >
                {device.status}
              </Text>
            </View>
          </View>
          <Text className='font-semibold text-lg'>Descrição do alerta: <Text className='font-normal'>{events[0].description}</Text></Text>
          <Text className='font-semibold text-lg'>Data e hora da ocorrência: <Text className='font-normal'>{formatISODateString(events[0].time_event)}</Text></Text>
          <Text className='font-semibold text-lg'>Local de recuperação: <Text className='font-normal'>{events[0].retrieval_location || "Esse dispositivo ainda não foi recuperado"}</Text></Text>
          <Text className='font-semibold text-lg'>Endereço: <Text className='font-normal'>{events[0].address || 'Esse dispositivo ainda não foi recuperado'}</Text></Text>
          
          <View className='flex flex-col w-full gap-1'>
            <View className='w-[100%] self-center h-72 gap-2'>
              <MapView 
                initialRegion={{
                  latitude: events[0].last_location[0],
                  longitude: events[0].last_location[1],
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                style={{ flex: 1 }} 
              >
              <Marker coordinate={{ latitude: events[0].last_location[0], longitude: events[0].last_location[1] }} />
              </MapView>
            </View>
          </View>
          
          {
            device.status !== 'Recuperado' ? (
              <Button variant='red' className='mt-4' onPress={() => setIsConfirmationDialogVisible(true)}>Cancelar o alerta</Button>              
            ) : (
              <Button variant='blue' className='mt-2' onPress={() => setIsConfirmationDialogVisible(true)}>
                <Text className='text-white font-medium'>Recuperei meu aparelho</Text>
              </Button>
            )
          }
        </View>
      </View>

      <ConfirmationDialog
        isModalVisible={isConfirmationDialogVisible}
        setIsModalVisible={setIsConfirmationDialogVisible}
        title={ device.status === 'Recuperado' ? 'Recuperar aparelho' : 'Cancelar o alerta'}
        description='Ao concordar com esta ação, o dispositivo será marcado como regular e os dados da recuperação serão perdidos.
                 Tenha certeza que já tem o aparelho em mãos antes de prosseguir.'
        onConfirm={handleDeviceRecovery}
      />
      
    </ScrollView>
  )
}

export default ViewMyAlerts