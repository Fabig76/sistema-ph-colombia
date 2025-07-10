'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Building2,
  Users,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Home,
  PieChart
} from 'lucide-react'
import { apiUtils } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminPHLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const [userData, setUserData] = useState<any>(null)
  
  useEffect(() => {
    setMounted(true)
    
    // Verificar autenticación
    const isAuth = apiUtils.isAuthenticated()
    const user = apiUtils.getUserData()
    
    if (!isAuth || !user) {
      toast.error('Acceso no autorizado. Por favor inicia sesión.')
      window.location.href = '/admin-ph/login'
      return
    }
    
    setUserData(user)
  }, [])
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Cargando panel de administración...</div>
      </div>
    )
  }
  
  const navigation = [
    { name: 'Dashboard', href: '/admin-ph', icon: PieChart, current: pathname === '/admin-ph' },
    { name: 'Copropiedades', href: '/admin-ph/copropiedades', icon: Building2, current: pathname === '/admin-ph/copropiedades' || pathname.startsWith('/admin-ph/copropiedades/') },
    { name: 'Propietarios', href: '/admin-ph/propietarios', icon: Users, current: pathname === '/admin-ph/propietarios' },
    { name: 'Paz y Salvos', href: '/admin-ph/paz-y-salvos', icon: FileText, current: pathname === '/admin-ph/paz-y-salvos' },
    { name: 'Pagos', href: '/admin-ph/pagos', icon: CreditCard, current: pathname === '/admin-ph/pagos' },
    { name: 'Mi Cuenta', href: '/admin-ph/cuenta', icon: Settings, current: pathname === '/admin-ph/cuenta' },
  ]
  
  const handleLogout = () => {
    apiUtils.clearAuth()
    toast.success('Sesión cerrada correctamente')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar para móvil */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-white shadow-lg">
          <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-white">Admin PH</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-4 py-4">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-4 py-3 text-sm font-medium rounded-md
                      ${item.current 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                    `}
                  >
                    <item.icon className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${item.current ? 'text-blue-600' : 'text-gray-500'}
                    `} />
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 w-full"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex items-center h-16 px-6 bg-blue-600">
          <span className="text-xl font-semibold text-white">Admin PH</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="px-4 py-4">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-md
                    ${item.current 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  <item.icon className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${item.current ? 'text-blue-600' : 'text-gray-500'}
                  `} />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 w-full"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Barra superior */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden -ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-3 text-xl font-semibold text-gray-900 lg:ml-0">
                Panel de Administrador PH
              </h1>
            </div>
            <div className="flex items-center">
              <Link href="/" className="mr-4 text-gray-500 hover:text-gray-700">
                <Home className="h-5 w-5" />
              </Link>
              <div className="relative ml-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {userData?.nombre ? getInitials(userData.nombre) : 'AP'}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {userData?.nombre ? userData.nombre : 'Administrador'}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
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
