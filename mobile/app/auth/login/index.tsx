import InputField from '@/components/InputField';
import { images } from '@/contants/images'
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native'
import { Lock, Mail } from 'lucide-react-native'
import Button from '@/components/Button';
import { router } from 'expo-router';
import { login } from '@/services/auth/login';
import { account } from '@/lib/appwrite';

export default function signIn() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const sessions = await account.get()
        if (sessions.status) {
          // await account.deleteSession('current')
          // console.log('Sessão anterior removida com sucesso')
          // console.log('Sessão anterior:', sessions)
          router.push('/my-devices')
        }
      } catch (error: any) {
        console.log('Erro ao verificar sessão:', error?.message)
      }
    }

    getSession()
  }, [])

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      console.log('Iniciando login com:', { email: form.email });
      setIsLoading(true);
      
      const response = await login(form.email, form.password);
      console.log('Resposta do login:', response);
      
      if (response.userStatus === 'blocked') {
        Alert.alert('Erro', 'Sua conta está bloqueada. Entre em contato com o suporte.');
        return;
      }

      router.replace('/my-devices');
    } catch (error: any) {
      console.log('Erro no login:', error);
      console.log('Detalhes do erro:', {
        message: error?.message,
        code: error?.code,
        type: error?.type,
        response: error?.response
      });
      // Alert.alert('Erro', 'Email ou senha inválidos');
      Alert.alert('Erro', error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-neutral-50" showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: '100%', paddingBottom: 40 }}>
      <View className="px-5 bg-white shadow-lg pt-2">
        <Image source={images.headerLogo} />
      </View>

      <View className='flex-1 flex-col items-center p-6 gap-5'>
        <Text>Para acessar o Procura.Aí faça login abaixo:</Text>

        <InputField
          label="Email"
          placeholder="Digite seu email"
          icon={<Mail size={20} color="gray" />}
          textContentType="emailAddress"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
        />

        <InputField
          label="Senha"
          placeholder="Digite sua senha"
          icon={<Lock size={20} color="gray" />}
          secureTextEntry={true}
          textContentType="password"
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
        />

        <Text className='underline self-start ml-16'>
          Esqueci minha senha
        </Text>

        <Button 
          variant='blue' 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>

        <View className='w-[90%] h-[1.5px] bg-primary' />

        <Text>
          Não possui conta?
        </Text>
        
        <Button variant='white' onPress={() => router.push('/auth/sign-up')}>
          Cadastre-se
        </Button>
      </View>
    </ScrollView>
  )
}