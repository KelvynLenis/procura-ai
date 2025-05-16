import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import InputField from '../InputField'
import Button from '../Button';
import { router } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';

interface AlertFormProps {
  setIsModalVisible?: React.Dispatch<React.SetStateAction<boolean>>
}

const AlertForm = ({ setIsModalVisible }: AlertFormProps) => {
  const [form, setForm] = useState({
    datetime: "",
    description: "",
    type: "",
    location: [0, 0],
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: '100%' }}>
      <View className='flex-col items-start p-6 gap-5 bg-white shadow-black shadow-md rounded-xl w-full'>
        <Text className='font-medium'>Preencha as informações:</Text>
        <View className='w-full h-0.5 bg-zinc-200' />

        <InputField
          label="Data e hora da ocorrência"
          required
          labelStyle='font-medium'
          placeholder="02/06/2024 - 12:00"
          containerStyle='rounded-md border-0 bg-zinc-100 w-full'
          textContentType="birthdate"
          value={form.datetime}
          onChangeText={(value) => setForm({ ...form, datetime: value })}
        />


        <InputField
          label="Descrição"
          labelStyle='font-medium'
          maxLength={250}
          numberOfLines={4}
          placeholder="Descreva em poucas palavras como aconteceu."
          containerStyle='rounded-md items-start border-0 bg-zinc-100 w-full h-40'
          inputStyle='h-40 break-words rounded-md'
          textContentType="none"
          value={form.description}
          onChangeText={(value) => setForm({ ...form, description: value })}
        />

        <InputField
          label="Tipo de ocorrência"
          labelStyle='font-medium'
          required
          placeholder="tipo"
          containerStyle='rounded-md border-0 bg-zinc-100 w-full'
          textContentType="none"
          value={form.type}
          onChangeText={(value) => setForm({ ...form, type: value })}
        />

        <View className='flex flex-row gap-2'>
          <Text style={{ color: 'red' }}>*</Text>
          <Text className='font-medium'>
            Clique no mapa para selecionar o local aproximado da  ocorrência
          </Text>
        </View>

        <View className='w-full h-80 bg-zinc-300'>
    
        </View>

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

export default AlertForm