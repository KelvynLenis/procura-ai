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

export async function exchangeCodeForToken(
  code: string,
  redirectUri?: string,
): Promise<TokenResponse> {
  const config = getGovBrConfig()
  const finalRedirectUri = redirectUri || config.redirectUri

  if (!config.clientId || !config.clientSecret || !finalRedirectUri) {
    throw new Error('Configurações incompletas para troca de token')
  }

  const tokenEndpoint = buildTokenUrl()
  const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')

  const formData = new URLSearchParams()
  formData.append('grant_type', 'authorization_code')
  formData.append('code', code)
  formData.append('redirect_uri', finalRedirectUri)

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