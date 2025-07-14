'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import DashboardLayout from '../components/DashboardLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import CopropiedadList from '../components/mis-copropiedades/CopropiedadList'
import CopropiedadSkeleton from '../components/mis-copropiedades/CopropiedadSkeleton'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Tipo para la copropiedad
interface Copropiedad {
  id: string
  nit: string
  nombre: string
  fechaRegistro: string
  propietariosCount: number
  sheetsUrl: string
  docsUrl: string
}

export default function MisCopropiedadesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [copropiedades, setCopropiedades] = useState<Copropiedad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Redirección si no hay usuario autenticado
  useEffect(() => {
    if (!user) {
      router.push('/admin-ph')
    }
  }, [user, router])

  // Cargar datos de copropiedades (simulado por ahora)
  useEffect(() => {
    const fetchCopropiedades = async () => {
      // Simular una carga de datos desde la API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Datos simulados - se reemplazará con la llamada real a la API
      const mockData: Copropiedad[] = [
        {
          id: '1',
          nit: '901234567-1',
          nombre: 'Conjunto Residencial Las Palmas',
          fechaRegistro: '2023-10-15',
          propietariosCount: 45,
          sheetsUrl: 'https://docs.google.com/spreadsheets/d/abc123',
          docsUrl: 'https://docs.google.com/document/d/xyz456'
        },
        {
          id: '2',
          nit: '900987654-3',
          nombre: 'Edificio Montecarlo Plaza',
          fechaRegistro: '2023-11-20',
          propietariosCount: 120,
          sheetsUrl: 'https://docs.google.com/spreadsheets/d/def456',
          docsUrl: 'https://docs.google.com/document/d/uvw789'
        },
        {
          id: '3',
          nit: '901456789-2',
          nombre: 'Conjunto Cerrado Bosques de Santafé',
          fechaRegistro: '2024-01-05',
          propietariosCount: 65,
          sheetsUrl: 'https://docs.google.com/spreadsheets/d/ghi789',
          docsUrl: 'https://docs.google.com/document/d/jkl012'
        }
      ]
      
      setCopropiedades(mockData)
      setIsLoading(false)
    }
    
    fetchCopropiedades()
  }, [])
  
  // Función para refrescar datos
  const refreshCopropiedades = async () => {
    setIsRefreshing(true)
    // Simular actualización
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
    toast.success('Datos actualizados correctamente')
  }

  // Filtrar copropiedades por búsqueda
  const filteredCopropiedades = copropiedades.filter(
    copropiedad => 
      copropiedad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      copropiedad.nit.includes(searchTerm)
  )

  // Manejar eliminación de copropiedad
  const handleDeleteCopropiedad = async (id: string) => {
    try {
      // Simulación de eliminación - será reemplazado con la llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Actualizar estado local
      setCopropiedades(copropiedades.filter(c => c.id !== id))
      toast.success('Copropiedad eliminada correctamente')
    } catch (error) {
      console.error('Error al eliminar copropiedad:', error)
      toast.error('Error al eliminar la copropiedad')
    }
  }

  if (!user) {
    return null // No renderizar si no hay usuario
  }

  return (
    <ProtectedRoute redirectTo="/admin-ph">
      <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Mis Copropiedades
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Buscar copropiedad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              onClick={refreshCopropiedades}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refrescar
            </button>
            
            <button
              onClick={() => router.push('/admin-ph/dashboard/registrar')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={18} className="mr-2" />
              Agregar Copropiedad
            </button>
          </div>
        </div>
        
        {/* Estado de carga */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            <CopropiedadSkeleton />
            <CopropiedadSkeleton />
            <CopropiedadSkeleton />
          </div>
        ) : filteredCopropiedades.length > 0 ? (
          <CopropiedadList 
            copropiedades={filteredCopropiedades}
            onDelete={handleDeleteCopropiedad}
          />
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {searchTerm ? 'No se encontraron resultados' : 'No hay copropiedades registradas'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? `No se encontraron copropiedades que coincidan con "${searchTerm}".` 
                : 'Comience registrando su primera copropiedad para empezar a gestionarla.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => router.push('/admin-ph/dashboard/registrar')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus size={18} className="mr-2" />
                  Registrar Copropiedad
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
