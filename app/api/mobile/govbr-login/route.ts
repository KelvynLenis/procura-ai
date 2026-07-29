import { NextResponse } from 'next/server'
import { resolveGovBrRedirectUri } from '@/lib/base-url'
import { buildAuthorizationUrl } from '@/lib/govbr/config'

export async function GET(request: Request) {
  try {
    const state = `mobile_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const redirectUri = resolveGovBrRedirectUri(request)
    const authUrl = buildAuthorizationUrl(state, redirectUri)
    
    // Redirecionar para Gov.br
    return NextResponse.redirect(authUrl.toString())
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao iniciar autenticação' },
      { status: 500 }
    )
  }
}
