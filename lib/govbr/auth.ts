import { ID } from 'appwrite'
import { account } from '@/lib/appwrite'
import { v4 as uuidv4 } from 'uuid'
import { getGovBrConfig, buildTokenUrl, buildUserInfoUrl } from './config'


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

  return response.json()
}

export async function createOrUpdateUser(userData: GovBrUserData) {

  console.log('Dados do usuário obtidos do Gov.br:', userData);
  // Usar o email do usuário se disponível, ou criar um email fictício válido
  const userEmail = userData.email || `user-${userData.sub}@procuraai.secties.pb.gov.br`
  const userPassword = `${userData.sub}-secret`
  
  try {
    // Tenta fazer login se usuário já existe
    return await account.createSession(userEmail, userPassword)
  } catch {
    // Se não existe, cria novo usuário
    const username = userData.preferred_username || userData.name || `govbr-${userData.sub}`
    const newUser = await account.create(
      ID.unique(),
      userEmail,
      userPassword,
      username
    )
    
    // Cria e retorna sessão para o novo usuário
    return await account.createSession(userEmail, userPassword)
  }
}