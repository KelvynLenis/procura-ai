"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { createUser } from "@/functions/user/create-user";
import { v4 as uuidv4 } from "uuid";
import ClipLoader from "react-spinners/ClipLoader";
import { 
  getCookieValue, 
  deleteCookie, 
  formatUserData, 
  isLoginError, 
  isUserExistsError,
  type GovBrUserData 
} from "@/lib/govbr-utils";

export default function GovBrCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Processando autenticação Gov.br...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processGovBrAuth = async () => {
      try {
        setStatus("Recuperando dados de autenticação...");
        
        // Busca dados do usuário do cookie
        const userDataJson = getCookieValue('govbr_user_data');
        
        if (!userDataJson) {
          throw new Error('Dados de autenticação não encontrados');
        }

        const userData: GovBrUserData = JSON.parse(userDataJson);
        deleteCookie('govbr_user_data'); // Limpa cookie imediatamente

        const appwriteUser = formatUserData(userData);
        
        setStatus("Verificando usuário existente...");

        // Primeira tentativa: login (usuário já existe)
        try {
          const session = await account.createEmailPasswordSession(appwriteUser.email, appwriteUser.password);
          console.log('Login realizado - usuário existente:', session.$id);
          setStatus("Login realizado! Redirecionando...");
          
          setTimeout(() => router.push('/meus-dispositivos'), 1000);
          return;

        } catch (loginError: any) {
          console.log('Usuário não encontrado, criando nova conta:', loginError.type || loginError.code);
          
          // Se login falhar por credenciais inválidas, criar usuário
          if (isLoginError(loginError)) {
            setStatus("Criando nova conta Gov.br...");
            
            try {
              const userId = uuidv4();
              await createUser({
                userId,
                name: appwriteUser.name,
                cpf: appwriteUser.cpf,
                email: appwriteUser.email,
                password: appwriteUser.password
              });

              setStatus("Conta criada! Fazendo login...");

              // Login após criação
              const session = await account.createEmailPasswordSession(appwriteUser.email, appwriteUser.password);
              setStatus("Login realizado! Redirecionando...");
              
              setTimeout(() => router.push('/meus-dispositivos'), 1000);
              
            } catch (createError: any) {
              console.log('Erro na criação, verificando duplicação:', createError);
              
              // Se usuário já existe (condição de corrida), tenta login
              if (isUserExistsError(createError)) {
                setStatus("Usuário já existe, fazendo login...");
                
                try {
                  const session = await account.createEmailPasswordSession(appwriteUser.email, appwriteUser.password);
                  setStatus("Login realizado! Redirecionando...");
                  
                  setTimeout(() => router.push('/meus-dispositivos'), 1000);
                  
                } catch (retryLoginError) {
                  throw new Error(`Falha no login após verificar duplicação: ${retryLoginError}`);
                }
              } else {
                throw new Error(`Falha ao criar usuário: ${createError.message}`);
              }
            }
          } else {
            throw new Error(`Erro inesperado no login: ${loginError.message}`);
          }
        }

      } catch (err: any) {
        console.error('Erro na autenticação Gov.br:', err);
        const errorMessage = err.message || 'Erro desconhecido durante autenticação';
        setError(errorMessage);
        setStatus("Falha na autenticação");
        
        // Redireciona para login com erro
        setTimeout(() => {
          const encodedError = encodeURIComponent(errorMessage.substring(0, 100));
          router.push(`/login?error=govbr_auth_failed&details=${encodedError}`);
        }, 4000);
      }
    };

    processGovBrAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center gap-6">
          <ClipLoader color="#0F2498" size={60} />
          
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-800">
              Autenticação Gov.br
            </h1>
            <p className="text-sm font-medium text-blue-600 mt-2">
              {status}
            </p>
          </div>

          {error && (
            <div className="w-full rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="font-semibold text-red-800 text-sm">
                Erro durante autenticação:
              </p>
              <p className="text-red-700 text-xs mt-1">{error}</p>
              <p className="text-red-600 text-xs mt-2">
                Redirecionando para login...
              </p>
            </div>
          )}

          {status.includes("OK") && (
            <div className="w-full rounded-lg bg-green-50 border border-green-200 p-4 text-center">
              <p className="text-green-800 font-medium text-sm">
                Autenticação realizada com sucesso!
              </p>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-xs text-gray-500 text-center max-w-md">
        Processando autenticação segura via Gov.br.
      </p>
    </div>
  );
}