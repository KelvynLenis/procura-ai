export interface GovBrUserData {
  sub: string;
  email?: string | null;
  name?: string | null;
  preferred_username?: string | null;
}

export function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }
  return null;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function formatUserData(userData: GovBrUserData) {
  return {
    email: userData.email || `govbr-${userData.sub}@procuraai.secties.pb.gov.br`,
    password: userData.sub,
    name: userData.name || userData.preferred_username || 'Usuário Gov.br',
    cpf: userData.sub
  };
}

export function isLoginError(error: any): boolean {
  return error?.code === 401 || error?.type === 'user_invalid_credentials';
}

export function isUserExistsError(error: any): boolean {
  return error?.code === 409 || 
         error?.type === 'user_already_exists' ||
         error?.message?.includes('user_already_exists');
}