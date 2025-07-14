'use client'

import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface GoogleSheetsValidatorProps {
  isValid: boolean
  message: string
  nitMatch: boolean
  nombreMatch: boolean
  nitValue: string
  nombreValue: string
}

export default function GoogleSheetsValidator({
  isValid,
  message,
  nitMatch,
  nombreMatch,
  nitValue,
  nombreValue,
}: GoogleSheetsValidatorProps) {
  return (
    <div className={`mt-4 p-4 rounded-md ${isValid ? 'bg-green-50' : 'bg-red-50'}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {isValid ? (
            <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
          ) : (
            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${isValid ? 'text-green-800' : 'text-red-800'}`}>
            Resultados de la validación
          </h3>
          <div className={`mt-2 text-sm ${isValid ? 'text-green-700' : 'text-red-700'}`}>
            <p>{message}</p>
          </div>
          
          {/* Detalle de la validación */}
          <div className="mt-3">
            <ul className="space-y-2 text-sm">
              {/* Validación del NIT */}
              <li className="flex items-center">
                {nitMatch ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className={nitMatch ? 'text-green-700' : 'text-red-700'}>
                  {nitMatch
                    ? `NIT "${nitValue}" coincide con la primera columna`
                    : `NIT no coincide o no se encuentra en la primera columna`}
                </span>
              </li>
              
              {/* Validación del nombre */}
              <li className="flex items-center">
                {nombreMatch ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className={nombreMatch ? 'text-green-700' : 'text-red-700'}>
                  {nombreMatch
                    ? `Nombre "${nombreValue}" coincide con la segunda columna`
                    : `Nombre no coincide o no se encuentra en la segunda columna`}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
