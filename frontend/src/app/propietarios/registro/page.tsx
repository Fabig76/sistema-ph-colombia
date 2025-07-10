'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Building2, ArrowLeft, User, Smartphone, Search, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi, apiUtils } from '@/lib/api'
import { isValidColombianPhone } from '@/lib/utils'

// Esquema de validación para el paso 1 (búsqueda de copropiedad)
const step1Schema = z.object({
  nit: z.string()
    .min(9, 'El NIT debe tener al menos 9 caracteres')
    .max(15, 'El NIT no puede exceder 15 caracteres')
    .regex(/^\d{1,10}-\d{1}$|^\d{1,10}$/, 'Formato de NIT inválido. Ej: 900123456-7 o 900123456')
})

// Esquema de validación para el paso 3 (datos personales)
const step3Schema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  telefono: z.string()
    .min(10, 'El número debe tener 10 dígitos')
    .refine(val => isValidColombianPhone(val), {
      message: 'Debe ser un número de celular colombiano válido'
    }),
  inmueble: z.string()
    .min(1, 'Debes seleccionar un inmueble')
})

// Esquema de validación para el paso 5 (verificación SMS)
const step5Schema = z.object({
  code: z.string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El código debe contener solo dígitos')
})

type Step1FormData = z.infer<typeof step1Schema>
type Step3FormData = z.infer<typeof step3Schema>
type Step5FormData = z.infer<typeof step5Schema>

