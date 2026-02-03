import { NextResponse } from 'next/server'
import { getGovBrConfig, buildAuthorizationUrl } from '@/lib/govbr/config'

export async function GET() {
  try {
    const config = getGovBrConfig()
    
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const state = `mobile_${timestamp}_${randomString}`
    
    const baseUrl = config.redirectUri!.replace('/api/login-gov/callback', '')
    const authUrl = buildAuthorizationUrl(baseUrl, state)
    
    return NextResponse.json({
      success: true,
      authUrl: authUrl.toString(),
      redirectUri: config.redirectUri,
      state,
      expiresIn: 300
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (error) {
    console.error('Erro ao gerar URL de autenticação:', error)
    return NextResponse.json({
      success: false,
      error: 'failed_to_generate_auth_url',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
