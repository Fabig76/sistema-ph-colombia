'use client'

import { AuthProvider as AuthContextProvider } from '@/lib/hooks/useAuth'
import { ReactNode } from 'react'

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContextProvider>{children}</AuthContextProvider>
}

export default AuthProvider
