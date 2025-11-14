'use client'

import { account } from '@/lib/appwrite'

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
    try {
      await account.deleteSession('current')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }
}