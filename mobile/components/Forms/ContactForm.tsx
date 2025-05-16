import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import InputField from '../InputField'
import Button from '../Button';
import { router } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';

interface ContactFormProps {
  setIsModalVisible?: React.Dispatch<React.SetStateAction<boolean>>
}

const ContactForm = ({ setIsModalVisible }: ContactFormProps) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
  });

  function onSignUp() {
    router.push('/auth/login')
  }
  
  return (
    <View className='flex-col items-start p-6 gap-2 bg-white shadow-black shadow-md rounded-xl w-full'>
      <InputField
        label="Nome"
        placeholder="nome completo"
        required
        containerStyle='rounded-md border-0 bg-zinc-100 w-full'
        textContentType="none"
        value={form.name}
        onChangeText={(value) => setForm({ ...form, name: value })}
      />

      <InputField
        label="Email"
        placeholder="email"
        required
        containerStyle='rounded-md border-0 bg-zinc-100 w-full'
        textContentType="none"
        value={form.email}
        onChangeText={(value) => setForm({ ...form, email: value })}
      />

      <InputField
        label="Número de telefone"
        placeholder="Número de telefone"
        containerStyle='rounded-md border-0 bg-zinc-100 w-full'
        textContentType="none"
        value={form.number}
        onChangeText={(value) => setForm({ ...form, number: value })}
      />

      <View className='flex flex-row w-full' style={{ justifyContent: 'space-between' }}>
        <Button variant='blue'>
          Adicionar contato
        </Button>
        <Button variant='red' onPress={setIsModalVisible ? () => setIsModalVisible(false) : () => console.log('cancelar')}>
          Cancelar
        </Button>
      </View>
    </View>
  )
}

export default ContactForm