import { ID } from 'appwrite'
import { account } from '@/lib/appwrite'
import { v4 as uuidv4 } from 'uuid'
import { getGovBrConfig, buildTokenUrl, buildUserInfoUrl } from './config'
import { createUser } from '@/functions/user/create-user'


interface GovBrUserData {
  sub: string
  email?: string
  name?: string
  preferred_username?: string
  [key: string]: any
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  id_token: string
  expires_in: number
  token_type: string
}

export function generateAuthState(): string {
  return uuidv4()
}

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const config = getGovBrConfig()
  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    throw new Error('Configurações incompletas para troca de token')
  }

  const tokenEndpoint = buildTokenUrl()
  const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')

  const formData = new URLSearchParams()
  formData.append('grant_type', 'authorization_code')
  formData.append('code', code)
  formData.append('redirect_uri', config.redirectUri)

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`
    },
    body: formData.toString()
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erro na troca de token: ${error}`)
  }

  return response.json()
}

export async function getUserInfo(accessToken: string): Promise<GovBrUserData> {
  const response = await fetch(buildUserInfoUrl(), {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (!response.ok) {
    throw new Error(`Erro ao obter informações do usuário: ${await response.text()}`)
  }
  console.log('Resposta do userinfo:', await response.clone().text());
  return response.json()
}

export async function createOrUpdateUser(userData: GovBrUserData) {
  console.log('Dados do usuário obtidos do Gov.br:', userData);
  
  // Usar o email do usuário se disponível, ou criar um email fictício válido
  const userEmail = userData.email || `govbr-${userData.sub}@procuraai.secties.pb.gov.br`
  const userPassword = userData.sub // Usar o 'sub' como senha conforme solicitado
  const userName = userData.name || `Usuário Gov.br`
  const userCpf = userData.preferred_username || '' // preferred_username contém o CPF
  
  try {
    // Tenta fazer login se usuário já existe
    const session = await account.createEmailPasswordSession(userEmail, userPassword)
    console.log('Usuário já existe, sessão criada:', session)
    return session
  } catch (loginError) {
    console.log('Usuário não existe, criando novo:', loginError)
    
    try {
      // Usa a função existente createUser para manter consistência
      const userId = uuidv4()
      await createUser({
        userId,
        name: userName,
        cpf: userCpf, // Usar o CPF do Gov.br (preferred_username)
        email: userEmail,
        password: userPassword
      })

      console.log('Usuário criado via Gov.br com sucesso')
      
      // Cria e retorna sessão para o novo usuário
      const session = await account.createEmailPasswordSession(userEmail, userPassword)
      console.log('Sessão criada para novo usuário:', session)
      return session
      
    } catch (createError) {
      console.error('Erro ao criar usuário:', createError)
      throw createError
    }
  }
}