export default function PropietariosRegistro() {
  const [step, setStep] = useState(1) // 1: Búsqueda NIT, 2: Resultados, 3: Datos personales, 4: Enviando SMS, 5: Verificación
  const [loading, setLoading] = useState(false)
  const [copropiedad, setCopropiedad] = useState<any>(null)
  const [inmuebles, setInmuebles] = useState<any[]>([])
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [userData, setUserData] = useState<any>({})
  const router = useRouter()
  
  // Formulario para el paso 1
  const { 
    register: registerStep1, 
    handleSubmit: handleSubmitStep1, 
    formState: { errors: errorsStep1 } 
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      nit: ''
    }
  })
  
  // Formulario para el paso 3
  const { 
    register: registerStep3, 
    handleSubmit: handleSubmitStep3, 
    formState: { errors: errorsStep3 } 
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      nombre: '',
      telefono: '',
      inmueble: ''
    }
  })
  
  // Formulario para el paso 5
  const { 
    handleSubmit: handleSubmitStep5, 
    formState: { errors: errorsStep5 } 
  } = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema)
  })
  
  const onSubmitStep1 = async (data: Step1FormData) => {
    try {
      setLoading(true)
      
      // En un entorno real, esto se conectaría con el backend para buscar la copropiedad
      // Por ahora simulamos una búsqueda exitosa
      
      // Simulamos una búsqueda después de un pequeño delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Formato del NIT para búsqueda
      const nitFormatted = data.nit.includes('-') ? data.nit : `${data.nit.slice(0, -1)}-${data.nit.slice(-1)}`
      
      // Simulamos resultados de búsqueda
      if (nitFormatted === '900123456-7') {
        setCopropiedad({
          id: 1,
          nombre: 'Edificio Los Pinos',
          nit: '900123456-7',
          direccion: 'Calle 123 #45-67, Bogotá',
          administrador: 'Juan Pérez'
        })
        setStep(2)
      } else if (nitFormatted === '901234567-8') {
        setCopropiedad({
          id: 2,
          nombre: 'Conjunto Residencial El Paraíso',
          nit: '901234567-8',
          direccion: 'Carrera 78 #90-12, Medellín',
          administrador: 'María López'
        })
        setStep(2)
      } else {
        toast.error('No se encontró ninguna copropiedad con el NIT proporcionado')
      }
    } catch (error: any) {
      console.error('Error al buscar copropiedad:', error)
      toast.error(error.response?.data?.message || 'Error al buscar la copropiedad')
    } finally {
      setLoading(false)
    }
  }
  
  const handleContinueToStep3 = () => {
    // Simulamos que obtenemos los inmuebles disponibles para registro
    setInmuebles([
      { id: '1', tipo: 'Apartamento', numero: '101', torre: 'A' },
      { id: '2', tipo: 'Apartamento', numero: '102', torre: 'A' },
      { id: '3', tipo: 'Apartamento', numero: '201', torre: 'A' },
      { id: '4', tipo: 'Parqueadero', numero: 'P01', torre: '' },
      { id: '5', tipo: 'Parqueadero', numero: 'P02', torre: '' }
    ])
    setStep(3)
  }
  
  const onSubmitStep3 = async (data: Step3FormData) => {
    try {
      setLoading(true)
      
      // Guardamos los datos del usuario
      setUserData({
        nombre: data.nombre,
        telefono: data.telefono,
        inmueble: inmuebles.find(i => i.id === data.inmueble)
      })
      
      // En un entorno real, esto se conectaría con el backend para verificar
      // que el teléfono está asociado al inmueble en la copropiedad
      // y enviar el código SMS
      
      // Avanzamos al paso de envío de SMS
      setStep(4)
      
      // Simulamos el envío del código SMS
      setTimeout(() => {
        toast.success('Código de verificación enviado a tu celular')
        setStep(5)
      }, 2000)
    } catch (error: any) {
      console.error('Error al registrar datos:', error)
      toast.error(error.response?.data?.message || 'Error al registrar los datos')
    } finally {
      setLoading(false)
    }
  }
  
  const handleVerificationCodeChange = (index: number, value: string) => {
    // Solo permitir dígitos
    if (value && !/^\d*$/.test(value)) return
    
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)
    
    // Mover al siguiente input si se ingresó un dígito
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }
  
  const onSubmitStep5 = async () => {
    try {
      setLoading(true)
      const code = verificationCode.join('')
      
      if (code.length !== 6) {
        toast.error('Ingresa el código completo de 6 dígitos')
        return
      }
      
      // En un entorno real, esto se conectaría con el backend para verificar el código
      // Por ahora simulamos una verificación exitosa
      
      if (code === '123456') {
        // Simulación de registro exitoso (en producción, esto vendría del backend)
        const mockResponse = {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token',
          propietario: {
            id: '1',
            nombre: userData.nombre,
            telefono: userData.telefono,
            inmuebles: [userData.inmueble],
            copropiedad: copropiedad
          }
        }
        
        // Guardar token y datos de usuario
        apiUtils.saveAuthToken(mockResponse.token)
        apiUtils.saveUserData(mockResponse.propietario)
        
        toast.success('¡Registro exitoso!')
        
        // Redirigir al dashboard
        router.push('/propietarios/inmuebles')
      } else {
        toast.error('Código de verificación incorrecto')
      }
    } catch (error: any) {
      console.error('Error de verificación:', error)
      toast.error(error.response?.data?.message || 'Error al verificar el código')
    } finally {
      setLoading(false)
    }
  }
  
  const resendCode = () => {
    toast.success('Código de verificación reenviado a tu celular')
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center text-green-600 hover:text-green-800 mb-6">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Volver al inicio</span>
        </Link>
        
        <div className="flex justify-center">
          <Building2 className="mx-auto h-12 w-12 text-green-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {step === 1 && 'Registro de propietario'}
          {step === 2 && 'Copropiedad encontrada'}
          {step === 3 && 'Datos personales'}
          {step === 4 && 'Enviando código...'}
          {step === 5 && 'Verificación de celular'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 && 'Busca tu copropiedad por NIT para comenzar'}
          {step === 2 && 'Confirma que esta es tu copropiedad'}
          {step === 3 && 'Ingresa tus datos y selecciona tu inmueble'}
          {step === 4 && 'Estamos enviando un código de verificación a tu celular'}
          {step === 5 && 'Ingresa el código de 6 dígitos enviado a tu celular'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleSubmitStep1(onSubmitStep1)}>
              <div>
                <label htmlFor="nit" className="block text-sm font-medium text-gray-700">
                  NIT de la copropiedad
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nit"
                    type="text"
                    {...registerStep1('nit')}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      errorsStep1.nit ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: 900123456-7"
                  />
                </div>
                {errorsStep1.nit && (
                  <p className="mt-2 text-sm text-red-600">{errorsStep1.nit.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Ingresa el NIT de la copropiedad donde tienes tu inmueble
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Buscando...' : 'Buscar copropiedad'}
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{' '}
                  <Link href="/propietarios/login" className="font-medium text-green-600 hover:text-green-500">
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </form>
          )}
          
          {step === 2 && copropiedad && (
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{copropiedad.nombre}</h3>
                <p className="text-sm text-gray-500">NIT: {copropiedad.nit}</p>
                <p className="text-sm text-gray-500">Dirección: {copropiedad.direccion}</p>
                <p className="text-sm text-gray-500">Administrador: {copropiedad.administrador}</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleContinueToStep3}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <form className="space-y-6" onSubmit={handleSubmitStep3(onSubmitStep3)}>
              {/* Campo de nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nombre"
                    type="text"
                    autoComplete="name"
                    {...registerStep3('nombre')}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      errorsStep3.nombre ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tu nombre completo"
                  />
                </div>
                {errorsStep3.nombre && (
                  <p className="mt-2 text-sm text-red-600">{errorsStep3.nombre.message}</p>
                )}
              </div>

              {/* Campo de teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                  Número de celular
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Smartphone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="telefono"
                    type="tel"
                    autoComplete="tel"
                    {...registerStep3('telefono')}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      errorsStep3.telefono ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="3XX XXX XXXX"
                  />
                </div>
                {errorsStep3.telefono && (
                  <p className="mt-2 text-sm text-red-600">{errorsStep3.telefono.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Se enviará un código de verificación a este número
                </p>
              </div>

              {/* Selección de inmueble */}
              <div>
                <label htmlFor="inmueble" className="block text-sm font-medium text-gray-700">
                  Selecciona tu inmueble
                </label>
                <select
                  id="inmueble"
                  {...registerStep3('inmueble')}
                  className={`mt-1 block w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                    errorsStep3.inmueble ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona un inmueble</option>
                  {inmuebles.map(inmueble => (
                    <option key={inmueble.id} value={inmueble.id}>
                      {inmueble.tipo} {inmueble.torre ? `Torre ${inmueble.torre} - ` : ''}{inmueble.numero}
                    </option>
                  ))}
                </select>
                {errorsStep3.inmueble && (
                  <p className="mt-2 text-sm text-red-600">{errorsStep3.inmueble.message}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Continuar'}
                </button>
              </div>
            </form>
          )}
          
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600">Enviando código de verificación...</p>
              <p className="text-sm text-gray-500 mt-2">Esto solo tomará un momento</p>
            </div>
          )}
          
          {step === 5 && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 text-center">
                Hemos enviado un código de verificación al número
                <br />
                <span className="font-medium text-gray-900">{userData.telefono}</span>
              </p>
              
              <form onSubmit={handleSubmitStep5(onSubmitStep5)}>
                <div className="flex justify-center space-x-2 mb-6">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                      className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  ))}
                </div>
                
                {errorsStep5.code && (
                  <p className="mt-2 text-sm text-red-600 text-center">{errorsStep5.code.message}</p>
                )}
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verificando...' : 'Completar registro'}
                  </button>
                </div>
              </form>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿No recibiste el código?{' '}
                  <button
                    type="button"
                    onClick={resendCode}
                    className="text-green-600 hover:text-green-500 font-medium"
                  >
                    Reenviar
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
