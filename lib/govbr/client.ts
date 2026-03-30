'use client'

import { account } from '@/lib/appwrite'
import { logoutToAppHome } from '@/lib/govbr/logout'

export const GovBrAuthService = {
  login: () => {
    window.location.href = '/api/login-gov/auth-status'
  },

  isAuthenticated: async (): Promise<boolean> => {
    try {
      const session = await account.get()
      return !!session.$id
    } catch {
      return false
    }
  },

  logout: async (): Promise<void> => {
    await logoutToAppHome()
  }
}