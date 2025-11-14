
const defaultConfig = {
  ssoUrl: 'https://sso.codata.pb.gov.br/auth/',
  realm: 'paraiba',
  clientId: 'secties',
  redirectUri: 'https://incubadora.horizontesdeinovacao.pb.gov.br/'
}

export function getGovBrConfig() {
  return {
    ssoUrl: process.env.NEXT_PUBLIC_GOVBR_SSO_URL || defaultConfig.ssoUrl,
    realm: process.env.NEXT_PUBLIC_GOVBR_REALM || defaultConfig.realm,
    clientId: process.env.NEXT_PUBLIC_GOVBR_CLIENT_ID || defaultConfig.clientId,
    clientSecret: process.env.NEXT_PUBLIC_GOVBR_CLIENT_SECRET,
    redirectUri: process.env.NEXT_PUBLIC_GOVBR_REDIRECT_URI || defaultConfig.redirectUri,
    callbackPath: '/api/login-gov/callback',
  }
}

export function buildAuthorizationUrl(baseUrl: string, state: string): URL {
  const config = getGovBrConfig()
  const authUrl = new URL(`${config.ssoUrl}realms/${config.realm}/protocol/openid-connect/auth`)
  
  authUrl.searchParams.append('client_id', config.clientId)
  authUrl.searchParams.append('redirect_uri', config.redirectUri)
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