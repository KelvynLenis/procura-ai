import InputField from '@/components/InputField';
import { images } from '@/contants/images'
import { useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native'
import { Lock, Mail } from 'lucide-react-native'
import Button from '@/components/Button';
import { router } from 'expo-router';

export default function signIn() {
  
  const [form, setForm] = useState({
    email: "",
    password: "",
  });


  return (
    <ScrollView className="flex-1 bg-neutral-50" showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: '100%', paddingBottom: 40 }}>
      <View className="px-5 bg-white shadow-lg pt-2">
        <Image source={images.headerLogo} />
      </View>

      <View className='flex-1 flex-col items-center p-6 gap-5'>
        <Text>Para acessar o Procura.Aí faça login abaixo:</Text>

        <InputField
            label="Email"
            placeholder="Enter email"
            icon={<Mail size={20} color="gray" />}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />

          <InputField
            label="Senha"
            placeholder="Enter password"
            icon={<Lock size={20} color="gray" />}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          <Text className='underline self-start ml-16'>
            Esqueci minha senha
          </Text>
          <Button variant='blue' onPress={() => router.push('/meus-dispositivos')}>
            Entrar
          </Button>

          <View className='w-10/12 h-[1.5px] bg-primary' />

          <Text>
            Não possui conta?
          </Text>
          <Button variant='white'>
            Cadastre-se
          </Button>
      </View>


    </ScrollView>
  )
}