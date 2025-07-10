'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import NavbarPropietarios from '@/components/propietarios/NavbarPropietarios'
import { apiUtils } from '@/lib/api'
import toast from 'react-hot-toast'

export default function PropietariosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const [userData, setUserData] = useState<any>(null)
  
  useEffect(() => {
    setMounted(true)
    
    // Verificar autenticación
    const isAuth = apiUtils.isAuthenticated()
    const user = apiUtils.getUserData()
    
    if (!isAuth || !user) {
      // Solo redirigimos si estamos en una página que requiere autenticación
      // La página principal de propietarios es pública
      if (pathname !== '/propietarios' && pathname !== '/propietarios/login' && pathname !== '/propietarios/registro') {
        toast.error('Acceso no autorizado. Por favor inicia sesión.')
        window.location.href = '/propietarios/login'
        return
      }
    } else {
      setUserData(user)
    }
  }, [pathname])
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Cargando...</div>
      </div>
    )
  }
  
  // Si estamos en la página principal de propietarios, login o registro, no mostramos el layout
  if (pathname === '/propietarios' || pathname === '/propietarios/login' || pathname === '/propietarios/registro') {
    return <>{children}</>
  }
  
  // Usamos el nuevo componente NavbarPropietarios para la navegación
  return (
    <div className="min-h-screen bg-gray-100">
      <NavbarPropietarios />
      <main className="py-6 px-4 sm:px-6 lg:px-8 pt-20">
        {children}
      </main>
    </div>
  )
}
