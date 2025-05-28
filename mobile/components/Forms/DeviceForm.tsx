import { View, Text, ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import InputField from '../InputField'
import Button from '../Button';
import { router } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import MaskInput from 'react-native-mask-input';
import { CreateDevice } from '@/interfaces';
import CreateDeviceSchema from '@/interfaces/createDeviceSchema';
import { ID } from 'react-native-appwrite';
import { createDevice } from '@/services/device/create-device';
import { z } from 'zod';
import { updateDevice } from '@/services/device/update-device';

interface DeviceFormProps {
  setIsModalVisible?: React.Dispatch<React.SetStateAction<boolean>>
  Device?: CreateDevice
}

interface ImeiCheckResponse {
  status: string
  result: string
  imei: string
  count_free_checks_today: number
  readPerformance: string
  object: {
    brand: string
    name: string
    model: string
  }
}

interface ImeiValidationResult {
  isValid: boolean
  brand?: string
  model?: string
  name?: string
  error?: string
}

const DeviceForm = ({ setIsModalVisible, Device }: DeviceFormProps) => {
  const [form, setForm] = useState({
    imei: Device?.imei || "",
    phone_model: Device?.phone_model || "",
    brand: Device?.brand || "",
    phone_number: Device?.phone_number || "",
    operator_id: Device?.operator_id || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateDevice, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingImei, setIsValidatingImei] = useState(false)
  const [imeiError, setImeiError] = useState<string | null>(null)


  async function validateImeiAndGetDetails(imei: string): Promise<ImeiValidationResult> {
    try {
      // Remove any spaces or formatting from IMEI
      const cleanImei = imei.replace(/\s/g, '')
      
      if (cleanImei.length !== 15) {
        return {
          isValid: false,
          error: 'IMEI deve ter exatamente 15 dígitos'
        }
      }

      const response = await fetch(
        `https://alpha.imeicheck.com/api/modelBrandName?imei=${cleanImei}&format=json`
      )

      if (!response.ok) {
        return {
          isValid: false,
          error: 'Não foi possível validar o IMEI no momento. Tente novamente mais tarde.'
        }
      }

      const data: ImeiCheckResponse = await response.json()

      if (data.status !== 'succes') {
        return {
          isValid: false,
          error: 'IMEI inválido ou não encontrado'
        }
      }

      return {
        isValid: true,
        brand: data.object.brand,
        model: data.object.model,
        name: data.object.name
      }
    } catch (error) {
      console.error('Erro ao validar IMEI:', error)
      return {
        isValid: false,
        error: 'Erro de conexão. Verifique sua internet e tente novamente.'
      }
    }
  }

 const handleImeiValidation = async (imei: string) => {
    // Remove any formatting and check if it's exactly 15 digits
    const cleanImei = imei.replace(/\s/g, '')
    
    if (cleanImei.length === 15 && /^\d{15}$/.test(cleanImei)) {
      setIsValidatingImei(true)
      setImeiError(null)
      try {
        const result = await validateImeiAndGetDetails(cleanImei)
        
        if (result.isValid && result.brand && (result.model || result.name)) {
          // Auto-complete the form fields
          setForm(prev => ({
            ...prev,
            brand: result.brand || prev.brand,
            phone_model: result.name || result.model || prev.phone_model
          }))
          
          // Show success message
          // Alert.alert(
          //   'IMEI Validado',
          //   'Informações do dispositivo foram preenchidas automaticamente.',
          //   [{ text: 'OK' }]
          // )
        } else {
          setImeiError(result.error || 'Não foi possível validar o IMEI')
        }
      } catch (error) {
        setImeiError('Erro ao validar IMEI. Tente novamente.')
      } finally {
        setIsValidatingImei(false)
      }
      
    } else if (cleanImei.length > 15) {
      setImeiError('IMEI deve ter exatamente 15 dígitos')
    } else {
      setImeiError(null)
    }
  }

  const handleFieldChange = (field: keyof CreateDevice, value: string) => {
      setForm(prev => ({ ...prev, [field]: value }));
      console.log(`Campo ${field} alterado para: ${value}`);
      console.log(value.length)

      if (field === 'imei' && value.length === 15) {
        console.log('Validando IMEI...');
        handleImeiValidation(value);
      }
      // Limpa o erro do campo quando o usuário começa a digitar
      setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  async function onSubmit() {
    try {
      // Fecha o teclado antes de validar
      Keyboard.dismiss();
      setIsLoading(true);
      
      // Validação do formulário
      await CreateDeviceSchema.parseAsync(form);
      setErrors({});

      console.log('Iniciando criação de usuário:', { 
        imei: form.imei,
        phone_model: form.phone_model,
        brand: form.brand,
        phone_number: form.phone_number,
        operator_id: form.operator_id
      });

      const deviceId = ID.unique();
      const deviceData = {
        imei: form.imei,
        phone_model: form.phone_model,
        brand: form.brand,
        phone_number: form.phone_number,
        operator_id: form.operator_id
      };

      console.log('Dados do dispositivo:', deviceData);

      if (Device) {
        await updateDevice(Device.$id!, deviceData);
        Alert.alert('Sucesso', 'Dispositivo atualizado com sucesso!');

        setIsModalVisible && setIsModalVisible(false);
        return
      }

      const response = await createDevice(deviceId, deviceData);

      console.log('Resposta da criação:', response);

      Alert.alert('Sucesso', 'Dispositivo criado com sucesso!');
      router.push('/my-devices');
    } catch (error) {
      console.log('Erro ao criar usuário:', error);
      
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof CreateDevice, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof CreateDevice] = err.message;
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
        Alert.alert('Erro', 'Não foi possível criar o dispositivo. Tente novamente.');
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: '100%', paddingBottom: 450 }}>
        <View className='flex-col items-start p-6 gap-5 bg-white shadow-black shadow-md rounded-xl w-full'>
          <Text>Insira os dados abaixo:</Text>
          <View className='w-full h-0.5 bg-zinc-200' />

          <View className="w-full mb-2 gap-2">
            <Text className="text-lg ml-1">
              <Text className="text-red-500">*</Text>
              IMEI
            </Text>
            <View className='rounded-md border-0 bg-zinc-100 px-4'>
              <MaskInput
                value={form.imei}
                onChangeText={(masked, unmasked) => handleFieldChange('imei', unmasked)}
                mask={[/\d/, ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/ ]}
                keyboardType="numeric"
                placeholder="Digite o IMEI"
                className="rounded-md p-4 text-[15px] flex-1 text-justify"
              />
            </View>
            {errors.imei && (
              <Text className="text-red-500 text-sm mt-1 ml-4">{errors.imei}</Text>
            )}
          </View>

          <View className='w-full rounded-lg px-5 py-2 flex flex-row' style={{ backgroundColor: 'rgba(216,169,18,0.3)' }}>
            <Text className='flex flex-row items-end gap-2'>
            <CircleAlert size={15} color='black' />{' '}
              O IMEI é composto por 15 números e pode ser encontrado na embalagem do aparelho ou digitando *#06# no teclado do aparelho.
            </Text>
          </View>

          <InputField
            label="Modelo"
            placeholder="Modelo"
            // icon={<Mail size={20} color="gray" />}
            containerStyle='rounded-md border-0 bg-zinc-100 w-full'
            textContentType="none"
            value={form.phone_model}
            onChangeText={(value) => setForm({ ...form, phone_model: value })}
          />

          <InputField
            label="Fabricante"
            placeholder="Fabricante"
            containerStyle='rounded-md border-0 bg-zinc-100 w-full'
            textContentType="none"
            value={form.brand}
            onChangeText={(value) => setForm({ ...form, brand: value })}
          />

          <View className="w-full mb-2 gap-2">
            <Text className="text-lg ml-1">
              {/* <Text className="text-red-500">*</Text> */}
              Número do celular
            </Text>
            <View className='rounded-md border-0 bg-zinc-100 px-4'>
              <MaskInput
                value={form.phone_number}
                onChangeText={(masked, unmasked) => handleFieldChange('phone_number', unmasked)}
                mask={['(', /\d/, /\d/, ')', /\d/, ' ',  /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/]}
                keyboardType="numeric"
                placeholder="Digite o IMEI"
                className="rounded-md p-4 text-[15px] flex-1 text-justify"
              />
            </View>
            {errors.phone_number && (
              <Text className="text-red-500 text-sm mt-1 ml-4">{errors.phone_number}</Text>
            )}
          </View>

          <InputField
            label="Operadora"
            placeholder="Operadora"
            containerStyle='rounded-md border-0 bg-zinc-100 w-full'
            textContentType="none"
            value={form.operator_id}
            onChangeText={(value) => setForm({ ...form, operator_id: value })}
          />

          <View className='flex flex-row w-full' style={{ justifyContent: 'space-between' }}>
            <Button variant='blue' onPress={onSubmit}>
              Criar conta
            </Button>
            <Button variant='red' onPress={setIsModalVisible ? () => setIsModalVisible(false) : () => console.log('cancelar')}>
              Cancelar
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default DeviceForm