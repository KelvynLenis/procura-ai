import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import InputField from '../InputField'
import Button from '../Button';
import { router } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';

interface DeviceFormProps {
  setIsModalVisible?: React.Dispatch<React.SetStateAction<boolean>>
}

const DeviceForm = ({ setIsModalVisible }: DeviceFormProps) => {
  const [form, setForm] = useState({
    imei: "",
    model: "",
    branch: "",
    number: "",
  });

  function onSignUp() {
    router.push('/auth/login')
  }
  
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: '100%', paddingBottom: 150 }}>
      <View className='flex-col items-start p-6 gap-5 bg-white shadow-black shadow-md rounded-xl w-full'>
        <Text>Insira os dados abaixo:</Text>
        <View className='w-full h-0.5 bg-zinc-200' />

        <InputField
          label="IMEI"
          placeholder="IMEI"
          required
          containerStyle='rounded-md border-0 bg-zinc-100'
          textContentType="none"
          value={form.imei}
          onChangeText={(value) => setForm({ ...form, imei: value })}
        />

        <View className='w-full rounded-lg px-5 py-2 flex flex-row' style={{ backgroundColor: 'rgba(216,169,18,0.3)' }}>
          <Text className='flex flex-row items-end gap-2'>
          <CircleAlert size={15} color='black' />{' '}
            O IMEI é composto por 15 números e pode ser encontrado na embalagem do aparelho ou digitando *#06# no teclado do aparelho.
          </Text>
        </View>

        <InputField
          label="Modelo"
          placeholder="Modelo"
          // icon={<Mail size={20} color="gray" />}
          containerStyle='rounded-md border-0 bg-zinc-100'
          textContentType="none"
          value={form.model}
          onChangeText={(value) => setForm({ ...form, model: value })}
        />

        <InputField
          label="Fabricante"
          placeholder="Fabricante"
          containerStyle='rounded-md border-0 bg-zinc-100'
          textContentType="none"
          value={form.branch}
          onChangeText={(value) => setForm({ ...form, branch: value })}
        />

        <InputField
          label="Número de celular"
          placeholder="Número de celular"
          containerStyle='rounded-md border-0 bg-zinc-100'
          textContentType="emailAddress"
          value={form.number}
          onChangeText={(value) => setForm({ ...form, number: value })}
        />

        <View className='flex flex-row w-full' style={{ justifyContent: 'space-between' }}>
          <Button variant='blue'>
            Criar conta
          </Button>
          <Button variant='red' onPress={setIsModalVisible ? () => setIsModalVisible(false) : () => console.log('cancelar')}>
            Cancelar
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}

export default DeviceForm