'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Building2, ArrowLeft, Smartphone, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi, apiUtils } from '@/lib/api'
import { isValidColombianPhone } from '@/lib/utils'

// Esquema de validación para el paso 1 (teléfono)
const step1Schema = z.object({
  telefono: z.string()
    .min(10, 'El número debe tener 10 dígitos')
    .refine(val => isValidColombianPhone(val), {
      message: 'Debe ser un número de celular colombiano válido'
    }),
  nit: z.string()
    .min(9, 'El NIT debe tener al menos 9 caracteres')
    .max(15, 'El NIT no puede exceder 15 caracteres')
    .regex(/^\d{1,10}-\d{1}$|^\d{1,10}$/, 'Formato de NIT inválido. Ej: 900123456-7 o 900123456')
})

// Esquema de validación para el paso 3 (verificación SMS)
const step3Schema = z.object({
  code: z.string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El código debe contener solo dígitos')
})

type Step1FormData = z.infer<typeof step1Schema>
type Step3FormData = z.infer<typeof step3Schema>

export default function PropietariosLogin() {
  const [step, setStep] = useState(1) // 1: Teléfono, 2: Verificando, 3: Código SMS
  const [loading, setLoading] = useState(false)
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [phoneNumber, setPhoneNumber] = useState('')
  const [nitValue, setNitValue] = useState('')
  const [inmuebles, setInmuebles] = useState<any[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Formulario para el paso 1
  const { 
    register: registerStep1, 
    handleSubmit: handleSubmitStep1, 
    setValue: setValueStep1,
    formState: { errors: errorsStep1 } 
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      telefono: '',
      nit: ''
    }
  })
  
  // Formulario para el paso 3
  const { 
    handleSubmit: handleSubmitStep3, 
    formState: { errors: errorsStep3 } 
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema)
  })
  
  // Si hay un NIT en los parámetros de búsqueda, lo establecemos en el formulario
  useEffect(() => {
    const nit = searchParams.get('nit')
    if (nit) {
      setValueStep1('nit', nit)
      setNitValue(nit)
    }
  }, [searchParams, setValueStep1])
  
  const onSubmitStep1 = async (data: Step1FormData) => {
    try {
      setLoading(true)
      
      // Limpiar el número de teléfono (eliminar espacios, guiones, etc.)
      const cleanPhone = data.telefono.replace(/\D/g, '')
      setPhoneNumber(cleanPhone)
      setNitValue(data.nit)
      
      // En un entorno real, esto se conectaría con el backend para verificar
      // que el teléfono está asociado a algún inmueble en la copropiedad
      // y enviar el código SMS
      
      // Simulamos una verificación exitosa después de un pequeño delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulamos que encontramos inmuebles asociados al teléfono
      if (cleanPhone === '3001234567' && (data.nit === '900123456-7' || data.nit === '900123456')) {
        setInmuebles([
          {
            id: 1,
            tipo: 'Apartamento',
            numero: '301',
            torre: 'A',
            estado: 'al_dia'
          },
          {
            id: 2,
            tipo: 'Parqueadero',
            numero: 'P12',
            torre: '',
            estado: 'al_dia'
          }
        ])
        
        // Avanzamos al paso de verificación
        setStep(2)
        
        // Simulamos que enviamos el código SMS
        setTimeout(() => {
          toast.success('Código de verificación enviado a tu celular')
          setStep(3)
        }, 2000)
      } else {
        toast.error('No se encontraron inmuebles asociados a este número de teléfono en la copropiedad indicada')
      }
    } catch (error: any) {
      console.error('Error al verificar teléfono:', error)
      toast.error(error.response?.data?.message || 'Error al verificar el teléfono')
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
  
  const onSubmitStep3 = async () => {
    try {
      setLoading(true)
      const code = verificationCode.join('')
      
      if (code.length !== 6) {
        toast.error('Ingresa el código completo de 6 dígitos')
        return
      }
      
      // En un entorno real, esto se conectaría con el backend para verificar el código
      // Por ahora simulamos una verificación exitosa
      
      // Simulación de login exitoso (en producción, esto vendría del backend)
      if (code === '123456') {
        const mockResponse = {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token',
          propietario: {
            id: '1',
            nombre: 'Carlos Rodríguez',
            telefono: phoneNumber,
            inmuebles: inmuebles,
            copropiedad: {
              id: '1',
              nombre: 'Edificio Los Pinos',
              nit: nitValue
            }
          }
        }
        
        // Guardar token y datos de usuario
        apiUtils.saveAuthToken(mockResponse.token)
        apiUtils.saveUserData(mockResponse.propietario)
        
        toast.success('Verificación exitosa')
        
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
          {step === 1 && 'Acceso para propietarios'}
          {step === 2 && 'Verificando...'}
          {step === 3 && 'Verificación de celular'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 && 'Ingresa tu número de celular y el NIT de la copropiedad'}
          {step === 2 && 'Estamos enviando un código de verificación a tu celular'}
          {step === 3 && 'Ingresa el código de 6 dígitos enviado a tu celular'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleSubmitStep1(onSubmitStep1)}>
              {/* Campo de NIT */}
              <div>
                <label htmlFor="nit" className="block text-sm font-medium text-gray-700">
                  NIT de la copropiedad
                </label>
                <div className="mt-1">
                  <input
                    id="nit"
                    type="text"
                    autoComplete="off"
                    {...registerStep1('nit')}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      errorsStep1.nit ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: 900123456-7"
                  />
                </div>
                {errorsStep1.nit && (
                  <p className="mt-2 text-sm text-red-600">{errorsStep1.nit.message}</p>
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
                    {...registerStep1('telefono')}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      errorsStep1.telefono ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="3XX XXX XXXX"
                  />
                </div>
                {errorsStep1.telefono && (
                  <p className="mt-2 text-sm text-red-600">{errorsStep1.telefono.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Ingresa el número de celular registrado en la copropiedad
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verificando...' : 'Continuar'}
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <Link href="/propietarios/registro" className="font-medium text-green-600 hover:text-green-500">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </form>
          )}
          
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600">Enviando código de verificación...</p>
              <p className="text-sm text-gray-500 mt-2">Esto solo tomará un momento</p>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 text-center">
                Hemos enviado un código de verificación al número
                <br />
                <span className="font-medium text-gray-900">{phoneNumber}</span>
              </p>
              
              <form onSubmit={handleSubmitStep3(onSubmitStep3)}>
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
                
                {errorsStep3.code && (
                  <p className="mt-2 text-sm text-red-600 text-center">{errorsStep3.code.message}</p>
                )}
                
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verificando...' : 'Verificar código'}
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
