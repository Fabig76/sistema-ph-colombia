'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  allowedRoles?: string[]
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/admin-ph', 
  allowedRoles = [] 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const hasRedirected = useRef(false)
  const [localUser, setLocalUser] = useState<any>(null)
  const [localLoading, setLocalLoading] = useState(true)

  useEffect(() => {
    // Verificar estado de autenticación

    // Solo proceder si la carga ha terminado completamente
    if (!isLoading) {
      if (user) {
        // Reset redirect flag if user is authenticated
        hasRedirected.current = false
      } else {
        // Solo redirigir una vez
        if (!hasRedirected.current) {
          hasRedirected.current = true
          router.push(redirectTo)
        }
      }
    } else {
      console.log('⏳ ProtectedRoute.FINAL - Esperando autenticación...')
    }
  }, [user, isLoading, router, redirectTo])

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, no mostrar nada (la redirección ya se activó)
  if (!user) {
    return null
  }

  // Si todo está bien, mostrar el contenido protegido
  return <>{children}</>
}
