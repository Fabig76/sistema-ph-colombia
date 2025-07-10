'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { User, Smartphone, Mail, Save, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiUtils } from '@/lib/api'
import { isValidColombianPhone } from '@/lib/utils'

// Esquema de validación para el formulario de perfil
const perfilSchema = z.object({
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
    .optional()
    .or(z.literal(''))
})

type PerfilFormData = z.infer<typeof perfilSchema>

export default function PropietariosPerfil() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()
  
  // Formulario para el perfil
  const { 
    register, 
    handleSubmit, 
    setValue,
    formState: { errors, isDirty } 
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre: '',
      telefono: '',
      email: ''
    }
  })
  
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
        
        // Establecer los valores del formulario
        setValue('nombre', userData.nombre || '')
        setValue('telefono', userData.telefono || '')
        setValue('email', userData.email || '')
      } catch (error) {
        console.error('Error al cargar datos:', error)
        toast.error('Error al cargar tu perfil')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router, setValue])
  
  const onSubmit = async (data: PerfilFormData) => {
    try {
      setSaving(true)
      
      // En un entorno real, esto se conectaría con el backend para actualizar el perfil
      // Por ahora simulamos una actualización exitosa
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Actualizar los datos del usuario en el almacenamiento local
      const updatedUserData = {
        ...userData,
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email
      }
      
      apiUtils.saveUserData(updatedUserData)
      setUserData(updatedUserData)
      
      toast.success('Perfil actualizado correctamente')
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error)
      toast.error(error.response?.data?.message || 'Error al actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }
  
  const handleLogout = () => {
    // Limpiar datos de autenticación
    apiUtils.clearAuth()
    
    // Redirigir al inicio
    toast.success('Sesión cerrada correctamente')
    router.push('/propietarios')
  }
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Cargando tu perfil...</p>
      </div>
    )
  }
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        {userData?.copropiedad && (
          <p className="mt-1 text-sm text-gray-500">
            {userData.copropiedad.nombre} • NIT: {userData.copropiedad.nit}
          </p>
        )}
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Información personal</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Actualiza tus datos personales
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                    errors.nombre ? 'border-red-300' : 'border-gray-300'
                  }`}
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
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                    errors.telefono ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.telefono && (
                <p className="mt-2 text-sm text-red-600">{errors.telefono.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Este número se usa para verificar tu identidad
              </p>
            </div>

            {/* Campo de email (opcional) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico (opcional)
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
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Puedes agregar un correo para recibir notificaciones
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Inmuebles asociados</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Inmuebles registrados a tu nombre
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {userData?.inmuebles?.map((inmueble: any) => (
              <li key={inmueble.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {inmueble.tipo} {inmueble.torre ? `Torre ${inmueble.torre} - ` : ''}{inmueble.numero}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      inmueble.estado === 'al_dia' 
                        ? 'bg-green-100 text-green-800' 
                        : inmueble.estado === 'pendiente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {inmueble.estado === 'al_dia' 
                        ? 'Al día' 
                        : inmueble.estado === 'pendiente'
                        ? 'Pendiente'
                        : 'En mora'}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Seguridad</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Opciones de seguridad de tu cuenta
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
