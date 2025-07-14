'use client'

import { useEffect, useState } from 'react'

interface NoHydrationProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Componente para prevenir errores de hidratación
 * Renderiza solo en el cliente para evitar discrepancias servidor-cliente
 */
export default function NoHydration({ children, fallback = null }: NoHydrationProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
