'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', label: 'Resumen', icon: 'BarChart3' },
    { id: 'registrar', label: 'Registrar Propiedad', icon: 'PlusCircle' },
    { id: 'copropiedades', label: 'Mis Copropiedades', icon: 'Building2' },
    { id: 'pagos', label: 'Pagos', icon: 'CreditCard' },
    { id: 'estadisticas', label: 'Estadísticas', icon: 'TrendingUp' },
    { id: 'perfil', label: 'Perfil', icon: 'User' }
  ]

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                      fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform 
                      lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300`}>
        <Sidebar 
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          user={user}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogout={logout}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
