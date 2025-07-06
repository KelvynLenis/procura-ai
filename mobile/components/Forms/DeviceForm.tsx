import { View, Text, ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, FlatList } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import InputField from '../InputField'
import Button from '../Button';
import { router } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import MaskInput from 'react-native-mask-input';
import { CreateDevice, DeviceProps, ImeiCheckResponse, ImeiValidationResult, Operator } from '@/interfaces';
import CreateDeviceSchema from '@/interfaces/createDeviceSchema';
import { ID } from 'react-native-appwrite';
import { createDevice } from '@/functions/device/create-device';
import { z } from 'zod';
import { updateDevice } from '@/functions/device/update-device';
import { listOperators } from '@/functions/operators/list-operators';
import { getOperator } from '@/functions/operators/get-operator';
import { Picker } from '@react-native-picker/picker';
import OperatorPickerComponent from '../OperatorPickerComponent';
import DropdownComponent from '../DropdownComponent';
import { validateIMEI } from '@/lib/utils';
import { checkImei } from '@/functions/device/check-imei';

interface DeviceFormProps {
  setIsModalVisible?: React.Dispatch<React.SetStateAction<boolean>>
  device?: DeviceProps
  onSuccess?: () => void
}

const DeviceForm = ({ setIsModalVisible, device, onSuccess }: DeviceFormProps) => {
  const [form, setForm] = useState({
    imei: device?.imei || "",
    phone_model: device?.phone_model || "",
    brand: device?.brand || "",
    phone_number: device?.phone_number || "",
    operator_id: device?.operator_id || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateDevice, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingImei, setIsValidatingImei] = useState(false)
  const [imeiError, setImeiError] = useState<string | null>(null)
  const [operators, setOperators] = useState<{ label: string; value: string }[]>([])

  const handleImeiValidation = async (imei: string) => {
    // Remove any formatting and check if it's exactly 15 digits
    const cleanImei = imei.replace(/\s/g, '')
    
    if (cleanImei.length === 15) {
      if (device && device.imei === cleanImei) {
        setImeiError(null);
        return;
      }

      setIsValidatingImei(true)
      setImeiError(null)
      try {
        const result = await checkImei(cleanImei, form.brand, form.phone_model)
        
        if (result.isValid && result.brand && (result.model || result.name)) {
          setForm(prev => ({
            ...prev,
            brand: result.brand || prev.brand,
            phone_model: result.name || result.model || prev.phone_model
          }))
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

      if (field === 'imei' && value.length === 15) {
        handleImeiValidation(value);
      }
      setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const validatedData = await CreateDeviceSchema.parseAsync(form);

      if (device) {
        await updateDevice(device.$id!, validatedData);
        Alert.alert('Sucesso', 'Dispositivo atualizado com sucesso!');
      } else {
        const deviceId = ID.unique();
        await createDevice(deviceId, validatedData);
        Alert.alert('Sucesso', 'Dispositivo criado com sucesso!');
        // Limpa o formulário apenas para novo cadastro
        setForm({
          imei: '',
          phone_model: '',
          brand: '',
          phone_number: '',
          operator_id: ''
        });
        setErrors({});
        setImeiError(null);
      }

      if (onSuccess) {
        onSuccess();
      }

      if (setIsModalVisible) {
        setIsModalVisible(false);
      } else {
        router.push('/(tabs)/my-devices');
      }
    } catch (error) {
      console.log('Erro ao processar dispositivo:', error);
      
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof CreateDevice, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof CreateDevice] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        Alert.alert('Erro', 'Não foi possível processar o dispositivo. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  function onCancel() {
    setForm({
      imei: '',
      brand: '',
      phone_model: '',
      phone_number: '',
      operator_id: ''
    });
    
    if (setIsModalVisible) {
      setIsModalVisible(false);
    } else {
      router.back();
    }
  }

  async function loadOperators() {
    try {
      const response = await listOperators();

      const data = response.map(operator => {
        return {
          label: operator.name_operator,
          value: operator.$id
        }
      })

      setOperators(data);
    } catch (error) {
      console.error('Erro ao listar operadores:', error);
    }
  }

  useEffect(() => {
    if (device) {
      const operator = getOperator(device.operator_id)
    }

    loadOperators()
  }, [device])
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ backgroundColor: '#fff', borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 36, gap: 20 }}>
        {/* <View className='flex-col items-start p-6 gap-5 bg-white shadow-black shadow-md rounded-xl w-full'> */}
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
                keyboardType="number-pad"
                placeholder="Digite o IMEI"
                className="rounded-md p-4 text-[15px] flex-1 text-justify"
              />
            </View>
            {errors.imei && (
              <Text className="text-red-500 text-sm mt-1 ml-4">{errors.imei}</Text>
            )}
            {imeiError && (
              <Text className="text-red-500 text-sm mt-1 ml-4">{imeiError}</Text>
            )}
            {isValidatingImei && (
              <View className="flex-row items-center mt-1 ml-4">
                <ActivityIndicator size="small" color="#0000ff" />
                <Text className="text-sm ml-2">Validando IMEI...</Text>
              </View>
            )}
          </View>

          <View className='w-full rounded-lg px-5 py-2 flex flex-row' style={{ backgroundColor: '#C4F3F2' }}>
            <Text className='flex flex-row items-end gap-2'>
              <CircleAlert size={15} color='black' />{' '}
              O IMEI é composto por 15 números e pode ser encontrado na embalagem do aparelho ou digitando *#06# no teclado do aparelho.
            </Text>
          </View>

          <InputField
            label="Modelo"
            placeholder="Modelo"
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
              <Text className="text-red-500">*</Text>
              Número do celular
            </Text>
            <View className='rounded-md border-0 bg-zinc-100 px-4'>
              <MaskInput
                value={form.phone_number}
                onChangeText={(masked, unmasked) => handleFieldChange('phone_number', unmasked)}
                mask={['(', /\d/, /\d/, ')', /\d/, ' ',  /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                keyboardType="number-pad"
                placeholder="Digite o número do celular"
                className="rounded-md p-4 text-[15px] flex-1 text-justify"
              />
            </View>
            {errors.phone_number && (
              <Text className="text-red-500 text-sm mt-1 ml-4">{errors.phone_number}</Text>
            )}
          </View>

          <OperatorPickerComponent 
            value={form.operator_id} 
            setValue={(value) => handleFieldChange('operator_id', value)}
          />

          <View className='flex flex-row w-full' style={{ justifyContent: 'space-between' }}>
            <Button variant='white' onPress={onCancel}>
              Cancelar
            </Button>
            <Button variant='blue' onPress={handleSubmit}>
              {isLoading ? <ActivityIndicator color="#fff" /> : device ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </View>
        {/* </View> */}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default DeviceForm