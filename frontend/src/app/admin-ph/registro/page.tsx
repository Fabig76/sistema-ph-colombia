'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Building2, ArrowLeft, User, Smartphone, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi, apiUtils } from '@/lib/api'
import { isValidColombianPhone, isValidEmail } from '@/lib/utils'

// Esquema de validación
const registroSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  telefono: z.string()
    .min(10, 'El número debe tener 10 dígitos')
    .refine(val => isValidColombianPhone(val), {
      message: 'Debe ser un número de celular colombiano válido'
    }),
  email: z.string()
    .email('Correo electrónico inválido')
    .refine(val => isValidEmail(val), {
      message: 'Formato de correo electrónico inválido'
    }),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean()
    .refine(val => val === true, {
      message: 'Debes aceptar los términos y condiciones'
    }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegistroFormData = z.infer<typeof registroSchema>

export default function AdminPHRegistro() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState(1) // 1: Formulario, 2: Verificación SMS
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      nombre: '',
      telefono: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    }
  })
  
  const onSubmit = async (data: RegistroFormData) => {
    try {
      setLoading(true)
      
      // Limpiar el número de teléfono (eliminar espacios, guiones, etc.)
      const cleanPhone = data.telefono.replace(/\D/g, '')
      
      // En un entorno real, esto se conectaría con el backend para enviar el código SMS
      // Por ahora simulamos que se envió el código
      
      toast.success('Código de verificación enviado a tu celular')
      setStep(2)
    } catch (error: any) {
      console.error('Error de registro:', error)
      toast.error(error.response?.data?.message || 'Error al registrar')
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
  
  const handleVerifyCode = async () => {
    try {
      setLoading(true)
      const code = verificationCode.join('')
      
      if (code.length !== 6) {
        toast.error('Ingresa el código completo de 6 dígitos')
        return
      }
      
      // En un entorno real, esto se conectaría con el backend para verificar el código
      // Por ahora simulamos una verificación exitosa
      
      // Simulación de registro exitoso (en producción, esto vendría del backend)
      const formData = getValues()
      const mockResponse = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token',
        administrador: {
          id: '1',
          nombre: formData.nombre,
          telefono: formData.telefono.replace(/\D/g, ''),
          email: formData.email,
          verificado: true,
          activo: true,
          createdAt: new Date().toISOString(),
        }
      }
      
      // Guardar token y datos de usuario
      apiUtils.saveAuthToken(mockResponse.token)
      apiUtils.saveUserData(mockResponse.administrador)
      
      toast.success('Registro exitoso')
      
      // Redirigir al dashboard
      router.push('/admin-ph')
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
        <Link href="/" className="flex items-center justify-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Volver al inicio</span>
        </Link>
        
        <div className="flex justify-center">
          <Building2 className="mx-auto h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {step === 1 ? 'Registro de Administrador PH' : 'Verificación de celular'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 
            ? 'Crea tu cuenta para administrar tus copropiedades' 
            : 'Ingresa el código de 6 dígitos enviado a tu celular'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                    {...register('nombre')}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.nombre ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tu nombre completo"
                  />
                </div>
                {errors.nombre && (
                  <p className="mt-2 text-sm text-red-600">{errors.nombre.message}</p>
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
                    {...register('telefono')}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.telefono ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="3XX XXX XXXX"
                  />
                </div>
                {errors.telefono && (
                  <p className="mt-2 text-sm text-red-600">{errors.telefono.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Se enviará un código de verificación a este número
                </p>
              </div>

              {/* Campo de email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="tu@correo.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Campo de contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('password')}
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Campo de confirmar contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Términos y condiciones */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    {...register('acceptTerms')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="acceptTerms" className="font-medium text-gray-700">
                    Acepto los{' '}
                    <Link href="/terminos-servicio" className="text-blue-600 hover:text-blue-500">
                      términos y condiciones
                    </Link>
                    {' '}y la{' '}
                    <Link href="/politica-privacidad" className="text-blue-600 hover:text-blue-500">
                      política de privacidad
                    </Link>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Registrarme'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 text-center">
                Hemos enviado un código de verificación al número
                <br />
                <span className="font-medium text-gray-900">{getValues().telefono}</span>
              </p>
              
              <div className="flex justify-center space-x-2">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ))}
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verificando...' : 'Verificar código'}
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿No recibiste el código?{' '}
                  <button
                    type="button"
                    onClick={resendCode}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Reenviar
                  </button>
                </p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">¿Ya tienes cuenta?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/admin-ph/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
