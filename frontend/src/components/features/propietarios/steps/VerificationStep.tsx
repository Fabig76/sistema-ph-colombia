'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Key, ArrowLeft, CheckCircle } from 'lucide-react'

import { Copropiedad } from '@/types/copropiedad'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

const codeSchema = z.object({
  codigo: z.string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El código debe contener solo números')
})

type CodeFormData = z.infer<typeof codeSchema>

interface VerificationStepProps {
  copropiedad: Copropiedad | null
  phoneNumber: string
  onSubmit: (codigo: string) => void
  onBack: () => void
  loading: boolean
}

export const VerificationStep: React.FC<VerificationStepProps> = ({
  copropiedad,
  phoneNumber,
  onSubmit,
  onBack,
  loading
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema)
  })

  const handleFormSubmit = (data: CodeFormData) => {
    onSubmit(data.codigo)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Código de Verificación
        </h2>
        <p className="text-gray-600">
          Hemos enviado un código de 6 dígitos al número <strong>{phoneNumber}</strong>
        </p>
      </div>

      {copropiedad && (
        <Alert variant="info">
          <strong>Copropiedad:</strong> {copropiedad.nombre}
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          {...register('codigo')}
          label="Código de Verificación"
          placeholder="Ej: 123456"
          icon={Key}
          error={errors.codigo?.message}
          helpText="Revisa tu teléfono, el código llegará por SMS"
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
            icon={CheckCircle}
            iconPosition="right"
          >
            Verificar Código
          </Button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Para pruebas, usa el código: <strong>123456</strong>
        </p>
      </div>
    </div>
  )
}

export default VerificationStep
