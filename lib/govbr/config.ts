const defaultConfig = {
  ssoUrl: 'https://sso.codata.pb.gov.br/auth/',
  realm: 'paraiba',
  clientId: 'secties',
  redirectUri: 'https://procuraai-homolog.secties.pb.gov.br/api/login-gov/callback',
}

function isLocalhostRedirectUri(uri?: string): boolean {
  if (!uri) return false
  try {
    const hostname = new URL(uri).hostname
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return uri.includes('localhost') || uri.includes('127.0.0.1')
  }
}

function resolveConfiguredRedirectUri(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GOVBR_REDIRECT_URI?.trim()
  if (fromEnv && !isLocalhostRedirectUri(fromEnv)) {
    return fromEnv
  }
  return defaultConfig.redirectUri
}

export function getGovBrConfig() {
  return {
    ssoUrl: process.env.NEXT_PUBLIC_GOVBR_SSO_URL || defaultConfig.ssoUrl,
    realm: process.env.NEXT_PUBLIC_GOVBR_REALM || defaultConfig.realm,
    clientId: process.env.NEXT_PUBLIC_GOVBR_CLIENT_ID || defaultConfig.clientId,
    clientSecret: process.env.NEXT_PUBLIC_GOVBR_CLIENT_SECRET,
    redirectUri: resolveConfiguredRedirectUri(),
    callbackPath: '/api/login-gov/callback',
  }
}

export function buildAuthorizationUrl(state: string, redirectUri?: string): URL {
  const config = getGovBrConfig()
  const finalRedirectUri = redirectUri || config.redirectUri
  const authUrl = new URL(`${config.ssoUrl}realms/${config.realm}/protocol/openid-connect/auth`)
  
  authUrl.searchParams.append('client_id', config.clientId)
  authUrl.searchParams.append('redirect_uri', finalRedirectUri)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('scope', 'openid')
  authUrl.searchParams.append('state', state)
  
  return authUrl
}

export function buildTokenUrl(): string {
  const { ssoUrl, realm } = getGovBrConfig()
  return `${ssoUrl}realms/${realm}/protocol/openid-connect/token`
}

export function buildUserInfoUrl(): string {
  const { ssoUrl, realm } = getGovBrConfig()
  return `${ssoUrl}realms/${realm}/protocol/openid-connect/userinfo`
}