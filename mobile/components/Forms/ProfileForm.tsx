import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import InputField from '../InputField'
import Button from '../Button';
import { router } from 'expo-router';
import { Pencil, Upload } from 'lucide-react-native';

interface ProfileFormProps {
  setIsModalVisible?: React.Dispatch<React.SetStateAction<boolean>>
}

const ProfileForm = ({ setIsModalVisible }: ProfileFormProps) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    cpf: "",
    imgURL: "",
  });

  function onSignUp() {
    router.push('/auth/login')
  }
  
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: '100%', paddingBottom: 40 }}>
      <View className='flex-col items-start p-6 gap-5 bg-white shadow-black shadow-md rounded-xl w-full'>
        <View className='flex flex-row gap-3'>
          <View className='w-24 h-24 rounded-full bg-zinc-300'></View>
          <View>
            <View className='flex flex-row'>
              <TouchableOpacity className='flex flex-row gap-2 bg-zinc-100 p-2 rounded-md border border-zinc-400 items-center'>
                <Upload size={24} color='black' />
                <Text>Selecionar imagem</Text>
              </TouchableOpacity>
              <TouchableOpacity className='flex w-24 justify-center flex-row gap-2 bg-zinc-100 p-2 rounded-md border border-zinc-400 items-center'>
                <Text>Remover</Text>
              </TouchableOpacity>
            </View>
            <Text className='w-80'>* São suportadas imagens nos formatos .png .jpg de até 50 mb</Text>
          </View>
        </View>

        <InputField
          label="Nome"
          placeholder="Nome"
          icon={<Pencil size={20} color="gray" className='right-0 absolute' />}
          iconEnd
          containerStyle='rounded-md border-0 bg-zinc-100 w-full'
          textContentType="name"
          value={form.name}
          onChangeText={(value) => setForm({ ...form, name: value })}
        />

        <InputField
          label="E-mail"
          placeholder="E-mail"
          icon={<Pencil size={20} color="gray" className='right-0 absolute' />}
          iconEnd
          containerStyle='rounded-md border-0 bg-zinc-100 w-full'
          textContentType="emailAddress"
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
        />

        <InputField
          label="CPF"
          placeholder="CPF"
          containerStyle='rounded-md border-0 bg-zinc-100'
          textContentType="none"
          value={form.cpf}
          onChangeText={(value) => setForm({ ...form, cpf: value })}
        />

        <View className='flex flex-row w-full' style={{ justifyContent: 'space-between' }}>
          <Button variant='blue'>
            Salvar
          </Button>
          <Button variant='red' onPress={setIsModalVisible ? () => setIsModalVisible(false) : () => console.log('cancelar')}>
            Cancelar
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}

export default ProfileForm