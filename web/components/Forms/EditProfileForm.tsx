'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { Input } from '../Input'
import { z } from 'zod'
import { Label } from '../ui/label'
import Button from '../Button'
import { useEffect, useState } from 'react'
import { getUserId } from '@/functions/user/get-user-id'
import { getUser } from '@/functions/user/get-user'
import Image from 'next/image'
import { Pencil, Upload, ChevronRight, ChevronDown, LogOut, Eye, EyeOff } from 'lucide-react'
import type { User } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUser } from '@/functions/user/update-user'
import { updatePassword } from '@/functions/auth/update-password'
import { toast } from 'react-toastify'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatCPF, validateCPF } from '@/lib/utils'
import { uploadImage } from '@/functions/storage/upload-image'
import { deleteImage } from '@/functions/storage/delete-image'
import { EditPassword } from './EditPassword'
import ClipLoader from 'react-spinners/ClipLoader'
import { account } from '@/lib/appwrite'
import { useRouter } from 'next/navigation'

const formSchema = z
  .object({
    name: z.string().min(1, 'O nome é obrigatório'),
    email: z.string().email('Email inválido'),
    cpf: z.string().min(1, 'O CPF é obrigatório'),
  })
  .refine(data => validateCPF(data.cpf), {
    path: ['cpf'],
    message: 'O CPF deve conter exatamente 11 dígitos numéricos.',
  })

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
      .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  })

