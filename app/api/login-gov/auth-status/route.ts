import { NextResponse } from 'next/server'
import { resolveGovBrRedirectUri } from '@/lib/base-url'
import { generateAuthState } from '@/lib/govbr/auth'
import { buildAuthorizationUrl } from '@/lib/govbr/config'

export async function GET(request: Request) {
  const state = generateAuthState()
  const redirectUri = resolveGovBrRedirectUri(request)
  const authUrl = buildAuthorizationUrl(state, redirectUri)
  
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
