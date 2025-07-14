'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import DashboardLayout from '../components/DashboardLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import PerfilForm from '../components/perfil/PerfilForm'
import CambioPasswordForm from '../components/perfil/CambioPasswordForm'
import PerfilSkeleton from '../components/perfil/PerfilSkeleton'
import { User, KeyRound } from 'lucide-react'

export default function PerfilPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('informacion')
  
  // Datos de perfil (simulados por ahora)
  const [perfilData, setPerfilData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fechaRegistro: ''
  })

  // Redirección si no hay usuario autenticado
  useEffect(() => {
    if (!user) {
      router.push('/admin-ph')
    }
  }, [user, router])

  // Cargar datos de perfil (simulado por ahora)
  useEffect(() => {
    const fetchPerfilData = async () => {
      setIsLoading(true)
      
      // Simular una carga de datos desde la API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Datos simulados - se reemplazará con la llamada real a la API
      setPerfilData({
        nombre: user?.nombre || 'Usuario Administrador',
        telefono: user?.telefono || '3001234567',
        email: user?.email || 'admin@example.com',
        fechaRegistro: new Date(user?.createdAt || Date.now()).toLocaleDateString('es-CO')
      })
      
      setIsLoading(false)
    }
    
    if (user) {
      fetchPerfilData()
    }
  }, [user])

  if (!user) {
    return null // No renderizar si no hay usuario
  }

  return (
    <ProtectedRoute redirectTo="/admin-ph">
      <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Mi Perfil
        </h1>
        
        {/* Tabs de navegación */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('informacion')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === 'informacion' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <User size={16} className="mr-2" />
              Información Personal
            </button>
            
            <button
              onClick={() => setActiveTab('seguridad')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === 'seguridad' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <KeyRound size={16} className="mr-2" />
              Seguridad
            </button>
          </nav>
        </div>
        
        {/* Contenido del tab */}
        <div className="py-6">
          {isLoading ? (
            <PerfilSkeleton />
          ) : (
            <>
              {activeTab === 'informacion' && (
                <PerfilForm 
                  initialData={perfilData}
                />
              )}
              
              {activeTab === 'seguridad' && (
                <CambioPasswordForm />
              )}
            </>
          )}
        </div>
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
