'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Save, Loader2, Eye, EyeOff } from 'lucide-react'

interface FormValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function CambioPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm<FormValues>()
  
  // Para validar que las contraseñas coincidan
  const watchNewPassword = watch("newPassword")
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    
    try {
      // Simular llamada a API para cambiar la contraseña
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // En producción, aquí iría la llamada real a la API
      // await adminPhApi.cambiarPassword({
      //   currentPassword: data.currentPassword,
      //   newPassword: data.newPassword
      // })
      
      toast.success('Contraseña actualizada correctamente')
      reset() // Limpiar formulario
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      toast.error('Error al actualizar la contraseña. Por favor, inténtelo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      {/* Título */}
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Cambiar Contraseña
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Actualice su contraseña para mejorar la seguridad
        </p>
      </div>
      
      {/* Formulario */}
      <div className="px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
          {/* Contraseña actual */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Contraseña actual
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                {...register('currentPassword', { required: 'La contraseña actual es requerida' })}
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md ${
                  errors.currentPassword ? 'border-red-300' : ''
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
            )}
          </div>
          
          {/* Nueva contraseña */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword', {
                  required: 'La nueva contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                  }
                })}
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md ${
                  errors.newPassword ? 'border-red-300' : ''
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.newPassword ? (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 6 caracteres.
              </p>
            )}
          </div>
          
          {/* Confirmar contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar nueva contraseña
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Debe confirmar la nueva contraseña',
                  validate: value => value === watchNewPassword || 'Las contraseñas no coinciden'
                })}
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md ${
                  errors.confirmPassword ? 'border-red-300' : ''
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
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
                  Cambiar contraseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
