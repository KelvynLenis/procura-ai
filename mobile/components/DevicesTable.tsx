import { View, Text, TouchableOpacity, Modal, Pressable, FlatList, ActivityIndicator, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Eye, Pencil, Trash2, TriangleAlert } from 'lucide-react-native'
import { router } from 'expo-router';
import ConfirmationDialog from './ConfirmationDialog';
import DeviceForm from './Forms/DeviceForm';
import AlertForm from './Forms/AlertForm';
import Button from './Button';
import { DeviceProps } from '@/interfaces';
import { account } from '@/lib/appwrite';
import { listDevices } from '@/functions/device/list-devices';
import { cn } from '@/utils/cn';
import { deleteDevice } from '@/functions/device/delete-device';
import { RefreshControl } from 'react-native';

const DeviceRow = ({ device, onRefresh }: {device: DeviceProps, onRefresh: () => void}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);

  async function handleDeleteDevice() {
    onRefresh()
    await deleteDevice(device.$id!)
    setIsConfirmModalVisible(false)
    setIsModalVisible(false)
  }

  return (
    <>
      <View className='bg-white w-full h-14 flex flex-row gap-2 items-center rounded-lg px-2 border border-zinc-300'>
        <View className='w-full max-w-52'>
          <Text>{device.phone_model}</Text>
        </View>
        <View className='w-fit sm:w-[7.2rem] md:w-[8.2rem]'>
          <View className={cn(
            'w-fit max-w-40 items-center justify-center rounded-md p-2',
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
          <View className='flex flex-row gap-2 w-fit'> 
            <TouchableOpacity onPress={() => setIsAlertModalVisible(true)} className={cn(
                'flex items-center justify-center w-9 h-9 rounded-md',
                device.status === 'Recuperado' && 'bg-regular-bg text-regular-text',
                'bg-red-500'
               )}
              >
              <TriangleAlert size={28} color={device.status === 'Recuperado' ? '#D7EDB6' :'red'} fill={device.status === 'Recuperado' ? 'green' : 'white'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsModalVisible(true)} className='bg-white border border-zinc-400 flex items-center justify-center w-9 h-9 rounded-md'>
              <Eye size={24} color='black' />
            </TouchableOpacity>
          </View>
      </View>

      <Modal animationType='fade' transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <Pressable className='flex-1 bg-black/50 flex items-center justify-center' onPress={() => setIsModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} className='bg-white w-[90%] h-[25rem] max-h-[30rem] flex rounded-2xl overflow-hidden'>
            <View className='w-full h-16 flex flex-row items-center justify-end gap-3 px-5 bg-primary rounded-t-2xl'>
              <TouchableOpacity onPress={() => setIsAlertModalVisible(true)} className='bg-red-500 flex items-center justify-center w-9 h-9 rounded-md border border-white'>
                <TriangleAlert size={28} color='red' fill={'white'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsEditModalVisible(true)} className='bg-white border border-zinc-400 flex items-center justify-center w-9 h-9 rounded-md'>
              <Pencil size={24} color='black' />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsConfirmModalVisible(true)} className='bg-white border border-zinc-400 flex items-center justify-center w-9 h-9 rounded-md'>
              <Trash2 size={24} color='red' />
            </TouchableOpacity>
            </View>

            <View className=''>
              <View className='flex flex-row gap-4'>
                <View className='w-[30%] flex bg-zinc-100 items-center justify-center pt-2'>
                  <Text>Modelo</Text>
                </View>
                <View className='w-[80%] pt-2'>
                  <Text className='font-semibold'>{device.phone_model}</Text>
                </View>
              </View>

              <View className='flex flex-row'>
                <View className='w-[30%] pb-2 pt-4 flex bg-zinc-100 items-center'>
                  <View className='w-14 h-0.5 bg-zinc-300' />
                </View>
                <View className='w-[90%] pb-2 pt-4 items-start ml-4'>
                  <View className='w-[67%] h-0.5 bg-zinc-300' />
                </View>
              </View>

              <View className='flex flex-row gap-4'>
                <View className='w-[30%] flex bg-zinc-100 items-center justify-center pt-2'>
                  <Text>Fabricante</Text>
                </View>
                <View className='w-[80%] pt-2'>
                  <Text className='font-semibold'>{device.brand}</Text>
                </View>
              </View>

              <View className='flex flex-row'>
                <View className='w-[30%] pb-2 pt-4 flex bg-zinc-100 items-center'>
                  <View className='w-14 h-0.5 bg-zinc-300' />
                </View>
                <View className='w-[90%] pb-2 pt-4 items-start ml-4'>
                  <View className='w-[67%] h-0.5 bg-zinc-300' />
                </View>
              </View>

              <View className='flex flex-row gap-4'>
                <View className='w-[30%] flex bg-zinc-100 items-center justify-center pt-2'>
                  <Text>IMEI</Text>
                </View>
                <View className='w-[80%] pt-2'>
                  <Text className='font-semibold'>{`${device.imei.slice(0, 1)} ${device.imei.slice(1, 8)} ${device.imei.slice(9, 15)}`}</Text>
                </View>
              </View>

              <View className='flex flex-row'>
                <View className='w-[30%] pb-2 pt-4 flex bg-zinc-100 items-center'>
                  <View className='w-14 h-0.5 bg-zinc-300' />
                </View>
                <View className='w-[90%] pb-2 pt-4 items-start ml-4'>
                  <View className='w-[67%] h-0.5 bg-zinc-300' />
                </View>
              </View>

              <View className='flex flex-row gap-4'>
                <View className='w-[30%] flex bg-zinc-100 items-center justify-center pt-2'>
                  <Text>Número</Text>
                </View>
                <View className='w-[80%] pt-2'>
                  <Text className='font-semibold'>{`(${device.phone_number.slice(0, 2)}) ${device.phone_number.slice(2, 7)}-${device.phone_number.slice(7, 11)}`}</Text>
                </View>
              </View>

              <View className='flex flex-row'>
                <View className='w-[30%] pb-2 pt-4 flex bg-zinc-100 items-center'>
                  <View className='w-14 h-0.5 bg-zinc-300' />
                </View>
                <View className='w-[90%] pb-2 pt-4 items-start ml-4'>
                  <View className='w-[67%] h-0.5 bg-zinc-300' />
                </View>
              </View>

              <View className='flex flex-row gap-4'>
                <View className='w-[30%] flex bg-zinc-100 items-center justify-center pt-2'>
                  <Text>Status</Text>
                </View>
                <View className='w-[80%] pt-2'>
                  <View className={cn(
                    'w-fit max-w-40 items-center justify-center rounded-md p-2',
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
              </View>

              <View className='flex flex-row'>
                <View className='w-[30%] pb-32 pt-4 flex bg-zinc-100 items-center'>
                  {/* <View className='w-14 h-0.5 bg-zinc-300' /> */}
                </View>
                <View className='w-[90%] pb-2 pt-4 items-start ml-4'>
                  {/* <View className='w-[67%] h-0.5 bg-zinc-300' /> */}
                </View>
              </View>

            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal animationType='fade' transparent visible={isAlertModalVisible} onRequestClose={() => setIsAlertModalVisible(false)}>
        <Pressable className='flex-1 bg-black/50 flex items-center justify-center' onPress={() => setIsEditModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ height: '76%', width: '95%' }} className='bg-white flex rounded-2xl overflow-hidden'>
            <AlertForm setIsModalVisible={() => setIsAlertModalVisible(false)} device={device} />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal animationType='fade' transparent visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)}>
        <Pressable className='flex-1 bg-black/50 flex items-center justify-center' onPress={() => setIsEditModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ height: '85%', width: '95%' }} className='bg-white flex rounded-2xl overflow-hidden'>
            <DeviceForm device={device} setIsModalVisible={() => setIsEditModalVisible(false)} />
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmationDialog onConfirm={handleDeleteDevice} title='Deseja realmente excluir o dispositivo?' description='Essa ação não pode ser desfeita. Isso excluirá permanentemente o dispositivo e removerá seus dados de nossos servidores.' isModalVisible={isConfirmModalVisible} setIsModalVisible={() => setIsConfirmModalVisible(false)} />
    </>
  )
}

