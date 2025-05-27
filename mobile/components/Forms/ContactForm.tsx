import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native'
import React, { useState, useEffect } from 'react'
import InputField from '../InputField'
import Button from '../Button';
import { router } from 'expo-router';
import { z } from 'zod';
import { createContact } from '@/services/contact/create-contact';
import { updateContact } from '@/services/contact/update-contact';
import type { Contact } from '@/services/contact/list-contacts';
import MaskInput from 'react-native-mask-input';

interface ContactFormProps {
  setIsModalVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;
  initialData?: Contact | null;
}

const contactSchema = z.object({
  name_contact: z.string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  email_contact: z.string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido')
    .max(100, 'E-mail deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de e-mail inválido'),
  number_contact: z.string()
    .min(1, 'Número de telefone é obrigatório')
    .length(11, 'Número deve ter 11 dígitos')
    .regex(/^\d{11}$/, 'Apenas números são permitidos'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactForm = ({ setIsModalVisible, onSuccess, initialData }: ContactFormProps) => {
  const [form, setForm] = useState<ContactFormData>({
    name_contact: "",
    email_contact: "",
    number_contact: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name_contact: initialData.name_contact,
        email_contact: initialData.email_contact,
        number_contact: initialData.number_contact,
      });
    }
  }, [initialData]);

  const handleFieldChange = (field: keyof ContactFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Limpa o erro do campo quando o usuário começa a digitar
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  async function handleSubmit() {
    try {
      // Fecha o teclado antes de validar
      Keyboard.dismiss();
      setIsLoading(true);

      // Validação do formulário
      await contactSchema.parseAsync(form);
      setErrors({});

      if (initialData) {
        await updateContact({
          id: initialData.$id,
          values: {
            name_contact: form.name_contact,
            email_contact: form.email_contact,
            number_contact: form.number_contact,
          }
        });
        Alert.alert('Sucesso', 'Contato atualizado com sucesso!');
      } else {
        await createContact({
          values: {
            name_contact: form.name_contact,
            email_contact: form.email_contact,
            number_contact: form.number_contact,
          }
        });
        Alert.alert('Sucesso', 'Contato adicionado com sucesso!');
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (setIsModalVisible) {
        setIsModalVisible(false);
      }
    } catch (error) {
      console.log('Erro ao manipular contato:', error);
      
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof ContactFormData] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        Alert.alert('Erro', 'Não foi possível editar o contato. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className='flex-col items-start p-6 gap-4 bg-white shadow-black shadow-md rounded-xl w-full'>
          <Text className="text-lg font-bold mb-2">
            {initialData ? 'Editar contato' : 'Cadastrar contato'}
          </Text>
          <Text className="text-sm text-gray-600 mb-4">
            {initialData 
              ? 'Atualize as informações do seu contato de confiança.'
              : 'Adicione um contato de confiança para eventuais contatos de emergência.'}
          </Text>

          <InputField
            label="Nome"
            placeholder="Nome completo"
            required
            containerStyle='rounded-md border-0 bg-zinc-100 w-full'
            textContentType="name"
            value={form.name_contact}
            onChangeText={(value) => handleFieldChange('name_contact', value)}
            error={errors.name_contact}
            maxLength={50}
          />

          <InputField
            label="Email"
            placeholder="Email"
            required
            containerStyle='rounded-md border-0 bg-zinc-100 w-full'
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email_contact}
            onChangeText={(value) => handleFieldChange('email_contact', value)}
            error={errors.email_contact}
            maxLength={100}
          />

          <View className="w-full">
            <Text className="text-sm font-medium mb-1">
              Número de telefone <Text className="text-red-500">*</Text>
            </Text>
            <MaskInput
              value={form.number_contact}
              onChangeText={(masked, unmasked) => handleFieldChange('number_contact', unmasked)}
              mask={['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
              keyboardType="phone-pad"
              placeholder="(XX) XXXXX-XXXX"
              className="h-12 px-4 rounded-md bg-zinc-100 w-full"
            />
            {errors.number_contact && (
              <Text className="text-red-500 text-sm mt-1">{errors.number_contact}</Text>
            )}
          </View>

          <View className='flex flex-row w-full gap-4 mt-2'>
            <Button 
              variant='blue'
              onPress={handleSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading 
                ? (initialData ? 'Atualizando...' : 'Adicionando...') 
                : (initialData ? 'Atualizar contato' : 'Adicionar contato')}
            </Button>
            <Button 
              variant='red' 
              onPress={setIsModalVisible ? () => setIsModalVisible(false) : () => router.back()}
              className="flex-1"
            >
              Cancelar
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default ContactForm