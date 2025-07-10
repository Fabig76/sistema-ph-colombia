'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiUtils } from '@/lib/api'

interface Inmueble {
  id: string
  tipo: string
  numero: string
  torre?: string
  estado: 'al_dia' | 'pendiente' | 'mora'
  ultimoPago?: string
  proximoPago?: string
}

export default function PropietariosInmuebles() {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([])
  const router = useRouter()
  
  useEffect(() => {
    // Verificar autenticación
    const checkAuth = async () => {
      try {
        // En un entorno real, esto verificaría el token con el backend
        const token = apiUtils.getAuthToken()
        if (!token) {
          router.push('/propietarios/login')
          return
        }
        
        // Obtener datos del usuario
        const userData = apiUtils.getUserData()
        if (!userData) {
          apiUtils.clearAuth()
          router.push('/propietarios/login')
          return
        }
        
        setUserData(userData)
        
        // Simular carga de inmuebles desde el backend
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Datos simulados de inmuebles
        const mockInmuebles: Inmueble[] = [
          {
            id: '1',
            tipo: 'Apartamento',
            numero: '301',
            torre: 'A',
            estado: 'al_dia',
            ultimoPago: '2023-10-15',
            proximoPago: '2023-11-15'
          },
          {
            id: '2',
            tipo: 'Parqueadero',
            numero: 'P12',
            torre: '',
            estado: 'al_dia',
            ultimoPago: '2023-10-15',
            proximoPago: '2023-11-15'
          }
        ]
        
        setInmuebles(mockInmuebles)
      } catch (error) {
        console.error('Error al cargar datos:', error)
        toast.error('Error al cargar tus inmuebles')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'al_dia':
        return 'Al día'
      case 'pendiente':
        return 'Pago pendiente'
      case 'mora':
        return 'En mora'
      default:
        return 'Desconocido'
    }
  }
  
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'al_dia':
        return 'text-green-600 bg-green-100'
      case 'pendiente':
        return 'text-yellow-600 bg-yellow-100'
      case 'mora':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }
  
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'al_dia':
        return <CheckCircle className="h-5 w-5" />
      case 'pendiente':
        return <Clock className="h-5 w-5" />
      case 'mora':
        return <AlertTriangle className="h-5 w-5" />
      default:
        return null
    }
  }
  
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const handleGenerarPazYSalvo = (inmuebleId: string) => {
    // En un entorno real, esto se conectaría con el backend para generar el paz y salvo
    // y luego redirigir a la página de descarga o mostrar un modal con el documento
    
    // Verificar si el inmueble está al día
    const inmueble = inmuebles.find(i => i.id === inmuebleId)
    if (!inmueble) {
      toast.error('Inmueble no encontrado')
      return
    }
    
    if (inmueble.estado !== 'al_dia') {
      toast.error('No puedes generar un paz y salvo para este inmueble porque no está al día en los pagos')
      return
    }
    
    // Simulamos la generación del paz y salvo
    toast.success('Generando paz y salvo...')
    setTimeout(() => {
      router.push(`/propietarios/paz-y-salvos?inmueble=${inmuebleId}`)
    }, 1000)
  }
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Cargando tus inmuebles...</p>
      </div>
    )
  }
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis inmuebles</h1>
        {userData?.copropiedad && (
          <p className="mt-1 text-sm text-gray-500">
            {userData.copropiedad.nombre} • NIT: {userData.copropiedad.nit}
          </p>
        )}
      </div>
      
      {inmuebles.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No tienes inmuebles registrados</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron inmuebles asociados a tu cuenta en esta copropiedad.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {inmuebles.map((inmueble, index) => (
            <motion.div
              key={inmueble.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white shadow overflow-hidden sm:rounded-lg"
            >
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {inmueble.tipo} {inmueble.torre ? `Torre ${inmueble.torre} - ` : ''}{inmueble.numero}
                  </h3>
                  <div className="mt-1 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(inmueble.estado)}`}>
                      {getEstadoIcon(inmueble.estado)}
                      <span className="ml-1">{getEstadoLabel(inmueble.estado)}</span>
                    </span>
                  </div>
                </div>
                
                {inmueble.estado === 'al_dia' && (
                  <button
                    onClick={() => handleGenerarPazYSalvo(inmueble.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Generar paz y salvo
                  </button>
                )}
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1 text-sm text-gray-900">{getEstadoLabel(inmueble.estado)}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Último pago</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(inmueble.ultimoPago || '')}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Próximo pago</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(inmueble.proximoPago || '')}</dd>
                  </div>
                </dl>
              </div>
              
              {inmueble.estado !== 'al_dia' && (
                <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-yellow-50">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-700">
                      Debes estar al día en tus pagos para generar un paz y salvo.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="mt-12 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Información importante</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Paz y salvos</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Los paz y salvos solo pueden ser generados para inmuebles que estén al día en sus pagos de administración.
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Validez</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Los paz y salvos generados tienen una validez de 30 días calendario a partir de su fecha de emisión.
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Soporte</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Si tienes problemas para generar tu paz y salvo o consideras que hay un error en tu estado de cuenta, 
                comunícate directamente con la administración de tu copropiedad.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
