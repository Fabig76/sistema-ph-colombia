'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Users, 
  Building2, 
  FileText, 
  AlertTriangle,
  Server,
  TrendingUp
} from 'lucide-react'
import { adminSistemaApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminSistemaDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalCopropiedades: 0,
    totalPropietarios: 0,
    totalPazYSalvos: 0,
    servidorStatus: 'online',
    alertas: [] as { id: number; mensaje: string; nivel: string }[]
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Simulamos una pequeña carga y luego mostramos datos mock
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Datos de ejemplo para testing
        setStats({
          totalAdmins: 12,
          totalCopropiedades: 45,
          totalPropietarios: 1250,
          totalPazYSalvos: 3200,
          servidorStatus: 'online',
          alertas: [
            { id: 1, mensaje: 'Sistema funcionando correctamente', nivel: 'info' },
            { id: 2, mensaje: 'Backup realizado exitosamente', nivel: 'success' }
          ]
        })
        
        toast.success('Dashboard cargado correctamente')
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error)
        toast.error('Error al cargar datos del dashboard')
        setStats(prev => ({
          ...prev,
          servidorStatus: 'error'
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const StatCard = ({ title, value, icon: Icon, color }: {
    title: string
    value: number | string
    icon: React.ComponentType<{ className?: string }>
    color: string
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`rounded-full p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">Monitoreo y estadísticas del sistema</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Administradores" 
              value={stats.totalAdmins} 
              icon={Users} 
              color="bg-blue-600" 
            />
            <StatCard 
              title="Copropiedades" 
              value={stats.totalCopropiedades} 
              icon={Building2} 
              color="bg-green-600" 
            />
            <StatCard 
              title="Propietarios" 
              value={stats.totalPropietarios} 
              icon={Users} 
              color="bg-purple-600" 
            />
            <StatCard 
              title="Paz y Salvos" 
              value={stats.totalPazYSalvos} 
              icon={FileText} 
              color="bg-amber-600" 
            />
          </div>

          {/* Estado del servidor */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estado del Sistema</h3>
              <div className="flex items-center">
                <Server className="h-5 w-5 text-gray-500 mr-2" />
                <span className="mr-2">Servidor:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stats.servidorStatus === 'online' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stats.servidorStatus === 'online' ? 'En línea' : 'Error'}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-gray-500 mr-2" />
                  <span>Rendimiento:</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas y notificaciones */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas y notificaciones</h3>
              
              {stats.alertas.length === 0 ? (
                <p className="text-gray-500">No hay alertas activas</p>
              ) : (
                <div className="space-y-4">
                  {stats.alertas.map(alerta => (
                    <div 
                      key={alerta.id} 
                      className={`p-4 rounded-lg flex items-start ${
                        alerta.nivel === 'warning' 
                          ? 'bg-amber-50 border border-amber-200' 
                          : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <AlertTriangle className={`h-5 w-5 ${
                        alerta.nivel === 'warning' ? 'text-amber-500' : 'text-blue-500'
                      }`} />
                      <span className="ml-3">{alerta.mensaje}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
