'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Phone, ArrowLeft, ArrowRight, CreditCard } from 'lucide-react'

import { Copropiedad } from '@/types/copropiedad'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

const phoneSchema = z.object({
  cedula: z.string()
    .min(7, 'La cédula debe tener al menos 7 dígitos')
    .max(12, 'La cédula no puede tener más de 12 dígitos')
    .regex(/^\d+$/, 'La cédula solo debe contener números'),
  telefono: z.string()
    .min(10, 'El número debe tener 10 dígitos')
    .max(10, 'El número debe tener 10 dígitos')
    .regex(/^3\d{9}$/, 'Debe ser un número de celular colombiano válido')
})

type PhoneFormData = z.infer<typeof phoneSchema>

interface PhoneStepProps {
  copropiedad: Copropiedad | null
  onSubmit: (cedula: string, telefono: string) => void
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
    onSubmit(data.cedula, data.telefono)
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
          {...register('cedula')}
          label="Número de Cédula"
          placeholder="Ej: 12345678"
          icon={CreditCard}
          error={errors.cedula?.message}
          helpText="Sin puntos ni espacios"
        />
        
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
