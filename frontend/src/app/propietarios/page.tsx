'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Building2, 
  FileText, 
  Search, 
  ArrowRight, 
  Phone, 
  ChevronRight, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Key,
  Home,
  Info,
  Download,
  ArrowLeft
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// Esquemas de validación
const searchSchema = z.object({
  nit: z.string()
    .min(9, 'El NIT debe tener al menos 9 caracteres')
    .max(15, 'El NIT no puede exceder 15 caracteres')
    .regex(/^\d{1,10}-\d{1}$|^\d{1,10}$/, 'Formato de NIT inválido. Ej: 900123456-7 o 900123456')
})

const phoneSchema = z.object({
  telefono: z.string()
    .min(10, 'El número debe tener 10 dígitos')
    .max(10, 'El número debe tener 10 dígitos')
    .regex(/^3\d{9}$/, 'Debe ser un número de celular colombiano válido')
})

const codeSchema = z.object({
  codigo: z.string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El código debe contener solo números')
})

type SearchFormData = z.infer<typeof searchSchema>
type PhoneFormData = z.infer<typeof phoneSchema>
type CodeFormData = z.infer<typeof codeSchema>

// Pasos del flujo de propietarios
type Step = 'search' | 'phone' | 'verify' | 'results'

// Interfaz para copropiedad
interface Copropiedad {
  id: string | number
  nombre: string
  nit: string
  direccion?: string
  administrador?: string
  estado: 'activo' | 'inactivo'
}

// Interfaz para propiedad
interface Propiedad {
  id: string | number
  tipo: string
  identificacion: string
  direccion: string
  estado: 'al_dia' | 'pendiente'
}

