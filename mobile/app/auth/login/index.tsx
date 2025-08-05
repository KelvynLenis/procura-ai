import InputField from '@/components/InputField';
import { images } from '@/contants/images'
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native'
import { Lock, Mail } from 'lucide-react-native'
import Button from '@/components/Button';
import { router } from 'expo-router';
import { login } from '@/functions/auth/login';
import { account } from '@/lib/appwrite';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

export default function signIn() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
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

  const validateForm = () => {
    try {
      formSchema.parse(form);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'email') {
            newErrors.email = err.message;
          } else if (err.path[0] === 'password') {
            newErrors.password = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) {
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

      if (error.message?.match(/password/)) {
        setErrors({
          email: 'Email ou senha incorretos',
          password: 'Email ou senha incorretos'
        });
        // Alert.alert('Erro', 'Email ou senha incorretos');
        return;
      }

      // Alert.alert('Erro', error?.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-neutral-50" showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: '100%', paddingBottom: 40 }}>
      <View className="px-5 bg-primary shadow-lg pt-2">
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
          onChangeText={(value) => {
            setForm({ ...form, email: value });
            setErrors({ ...errors, email: undefined });
          }}
          error={errors.email}
        />

        <InputField
          label="Senha"
          placeholder="Digite sua senha"
          icon={<Lock size={20} color="gray" />}
          secureTextEntry={true}
          textContentType="password"
          value={form.password}
          onChangeText={(value) => {
            setForm({ ...form, password: value });
            setErrors({ ...errors, password: undefined });
          }}
          error={errors.password}
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
        
        <Button variant='black' onPress={() => router.push('/auth/sign-up')}>
          Cadastre-se
        </Button>
      </View>
    </ScrollView>
  )
}