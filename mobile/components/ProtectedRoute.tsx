
import { account } from '@/lib/appwrite'
import { router } from 'expo-router'
import { View } from 'lucide-react-native'
import { ReactNode, useEffect, useState } from 'react'
import { Text } from 'react-native'

interface ProtectedRouteProps {
  admin?: boolean
  children: ReactNode
}

export default function ProtectedRoute({
  admin,
  children,
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkUserAuthentication = async () => {
      try {
        const user = await account.get() // Verifica se o usuário está autenticado

        // Verifica o status e permissões do usuário
        // const userStatus = await checkUserStatus(user.$id)

        if (!user) {
          router.push('/auth/login')
          return
        }

        // Verifica se usuário está inativo
        // if (userStatus.status === 'Inativo') {
        //   toast.error('Usuário inativo')
        //   await deleteUserSession(user.$id)
        //   router.push('/login')
        //   return
        // }

        setIsAuthenticated(true)
      } catch (error) {
        console.error('Erro na autenticação:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkUserAuthentication()
  }, [router, admin])

  if (isLoading) {
    return (
      <View className="w-full h-screen flex justify-center items-center">
        {/* <ClipLoader color="#0F2498" size={75} /> */}
        <Text>Carregando...</Text>
      </View>
    )
  }

  return isAuthenticated ? children : null
}
