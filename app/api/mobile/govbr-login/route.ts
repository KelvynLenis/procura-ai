import { NextResponse } from 'next/server'
import { buildAuthorizationUrl } from '@/lib/govbr/config'

export async function GET(request: Request) {
  try {
    // Gerar state com marcador mobile
    const state = `mobile_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // Construir URL de autorização Gov.br
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://procuraai.secties.pb.gov.br'
    const authUrl = buildAuthorizationUrl(baseUrl, state)
    
    // Redirecionar para Gov.br
    return NextResponse.redirect(authUrl.toString())
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao iniciar autenticação' },
      { status: 500 }
    )
  }
}
