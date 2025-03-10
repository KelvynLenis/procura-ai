'use client'

import { account } from '@/lib/appwrite'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import ClipLoader from 'react-spinners/ClipLoader'
import { toast } from 'react-toastify'

interface ProtectedRouteProps {
  admin?: boolean
  children: ReactNode
}

export default function ProtectedRoute({
  admin,
  children,
}: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkUserAuthentication = async () => {
      try {
        const user = await account.get() // Verifica se o usuário está autenticado
        const isAdmin = user.labels[0] === 'admin'

        if (admin && !isAdmin) {
          throw new Error('Acesso negado')
        }

        const params = new URLSearchParams({
          'queries[0]': JSON.stringify({
            method: 'equal',
            attribute: 'user_id',
            values: [`${user.$id}`],
          }),
        })

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
          }
        )

        const {
          documents: [userDoc],
        } = await response.json()

        if (userDoc) {
          if (userDoc.status === 'inactive') {
            toast.error('Usuário inativo')

            account.deleteSession('current')
            router.back()
            return
          }
        }

        setIsAuthenticated(true)
      } catch (error) {
        router.back()
      } finally {
        setIsLoading(false)
      }
    }

    checkUserAuthentication()
  }, [router])

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <ClipLoader color="#0F2498" size={75} />
      </div>
    )
  }

  return isAuthenticated ? children : null
}
