'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { ArrowRight, Loader2, AlertCircle, CheckCircle, Download } from 'lucide-react'
import GoogleSheetsValidator from './GoogleSheetsValidator'
import { adminPhApi } from '@/lib/api/adminPhApi'

// Tipos de datos para el formulario
interface FormData {
  nitCopropiedad: string
  nombreCopropiedad: string
  nitResolucion: string
  fechaResolucion: string
  googleSheetsUrl: string
  googleDocsUrl: string
}

interface RegistrarCopropiedadFormProps {
  onSubmitSuccess: () => void
  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void
  validationSuccess: boolean
  setValidationSuccess: (value: boolean) => void
}

export default function RegistrarCopropiedadForm({
  onSubmitSuccess,
  isSubmitting, 
  setIsSubmitting,
  validationSuccess,
  setValidationSuccess
}: RegistrarCopropiedadFormProps) {
  // Estado de validación de Google Sheets
  const [isValidatingSheet, setIsValidatingSheet] = useState(false)
  const [sheetValidationData, setSheetValidationData] = useState<{
    isValid: boolean
    message: string
    nitMatch: boolean
    nombreMatch: boolean
  } | null>(null)

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues
  } = useForm<FormData>({
    defaultValues: {
      nitCopropiedad: '',
      nombreCopropiedad: '',
      nitResolucion: '',
      fechaResolucion: '',
      googleSheetsUrl: '',
      googleDocsUrl: ''
    }
  })

  // Valores actuales del formulario
  const nitValue = watch('nitCopropiedad')
  const nombreValue = watch('nombreCopropiedad')
  const googleSheetsUrl = watch('googleSheetsUrl')
  
  // Función para validar la hoja de Google Sheets
  const handleValidateGoogleSheet = async () => {
    // Reset de estados de validación
    setIsValidatingSheet(true)
    setSheetValidationData(null)
    setValidationSuccess(false)
    
    try {
      // Simulación de validación - Esto se reemplazará con la llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Validación simulada (debe implementarse con la API real)
      const isValid = googleSheetsUrl.includes('google.com/spreadsheets')
      const nitMatch = isValid
      const nombreMatch = isValid

      if (isValid && nitMatch && nombreMatch) {
        setSheetValidationData({
          isValid: true,
          message: 'La hoja de cálculo es válida y contiene los datos correctos.',
          nitMatch: true,
          nombreMatch: true
        })
        setValidationSuccess(true)
        toast.success('Validación exitosa')
      } else {
        setSheetValidationData({
          isValid: false,
          message: 'La validación falló. Verifique el formato y contenido del Google Sheets.',
          nitMatch: false,
          nombreMatch: false
        })
        toast.error('Error en la validación')
      }
    } catch (error) {
      console.error('Error al validar Google Sheets:', error)
      setSheetValidationData({
        isValid: false,
        message: 'Error al procesar la validación.',
        nitMatch: false,
        nombreMatch: false
      })
      toast.error('Error en la validación')
    } finally {
      setIsValidatingSheet(false)
    }
  }

  // Envío del formulario
  const onSubmit = async (data: FormData) => {
    if (!validationSuccess) {
      toast.error('Debe validar la hoja de Google Sheets antes de registrar la copropiedad')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Registrar copropiedad usando la API
      const resultado = await adminPhApi.registrarCopropiedad({
        nombre: data.nombreCopropiedad,
        nit: data.nitCopropiedad,
        resolucionNumero: data.nitResolucion,
        resolucionFecha: data.fechaResolucion,
        googleSheetUrl: data.googleSheetsUrl,
        googleDocUrl: data.googleDocsUrl
      })
      
      toast.success(resultado.message || '¡Copropiedad registrada exitosamente!', {
        duration: 4000, // 4 segundos
        icon: '🎉'
      })
      
      // Delay para que el usuario vea el mensaje antes de redirigir
      setTimeout(() => {
        onSubmitSuccess()
      }, 1500) // 1.5 segundos
    } catch (error) {
      console.error('Error al registrar copropiedad:', error)
      toast.error('Error al registrar la copropiedad')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NIT de la copropiedad */}
        <div>
          <label htmlFor="nitCopropiedad" className="block text-sm font-medium text-gray-700 mb-1">
            NIT de la copropiedad *
          </label>
          <input
            type="text"
            id="nitCopropiedad"
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.nitCopropiedad ? 'border-red-500' : ''
            }`}
            placeholder="Ej: 901234567-1"
            {...register('nitCopropiedad', {
              required: 'El NIT es obligatorio',
              pattern: {
                value: /^[0-9]{9}-[0-9]{1}$/,
                message: 'Formato inválido. Ej: 901234567-1'
              }
            })}
          />
          {errors.nitCopropiedad && (
            <p className="mt-1 text-sm text-red-600">{errors.nitCopropiedad.message}</p>
          )}
        </div>

        {/* Nombre de la copropiedad */}
        <div>
          <label htmlFor="nombreCopropiedad" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la copropiedad *
          </label>
          <input
            type="text"
            id="nombreCopropiedad"
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.nombreCopropiedad ? 'border-red-500' : ''
            }`}
            placeholder="Ej: Conjunto Residencial Las Palmas"
            {...register('nombreCopropiedad', {
              required: 'El nombre es obligatorio',
              minLength: {
                value: 5,
                message: 'El nombre debe tener al menos 5 caracteres'
              }
            })}
          />
          {errors.nombreCopropiedad && (
            <p className="mt-1 text-sm text-red-600">{errors.nombreCopropiedad.message}</p>
          )}
        </div>

        {/* Número de resolución */}
        <div>
          <label htmlFor="nitResolucion" className="block text-sm font-medium text-gray-700 mb-1">
            Número de resolución de nombramiento *
          </label>
          <input
            type="text"
            id="nitResolucion"
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.nitResolucion ? 'border-red-500' : ''
            }`}
            placeholder="Ej: 2023-0456"
            {...register('nitResolucion', {
              required: 'El número de resolución es obligatorio'
            })}
          />
          {errors.nitResolucion && (
            <p className="mt-1 text-sm text-red-600">{errors.nitResolucion.message}</p>
          )}
        </div>

        {/* Fecha de resolución */}
        <div>
          <label htmlFor="fechaResolucion" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de resolución *
          </label>
          <input
            type="date"
            id="fechaResolucion"
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.fechaResolucion ? 'border-red-500' : ''
            }`}
            {...register('fechaResolucion', {
              required: 'La fecha de resolución es obligatoria'
            })}
          />
          {errors.fechaResolucion && (
            <p className="mt-1 text-sm text-red-600">{errors.fechaResolucion.message}</p>
          )}
        </div>
      </div>

      {/* Link de Google Sheets */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="googleSheetsUrl" className="block text-sm font-medium text-gray-700">
            URL de Google Sheets con datos de residentes *
          </label>
          <a 
            href="#" 
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            onClick={(e) => {
              e.preventDefault()
              // Aquí se implementará la descarga de la plantilla
              toast.success('Plantilla de ejemplo descargada')
            }}
          >
            <Download size={14} className="mr-1" />
            Descargar plantilla
          </a>
        </div>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="url"
            id="googleSheetsUrl"
            className={`block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.googleSheetsUrl ? 'border-red-500' : ''
            }`}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            {...register('googleSheetsUrl', {
              required: 'La URL de Google Sheets es obligatoria',
              pattern: {
                value: /https:\/\/docs\.google\.com\/spreadsheets\/d\/.+/i,
                message: 'Debe ser una URL válida de Google Sheets'
              }
            })}
          />
          <button
            type="button"
            onClick={handleValidateGoogleSheet}
            disabled={isValidatingSheet || !googleSheetsUrl || errors.googleSheetsUrl !== undefined}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300"
          >
            {isValidatingSheet ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            Validar
          </button>
        </div>
        {errors.googleSheetsUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.googleSheetsUrl.message}</p>
        )}
        
        {/* Componente de validación */}
        {sheetValidationData !== null && (
          <GoogleSheetsValidator
            isValid={sheetValidationData.isValid}
            message={sheetValidationData.message}
            nitMatch={sheetValidationData.nitMatch}
            nombreMatch={sheetValidationData.nombreMatch}
            nitValue={nitValue}
            nombreValue={nombreValue}
          />
        )}
      </div>

      {/* Link de Google Docs */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="googleDocsUrl" className="block text-sm font-medium text-gray-700">
            URL de plantilla Google Docs para paz y salvos *
          </label>
          <a 
            href="#" 
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            onClick={(e) => {
              e.preventDefault()
              // Aquí se implementará la descarga de la plantilla
              toast.success('Plantilla de ejemplo descargada')
            }}
          >
            <Download size={14} className="mr-1" />
            Descargar ejemplo
          </a>
        </div>
        <input
          type="url"
          id="googleDocsUrl"
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.googleDocsUrl ? 'border-red-500' : ''
          }`}
          placeholder="https://docs.google.com/document/d/..."
          {...register('googleDocsUrl', {
            required: 'La URL de Google Docs es obligatoria',
            pattern: {
              value: /https:\/\/docs\.google\.com\/document\/d\/.+/i,
              message: 'Debe ser una URL válida de Google Docs'
            }
          })}
        />
        {errors.googleDocsUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.googleDocsUrl.message}</p>
        )}
      </div>

      {/* Botón de envío */}
      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !validationSuccess}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Registrando...
              </>
            ) : validationSuccess ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Registrar Copropiedad
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 mr-2" />
                Validar datos primero
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
