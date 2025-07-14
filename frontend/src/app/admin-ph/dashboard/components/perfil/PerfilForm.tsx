'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Save, Loader2 } from 'lucide-react'

interface PerfilFormProps {
  initialData: {
    nombre: string
    telefono: string
    email: string
    fechaRegistro: string
  }
}

interface FormValues {
  nombre: string
  email: string
}

export default function PerfilForm({ initialData }: PerfilFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      nombre: initialData.nombre,
      email: initialData.email
    }
  })
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    
    try {
      // Simular llamada a API para actualizar el perfil
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // En producción, aquí iría la llamada real a la API
      // await adminPhApi.updatePerfil(data)
      
      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      toast.error('Error al actualizar el perfil. Por favor, inténtelo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      {/* Información general */}
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Información de Perfil
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Actualice su información personal
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {/* Lado izquierdo - Información no editable */}
          <div className="px-4 py-5 sm:px-6">
            <h4 className="text-sm font-medium text-gray-500 mb-4">Información de cuenta</h4>
            
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Número de teléfono</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{initialData.telefono}</dd>
                <p className="mt-1 text-xs text-gray-500">El número de teléfono no puede ser modificado ya que es su identificador principal de acceso.</p>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Fecha de registro</dt>
                <dd className="mt-1 text-sm text-gray-900">{initialData.fechaRegistro}</dd>
              </div>
            </dl>
          </div>
          
          {/* Lado derecho - Formulario editable */}
          <div className="px-4 py-5 sm:px-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nombre completo */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <div className="mt-1">
                  <input
                    id="nombre"
                    type="text"
                    {...register('nombre', { required: 'El nombre es requerido' })}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.nombre ? 'border-red-300' : ''
                    }`}
                  />
                </div>
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    {...register('email', { 
                      required: 'El correo electrónico es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Dirección de correo inválida'
                      }
                    })}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.email ? 'border-red-300' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              {/* Botón de guardar */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
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
      </div>
    </div>
  )
}
