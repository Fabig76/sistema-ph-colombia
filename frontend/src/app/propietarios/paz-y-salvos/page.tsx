'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, Download, Calendar, Clock, CheckCircle, ArrowLeft, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiUtils } from '@/lib/api'

interface PazYSalvo {
  id: string
  inmuebleId: string
  inmuebleInfo: string
  fechaGeneracion: string
  fechaVencimiento: string
  estado: 'vigente' | 'vencido'
  url: string
}

export default function PropietariosPazYSalvos() {
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [pazYSalvos, setPazYSalvos] = useState<PazYSalvo[]>([])
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  
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
        
        // Verificar si hay un inmueble en los parámetros de búsqueda
        const inmuebleId = searchParams.get('inmueble')
        if (inmuebleId) {
          setInmuebleSeleccionado(inmuebleId)
          await generarNuevoPazYSalvo(inmuebleId)
        }
        
        // Simular carga de paz y salvos desde el backend
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Datos simulados de paz y salvos
        const mockPazYSalvos: PazYSalvo[] = [
          {
            id: '1',
            inmuebleId: '1',
            inmuebleInfo: 'Apartamento Torre A - 301',
            fechaGeneracion: '2023-10-15',
            fechaVencimiento: '2023-11-14',
            estado: 'vigente',
            url: '#'
          },
          {
            id: '2',
            inmuebleId: '1',
            inmuebleInfo: 'Apartamento Torre A - 301',
            fechaGeneracion: '2023-09-15',
            fechaVencimiento: '2023-10-14',
            estado: 'vencido',
            url: '#'
          },
          {
            id: '3',
            inmuebleId: '2',
            inmuebleInfo: 'Parqueadero P12',
            fechaGeneracion: '2023-10-15',
            fechaVencimiento: '2023-11-14',
            estado: 'vigente',
            url: '#'
          }
        ]
        
        setPazYSalvos(mockPazYSalvos)
      } catch (error) {
        console.error('Error al cargar datos:', error)
        toast.error('Error al cargar tus paz y salvos')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router, searchParams])
  
  const generarNuevoPazYSalvo = async (inmuebleId: string) => {
    try {
      setGenerando(true)
      
      // En un entorno real, esto se conectaría con el backend para generar el paz y salvo
      // y luego redirigir a la página de descarga o mostrar un modal con el documento
      
      // Simulamos la generación del paz y salvo
      toast.success('Generando paz y salvo...')
      
      // Simulamos un tiempo de generación
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulamos que se ha generado correctamente
      toast.success('Paz y salvo generado correctamente')
      
      // Actualizar la lista de paz y salvos con el nuevo documento
      const hoy = new Date()
      const vencimiento = new Date()
      vencimiento.setDate(hoy.getDate() + 30) // Vence en 30 días
      
      const nuevoPazYSalvo: PazYSalvo = {
        id: `nuevo-${Date.now()}`,
        inmuebleId,
        inmuebleInfo: inmuebleId === '1' ? 'Apartamento Torre A - 301' : 'Parqueadero P12',
        fechaGeneracion: hoy.toISOString().split('T')[0],
        fechaVencimiento: vencimiento.toISOString().split('T')[0],
        estado: 'vigente',
        url: '#'
      }
      
      setPazYSalvos(prev => [nuevoPazYSalvo, ...prev])
    } catch (error) {
      console.error('Error al generar paz y salvo:', error)
      toast.error('Error al generar el paz y salvo')
    } finally {
      setGenerando(false)
      setInmuebleSeleccionado(null)
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
  
  const handleDescargar = (pazYSalvo: PazYSalvo) => {
    // En un entorno real, esto descargaría el PDF del paz y salvo
    toast.success('Descargando paz y salvo...')
  }
  
  const handleImprimir = (pazYSalvo: PazYSalvo) => {
    // En un entorno real, esto abriría la ventana de impresión con el PDF
    toast.success('Preparando documento para imprimir...')
  }
  
  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return 'Vigente'
      case 'vencido':
        return 'Vencido'
      default:
        return 'Desconocido'
    }
  }
  
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return 'text-green-600 bg-green-100'
      case 'vencido':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }
  
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return <CheckCircle className="h-5 w-5" />
      case 'vencido':
        return <Clock className="h-5 w-5" />
      default:
        return null
    }
  }
  
  if (loading || generando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">
          {generando ? 'Generando paz y salvo...' : 'Cargando tus paz y salvos...'}
        </p>
      </div>
    )
  }
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis paz y salvos</h1>
        {userData?.copropiedad && (
          <p className="mt-1 text-sm text-gray-500">
            {userData.copropiedad.nombre} • NIT: {userData.copropiedad.nit}
          </p>
        )}
      </div>
      
      <div className="mb-6">
        <button
          onClick={() => router.push('/propietarios/inmuebles')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a mis inmuebles
        </button>
      </div>
      
      {pazYSalvos.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No tienes paz y salvos generados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aún no has generado ningún paz y salvo para tus inmuebles.
          </p>
          <p className="mt-4">
            <button
              onClick={() => router.push('/propietarios/inmuebles')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Ir a mis inmuebles
            </button>
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pazYSalvos.map((pazYSalvo, index) => (
            <motion.div
              key={pazYSalvo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white shadow overflow-hidden sm:rounded-lg"
            >
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Paz y Salvo - {pazYSalvo.inmuebleInfo}
                  </h3>
                  <div className="mt-1 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(pazYSalvo.estado)}`}>
                      {getEstadoIcon(pazYSalvo.estado)}
                      <span className="ml-1">{getEstadoLabel(pazYSalvo.estado)}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleImprimir(pazYSalvo)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    Imprimir
                  </button>
                  <button
                    onClick={() => handleDescargar(pazYSalvo)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    disabled={pazYSalvo.estado === 'vencido'}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Fecha de generación</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(pazYSalvo.fechaGeneracion)}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Fecha de vencimiento</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(pazYSalvo.fechaVencimiento)}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1 text-sm text-gray-900">{getEstadoLabel(pazYSalvo.estado)}</dd>
                  </div>
                </dl>
              </div>
              
              {pazYSalvo.estado === 'vencido' && (
                <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-red-50">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-sm text-red-700">
                      Este paz y salvo ha vencido. Por favor genera uno nuevo para obtener un documento válido.
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
              <dt className="text-sm font-medium text-gray-500">Validez</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Los paz y salvos generados tienen una validez de 30 días calendario a partir de su fecha de emisión.
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Verificación</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Cada paz y salvo cuenta con un código QR y un código de verificación que puede ser validado por terceros 
                para confirmar su autenticidad.
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Renovación</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Para generar un nuevo paz y salvo, debes estar al día en tus pagos de administración. 
                Puedes generar un nuevo paz y salvo desde la sección "Mis inmuebles".
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
