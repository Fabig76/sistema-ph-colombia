'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { authApi } from '@/lib/api'
import { useRouter } from 'next/navigation'

// Tipos de usuario
interface AdminPh {
  id: string
  nombre: string
  telefono: string
  email: string
  createdAt: string
}

// Tipos del contexto
interface AuthContextType {
  user: AdminPh | null
  isLoading: boolean
  error: string | null
  login: (telefono: string, password: string) => Promise<boolean>
  logout: () => void
  register: (data: any) => Promise<any>
  resetAuthError: () => void
}

// Contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider del contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminPh | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Sincronización con localStorage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem('ph_auth_token')
        const userData = localStorage.getItem('ph_user_data')
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
          } catch (parseError) {
            // Limpiar datos corruptos
            localStorage.removeItem('ph_user_data')
            localStorage.removeItem('ph_auth_token')
          }
        }
      } catch (error) {
        setError('Error al restaurar la sesión')
      } finally {
        setIsLoading(false)
      }
    }
    
    // Ejecutar inmediatamente
    restoreSession()
    
    // Listener para cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ph_auth_token' || e.key === 'ph_user_data') {
        restoreSession()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Función de restauración manual
    ;(window as any).forceRestoreAuth = () => {
      restoreSession()
    }
    
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Función de login
  const login = async (telefono: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await authApi.loginAdminPh(telefono, password)
      
      if (response.token && response.admin && typeof response.admin === 'object') {
        // Almacenar token y datos del usuario SOLO si son válidos
        localStorage.setItem('ph_auth_token', response.token)
        localStorage.setItem('ph_user_data', JSON.stringify(response.admin))
        
        // Actualizar estado
        setUser(response.admin)
        setIsLoading(false)
        
        return true
      } else {
        console.error('Respuesta de login inválida:', { token: !!response.token, admin: response.admin })
        throw new Error('Error en el login - datos inválidos')
      }
    } catch (error: any) {
      console.error('Error en login:', error)
      setError(error.message || 'Error de conexión')
      setIsLoading(false)
      return false
    }
  }

  // Función de logout
  const logout = () => {
    localStorage.removeItem('ph_auth_token')
    localStorage.removeItem('ph_user_data')
    setUser(null)
    setError(null)
    router.push('/admin-ph')
  }

  // Función de registro
  const register = async (data: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await authApi.registerAdminPh(data)
      setIsLoading(false)
      return response
    } catch (error: any) {
      console.error('Error en registro:', error)
      setError(error.message || 'Error en el registro')
      setIsLoading(false)
      throw error
    }
  }

  // Función para limpiar errores
  const resetAuthError = () => {
    setError(null)
  }

  // Valor del contexto
  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    register,
    resetAuthError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar el contexto
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
