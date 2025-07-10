'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Phone, ArrowLeft, ArrowRight } from 'lucide-react'

import { Copropiedad } from '@/types/copropiedad'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

const phoneSchema = z.object({
  telefono: z.string()
    .min(10, 'El número debe tener 10 dígitos')
    .max(10, 'El número debe tener 10 dígitos')
    .regex(/^3\d{9}$/, 'Debe ser un número de celular colombiano válido')
})

type PhoneFormData = z.infer<typeof phoneSchema>

interface PhoneStepProps {
  copropiedad: Copropiedad | null
  onSubmit: (telefono: string) => void
  onBack: () => void
  loading: boolean
}

export const PhoneStep: React.FC<PhoneStepProps> = ({
  copropiedad,
  onSubmit,
  onBack,
  loading
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema)
  })

  const handleFormSubmit = (data: PhoneFormData) => {
    onSubmit(data.telefono)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verifica tu Identidad
        </h2>
        <p className="text-gray-600">
          Ingresa tu número de celular para recibir un código de verificación
        </p>
      </div>

      {copropiedad && (
        <Alert variant="success">
          <strong>Copropiedad seleccionada:</strong><br />
          {copropiedad.nombre}
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          {...register('telefono')}
          label="Número de Celular"
          placeholder="Ej: 3001234567"
          icon={Phone}
          error={errors.telefono?.message}
          helpText="Debe ser el número registrado en la copropiedad"
        />

        <div className="flex justify-between space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            icon={ArrowLeft}
          >
            Volver
          </Button>

          <Button
            type="submit"
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Enviar Código
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PhoneStep
