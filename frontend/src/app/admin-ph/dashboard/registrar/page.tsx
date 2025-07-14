'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import DashboardLayout from '../components/DashboardLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import RegistrarCopropiedadForm from '../components/registrar/RegistrarCopropiedadForm'
import GoogleSheetsValidator from '../components/registrar/GoogleSheetsValidator'
import { toast } from 'react-hot-toast'

export default function RegistrarCopropiedadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationSuccess, setValidationSuccess] = useState(false)
  
  // Redirigir si no hay usuario autenticado
  if (!user) {
    router.push('/admin-ph')
    return null
  }

  const handleRegistroExitoso = () => {
    toast.success('Copropiedad registrada con éxito')
    router.push('/admin-ph/dashboard/mis-copropiedades')
  }

  return (
    <ProtectedRoute redirectTo="/admin-ph">
      <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Registrar Nueva Copropiedad
          </h1>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-700 mb-2">
                Información Importante
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-700">
                  Para registrar una nueva copropiedad necesitará:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                  <li>NIT y nombre oficial de la copropiedad</li>
                  <li>Número y fecha de la resolución de nombramiento emitida por la alcaldía</li>
                  <li>
                    Link a una hoja de Google Sheets con los datos de los residentes
                    <span className="block pl-5 mt-1">
                      - El NIT y nombre de la copropiedad deben estar en las dos primeras columnas
                    </span>
                  </li>
                  <li>Link a una plantilla de Google Docs para generar los paz y salvos</li>
                </ul>
              </div>
            </div>
            
            <RegistrarCopropiedadForm 
              onSubmitSuccess={handleRegistroExitoso}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              validationSuccess={validationSuccess}
              setValidationSuccess={setValidationSuccess}
            />
          </div>
        </div>
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
