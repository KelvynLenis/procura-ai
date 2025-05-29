import InputField from '@/components/InputField';
import { images } from '@/contants/images'
import { useState } from 'react';
import { View, Text, ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native'
import Button from '@/components/Button';
import { Link, router } from 'expo-router';
import { createUser } from '@/functions/user/create-user';
import { ID } from '@/lib/appwrite';
import { z } from 'zod';
import MaskInput from 'react-native-mask-input';
import { CreateUserFormData } from '@/interfaces';
import { createUserSchema } from '@/interfaces/user';

export default function signUp() {
  const [form, setForm] = useState<CreateUserFormData>({
    name: "",
    cpf: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleFieldChange = (field: keyof CreateUserFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Limpa o erro do campo quando o usuário começa a digitar
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  async function onSignUp() {
    try {
      // Fecha o teclado antes de validar
      Keyboard.dismiss();
      setIsLoading(true);
      
      // Validação do formulário
      await createUserSchema.parseAsync(form);
      setErrors({});

      console.log('Iniciando criação de usuário:', { 
        email: form.email,
        name: form.name,
        cpf: form.cpf 
      });

      const userId = ID.unique();
      const userData = {
        userId,
        name: form.name,
        cpf: form.cpf.replace(/\D/g, ''), // Remove caracteres não numéricos
        email: form.email,
        password: form.password,
      };

      console.log('Dados do usuário:', userData);

      const response = await createUser(userData);
      console.log('Resposta da criação:', response);

      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.');
      router.push('/auth/login');
    } catch (error) {
      console.log('Erro ao criar usuário:', error);
      
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof CreateUserFormData, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof CreateUserFormData] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        const errorObj = error as { message?: string; code?: string; type?: string; response?: any };
        console.log('Detalhes do erro:', {
          message: errorObj?.message,
          code: errorObj?.code,
          type: errorObj?.type,
          response: errorObj?.response
        });

        if (errorObj?.message?.includes('email')) {
          Alert.alert('Erro', 'Este email já está em uso. Tente outro email.');
        } else {
          Alert.alert('Erro', 'Não foi possível criar sua conta. Tente novamente.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-neutral-50"
    >
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: 40 
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="px-5 bg-white shadow-lg pt-2">
          <Image source={images.headerLogo} />
        </View>

        <View className='flex-1 flex-col items-center p-6 gap-8'>
          <Text className="text-lg text-center mb-2">Para se cadastrar, preencha as informações a seguir:</Text>

          <InputField
            label="Nome completo"
            placeholder="Nome completo"
            textContentType="name"
            value={form.name}
            onChangeText={(value) => handleFieldChange('name', value)}
            error={errors.name}
            containerStyle="w-full mb-2"
          />

          <View className="w-full mb-2">
            <Text className="text-lg mb-3 ml-4">CPF</Text>
            <View className="w-full px-4 flex flex-row justify-start shadow-xl items-center relative bg-white rounded-full border border-primary">
              <MaskInput
                value={form.cpf}
                onChangeText={(masked, unmasked) => handleFieldChange('cpf', unmasked)}
                mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
                keyboardType="numeric"
                placeholder="Digite seu CPF"
                className="rounded-full p-4 text-[15px] flex-1 text-justify"
              />
            </View>
            {errors.cpf && (
              <Text className="text-red-500 text-sm mt-1 ml-4">{errors.cpf}</Text>
            )}
          </View>

          <InputField
            label="e-mail"
            placeholder="Email"
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(value) => handleFieldChange('email', value)}
            error={errors.email}
            containerStyle="w-full mb-2"
          />

          <InputField
            label="Confirmar e-mail"
            placeholder="Confirmar e-mail"
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.confirmEmail}
            onChangeText={(value) => handleFieldChange('confirmEmail', value)}
            error={errors.confirmEmail}
            containerStyle="w-full mb-2"
          />

          <InputField
            label="Senha"
            placeholder="Digite sua senha"
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => handleFieldChange('password', value)}
            error={errors.password}
            containerStyle="w-full mb-2"
          />

          <InputField
            label="Confirmar Senha"
            placeholder="Confirmar senha"
            secureTextEntry={true}
            textContentType="password"
            value={form.confirmPassword}
            onChangeText={(value) => handleFieldChange('confirmPassword', value)}
            error={errors.confirmPassword}
            containerStyle="w-full mb-4"
          />

          <Button 
            variant='blue' 
            onPress={onSignUp}
            disabled={isLoading}
            className="w-full mb-4"
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </Button>

          <View className='w-10/12 h-[1.5px] bg-primary mb-4' />

          <View className='flex flex-row justify-center mb-4'>
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
    </KeyboardAvoidingView>
  )
}