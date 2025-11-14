import { NextResponse } from 'next/server'
import { exchangeCodeForToken, getUserInfo, createOrUpdateUser } from '@/lib/govbr/auth'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  
  // Verifica erros na resposta do Gov.br
  if (error || !code) {
    const errorType = error ? 'govbr_auth_failed' : 'govbr_missing_code'
    const baseUrl = 'https://procuraai.secties.pb.gov.br'
    return NextResponse.redirect(new URL(`/login?error=${errorType}`, baseUrl))
  }
  
  try {
    // Obtém token e informações do usuário
    const tokenResponse = await exchangeCodeForToken(code)
    const userData = await getUserInfo(tokenResponse.access_token)
    const userResult = await createOrUpdateUser(userData)
    
    // Prepara redirecionamento usando a URL de produção
    const baseUrl = 'https://procuraai.secties.pb.gov.br'
    const redirectUrl = new URL('/meus-dispositivos', baseUrl)
    const response = NextResponse.redirect(redirectUrl)
    
    // Configura cookies
    response.cookies.set('govbr_access_token', tokenResponse.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 3600
    })
    
    response.cookies.set('govbr_auth_state', '', {
      expires: new Date(0)
    })
    
    return response
  } catch (error) {
    console.error('Erro durante autenticação:', error)
    
    const errorMessage = error instanceof Error ? 
      encodeURIComponent(error.message.substring(0, 100)) : 
      'unknown_error'
    
    // Usar a URL base correta para o redirecionamento  
    const baseUrl = 'https://procuraai.secties.pb.gov.br'
    const loginUrl = new URL('/login', baseUrl)
    loginUrl.searchParams.set('error', 'govbr_system_error')
    loginUrl.searchParams.set('details', errorMessage)
    
    return NextResponse.redirect(loginUrl)
  }
}
