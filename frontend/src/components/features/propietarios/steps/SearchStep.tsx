'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Search, CheckCircle } from 'lucide-react'

import { Copropiedad } from '@/types/copropiedad'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CopropiedadSkeleton } from '@/components/ui/Skeleton'

const searchSchema = z.object({
  nit: z.string()
    .min(8, 'Ingrese al menos 8 caracteres')
    .max(20, 'NIT demasiado largo')
    .refine(val => /^[0-9\-]+$/.test(val), 'Ingrese un NIT válido')
})

type SearchFormData = z.infer<typeof searchSchema>

interface SearchStepProps {
  copropiedades: Copropiedad[]
  onSubmit: (nit: string) => void
  onSelect: (copropiedad: Copropiedad) => void
  loading: boolean
}

export const SearchStep: React.FC<SearchStepProps> = ({
  copropiedades,
  onSubmit,
  onSelect,
  loading
}) => {
  const [searchPerformed, setSearchPerformed] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema)
  })

  const handleFormSubmit = (data: SearchFormData) => {
    setSearchPerformed(true)
    onSubmit(data.nit)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Busca tu Copropiedad
        </h2>
        <p className="text-gray-600">
          Ingresa el NIT o nombre de tu conjunto residencial o edificio
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          {...register('nit')}
          label="NIT o Nombre de la Copropiedad"
          placeholder="Ej: 900123456 o Los Pinos"
          icon={Search}
          error={errors.nit?.message}
          helpText="Sin puntos ni espacios. Puedes usar parte del nombre."
        />

        <div className="flex justify-center">
          <Button
            type="submit"
            loading={loading}
            icon={Search}
          >
            Buscar Copropiedad
          </Button>
        </div>
      </form>

      {/* Resultados de búsqueda */}
      {searchPerformed && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Resultados de la búsqueda
          </h3>

          {loading ? (
            <div className="space-y-4">
              <CopropiedadSkeleton />
              <CopropiedadSkeleton />
            </div>
          ) : (
            <>
              {copropiedades.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
                  No se encontraron copropiedades con ese NIT o nombre. Por favor verifica la información.
                </div>
              ) : (
                <div className="space-y-3">
                  {copropiedades.map((copropiedad) => (
                    <div
                      key={copropiedad.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {copropiedad.nombre}
                          </h4>
                          <p className="text-sm text-gray-600">
                            NIT: {copropiedad.nit}
                          </p>
                          {copropiedad.direccion && (
                            <p className="text-xs text-gray-500">
                              {copropiedad.direccion}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            copropiedad.estado === 'activa'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {copropiedad.estado === 'activa' ? 'Activa' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          onClick={() => onSelect(copropiedad)}
                          size="sm"
                          icon={CheckCircle}
                        >
                          Seleccionar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchStep
