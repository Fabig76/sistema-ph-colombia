'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, LoginCredentials, VerificationData } from '@/types/auth'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; requiresVerification?: boolean }>
  logout: () => void
  verifyCode: (data: VerificationData) => Promise<{ success: boolean }>
  sendVerificationCode: (telefono: string) => Promise<{ success: boolean }>
  clearError: () => void
  checkAuthStatus: () => void
}

export const useAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  })

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = useCallback(() => {
    try {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')
      
      if (token && userData) {
        const user = JSON.parse(userData)
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true
        }))
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Simular diferentes tipos de login
      if (credentials.telefono && !credentials.email) {
        // Login de propietario - requiere verificación SMS
        return { success: true, requiresVerification: true }
      }

      // Login de admin - directo
      const mockUser: User = {
        id: '1',
        nombre: credentials.email === 'admin@test.com' ? 'Admin Sistema' : 'Admin PH',
        email: credentials.email || '',
        telefono: credentials.telefono || '',
        tipo: credentials.email === 'admin@test.com' ? 'admin_sistema' : 'admin_ph'
      }

      // Guardar en localStorage
      localStorage.setItem('auth_token', 'mock_token_' + Date.now())
      localStorage.setItem('user_data', JSON.stringify(mockUser))

      setState(prev => ({
        ...prev,
        user: mockUser,
        isAuthenticated: true,
        loading: false
      }))

      toast.success(`¡Bienvenido, ${mockUser.nombre}!`)
      return { success: true }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de autenticación'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      toast.error(errorMessage)
      return { success: false }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    
    setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    })

    toast.success('Sesión cerrada correctamente')
  }, [])

  const sendVerificationCode = useCallback(async (telefono: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Simular envío de SMS
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Validar formato de teléfono colombiano
      if (!/^3\d{9}$/.test(telefono)) {
        throw new Error('Número de teléfono inválido')
      }

      setState(prev => ({ ...prev, loading: false }))
      toast.success(`Código enviado al ${telefono}`)
      return { success: true }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error enviando código'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      toast.error(errorMessage)
      return { success: false }
    }
  }, [])

  const verifyCode = useCallback(async (data: VerificationData) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Simular verificación
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Para pruebas, aceptar código 123456
      if (data.codigo !== '123456') {
        throw new Error('Código de verificación incorrecto')
      }

      const mockUser: User = {
        id: '2',
        nombre: 'Propietario',
        email: '',
        telefono: data.telefono,
        tipo: 'propietario'
      }

      // Guardar en localStorage
      localStorage.setItem('auth_token', 'mock_token_' + Date.now())
      localStorage.setItem('user_data', JSON.stringify(mockUser))

      setState(prev => ({
        ...prev,
        user: mockUser,
        isAuthenticated: true,
        loading: false
      }))

      toast.success('¡Verificación exitosa!')
      return { success: true }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de verificación'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      toast.error(errorMessage)
      return { success: false }
    }
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    login,
    logout,
    verifyCode,
    sendVerificationCode,
    clearError,
    checkAuthStatus
  }
}
