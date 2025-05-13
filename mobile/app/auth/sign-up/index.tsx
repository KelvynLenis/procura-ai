import InputField from '@/components/InputField';
import { images } from '@/contants/images'
import { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import { Lock, Mail } from 'lucide-react-native'
import Button from '@/components/Button';
import { Link, router } from 'expo-router';

export default function signUp() {
  
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });

  function onSignUp() {
    router.push('/auth/login')
  }


  return (
    <ScrollView className="flex-1 bg-neutral-50" showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: '100%', paddingBottom: 40 }}>
      <View className="px-5 bg-white shadow-lg pt-2">
        <Image source={images.headerLogo} />
      </View>

      <View className='flex-1 flex-col items-center p-6 gap-5'>
        <Text>Para se cadastrar, preencha as informações a seguir:</Text>

        <InputField
          label="Nome completo"
          placeholder="Nome completo"
          // icon={<Mail size={20} color="gray" />}
          textContentType="name"
          value={form.name}
          onChangeText={(value) => setForm({ ...form, name: value })}
        />

        <InputField
          label="CPF"
          placeholder="Digite seu CPF"
          // icon={<Mail size={20} color="gray" />}
          textContentType="none"
          value={form.cpf}
          onChangeText={(value) => setForm({ ...form, cpf: value })}
        />

        <InputField
          label="e-mail"
          placeholder="Email"
          // icon={<Mail size={20} color="gray" />}
          textContentType="emailAddress"
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
        />

        <InputField
          label="Confirmar e-mail"
          placeholder="Confirmar e-mail"
          // icon={<Mail size={20} color="gray" />}
          textContentType="emailAddress"
          value={form.confirmEmail}
          onChangeText={(value) => setForm({ ...form, confirmEmail: value })}
        />

        <InputField
          label="Senha"
          placeholder="Digite sua senha"
          // icon={<Lock size={20} color="gray" />}
          secureTextEntry={true}
          textContentType="password"
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
        />

        <InputField
          label="Confirmar Senha"
          placeholder="Confirmar senha"
          // icon={<Lock size={20} color="gray" />}
          secureTextEntry={true}
          textContentType="password"
          value={form.confirmPassword}
          onChangeText={(value) => setForm({ ...form, confirmPassword: value })}
        />

        <Button variant='blue' onPress={onSignUp}>
          Criar conta
        </Button>

        <View className='w-10/12 h-[1.5px] bg-primary' />

        <View className='flex flex-row justify-center'>
          <Text>
            Já possui conta?{' '}
            <Link href={'/auth/login'}>
              <Text>
                Faça login
              </Text>
            </Link>
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}