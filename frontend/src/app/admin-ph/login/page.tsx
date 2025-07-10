'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Building2, ArrowLeft, Smartphone, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi, apiUtils } from '@/lib/api'
import { isValidColombianPhone } from '@/lib/utils'

// Esquema de validación
const loginSchema = z.object({
  telefono: z.string()
    .min(10, 'El número debe tener 10 dígitos')
    .refine(val => isValidColombianPhone(val), {
      message: 'Debe ser un número de celular colombiano válido'
    }),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AdminPHLogin() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      telefono: '',
      password: '',
    }
  })
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true)
      
      // Limpiar el número de teléfono (eliminar espacios, guiones, etc.)
      const cleanPhone = data.telefono.replace(/\D/g, '')
      
      // En un entorno real, esto se conectaría con el backend
      // Por ahora simulamos una respuesta exitosa
      
      // Simulación de login exitoso (en producción, esto vendría del backend)
      const mockResponse = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token',
        administrador: {
          id: '1',
          nombre: 'Juan Pérez',
          telefono: cleanPhone,
          email: 'juan@example.com',
          verificado: true,
          activo: true,
          createdAt: new Date().toISOString(),
        }
      }
      
      // Guardar token y datos de usuario
      apiUtils.saveAuthToken(mockResponse.token)
      apiUtils.saveUserData(mockResponse.administrador)
      
      toast.success('Inicio de sesión exitoso')
      
      // Redirigir al dashboard
      router.push('/admin-ph')
    } catch (error: any) {
      console.error('Error de login:', error)
      toast.error(error.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
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
          Acceso para Administradores PH
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ingresa con tu número de celular y contraseña
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <Link href="/admin-ph/recuperar-password" className="font-medium text-blue-600 hover:text-blue-500">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">¿No tienes cuenta?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/admin-ph/registro"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Registrarme como administrador
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
