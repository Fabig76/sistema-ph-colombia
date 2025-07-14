'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import DashboardLayout from '../components/DashboardLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import EstadisticasResumen from '../components/estadisticas/EstadisticasResumen'
import GraficoActividad from '../components/estadisticas/GraficoActividad'
import GraficoDistribucion from '../components/estadisticas/GraficoDistribucion'
import EstadisticasSkeleton from '../components/estadisticas/EstadisticasSkeleton'
import { RefreshCw, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Tipos de datos para estadísticas
interface EstadisticasData {
  resumen: {
    totalCopropiedades: number
    totalPropietarios: number
    pazYSalvosGenerados: number
    consultasRealizadas: number
  }
  actividad: {
    labels: string[]
    pazYSalvos: number[]
    consultas: number[]
  }
  distribucion: {
    tiposCopropiedad: {
      labels: string[]
      data: number[]
    }
    estadoPago: {
      labels: string[]
      data: number[]
    }
  }
}

export default function EstadisticasPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('ultimos30dias')

  // ProtectedRoute maneja la autenticación automáticamente

  // Cargar datos de estadísticas (simulado por ahora)
  useEffect(() => {
    const fetchEstadisticas = async () => {
      setIsLoading(true)
      
      // Simular una carga de datos desde la API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Datos simulados - se reemplazará con la llamada real a la API
      const mockData: EstadisticasData = {
        resumen: {
          totalCopropiedades: 3,
          totalPropietarios: 230,
          pazYSalvosGenerados: 45,
          consultasRealizadas: 120
        },
        actividad: {
          labels: ['01/07', '08/07', '15/07', '22/07', '29/07', '05/08', '12/08'],
          pazYSalvos: [5, 8, 12, 7, 9, 11, 6],
          consultas: [15, 12, 18, 22, 17, 20, 16]
        },
        distribucion: {
          tiposCopropiedad: {
            labels: ['Residencial', 'Comercial', 'Mixto'],
            data: [75, 15, 10]
          },
          estadoPago: {
            labels: ['Al día', 'En mora'],
            data: [80, 20]
          }
        }
      }
      
      setEstadisticas(mockData)
      setIsLoading(false)
    }
    
    fetchEstadisticas()
  }, [periodoSeleccionado])
  
  // Función para refrescar datos
  const refreshEstadisticas = async () => {
    setIsRefreshing(true)
    
    // Simular actualización
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsRefreshing(false)
    toast.success('Estadísticas actualizadas correctamente')
  }

  // Cambiar período
  const handleChangePeriodo = (periodo: string) => {
    setPeriodoSeleccionado(periodo)
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
            Estadísticas y Análisis
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Selector de período */}
            <div className="relative inline-block">
              <div className="flex items-center">
                <Calendar size={18} className="text-gray-400 mr-2" />
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={periodoSeleccionado}
                  onChange={(e) => handleChangePeriodo(e.target.value)}
                >
                  <option value="ultimos7dias">Últimos 7 días</option>
                  <option value="ultimos30dias">Últimos 30 días</option>
                  <option value="ultimos90dias">Últimos 3 meses</option>
                  <option value="ultimo365dias">Último año</option>
                </select>
              </div>
            </div>
            
            {/* Botón de refrescar */}
            <button
              onClick={refreshEstadisticas}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar datos
            </button>
          </div>
        </div>
        
        {/* Estado de carga */}
        {isLoading ? (
          <EstadisticasSkeleton />
        ) : estadisticas ? (
          <div className="space-y-8">
            {/* Resumen de métricas clave */}
            <EstadisticasResumen 
              totalCopropiedades={estadisticas.resumen.totalCopropiedades}
              totalPropietarios={estadisticas.resumen.totalPropietarios}
              pazYSalvosGenerados={estadisticas.resumen.pazYSalvosGenerados}
              consultasRealizadas={estadisticas.resumen.consultasRealizadas}
            />
            
            {/* Gráfico de actividad */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h2>
              <GraficoActividad 
                labels={estadisticas.actividad.labels}
                pazYSalvos={estadisticas.actividad.pazYSalvos}
                consultas={estadisticas.actividad.consultas}
              />
            </div>
            
            {/* Gráficos de distribución */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Tipos de Copropiedades</h2>
                <GraficoDistribucion 
                  labels={estadisticas.distribucion.tiposCopropiedad.labels}
                  data={estadisticas.distribucion.tiposCopropiedad.data}
                  colors={['#3b82f6', '#f59e0b', '#10b981']}
                />
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Estado de Pagos</h2>
                <GraficoDistribucion 
                  labels={estadisticas.distribucion.estadoPago.labels}
                  data={estadisticas.distribucion.estadoPago.data}
                  colors={['#10b981', '#ef4444']}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No hay estadísticas disponibles</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontraron datos para el periodo seleccionado.
            </p>
            <div className="mt-6">
              <button
                onClick={refreshEstadisticas}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw size={18} className="mr-2" />
                Intentar nuevamente
              </button>
            </div>
          </div>
        )}
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
