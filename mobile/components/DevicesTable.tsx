import { View, Text, TouchableOpacity, Modal, Pressable, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Eye, Pencil, Trash2, TriangleAlert } from 'lucide-react-native'
import { router } from 'expo-router';
import ConfirmationDialog from './ConfirmationDialog';
import DeviceForm from './Forms/DeviceForm';
import AlertForm from './Forms/AlertForm';
import Button from './Button';
import { DeviceProps } from '@/interfaces';
import { account } from '@/lib/appwrite';
import { listDevices } from '@/services/device/list-devices';
import useFetch from '@/lib/useFetch';

const DeviceRow = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);

  return (
    <>
      <View className='bg-white w-full h-14 flex flex-row gap-2 items-center rounded-lg px-2 border border-zinc-300'>
        <View className='w-[45%]'>
          <Text>Galaxy A54</Text>
        </View>
        <View className='w-[25%] mr-5'>
          <View className='bg-red-100 w-28 items-center justify-center rounded-md p-2'>
            <Text className='text-red-600'>Roubado</Text>
          </View>
        </View>
          <View className='flex flex-row gap-2 w-[20%]'> 
            <TouchableOpacity onPress={() => setIsAlertModalVisible(true)} className='bg-red-500 flex items-center justify-center w-9 h-9 rounded-md'>
              <TriangleAlert size={28} color='red' fill={'white'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsModalVisible(true)} className='bg-white border border-zinc-400 flex items-center justify-center w-9 h-9 rounded-md'>
              <Eye size={24} color='black' />
            </TouchableOpacity>
          </View>
      </View>

      <Modal animationType='fade' transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <Pressable className='flex-1 bg-black/50 flex items-center justify-center' onPress={() => setIsModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} className='bg-white w-[90%] h-80 flex rounded-2xl overflow-hidden'>
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
            <View className='flex flex-row w-full h-full'>
              <View className='flex items-start px-6 gap-5 pt-4 w-[30%] bg-zinc-100 h-full'>
                <Text>Modelo</Text>
                <View className='w-14 h-0.5 bg-zinc-300' />
                <Text>Fabricante</Text>
                <View className='w-14 h-0.5 bg-zinc-300' />
                <Text>IMEI</Text>
                <View className='w-14 h-0.5 bg-zinc-300' />
                <Text className='mt-2'>Status</Text>
              </View>
              <View className='flex items-start px-6 gap-5 pt-4 w-full h-full'>
                <Text className='font-semibold'>Modelo</Text>
                <View className='w-[67%] h-0.5 bg-zinc-300' />
                <Text className='font-semibold'>Fabricante</Text>
                <View className='w-[67%] h-0.5 bg-zinc-300' />
                <Text className='font-semibold'>IMEI</Text>
                <View className='w-[67%] h-0.5 bg-zinc-300' />
                <Text className='font-semibold'>
                  <View className='bg-red-100 w-28 items-center justify-center rounded-md p-2'>
                    <Text className='text-red-600'>Roubado</Text>
                  </View>
                </Text>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal animationType='fade' transparent visible={isAlertModalVisible} onRequestClose={() => setIsAlertModalVisible(false)}>
        <Pressable className='flex-1 bg-black/50 flex items-center justify-center' onPress={() => setIsEditModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ height: '76%', width: '95%' }} className='bg-white flex rounded-2xl overflow-hidden'>
            <AlertForm setIsModalVisible={() => setIsAlertModalVisible(false)} />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal animationType='fade' transparent visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)}>
        <Pressable className='flex-1 bg-black/50 flex items-center justify-center' onPress={() => setIsEditModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ height: '85%', width: '95%' }} className='bg-white flex rounded-2xl overflow-hidden'>
            <DeviceForm setIsModalVisible={() => setIsEditModalVisible(false)} />
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmationDialog onConfirm={() => setIsConfirmModalVisible(false)} title='Deseja realmente excluir o dispositivo?' description='Essa ação não pode ser desfeita. Isso excluirá permanentemente o dispositivo e removerá seus dados de nossos servidores.' isModalVisible={isConfirmModalVisible} setIsModalVisible={() => setIsConfirmModalVisible(false)} />
    </>
  )
}

const DevicesTable = () => {
   const [devices, setDevices] = useState<DeviceProps[]>([])
   const [isLoading, setIsLoading] = useState(true)

   useEffect(() => {
     async function fetchDevices() {
       const user = await account.get()
      //  const { data, loading: isLoading, error: devicesErro } = useFetch(() => listDevices({ userId: user.$id, limit: 100, page: 1}));
      const devices = await listDevices({ userId: user.$id, limit: 100, page: 1})
      
      setDevices(devices)

      console.log(devices)

      setIsLoading(false)
    }

    fetchDevices()
  }, [])

  return (
    <View className='bg-zinc-100/50 border border-zinc-200 w-full h-fit gap-2 rounded-xl'>
      <View className='bg-zinc-200/70 w-full h-10 flex flex-row items-center rounded-t-xl pr-5 pl-3'>
        <View className='w-[49%]'>
          <Text>Modelo</Text>
        </View>
        <View className='w-[31.5%]'>
          <Text>Status</Text>
        </View>
        <View className='w-[10%]'>
          <Text>Ação</Text>
        </View>
      </View>

      <View className='pb-2 px-1 gap-2'>
        {/* {
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
                renderItem={({ item }) => <DeviceRow />}
                keyExtractor={item => item.$id?.toString() || ''}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'flex-start', gap: 20, paddingRight: 5, marginBottom: 10 }}
                className="mt-2 pb-32"
                scrollEnabled={false}
              />
            </>
          )
        } */}

        <DeviceRow />
        <Button variant='blue' onPress={() => router.push('/add-new')} className='self-end'>Cadastrar dispositivo</Button>
      </View>
    </View>
  )
}
export default DevicesTable