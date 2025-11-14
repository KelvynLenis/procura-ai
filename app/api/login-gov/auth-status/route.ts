import { NextResponse } from 'next/server'
import { generateAuthState } from '@/lib/govbr/auth'
import { buildAuthorizationUrl } from '@/lib/govbr/config'

export async function GET(request: Request) {
  const state = generateAuthState()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin
  const authUrl = buildAuthorizationUrl(baseUrl, state)
  
  const response = NextResponse.redirect(authUrl.toString())
  
  // Cookie para proteção CSRF
  response.cookies.set('govbr_auth_state', state, {
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 // 15 minutos
  })
  
  return response
}
