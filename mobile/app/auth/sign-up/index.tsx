import InputField from '@/components/InputField';
import { images } from '@/contants/images'
import { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native'
import { Lock, Mail } from 'lucide-react-native'
import Button from '@/components/Button';
import { Link, router } from 'expo-router';
import { createUser } from '@/services/user/create-user';
import { ID } from '@/lib/appwrite';

export default function signUp() {
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!form.name || !form.cpf || !form.email || !form.confirmEmail || !form.password || !form.confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return false;
    }

    if (form.email !== form.confirmEmail) {
      Alert.alert('Erro', 'Os emails não coincidem');
      return false;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    if (form.password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  async function onSignUp() {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      console.log('Iniciando criação de usuário:', { 
        email: form.email,
        name: form.name,
        cpf: form.cpf 
      });

      const userId = ID.unique();
      const userData = {
        userId,
        name: form.name,
        cpf: form.cpf,
        email: form.email,
        password: form.password,
      };

      console.log('Dados do usuário:', userData);

      const response = await createUser(userData);
      console.log('Resposta da criação:', response);

      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.');
      router.push('/auth/login');
    } catch (error: any) {
      console.log('Erro ao criar usuário:', error);
      console.log('Detalhes do erro:', {
        message: error?.message,
        code: error?.code,
        type: error?.type,
        response: error?.response
      });

      if (error?.message?.includes('email')) {
        Alert.alert('Erro', 'Este email já está em uso. Tente outro email.');
      } else {
        Alert.alert('Erro', 'Não foi possível criar sua conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
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
          textContentType="name"
          value={form.name}
          onChangeText={(value) => setForm({ ...form, name: value })}
        />

        <InputField
          label="CPF"
          placeholder="Digite seu CPF"
          textContentType="none"
          keyboardType="numeric"
          value={form.cpf}
          onChangeText={(value) => setForm({ ...form, cpf: value })}
        />

        <InputField
          label="e-mail"
          placeholder="Email"
          textContentType="emailAddress"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
        />

        <InputField
          label="Confirmar e-mail"
          placeholder="Confirmar e-mail"
          textContentType="emailAddress"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.confirmEmail}
          onChangeText={(value) => setForm({ ...form, confirmEmail: value })}
        />

        <InputField
          label="Senha"
          placeholder="Digite sua senha"
          secureTextEntry={true}
          textContentType="password"
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
        />

        <InputField
          label="Confirmar Senha"
          placeholder="Confirmar senha"
          secureTextEntry={true}
          textContentType="password"
          value={form.confirmPassword}
          onChangeText={(value) => setForm({ ...form, confirmPassword: value })}
        />

        <Button 
          variant='blue' 
          onPress={onSignUp}
          disabled={isLoading}
        >
          {isLoading ? 'Criando conta...' : 'Criar conta'}
        </Button>

        <View className='w-10/12 h-[1.5px] bg-primary' />

        <View className='flex flex-row justify-center'>
          <Text>
            Já possui conta?{' '}
            <Link href={'/auth/login'}>
              <Text className='text-blue-500 underline'>
                Faça login
              </Text>
            </Link>
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}