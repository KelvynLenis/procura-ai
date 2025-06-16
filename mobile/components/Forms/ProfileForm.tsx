import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Keyboard, Image, Modal, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import InputField from '../InputField'
import Button from '../Button';
import { router } from 'expo-router';
import { Pencil, Upload, LogOut, Eye, EyeOff } from 'lucide-react-native';
import { z } from 'zod';
import { updateUser } from '@/functions/user/update-user';
import MaskInput from 'react-native-mask-input';
import { getUserId } from '@/functions/user/get-user-id';
import { getUserInfo } from '@/functions/user/get-user-info';
import * as ImagePicker from 'expo-image-picker';
import { validateCPF } from '@/lib/utils';
import { updatePassword } from '@/functions/auth/update-password';
import { uploadImage } from '@/functions/storage/upload-image';
import { deleteImage } from '@/functions/storage/delete-image';
import { useFocusEffect } from '@react-navigation/native'
import { account } from '@/lib/appwrite';

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
  imgURL: z.string().nullable(),
  cpf: z.string(),
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
    imgURL: "",
    cpf: "",
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
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);
  const [userId, setUserId] = useState<any>(null);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'profile' | 'password' | null>('profile');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imageState, setImageState] = useState<{
    currentUrl: string | null;
    tempUri: string | null;
    isDeleted: boolean;
  }>({
    currentUrl: null,
    tempUri: null,
    isDeleted: false
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
      setErrors({});
      setPasswordErrors({});
      setImageState({
        currentUrl: null,
        tempUri: null,
        isDeleted: false
      });
      setExpandedSection('profile');
    }, [])
  );

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
        email: string;
        img_url: string | null;
        name: string;
        status: string;
        type: string;
        user_id: string;
        cpf: string;
      }[] = await getUserInfo(currentUserId);
      setUserId(userData);

      if (userData && userData.length > 0) {
        const user = userData[0];
        setForm({
          name: user.name || "",
          email: user.email || "",
          imgURL: user.img_url || "",
          cpf: user.cpf || "",
        });
        setImageState({
          currentUrl: user.img_url,
          tempUri: null,
          isDeleted: false
        });
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
        setImageState(prev => ({
          ...prev,
          tempUri: selectedAsset.uri,
          isDeleted: false
        }));
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleCancel = () => {
    setImageState(prev => ({
      ...prev,
      tempUri: null,
      isDeleted: false
    }));
  };

  const handleRemoveImage = () => {
    setImageState(prev => ({
      ...prev,
      tempUri: null,
      isDeleted: true
    }));
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

      let finalImageUrl = imageState.currentUrl;

      if (imageState.tempUri) {
        const fileData = {
          uri: imageState.tempUri,
          type: 'image/jpeg',
          name: `profile-${Date.now()}.jpg`,
          size: 0
        };

        try {
          finalImageUrl = await uploadImage(fileData);
        } catch (error: any) {
          console.error('Erro ao fazer upload da imagem:', error);
          throw new Error('Não foi possível fazer o upload da imagem. Tente novamente.');
        }
      }

      if (imageState.currentUrl && (imageState.isDeleted || imageState.tempUri)) {
        try {
          await deleteImage(imageState.currentUrl);
        } catch (error) {
          console.error('Erro ao deletar imagem antiga:', error);
        }
      }

      if (imageState.isDeleted && !imageState.tempUri) {
        finalImageUrl = null;
      }

      await updateUser(userId[0].$id, {
        name: form.name,
        email: form.email,
        img_url: finalImageUrl,
      });

      setImageState({
        currentUrl: finalImageUrl,
        tempUri: null,
        isDeleted: false
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

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja realmente sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await account.deleteSession('current');
            router.replace('/');
          } catch (error) {
            console.error('Erro ao fazer logout:', error);
            Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
          }
        }
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: 100 
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={true}
        style={{ flex: 1 }}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0F2498']}
            tintColor="#0F2498"
          />
        }
      >
        <View style={{ minHeight: '100%', paddingBottom: 200 }}>
          <View className="w-full items-center justify-center pt-6 pb-2">
            <View className='w-24 h-24 rounded-full bg-zinc-300 overflow-hidden mb-2'>
              {(imageState.tempUri || (!imageState.isDeleted && imageState.currentUrl)) ? (
                <Image
                  source={{ uri: imageState.tempUri || imageState.currentUrl || undefined }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-primary">
                  <Text className="text-white text-3xl font-medium">
                    {form.name.split(' ').length > 1
                      ? form.name.split(' ')[0][0] + form.name.split(' ')[1][0]
                      : form.name.split(' ')[0][0]}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-lg font-bold text-zinc-900 mb-1">{form.name}</Text>
            <Text className="text-sm text-zinc-500 mb-2">{form.email}</Text>
          </View>
          <View className='flex-col items-start p-6 gap-5 bg-white shadow-black shadow-md rounded-xl w-full mt-0'>
            {isLoadingData ? (
              <View className="w-full items-center justify-center py-8">
                <Text className="text-gray-600">Carregando dados...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => setExpandedSection(expandedSection === 'profile' ? null : 'profile')}
                  className="flex-row items-center justify-between w-full py-3 px-2 border-b border-zinc-200"
                  activeOpacity={0.8}
                >
                  <Text className="text-base font-semibold text-primary">Editar dados pessoais</Text>
                  <Text className="text-primary text-xl">{expandedSection === 'profile' ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {expandedSection === 'profile' && (
                  <View className="w-full mt-2">
                    <View className='flex flex-row gap-3 mb-2'>
                      <View className="flex-1 justify-center">
                        <TouchableOpacity
                          onPress={pickImage}
                          className='flex flex-row gap-2 bg-zinc-100 p-2 rounded-md border border-zinc-400 items-center mb-1'
                        >
                          <Upload size={20} color='black' />
                          <Text>Selecionar imagem</Text>
                        </TouchableOpacity>
                        
                        {imageState.tempUri && (
                          <TouchableOpacity
                            onPress={handleCancel}
                            className='flex flex-row gap-2 bg-zinc-100 p-2 rounded-md border border-zinc-400 items-center mb-1'
                          >
                            <Text>Cancelar</Text>
                          </TouchableOpacity>
                        )}

                        {(imageState.currentUrl || imageState.tempUri) && !imageState.isDeleted && (
                          <TouchableOpacity
                            onPress={handleRemoveImage}
                            className='flex flex-row gap-2 bg-zinc-100 p-2 rounded-md border border-zinc-400 items-center'
                          >
                            <Text>Remover</Text>
                          </TouchableOpacity>
                        )}
                        
                        <Text className='text-xs mt-2'>* São suportadas imagens nos formatos .png .jpg de até 10 mb</Text>
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
                    <View className="w-full mb-2">
                      <Text className="text-sm font-medium mb-1">
                        CPF
                      </Text>
                      <View className="bg-zinc-100 rounded-md p-2">
                        <Text>{form.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</Text>
                      </View>
                    </View>
                    <View className='flex flex-row w-full gap-4 mt-2'>
                      <Button
                        variant='white'
                        onPress={handleCancel}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant='blue'
                        onPress={handleSubmit}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </View>
                    <View className="w-full mt-4 flex-col items-end">
                      <TouchableOpacity
                        onPress={() => setExpandedSection('password')}
                        className="flex-row items-center justify-end"
                      >
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => setExpandedSection(expandedSection === 'password' ? null : 'password')}
                  className="flex-row items-center justify-between w-full py-3 px-2 border-b border-zinc-200"
                  activeOpacity={0.8}
                >
                  <Text className="text-base font-semibold text-primary">Alterar senha</Text>
                  <Text className="text-primary text-xl">{expandedSection === 'password' ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {expandedSection === 'password' && (
                  <View className="w-full mt-2">
                    <InputField
                      label="Senha atual"
                      placeholder="Digite sua senha atual"
                      secureTextEntry={!showOldPassword}
                      containerStyle='rounded-md border-0 bg-zinc-100 w-full'
                      value={passwordForm.oldPassword}
                      onChangeText={(value) => handlePasswordChange('oldPassword', value)}
                      error={passwordErrors.oldPassword}
                      icon={
                        <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                          {showOldPassword ? (
                            <EyeOff size={20} color="gray" />
                          ) : (
                            <Eye size={20} color="gray" />
                          )}
                        </TouchableOpacity>
                      }
                      iconEnd
                    />
                    <InputField
                      label="Nova senha"
                      placeholder="Digite sua nova senha"
                      secureTextEntry={!showNewPassword}
                      containerStyle='rounded-md border-0 bg-zinc-100 w-full mt-4'
                      value={passwordForm.newPassword}
                      onChangeText={(value) => handlePasswordChange('newPassword', value)}
                      error={passwordErrors.newPassword}
                      icon={
                        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                          {showNewPassword ? (
                            <EyeOff size={20} color="gray" />
                          ) : (
                            <Eye size={20} color="gray" />
                          )}
                        </TouchableOpacity>
                      }
                      iconEnd
                    />
                    <InputField
                      label="Confirmar nova senha"
                      placeholder="Confirme sua nova senha"
                      secureTextEntry={!showConfirmPassword}
                      containerStyle='rounded-md border-0 bg-zinc-100 w-full mt-4'
                      value={passwordForm.confirmPassword}
                      onChangeText={(value) => handlePasswordChange('confirmPassword', value)}
                      error={passwordErrors.confirmPassword}
                      icon={
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? (
                            <EyeOff size={20} color="gray" />
                          ) : (
                            <Eye size={20} color="gray" />
                          )}
                        </TouchableOpacity>
                      }
                      iconEnd
                    />
                    <View className="flex flex-row gap-4 mt-4">
                      <Button
                        variant='white'
                        onPress={() => {
                          setPasswordForm({
                            oldPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                          setPasswordErrors({});
                          setExpandedSection('profile');
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant='blue'
                        onPress={handlePasswordSubmit}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? 'Salvando...' : 'Alterar senha'}
                      </Button>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
          <View className="w-full items-center py-4 mt-4 mb-8">
            <TouchableOpacity 
              onPress={handleLogout} 
              className="flex-row items-center gap-2"
            >
              <LogOut size={20} color="#e11d48" />
              <Text className="text-red-500 font-medium text-base">Sair da conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default ProfileForm