export function EditProfileForm() {
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<User>({} as User)
  const [file, setFile] = useState<File>()
  
  // Estados para controle de imagem
  const [imageState, setImageState] = useState<{
    currentUrl: string | null;
    tempFile: File | null;
    isDeleted: boolean;
  }>({
    currentUrl: null,
    tempFile: null,
    isDeleted: false
  });
  
  // Estados para as abas responsivas
  const [expandedSection, setExpandedSection] = useState<'profile' | 'password' | null>('profile')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const router = useRouter()

  // Função helper para gerar as iniciais do usuário
  const getUserInitials = (name: string | undefined): string => {
    if (!name || name.trim() === '') return 'U';
    
    const words = name.trim().split(' ').filter(word => word.length > 0);
    
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    } else if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    
    return 'U';
  }

  const form = useForm({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      cpf: '',
    },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Limpar blob URL anterior se existir
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
      
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
      setFile(file)
      setImageState(prev => ({
        ...prev,
        tempFile: file,
        isDeleted: false
      }))
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    setFile(undefined)
    setImageState(prev => ({
      ...prev,
      tempFile: null,
      isDeleted: true
    }))
    // Limpar os valores dos inputs para permitir selecionar a mesma imagem novamente
    const fileInput = document.getElementById('file') as HTMLInputElement
    const fileMobileInput = document.getElementById('fileMobile') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
    if (fileMobileInput) {
      fileMobileInput.value = ''
    }
  }

  async function handleLogout() {
    try {
      await account.deleteSession('current')
      router.push('/')
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast.error('Erro ao fazer logout. Tente novamente.')
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("subimited")
    try {
      setIsSubmitting(true)
      const callFunction = async () => {
        let finalImageUrl = imageState.currentUrl

        // Se há uma nova imagem temporária, fazer upload
        if (imageState.tempFile) {
          try {
            const uploadResult = await uploadImage(imageState.tempFile)
            finalImageUrl = uploadResult || null
          } catch (error: any) {
            console.error('Erro ao fazer upload da imagem:', error)
            throw new Error('Não foi possível fazer o upload da imagem. Tente novamente.')
          }
        }

        // Se havia uma imagem antiga e (foi deletada ou substituída), deletar a antiga
        if (imageState.currentUrl && (imageState.isDeleted || imageState.tempFile)) {
          try {
            await deleteImage(imageState.currentUrl)
          } catch (error) {
            console.error('Erro ao deletar imagem antiga:', error)
          }
        }

        // Se a imagem foi marcada para deleção e não há nova imagem, definir como null
        if (imageState.isDeleted && !imageState.tempFile) {
          finalImageUrl = null
        }

        await updateUser(user.$id, {
          name: values.name,
          email: values.email,
          cpf: values.cpf,
          img_url: finalImageUrl,
        })

        // Limpar preview se havia uma imagem temporária
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview)
        }
        setPreview(null)
        setFile(undefined)

        // Recarregar dados do usuário para refletir mudanças do banco (como no mobile)
        const updatedUserData = await getUser({ filters: [{
          method: 'equal',
          attribute: 'user_id',
          values: [await getUserId()],
        }] })
        
        setUser(updatedUserData[0])
        setImageState({
          currentUrl: updatedUserData[0].img_url || null,
          tempFile: null,
          isDeleted: false
        })
      }
      toast.promise(callFunction(), {
        pending: 'Atualizando perfil...',
        success: 'Perfil atualizado com sucesso!',
        error: 'Erro ao atualizar perfil',
      })
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    try {
      setIsSubmitting(true)
      await updatePassword(values.newPassword, values.oldPassword)
      
      passwordForm.reset()
      toast.success('Senha atualizada com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar senha. Verifique se a senha atual está correta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    async function getUserData() {
      const userId = await getUserId()

      const userFilter = {
        method: 'equal',
        attribute: 'user_id',
        values: [userId],
      }

      const userData = await getUser({ filters: [userFilter] })

      setUser(userData[0])

      if (userData[0].img_url) {
        setPreview(userData[0].img_url)
        setImageState(prev => ({
          ...prev,
          currentUrl: userData[0].img_url
        }))
      }

      form.setValue('name', userData[0].name)
      form.setValue('email', userData[0].email)
      form.setValue('cpf', userData[0].cpf)

      setIsLoading(false)
    }

    getUserData()
  }, [])

  return isLoading ? (
    <ClipLoader color="#0F2498" size={45} className="self-center top-1/2 left-1/2" />
  ) : (
    <>
      {/* Layout Desktop - mantém o formato original */}
      <div className="hidden md:block">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col px-5 md:p-10 py-4 gap-4 bg-white w-full text-zinc-900 self-center justify-center rounded-lg drop-shadow-sm"
          >
            <div className="flex flex-row md:flex-row items-center gap-4">
              {(imageState.tempFile || (!imageState.isDeleted && imageState.currentUrl)) && (preview || imageState.currentUrl) ? (
                <Image
                  src={preview || imageState.currentUrl || ''}
                  alt="Preview"
                  width={128}
                  height={128}
                  className="w-24 h-24 lg:w-24 lg:h-24 rounded-full object-cover"
                />
              ) : (
                <div className="md:w-24 md:h-24 w-16 h-16 p-10 rounded-full flex items-center justify-center text-[48px] font-medium text-white bg-primary">
                  {getUserInitials(user?.name)}
                </div>
              )}

              <div className="flex flex-col items-center md:items-start gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <label
                    htmlFor="file"
                    className="bg-zinc-100 rounded-xl cursor-pointer w-full max-w-48 max-h-11 items-center justify-center text-xs lg:text-sm flex gap-3 px-4 py-3 ring-1 ring-[#232323]/30 hover:opacity-70"
                  >
                    <input
                      id="file"
                      type="file"
                      className="hidden"
                      accept="image/png, image/jpeg"
                      onChange={handleFileChange}
                    />
                    <Upload className="w-5 h-5 lg:w-6 lg:h-6" />
                    Selecionar imagem
                  </label>
                  {(imageState.currentUrl || imageState.tempFile) && !imageState.isDeleted && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-procura-ai-zinc bg-zinc-100 max-w-48 max-h-11 rounded-lg px-4 py-2 ring-1 text-xs lg:text-sm ring-[#232323]/30"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <span className="text-xs md:text-base">
                  * São suportadas imagens nos formatos .png .jpg de até 50 mb
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full max-w-80">
                      <Label className="text-base">Nome</Label>
                      <div className="flex items-center gap-2 relative">
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Fulano Beltrano de Cicrano"
                            className="bg-zinc-100 ring-0 shadow-none"
                            {...field}
                          />
                        </FormControl>
                        <Pencil className="w-4 h-4 absolute right-5" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full max-w-80">
                      <Label className="text-base">Email</Label>
                      <div className="flex items-center gap-2 relative">
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="email@mail.com"
                            className="bg-zinc-100 ring-0 shadow-none"
                            {...field}
                          />
                        </FormControl>
                        <Pencil className="w-4 h-4 absolute right-5" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-base font-medium">CPF</span>
                <span className="bg-zinc-100 rounded-md p-2 w-full max-w-fit">
                  {formatCPF(user.cpf)}
                </span>
              </div>
            </div>
            <div className="flex w-full justify-between">
              <Button variant="white" type="button">
                Cancelar
              </Button>
              <Button variant="blue" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
          <Dialog>
            <DialogTrigger asChild className="mt-5 ml-3">
              <Button variant="blue" type="button">
                Editar senha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar senha</DialogTitle>
              </DialogHeader>
              <EditPassword />
            </DialogContent>
          </Dialog>
        </Form>
      </div>

      {/* Layout Mobile - com abas */}
      <div className="block md:hidden">
        <div className="flex flex-col gap-6">
          {/* Header com avatar e informações básicas */}
          <div className="w-full flex flex-col items-center justify-center pt-6 pb-4">
            <div className='w-24 h-24 rounded-full bg-zinc-300 overflow-hidden mb-2'>
              {(imageState.tempFile || (!imageState.isDeleted && imageState.currentUrl)) && (preview || imageState.currentUrl) ? (
                <Image
                  src={preview || imageState.currentUrl || ''}
                  alt="Preview"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-medium text-white bg-primary">
                  {getUserInitials(user?.name)}
                </div>
              )}
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mb-1">{user?.name || ''}</h2>
            <p className="text-sm text-zinc-500 mb-2">{user?.email || ''}</p>
          </div>

          {/* Container das abas */}
          <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden">
            {/* Aba de Dados Pessoais */}
            <div className="border-b border-zinc-200">
              <button
                onClick={() => setExpandedSection(expandedSection === 'profile' ? null : 'profile')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 transition-colors"
                type="button"
              >
                <h3 className="text-base font-semibold text-primary">Editar dados pessoais</h3>
                {expandedSection === 'profile' ? 
                  <ChevronDown className="text-primary" size={20} /> : 
                  <ChevronRight className="text-primary" size={20} />
                }
              </button>
              
              {expandedSection === 'profile' && (
                <div className="p-4 pt-0">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {/* Seção de imagem */}
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-3">
                          <label
                            htmlFor="fileMobile"
                            className="bg-zinc-100 rounded-md cursor-pointer max-w-48 h-11 flex items-center justify-center text-sm gap-2 px-4 py-2 border border-zinc-400 hover:opacity-70 transition-opacity"
                          >
                            <input
                              id="fileMobile"
                              type="file"
                              className="hidden"
                              accept="image/png, image/jpeg"
                              onChange={handleFileChange}
                            />
                            <Upload className="w-5 h-5" />
                            Selecionar imagem
                          </label>
                          
                          {imageState.tempFile && (
                            <button
                              type="button"
                              onClick={() => {
                                setPreview(imageState.currentUrl)
                                setFile(undefined)
                                setImageState(prev => ({
                                  ...prev,
                                  tempFile: null,
                                  isDeleted: false
                                }))
                                // Limpar o valor do input para permitir selecionar a mesma imagem novamente
                                const fileInput = document.getElementById('fileMobile') as HTMLInputElement
                                if (fileInput) {
                                  fileInput.value = ''
                                }
                              }}
                              className="bg-zinc-100 rounded-md px-4 py-2 border border-zinc-400 text-sm hover:opacity-70 transition-opacity max-w-48"
                            >
                              Cancelar
                            </button>
                          )}

                          {(imageState.currentUrl || imageState.tempFile) && !imageState.isDeleted && (
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="bg-zinc-100 rounded-md px-4 py-2 border border-zinc-400 text-sm hover:opacity-70 transition-opacity max-w-48"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-zinc-600">
                          * São suportadas imagens nos formatos .png .jpg de até 10 mb
                        </p>
                      </div>

                      {/* Campos do formulário */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-full">
                            <Label className="text-base">Nome</Label>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Fulano Beltrano de Cicrano"
                                  className="bg-zinc-100 ring-0 shadow-none pr-10"
                                  {...field}
                                />
                              </FormControl>
                              <Pencil className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-full">
                            <Label className="text-base">Email</Label>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="email@mail.com"
                                  className="bg-zinc-100 ring-0 shadow-none pr-10"
                                  {...field}
                                />
                              </FormControl>
                              <Pencil className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex flex-col gap-2">
                        <Label className="text-base font-medium">CPF</Label>
                        <div className="bg-zinc-100 rounded-md p-2 w-full max-w-fit">
                          {formatCPF(user.cpf)}
                        </div>
                      </div>

                      {/* Botões */}
                      <div className="flex gap-4 pt-2">
                        <Button
                          variant="white"
                          type="button"
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="blue"
                          type="submit"
                          className="flex-1"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </div>

            {/* Aba de Alterar Senha */}
            <div className="border-b border-zinc-200">
              <button
                onClick={() => setExpandedSection(expandedSection === 'password' ? null : 'password')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 transition-colors"
                type="button"
              >
                <h3 className="text-base font-semibold text-primary">Alterar senha</h3>
                {expandedSection === 'password' ? 
                  <ChevronDown className="text-primary" size={20} /> : 
                  <ChevronRight className="text-primary" size={20} />
                }
              </button>
              
              {expandedSection === 'password' && (
                <div className="p-4 pt-0">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="oldPassword"
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-full">
                            <Label className="text-base">Senha atual</Label>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showOldPassword ? "text" : "password"}
                                  placeholder="Digite sua senha atual"
                                  className="bg-zinc-100 ring-0 shadow-none pr-10"
                                  {...field}
                                />
                              </FormControl>
                              <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                {showOldPassword ? 
                                  <EyeOff className="w-4 h-4 text-gray-500" /> : 
                                  <Eye className="w-4 h-4 text-gray-500" />
                                }
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-full">
                            <Label className="text-base">Nova senha</Label>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Digite sua nova senha"
                                  className="bg-zinc-100 ring-0 shadow-none pr-10"
                                  {...field}
                                />
                              </FormControl>
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                {showNewPassword ? 
                                  <EyeOff className="w-4 h-4 text-gray-500" /> : 
                                  <Eye className="w-4 h-4 text-gray-500" />
                                }
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-full">
                            <Label className="text-base">Confirmar nova senha</Label>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirme sua nova senha"
                                  className="bg-zinc-100 ring-0 shadow-none pr-10"
                                  {...field}
                                />
                              </FormControl>
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                {showConfirmPassword ? 
                                  <EyeOff className="w-4 h-4 text-gray-500" /> : 
                                  <Eye className="w-4 h-4 text-gray-500" />
                                }
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Botões */}
                      <div className="flex gap-4 pt-2">
                        <Button
                          variant="white"
                          type="button"
                          className="flex-1"
                          onClick={() => {
                            passwordForm.reset()
                            setExpandedSection('profile')
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="blue"
                          type="submit"
                          className="flex-1"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Salvando...' : 'Alterar senha'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </div>
          </div>

          {/* Botão de logout para mobile */}
          <div className="w-full flex justify-center py-4">
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
              type="button"
            >
              <LogOut size={20} />
              <span className="font-medium text-base">Sair da conta</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
