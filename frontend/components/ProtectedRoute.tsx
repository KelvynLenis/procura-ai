'use client';

import { account } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUserAuthentication = async () => {
      try {
        await account.get(); // Verifica se o usuário está autenticado
        setIsAuthenticated(true);
      } catch (error) {
        router.push('/'); // Redireciona para a página de login se não autenticado
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuthentication();
  }, [router]);

  if (isLoading) {
    return <p className='self-center'>Carregando...</p>;
  }

  return isAuthenticated ? children : null;
}
