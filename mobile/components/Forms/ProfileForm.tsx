import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Keyboard, Image, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import InputField from '../InputField'
import Button from '../Button';
import { router } from 'expo-router';
import { Pencil, Upload } from 'lucide-react-native';
import { z } from 'zod';
import { updateUser } from '@/functions/user/update-user';
import MaskInput from 'react-native-mask-input';
import { getUserId } from '@/functions/user/get-user-id';
import { getUserInfo } from '@/functions/user/get-user-info';
import * as ImagePicker from 'expo-image-picker';
import { validateCPF } from '@/lib/utils';
import { updatePassword } from '@/functions/auth/update-password';
import { uploadImage } from '@/functions/storage/upload-image';

interface ProfileFormProps {
  setIsModalVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;
}

const profileSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  email: z.string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido')
    .max(100, 'E-mail deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de e-mail inválido'),
  cpf: z.string()
    .min(1, 'CPF é obrigatório')
    .length(11, 'CPF deve ter 11 dígitos')
    .regex(/^\d{11}$/, 'Apenas números são permitidos'),
  imgURL: z.string().nullable(),
}).refine(data => validateCPF(data.cpf), {
  path: ['cpf'],
  message: 'O CPF deve conter exatamente 11 dígitos numéricos.',
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine(data => data.newPassword === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'As senhas não coincidem',
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfileForm = ({ setIsModalVisible, onSuccess }: ProfileFormProps) => {
  const [form, setForm] = useState<ProfileFormData>({
    name: "",
    email: "",
    cpf: "",
    imgURL: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof PasswordFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<any>(null);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      setIsLoadingData(true);
      const currentUserId = await getUserId();
      
      if (!currentUserId) {
        throw new Error('Usuário não encontrado');
      }

      const userData: {
        $collectionId: string;
        $createdAt: string;
        $databaseId: string;
        $id: string;
        $permissions: any[];
        $updatedAt: string;
        accessed_at: string;
        cpf: string;
        email: string;
        img_url: string | null;
        name: string;
        status: string;
        type: string;
        user_id: string;
      }[] = await getUserInfo(currentUserId);
      setUserId(userData);

      
      if (userData && userData.length > 0) {
        const user = userData[0];
        setForm({
          name: user.name || "",
          email: user.email || "",
          cpf: user.cpf || "",
          imgURL: user.img_url || "",
        });
        if (user.img_url) {
          setSelectedImage(user.img_url);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do usuário.');
    } finally {
      setIsLoadingData(false);
    }
  }

  const handleFieldChange = (field: keyof ProfileFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        const selectedAsset = result.assets[0];
        setSelectedImage(selectedAsset.uri);

        // Preparar arquivo para upload
        const fileData = {
          uri: selectedAsset.uri,
          type: 'image/jpeg',
          name: `profile-${Date.now()}.jpg`,
          size: selectedAsset.fileSize || 0
        };

        try {
          setIsLoading(true);
          const imageUrl = await uploadImage(fileData);
          setForm(prev => ({ ...prev, imgURL: imageUrl }));
          Alert.alert('Sucesso', 'Imagem enviada com sucesso!');
        } catch (error: any) {
          console.error('Erro ao fazer upload da imagem:', error);
          let errorMessage = 'Não foi possível fazer o upload da imagem.';
          
          if (error.message?.includes('Network request failed')) {
            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          }
          
          Alert.alert('Erro', errorMessage);
          setSelectedImage(null);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const removeImage = async () => {
    try {
      setSelectedImage(null);
      setForm(prev => ({ ...prev, imgURL: "" }));

      if (userId && userId[0]?.$id) {
        await updateUser(userId[0].$id, {
          ...form,
          img_url: null
        });
      }
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      Alert.alert('Erro', 'Não foi possível remover a imagem.');
    }
  };

  async function handleSubmit() {
    try {
      Keyboard.dismiss();
      setIsLoading(true);

      await profileSchema.parseAsync(form);
      setErrors({});

      if (!userId || !userId[0]?.$id) {
        throw new Error('Usuário não encontrado');
      }

      await updateUser(userId[0].$id, {
        name: form.name,
        email: form.email,
        cpf: form.cpf,
        img_url: form.imgURL,
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (setIsModalVisible) {
        setIsModalVisible(false);
      }
    } catch (error) {
      console.log('Erro ao atualizar perfil:', error);
      
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof ProfileFormData] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o perfil. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    setPasswordErrors(prev => ({ ...prev, [field]: undefined }));
  };

  async function handlePasswordSubmit() {
    try {
      setIsLoading(true);
      await passwordSchema.parseAsync(passwordForm);
      setPasswordErrors({});

      await updatePassword(passwordForm.newPassword, passwordForm.oldPassword);

      Alert.alert('Sucesso', 'Senha atualizada com sucesso!');
      setIsPasswordModalVisible(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.log('Erro ao atualizar senha:', error);
      
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof PasswordFormData, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof PasswordFormData] = err.message;
          }
        });
        setPasswordErrors(newErrors);
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar a senha. Verifique se a senha atual está correta.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ minHeight: '100%', paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <View className='flex-col items-start p-6 gap-5 bg-white shadow-black shadow-md rounded-xl w-full'>
          {isLoadingData ? (
            <View className="w-full items-center justify-center py-8">
              <Text className="text-gray-600">Carregando dados...</Text>
            </View>
          ) : (
            <>
              <View className='flex flex-row gap-3'>
                <View className='w-24 h-24 rounded-full bg-zinc-300 overflow-hidden'>
                  {selectedImage ? (
                    <Image 
                      source={{ uri: selectedImage }} 
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center bg-primary">
                      <Text className="text-white text-2xl font-medium">
                        {form.name.split(' ').length > 1
                          ? form.name.split(' ')[0][0] + form.name.split(' ')[1][0]
                          : form.name.split(' ')[0][0]}
                      </Text>
                    </View>
                  )}
                </View>
                <View>
                  <View className='flex flex-row gap-2'>
                    <TouchableOpacity 
                      onPress={pickImage}
                      className='flex flex-row gap-2 bg-zinc-100 p-2 rounded-md border border-zinc-400 items-center'
                    >
                      <Upload size={24} color='black' />
                      <Text>Selecionar imagem</Text>
                    </TouchableOpacity>
                    {selectedImage && (
                      <TouchableOpacity 
                        onPress={removeImage}
                        className='flex w-24 justify-center flex-row gap-2 bg-zinc-100 p-2 rounded-md border border-zinc-400 items-center'
                      >
                        <Text>Remover</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text className='w-80 text-xs mt-2'>* São suportadas imagens nos formatos .png .jpg de até 50 mb</Text>
                </View>
              </View>

              <InputField
                label="Nome"
                placeholder="Nome"
                icon={<Pencil size={20} color="gray" className='right-0 absolute' />}
                iconEnd
                containerStyle='rounded-md border-0 bg-zinc-100 w-full'
                textContentType="name"
                value={form.name}
                onChangeText={(value) => handleFieldChange('name', value)}
                error={errors.name}
                maxLength={50}
                returnKeyType="next"
              />

              <InputField
                label="E-mail"
                placeholder="E-mail"
                icon={<Pencil size={20} color="gray" className='right-0 absolute' />}
                iconEnd
                containerStyle='rounded-md border-0 bg-zinc-100 w-full'
                textContentType="emailAddress"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(value) => handleFieldChange('email', value)}
                error={errors.email}
                maxLength={100}
                returnKeyType="next"
              />

              <View className="w-full">
                <Text className="text-sm font-medium mb-1">
                  CPF <Text className="text-red-500">*</Text>
                </Text>
                <View className="bg-zinc-100 rounded-md p-2">
                  <Text>{form.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</Text>
                </View>
              </View>

              <View className='flex flex-row w-full gap-4 mt-2'>
                <Button 
                  variant='blue'
                  onPress={handleSubmit}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button 
                  variant='red' 
                  onPress={setIsModalVisible ? () => setIsModalVisible(false) : () => router.back()}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </View>

              <Button 
                variant='blue'
                onPress={() => setIsPasswordModalVisible(true)}
                className="w-full mt-4"
              >
                Editar senha
              </Button>
            </>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isPasswordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPasswordModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-sm">
            <Text className="text-lg font-bold mb-4">Editar senha</Text>
            
            <InputField
              label="Senha atual"
              placeholder="Digite sua senha atual"
              secureTextEntry
              containerStyle='rounded-md border-0 bg-zinc-100 w-full'
              value={passwordForm.oldPassword}
              onChangeText={(value) => handlePasswordChange('oldPassword', value)}
              error={passwordErrors.oldPassword}
            />

            <InputField
              label="Nova senha"
              placeholder="Digite sua nova senha"
              secureTextEntry
              containerStyle='rounded-md border-0 bg-zinc-100 w-full mt-4'
              value={passwordForm.newPassword}
              onChangeText={(value) => handlePasswordChange('newPassword', value)}
              error={passwordErrors.newPassword}
            />

            <InputField
              label="Confirmar nova senha"
              placeholder="Confirme sua nova senha"
              secureTextEntry
              containerStyle='rounded-md border-0 bg-zinc-100 w-full mt-4'
              value={passwordForm.confirmPassword}
              onChangeText={(value) => handlePasswordChange('confirmPassword', value)}
              error={passwordErrors.confirmPassword}
            />

            <View className="flex flex-row gap-4 mt-4">
              <Button 
                variant='blue'
                onPress={handlePasswordSubmit}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button 
                variant='red'
                onPress={() => {
                  setIsPasswordModalVisible(false);
                  setPasswordForm({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPasswordErrors({});
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

export default ProfileForm