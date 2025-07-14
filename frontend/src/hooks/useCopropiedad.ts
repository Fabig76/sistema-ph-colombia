'use client'

import { useState, useCallback } from 'react'
import { Copropiedad, Property } from '@/types/copropiedad'
import { propietariosApi } from '@/lib/api/propietariosApi'
import toast from 'react-hot-toast'

interface CopropiedadState {
  copropiedades: Copropiedad[]
  selectedCopropiedad: Copropiedad | null
  properties: Property[]
  loading: boolean
  error: string | null
}

interface CopropiedadActions {
  searchByNit: (nit: string) => Promise<{ success: boolean; data?: Copropiedad[] }>
  selectCopropiedad: (copropiedad: Copropiedad) => void
  searchPropertiesByPhone: (telefono: string, copropiedadId: string, cedula: string, codigoVerificacion: string) => Promise<{ success: boolean; data?: Property[] }>
  generatePazYSalvo: (datosGeneracion: { cedula: string; telefono: string; codigoVerificacion: string; nitCopropiedad: string; inmuebleId: string }) => Promise<{ success: boolean; url?: string }>
  clearResults: () => void
  clearError: () => void
}

export const useCopropiedad = (): CopropiedadState & CopropiedadActions => {
  const [state, setState] = useState<CopropiedadState>({
    copropiedades: [],
    selectedCopropiedad: null,
    properties: [],
    loading: false,
    error: null
  })

  const searchByNit = useCallback(async (nit: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Llamada real a API
      const results = await propietariosApi.buscarCopropiedad(nit)

      setState(prev => ({
        ...prev,
        copropiedades: results,
        loading: false
      }))

      if (results.length === 0) {
        toast.error('No se encontraron copropiedades con ese NIT')
        return { success: false }
      }

      toast.success(`Se encontraron ${results.length} copropiedad(es)`)
      return { success: true, data: results }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en la búsqueda'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      toast.error(errorMessage)
      return { success: false }
    }
  }, [])

  const selectCopropiedad = useCallback((copropiedad: Copropiedad) => {
    setState(prev => ({
      ...prev,
      selectedCopropiedad: copropiedad
    }))
    toast.success(`Copropiedad seleccionada: ${copropiedad.nombre}`)
  }, [])

  const searchPropertiesByPhone = useCallback(async (telefono: string, copropiedadId: string, cedula: string, codigoVerificacion: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Llamada real a API con todos los datos requeridos
      const inmuebles = await propietariosApi.getInmuebles({
        cedula,
        telefono,
        codigoVerificacion,
        nitCopropiedad: state.selectedCopropiedad?.nit || ''
      })

      setState(prev => ({
        ...prev,
        properties: inmuebles,
        loading: false
      }))

      if (inmuebles.length === 0) {
        toast.error('No se encontraron propiedades con esos datos')
        return { success: false }
      }

      toast.success(`Se encontraron ${inmuebles.length} propiedad(es)`)
      return { success: true, data: inmuebles }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en la consulta'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      toast.error(errorMessage)
      return { success: false }
    }
  }, [state.selectedCopropiedad])

  const generatePazYSalvo = useCallback(async (datosGeneracion: {
    cedula: string;
    telefono: string;
    codigoVerificacion: string;
    nitCopropiedad: string;
    inmuebleId: string;
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Llamada real a API para generar PDF
      const resultado = await propietariosApi.generarPazYSalvo(datosGeneracion)
      
      toast.success('Paz y salvo generado exitosamente')
      return { success: true, url: resultado.url }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error generando paz y salvo'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      toast.error(errorMessage)
      return { success: false }
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const clearResults = useCallback(() => {
    setState({
      copropiedades: [],
      selectedCopropiedad: null,
      properties: [],
      loading: false,
      error: null
    })
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    searchByNit,
    selectCopropiedad,
    searchPropertiesByPhone,
    generatePazYSalvo,
    clearResults,
    clearError
  }
}
