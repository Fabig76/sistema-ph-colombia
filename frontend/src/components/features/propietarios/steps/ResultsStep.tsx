'use client'

import React, { useState } from 'react'
import { Download, Home, ArrowLeft, Info, RotateCcw } from 'lucide-react'

import { Copropiedad, Property } from '@/types/copropiedad'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCopropiedad } from '@/hooks/useCopropiedad'
import toast from 'react-hot-toast'

interface ResultsStepProps {
  copropiedad: Copropiedad | null
  propiedades: Property[]
  onNewSearch: () => void
  loading: boolean
}

export const ResultsStep: React.FC<ResultsStepProps> = ({
  copropiedad,
  propiedades,
  onNewSearch,
  loading
}) => {
  const { generatePazYSalvo } = useCopropiedad()

  const handleDownloadPazYSalvo = async (propertyId: string) => {
    const result = await generatePazYSalvo(propertyId)
    if (result.success) {
      toast.success('Paz y salvo generado correctamente')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tus Inmuebles
        </h2>
        <p className="text-gray-600">
          Estos son los inmuebles asociados a tu número de celular
        </p>
      </div>

      {copropiedad && (
        <Alert variant="success">
          <strong>Copropiedad:</strong> {copropiedad.nombre}
        </Alert>
      )}

      {propiedades.length === 0 ? (
        <Alert variant="warning">
          No se encontraron inmuebles asociados a tu número de celular en esta copropiedad.
        </Alert>
      ) : (
        <div className="space-y-4">
          {propiedades.map((property: Property) => (
            <div
              key={property.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start space-x-3">
                  <Home className="h-5 w-5 text-gray-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {property.tipo} {property.identificacion}
                    </h4>
                    <p className="text-sm text-gray-600">{property.direccion}</p>
                  </div>
                </div>
                
                <Badge
                  variant={property.estado === 'al_dia' ? 'success' : 'error'}
                >
                  {property.estado === 'al_dia' ? 'Al día' : 'Pendiente'}
                </Badge>
              </div>

              {property.estado === 'al_dia' ? (
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleDownloadPazYSalvo(property.id)}
                    icon={Download}
                    size="sm"
                  >
                    Descargar Paz y Salvo
                  </Button>
                </div>
              ) : (
                <Alert variant="warning">
                  <Info className="h-4 w-4" />
                  Para descargar el paz y salvo, debes estar al día con tus obligaciones.
                </Alert>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-6">
        <Button
          onClick={onNewSearch}
          variant="outline"
          icon={RotateCcw}
        >
          Nueva Consulta
        </Button>
      </div>
    </div>
  )
}

export default ResultsStep