const DevicesTable = () => {
   const [devices, setDevices] = useState<DeviceProps[]>([])
   const [isLoading, setIsLoading] = useState(true)

  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      fetchDevices();
      setIsLoading(false);
    }, 2000);
  }, []);

  async function fetchDevices() {
    const user = await account.get()
   //  const { data, loading: isLoading, error: devicesErro } = useFetch(() => listDevices({ userId: user.$id, limit: 100, page: 1}));
   const devices = await listDevices({ userId: user.$id, limit: 100, page: 1})
   
   setDevices(devices)

   setIsLoading(false)
 }

  useEffect(() => {
    fetchDevices()
  }, [])

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      <View className='bg-zinc-100/50 border border-zinc-200 w-full h-fit gap-2 rounded-xl flex'>
        <View className='bg-zinc-200/70 w-full h-10 flex flex-row items-center rounded-t-xl pr-5 pl-3'>
          <View className='w-full max-w-[13.5rem]'>
            <Text>Modelo</Text>
          </View>
          <View className='w-[7.4rem] sm:w-[7.6rem] md:w-[8.6rem]'>
            <Text>Status</Text>
          </View>
          <View className='w-fit'>
            <Text>Ação</Text>
          </View>
        </View>

        <View className='pb-2 px-1 gap-2'>
          {
            isLoading ? (
              <ActivityIndicator 
                size='large'
                color={'#0000ff'}
                className="mt-0 self-center"
              />
            ) : (
              <>
                <FlatList 
                  data={devices}
                  renderItem={({ item }) => <DeviceRow device={item} onRefresh={onRefresh} />}
                  keyExtractor={item => item.$id?.toString() || ''}
                  className="mt-2"
                  contentContainerStyle={{ gap: 4 }}
                  scrollEnabled={false}
                />
              </>
            )
          }

          <Button variant='blue' onPress={() => router.push('/add-new')} className='self-end'>Cadastrar dispositivo</Button>
        </View>
      </View>
    </ScrollView>
  )
}
export default DevicesTable