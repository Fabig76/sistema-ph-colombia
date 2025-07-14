'use client'

import { usePathname } from 'next/navigation'

export default function AdminPHLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Páginas públicas que no necesitan autenticación
  const publicPages = ['/admin-ph/login', '/admin-ph/registro', '/admin-ph/verificar-sms']
  const isPublicPage = publicPages.some(page => pathname.startsWith(page))
  
  // Para páginas públicas, renderizar directamente sin layout
  if (isPublicPage) {
    return <>{children}</>
  }
  
  // Para páginas protegidas, por ahora solo renderizar el contenido
  // TODO: Implementar sidebar y navegación completa
  return (
    <div className="min-h-screen bg-gray-100" suppressHydrationWarning>
      <div className="py-6" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel de Administración</h1>
          {children}
        </div>
      </div>
    </div>
  )
}

// Función para obtener iniciales de un nombre
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