export default function PropietariosPage() {
  // Estados para controlar el flujo de la aplicación
  const [currentStep, setCurrentStep] = useState<Step>('search')
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Copropiedad[]>([])
  const [selectedCopropiedad, setSelectedCopropiedad] = useState<Copropiedad | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [userProperties, setUserProperties] = useState<Propiedad[]>([])

  // Formularios con React Hook Form
  const { 
    register: registerSearch, 
    handleSubmit: handleSubmitSearch, 
    formState: { errors: searchErrors },
    reset: resetSearch
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema)
  })
  
  const { 
    register: registerPhone, 
    handleSubmit: handleSubmitPhone, 
    formState: { errors: phoneErrors },
    reset: resetPhone
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema)
  })
  
  const { 
    register: registerCode, 
    handleSubmit: handleSubmitCode, 
    formState: { errors: codeErrors },
    reset: resetCode
  } = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema)
  })
  
  // Manejar búsqueda de copropiedad
  const onSearchSubmit = async (data: SearchFormData) => {
    try {
      setLoading(true)
      
      // Simular búsqueda en un entorno real
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Formato del NIT para búsqueda
      const nitFormatted = data.nit.includes('-') ? data.nit : `${data.nit.slice(0, -1)}-${data.nit.slice(-1)}`
      
      // Simulamos resultados de búsqueda
      if (nitFormatted === '900123456-7') {
        setSearchResults([
          {
            id: 1,
            nombre: 'Edificio Los Pinos',
            nit: '900123456-7',
            direccion: 'Calle 123 #45-67, Bogotá',
            administrador: 'Juan Pérez',
            estado: 'activo'
          }
        ])
      } else if (nitFormatted === '901234567-8') {
        setSearchResults([
          {
            id: 2,
            nombre: 'Conjunto Residencial El Paraíso',
            nit: '901234567-8',
            direccion: 'Carrera 78 #90-12, Medellín',
            administrador: 'María López',
            estado: 'activo'
          }
        ])
      } else if (nitFormatted === '902345678-9') {
        setSearchResults([
          {
            id: 3,
            nombre: 'Torres del Norte',
            nit: '902345678-9',
            direccion: 'Avenida 45 #23-67, Cali',
            administrador: 'Carlos Rodríguez',
            estado: 'inactivo'
          }
        ])
      } else {
        setSearchResults([])
        toast.error('No se encontró ninguna copropiedad con el NIT ingresado')
      }
    } catch (err) {
      console.error('Error al buscar copropiedad:', err)
      toast.error('Error al buscar la copropiedad')
    } finally {
      setLoading(false)
    }
  }
  
  // Seleccionar una copropiedad y avanzar al siguiente paso
  const selectCopropiedad = (copropiedad: Copropiedad) => {
    if (copropiedad.estado === 'inactivo') {
      toast.error('Esta copropiedad está inactiva. Contacte al administrador.')
      return
    }
    
    setSelectedCopropiedad(copropiedad)
    setCurrentStep('phone')
  }
  
  // Enviar código de verificación al teléfono
  const onPhoneSubmit = async (data: PhoneFormData) => {
    try {
      setLoading(true)
      
      // Simular envío de SMS en un entorno real
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Código simulado
      setVerificationCode('123456')
      setVerificationSent(true)
      setCurrentStep('verify')
      toast.success('Código enviado a tu celular')
    } catch (err) {
      console.error('Error al enviar código:', err)
      toast.error('Error al enviar el código de verificación')
    } finally {
      setLoading(false)
    }
  }
  
  // Verificar código SMS
  const onCodeSubmit = async (data: CodeFormData) => {
    try {
      setLoading(true)
      
      // Simular verificación en un entorno real
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Verificación simulada
      if (data.codigo === '123456' || data.codigo === verificationCode) {
        // Simulamos propiedades encontradas
        setUserProperties([
          {
            id: 1,
            tipo: 'Apartamento',
            identificacion: '101',
            direccion: 'Edificio Los Pinos - Apto 101',
            estado: 'al_dia'
          },
          {
            id: 2,
            tipo: 'Parqueadero',
            identificacion: 'P-15',
            direccion: 'Edificio Los Pinos - Parqueadero P-15',
            estado: 'al_dia'
          },
          {
            id: 3,
            tipo: 'Bodega',
            identificacion: 'B-03',
            direccion: 'Edificio Los Pinos - Bodega B-03',
            estado: 'pendiente'
          }
        ])
        setCurrentStep('results')
        toast.success('Verificación exitosa')
      } else {
        toast.error('Código incorrecto. Intenta nuevamente.')
      }
    } catch (err) {
      console.error('Error al verificar código:', err)
      toast.error('Error al verificar el código')
    } finally {
      setLoading(false)
    }
  }

  // Reiniciar el flujo
  const resetFlow = () => {
    setCurrentStep('search')
    setSearchResults([])
    setSelectedCopropiedad(null)
    setVerificationCode('')
    setVerificationSent(false)
    setUserProperties([])
    resetSearch()
    resetPhone()
    resetCode()
  }

  // Manejar descarga de paz y salvo
  const handleDownloadPazYSalvo = (propiedad: Propiedad) => {
    if (propiedad.estado !== 'al_dia') {
      toast.error('Debes estar al día para descargar el paz y salvo')
      return
    }
    
    toast.loading('Generando paz y salvo...', { duration: 1500 })
    setTimeout(() => {
      toast.success('Paz y salvo generado correctamente')
      // Aquí iría la lógica para generar y descargar el PDF
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <nav className="p-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-white hover:text-green-200 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Volver al inicio</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-green-400" />
              <span className="text-xl font-bold text-white">Portal Propietarios</span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[80vh] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              
              {/* Progress Indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-4">
                  {['search', 'phone', 'verify', 'results'].map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                        currentStep === step || (['phone', 'verify', 'results'].includes(currentStep) && index <= ['search', 'phone', 'verify', 'results'].indexOf(currentStep))
                          ? "bg-green-500 text-white"
                          : "bg-white/20 text-white/60"
                      )}>
                        {index + 1}
                      </div>
                      {index < 3 && (
                        <div className={cn(
                          "w-12 h-0.5 mx-2",
                          (['phone', 'verify', 'results'].includes(currentStep) && index < ['search', 'phone', 'verify', 'results'].indexOf(currentStep))
                            ? "bg-green-500"
                            : "bg-white/20"
                        )} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Search */}
              {currentStep === 'search' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Busca tu Copropiedad
                    </h1>
                    <p className="text-gray-300">
                      Ingresa el NIT de tu copropiedad para continuar
                    </p>
                  </div>

                  <form onSubmit={handleSubmitSearch(onSearchSubmit)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        NIT de la Copropiedad
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Ej: 900123456-7"
                          className={cn(
                            "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:border-transparent",
                            searchErrors.nit 
                              ? "focus:ring-red-500 border-red-400" 
                              : "focus:ring-green-500"
                          )}
                          {...registerSearch('nit')}
                        />
                        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                      {searchErrors.nit && (
                        <p className="mt-2 text-sm text-red-400">{searchErrors.nit.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200",
                        "bg-green-600 hover:bg-green-700 text-white",
                        "focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent",
                        loading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Buscando...
                        </div>
                      ) : (
                        'Buscar Copropiedad'
                      )}
                    </button>
                  </form>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 space-y-4"
                    >
                      <h3 className="text-lg font-medium text-white">Resultados encontrados:</h3>
                      {searchResults.map((copropiedad) => (
                        <div 
                          key={copropiedad.id}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02]",
                            copropiedad.estado === 'activo'
                              ? "bg-green-500/10 border-green-400/30 hover:bg-green-500/20"
                              : "bg-red-500/10 border-red-400/30 hover:bg-red-500/20"
                          )}
                          onClick={() => selectCopropiedad(copropiedad)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-white">{copropiedad.nombre}</h4>
                              <p className="text-sm text-gray-300">NIT: {copropiedad.nit}</p>
                              <p className="text-sm text-gray-300">{copropiedad.direccion}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                copropiedad.estado === 'activo'
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-red-500/20 text-red-300"
                              )}>
                                {copropiedad.estado === 'activo' ? 'Activo' : 'Inactivo'}
                              </span>
                              {copropiedad.estado === 'activo' && (
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                      Para pruebas usa: <span className="text-green-400">900123456-7</span>, <span className="text-green-400">901234567-8</span> o <span className="text-green-400">902345678-9</span>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Phone */}
              {currentStep === 'phone' && selectedCopropiedad && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Verifica tu Identidad
                    </h1>
                    <p className="text-gray-300">
                      Ingresa tu número de celular para recibir un código de verificación
                    </p>
                  </div>

                  <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-green-300">Copropiedad seleccionada:</h3>
                    <p className="text-white">{selectedCopropiedad.nombre}</p>
                    <p className="text-sm text-gray-300">NIT: {selectedCopropiedad.nit}</p>
                  </div>

                  <form onSubmit={handleSubmitPhone(onPhoneSubmit)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Número de Celular
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="Ej: 3001234567"
                          className={cn(
                            "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:border-transparent",
                            phoneErrors.telefono 
                              ? "focus:ring-red-500 border-red-400" 
                              : "focus:ring-green-500"
                          )}
                          {...registerPhone('telefono')}
                        />
                        <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                      {phoneErrors.telefono && (
                        <p className="mt-2 text-sm text-red-400">{phoneErrors.telefono.message}</p>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('search')}
                        className="flex-1 py-3 px-4 rounded-lg font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
                      >
                        Volver
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200",
                          "bg-green-600 hover:bg-green-700 text-white",
                          loading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Enviando...
                          </div>
                        ) : (
                          'Enviar Código'
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Verify */}
              {currentStep === 'verify' && verificationSent && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Código de Verificación
                    </h1>
                    <p className="text-gray-300">
                      Ingresa el código de 6 dígitos que enviamos a tu celular
                    </p>
                  </div>

                  <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-green-300">Copropiedad:</h3>
                    <p className="text-white">{selectedCopropiedad?.nombre}</p>
                  </div>

                  <form onSubmit={handleSubmitCode(onCodeSubmit)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Código de Verificación
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          className={cn(
                            "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:border-transparent text-center text-2xl tracking-wider",
                            codeErrors.codigo 
                              ? "focus:ring-red-500 border-red-400" 
                              : "focus:ring-green-500"
                          )}
                          {...registerCode('codigo')}
                        />
                        <Key className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                      {codeErrors.codigo && (
                        <p className="mt-2 text-sm text-red-400">{codeErrors.codigo.message}</p>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('phone')}
                        className="flex-1 py-3 px-4 rounded-lg font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
                      >
                        Volver
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200",
                          "bg-green-600 hover:bg-green-700 text-white",
                          loading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Verificando...
                          </div>
                        ) : (
                          'Verificar Código'
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                      Para pruebas usa el código: <span className="text-green-400">123456</span>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Results */}
              {currentStep === 'results' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Tus Inmuebles
                    </h1>
                    <p className="text-gray-300">
                      Estos son los inmuebles asociados a tu número de celular
                    </p>
                  </div>

                  <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-green-300">Copropiedad:</h3>
                    <p className="text-white">{selectedCopropiedad?.nombre}</p>
                    <p className="text-sm text-gray-300">NIT: {selectedCopropiedad?.nit}</p>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {userProperties.map((propiedad) => (
                      <div 
                        key={propiedad.id}
                        className={cn(
                          "p-4 rounded-lg border",
                          propiedad.estado === 'al_dia'
                            ? "bg-green-500/10 border-green-400/30"
                            : "bg-red-500/10 border-red-400/30"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <Building2 className="h-5 w-5 text-gray-400 mt-1" />
                            <div>
                              <h4 className="font-bold text-white">
                                {propiedad.tipo} {propiedad.identificacion}
                              </h4>
                              <p className="text-sm text-gray-300">{propiedad.direccion}</p>
                            </div>
                          </div>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            propiedad.estado === 'al_dia'
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                          )}>
                            {propiedad.estado === 'al_dia' ? 'Al día' : 'Pendiente'}
                          </span>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          {propiedad.estado === 'al_dia' ? (
                            <button
                              onClick={() => handleDownloadPazYSalvo(propiedad)}
                              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Descargar Paz y Salvo
                            </button>
                          ) : (
                            <div className="flex items-center text-sm text-red-300">
                              <Info className="h-4 w-4 mr-2" />
                              Debe estar al día para descargar
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={resetFlow}
                      className="py-3 px-6 rounded-lg font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
                    >
                      Nueva Consulta
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}