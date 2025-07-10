'use client'

import { useState, useCallback } from 'react'
import { Copropiedad, Property } from '@/types/copropiedad'
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
  searchPropertiesByPhone: (telefono: string, copropiedadId: string) => Promise<{ success: boolean; data?: Property[] }>
  generatePazYSalvo: (propertyId: string) => Promise<{ success: boolean; url?: string }>
  clearResults: () => void
  clearError: () => void
}

// Mock data para desarrollo
const mockCopropiedades: Copropiedad[] = [
  {
    id: '1',
    nit: '900123456',
    nombre: 'Conjunto Residencial Los Pinos',
    direccion: 'Calle 123 #45-67, Bogotá',
    estado: 'activa',
    fechaCreacion: '2023-01-15',
    estadoPago: 'al_dia',
    administrador: {
      id: '1',
      nombre: 'María García',
      email: 'maria@lospinos.com',
      telefono: '3001234567'
    }
  },
  {
    id: '2',
    nit: '900654321',
    nombre: 'Edificio Torre Central',
    direccion: 'Carrera 15 #89-12, Medellín',
    estado: 'activa',
    fechaCreacion: '2023-03-20',
    estadoPago: 'al_dia'
  }
]

const mockProperties: Property[] = [
  {
    id: '1',
    tipo: 'apartamento',
    numero: '501',
    identificacion: 'Apto 501',
    direccion: 'Torre A - Piso 5',
    propietario: {
      nombre: 'Juan Pérez',
      telefono: '3001234567',
      email: 'juan@email.com'
    },
    estado: 'al_dia',
    valorCuota: 450000,
    cuotasPendientes: 0,
    ultimoPago: '2024-01-15',
    saldoPendiente: 0
  },
  {
    id: '2',
    tipo: 'parqueadero',
    numero: 'P-15',
    identificacion: 'P-15',
    direccion: 'Sótano 1',
    propietario: {
      nombre: 'Juan Pérez',
      telefono: '3001234567',
      email: 'juan@email.com'
    },
    estado: 'al_dia',
    valorCuota: 80000,
    cuotasPendientes: 0,
    ultimoPago: '2024-01-15',
    saldoPendiente: 0
  }
]

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
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Buscar copropiedades que coincidan con el NIT
      const results = mockCopropiedades.filter(copropiedad => 
        copropiedad.nit.includes(nit) || 
        copropiedad.nombre.toLowerCase().includes(nit.toLowerCase())
      )

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

  const searchPropertiesByPhone = useCallback(async (telefono: string, copropiedadId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Simular llamada a Google Sheets API
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Validar teléfono colombiano
      if (!/^3\d{9}$/.test(telefono)) {
        throw new Error('Formato de teléfono inválido')
      }

      // Simular búsqueda de propiedades
      const userProperties = mockProperties.filter(property => 
        property.propietario.telefono === telefono
      )

      setState(prev => ({
        ...prev,
        properties: userProperties,
        loading: false
      }))

      if (userProperties.length === 0) {
        toast.error('No se encontraron inmuebles asociados a este teléfono')
        return { success: false }
      }

      toast.success(`Se encontraron ${userProperties.length} inmueble(s)`)
      return { success: true, data: userProperties }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error consultando inmuebles'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      toast.error(errorMessage)
      return { success: false }
    }
  }, [])

  const generatePazYSalvo = useCallback(async (propertyId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Simular generación de documento
      await new Promise(resolve => setTimeout(resolve, 2000))

      const property = state.properties.find(p => p.id === propertyId)
      if (!property) {
        throw new Error('Propiedad no encontrada')
      }

      if (property.estado !== 'al_dia') {
        throw new Error('No se puede generar paz y salvo. Hay cuotas pendientes.')
      }

      // Simular URL de descarga
      const downloadUrl = `https://docs.google.com/document/d/mock-paz-y-salvo-${propertyId}/export?format=pdf`

      setState(prev => ({ ...prev, loading: false }))

      // Simular descarga
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `paz-y-salvo-${property.identificacion}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Paz y salvo generado correctamente')
      return { success: true, url: downloadUrl }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error generando paz y salvo'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      toast.error(errorMessage)
      return { success: false }
    }
  }, [state.properties])

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
