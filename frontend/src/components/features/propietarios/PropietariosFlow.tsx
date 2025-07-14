'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCopropiedad } from '@/hooks/useCopropiedad'
import { useAuth } from '@/lib/hooks/useAuth'
import { Copropiedad } from '@/types/copropiedad'
import { SearchStep } from './steps/SearchStep'
import { PhoneStep } from './steps/PhoneStep'
import { VerificationStep } from './steps/VerificationStep'
import { ResultsStep } from './steps/ResultsStep'

type Step = 'search' | 'phone' | 'verify' | 'results'

export const PropietariosFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('search')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [cedula, setCedula] = useState('')
  const [codigoVerificacion, setCodigoVerificacion] = useState('')
  
  const {
    copropiedades,
    selectedCopropiedad,
    properties,
    loading,
    searchByNit,
    selectCopropiedad,
    searchPropertiesByPhone,
    clearResults
  } = useCopropiedad()

  const {
    sendVerificationCode,
    verifyCode,
    loading: authLoading
  } = useAuth()

  const handleSearchSubmit = async (nit: string) => {
    const result = await searchByNit(nit)
    if (result.success && result.data && result.data.length === 1) {
      // Si solo hay una copropiedad, seleccionarla automáticamente
      selectCopropiedad(result.data[0])
      setCurrentStep('phone')
    }
  }

  const handleCopropiedadSelect = (copropiedad: Copropiedad) => {
    selectCopropiedad(copropiedad)
    setCurrentStep('phone')
  }

  const handlePhoneSubmit = async (cedulaInput: string, telefono: string) => {
    setCedula(cedulaInput)
    setPhoneNumber(telefono)
    const result = await sendVerificationCode(telefono)
    if (result.success) {
      setCurrentStep('verify')
    }
  }

  const handleVerificationSubmit = async (codigo: string) => {
    setCodigoVerificacion(codigo)
    const result = await verifyCode({ telefono: phoneNumber, codigo })
    if (result.success && selectedCopropiedad) {
      const propertiesResult = await searchPropertiesByPhone(phoneNumber, selectedCopropiedad.id, cedula, codigo)
      if (propertiesResult.success) {
        setCurrentStep('results')
      }
    }
  }

  const handleNewSearch = () => {
    clearResults()
    setCurrentStep('search')
    setPhoneNumber('')
    setCedula('')
    setCodigoVerificacion('')
  }

  const handleBackToSearch = () => {
    setCurrentStep('search')
  }

  const handleBackToPhone = () => {
    setCurrentStep('phone')
  }

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Portal Propietarios
          </h1>
          <p className="text-gray-600">
            Consulta y descarga tu paz y salvo de forma rápida y segura
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['search', 'phone', 'verify', 'results'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? 'bg-green-600 text-white'
                      : index < ['search', 'phone', 'verify', 'results'].indexOf(currentStep)
                      ? 'bg-green-200 text-green-800'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      index < ['search', 'phone', 'verify', 'results'].indexOf(currentStep)
                        ? 'bg-green-200'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <AnimatePresence mode="wait">
            {currentStep === 'search' && (
              <motion.div
                key="search"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <SearchStep
                  copropiedades={copropiedades}
                  onSubmit={handleSearchSubmit}
                  onSelect={handleCopropiedadSelect}
                  loading={loading}
                />
              </motion.div>
            )}

            {currentStep === 'phone' && (
              <motion.div
                key="phone"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <PhoneStep
                  copropiedad={selectedCopropiedad}
                  onSubmit={handlePhoneSubmit}
                  onBack={handleBackToSearch}
                  loading={authLoading}
                />
              </motion.div>
            )}

            {currentStep === 'verify' && (
              <motion.div
                key="verify"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <VerificationStep
                  copropiedad={selectedCopropiedad}
                  phoneNumber={phoneNumber}
                  onSubmit={handleVerificationSubmit}
                  onBack={handleBackToPhone}
                  loading={authLoading || loading}
                />
              </motion.div>
            )}

            {currentStep === 'results' && (
              <motion.div
                key="results"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <ResultsStep
                  copropiedad={selectedCopropiedad}
                  propiedades={properties}
                  cedula={cedula}
                  telefono={phoneNumber}
                  codigoVerificacion={codigoVerificacion}
                  onNewSearch={handleNewSearch}
                  loading={loading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
