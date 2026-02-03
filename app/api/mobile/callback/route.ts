/**
 * Callback específico para mobile usando expo-web-browser
 * 
 * O expo-web-browser captura esta URL automaticamente
 * Processamos o OAuth e redirecionamos para página HTML simples
 */

import { NextResponse } from 'next/server'
import { exchangeCodeForToken, getUserInfo } from '@/lib/govbr/auth'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const state = url.searchParams.get('state')
  
  // Verifica erros na resposta do Gov.br
  if (error || !code) {
    const errorType = error || 'missing_code'
    
    return NextResponse.json({
      success: false,
      error: errorType,
      message: error ? `Erro Gov.br: ${error}` : 'Código de autorização não fornecido',
      timestamp: new Date().toISOString()
    }, {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  }
  
  try {
    // Obtém token e informações do usuário do Gov.br
    const tokenResponse = await exchangeCodeForToken(code)
    const userData = await getUserInfo(tokenResponse.access_token)
    
    // Retornar JSON diretamente para o mobile processar
    return NextResponse.json({
      success: true,
      data: {
        sub: userData.sub,
        name: userData.name || null,
        email: userData.email || null,
        preferred_username: userData.preferred_username || null,
        cpf: userData.sub,
      },
      timestamp: new Date().toISOString()
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'authentication_failed',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  }
}
