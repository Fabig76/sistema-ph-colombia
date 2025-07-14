'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { UserCheck, Building2, PlusCircle, BarChart3, Settings, ChevronDown, ChevronUp, Save, X, ExternalLink, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { adminPhApi } from '@/lib/api/adminPhApi'

export default function DashboardPage() {
  const { user } = useAuth()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cargandoRegistro, setCargandoRegistro] = useState(false)
  const [estadisticas, setEstadisticas] = useState<any | null>(null)
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true)
  const [mostrarCopropiedades, setMostrarCopropiedades] = useState(false)
  const [copropiedades, setCopropiedades] = useState<any[]>([])
  const [cargandoCopropiedades, setCargandoCopropiedades] = useState(false)
  const [formData, setFormData] = useState({
    nit: '',
    nombre: '',
    resolucionNumero: '',
    resolucionFecha: '',
    hojaGoogleSheetsId: '',
    plantillaGoogleDocsId: ''
  })

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      setCargandoEstadisticas(true)
      const stats = await adminPhApi.getEstadisticas()
      setEstadisticas(stats)
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error.message)
      toast.error('Error al cargar estadísticas')
    } finally {
      setCargandoEstadisticas(false)
    }
  }

  const cargarCopropiedades = async () => {
    try {
      setCargandoCopropiedades(true)
      const data = await adminPhApi.getCopropiedades()
      setCopropiedades(data)
    } catch (error: any) {
      console.error('Error al cargar copropiedades:', error.message)
      toast.error('Error al cargar copropiedades')
    } finally {
      setCargandoCopropiedades(false)
    }
  }

  const handleVerCopropiedades = async () => {
    if (!mostrarCopropiedades) {
      await cargarCopropiedades()
    }
    setMostrarCopropiedades(!mostrarCopropiedades)
  }

  const handleSubmitCopropiedad = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargandoRegistro(true)

    try {
      // Validaciones básicas
      if (!formData.nit || !formData.nombre || !formData.resolucionNumero || 
          !formData.resolucionFecha || !formData.hojaGoogleSheetsId || 
          !formData.plantillaGoogleDocsId) {
        toast.error('Todos los campos son obligatorios')
        return
      }

      // Validar formato de URLs de Google
      const urlSheets = formData.hojaGoogleSheetsId
      const urlDocs = formData.plantillaGoogleDocsId
      
      if (!urlSheets.includes('docs.google.com/spreadsheets')) {
        toast.error('El link de Google Sheets no es válido')
        return
      }
      
      if (!urlDocs.includes('docs.google.com/document')) {
        toast.error('El link de Google Docs no es válido')
        return
      }

      // Registrar copropiedad usando la API
      const resultado = await adminPhApi.registrarCopropiedad({
        nombre: formData.nombre,
        nit: formData.nit,
        resolucionNumero: formData.resolucionNumero,
        resolucionFecha: formData.resolucionFecha,
        googleSheetUrl: formData.hojaGoogleSheetsId,
        googleDocUrl: formData.plantillaGoogleDocsId
      })
      
      toast.success(resultado.message || '¡Copropiedad registrada exitosamente!')
      
      // Recargar estadísticas para actualizar contadores
      await cargarEstadisticas()
      
      // Limpiar formulario y ocultar
      setFormData({
        nit: '',
        nombre: '',
        resolucionNumero: '',
        resolucionFecha: '',
        hojaGoogleSheetsId: '',
        plantillaGoogleDocsId: ''
      })
      setMostrarFormulario(false)
      
    } catch (error) {
      console.error('Error al registrar copropiedad:', error)
      toast.error('Error al registrar la copropiedad. Intente nuevamente.')
    } finally {
      setCargandoRegistro(false)
    }
  }
  
  return (
    <ProtectedRoute redirectTo="/admin-ph">
      <DashboardLayout>
      <div className="space-y-8">
        {/* Bienvenida y resumen */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            ¡Bienvenido, {user?.nombre || 'Administrador'}!
          </h1>
          <p className="text-gray-600">
            Este es su panel de administración de Propiedades Horizontales. 
            Aquí podrá gestionar sus copropiedades, ver estadísticas, y administrar los pagos.
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <div className="flex items-center mb-2">
              <Building2 className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-blue-900">Copropiedades</h3>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {cargandoEstadisticas ? '...' : (estadisticas?.totalCopropiedades || 0)}
            </p>
            <p className="text-sm text-blue-600 mt-1">Activas bajo su administración</p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <div className="flex items-center mb-2">
              <UserCheck className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-medium text-green-900">Propietarios</h3>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {cargandoEstadisticas ? '...' : (estadisticas?.propietariosConsultas || 0)}
            </p>
            <p className="text-sm text-green-600 mt-1">Han realizado consultas</p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
            <div className="flex items-center mb-2">
              <PlusCircle className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="font-medium text-purple-900">Paz y Salvos</h3>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {cargandoEstadisticas ? '...' : (estadisticas?.pazySalvosGenerados || 0)}
            </p>
            <p className="text-sm text-purple-600 mt-1">Generados este mes</p>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
            <div className="flex items-center mb-2">
              <BarChart3 className="w-5 h-5 text-amber-600 mr-2" />
              <h3 className="font-medium text-amber-900">Plan</h3>
            </div>
            <p className="text-2xl font-bold text-amber-700">Trial</p>
            <p className="text-sm text-amber-600 mt-1">60 días para probar</p>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="flex items-center justify-between w-full p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <PlusCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-blue-900">Registrar Propiedad</h3>
                  <p className="text-sm text-blue-700">Añadir nueva copropiedad</p>
                </div>
              </div>
              {mostrarFormulario ? 
                <ChevronUp className="w-5 h-5 text-blue-600" /> : 
                <ChevronDown className="w-5 h-5 text-blue-600" />
              }
            </button>
            
            <button 
              onClick={handleVerCopropiedades}
              className="flex items-center justify-between w-full p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-green-900">Ver Copropiedades</h3>
                  <p className="text-sm text-green-700">Gestionar existentes</p>
                </div>
              </div>
              {mostrarCopropiedades ? 
                <ChevronUp className="w-5 h-5 text-green-600" /> : 
                <ChevronDown className="w-5 h-5 text-green-600" />
              }
            </button>

            {/* LISTA DE COPROPIEDADES - Desplegable */}
            {mostrarCopropiedades && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200 border-l-4 border-l-green-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Building2 className="w-6 h-6 text-green-600 mr-2" />
                    Mis Copropiedades
                  </h2>
                  <button 
                    onClick={() => setMostrarCopropiedades(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {cargandoCopropiedades ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="mt-2 text-gray-600">Cargando copropiedades...</p>
                  </div>
                ) : copropiedades.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No hay copropiedades registradas</p>
                    <p className="text-sm text-gray-500">Use el botón "Registrar Propiedad" para agregar su primera copropiedad</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {copropiedades.map((copropiedad) => (
                      <div key={copropiedad.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="font-semibold text-gray-800 mr-3">{copropiedad.nombre}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                copropiedad.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {copropiedad.activo ? 'Activa' : 'Inactiva'}
                              </span>
                              {copropiedad.periodoGratis && (
                                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Período Gratis
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <p><span className="font-medium">NIT:</span> {copropiedad.nit}</p>
                              <p><span className="font-medium">Eventos:</span> {copropiedad._count?.eventos || 0}</p>
                              <p><span className="font-medium">Creada:</span> {new Date(copropiedad.createdAt).toLocaleDateString()}</p>
                              <p><span className="font-medium">Pagos:</span> {copropiedad._count?.pagos || 0}</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors">
                              Ver Detalles
                            </button>
                            <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition-colors">
                              Desactivar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-purple-900">Mi Perfil</h3>
                <p className="text-sm text-purple-700">Actualizar información</p>
              </div>
            </button>
          </div>
        </div>

        {/* FORMULARIO REGISTRO COPROPIEDAD - Desplegable */}
        {mostrarFormulario && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Building2 className="w-6 h-6 text-blue-600 mr-2" />
                Registrar Nueva Copropiedad
              </h2>
              <button 
                onClick={() => setMostrarFormulario(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCopropiedad} className="space-y-6">
              {/* Fila 1: NIT y Nombre */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIT de la Copropiedad *
                  </label>
                  <input
                    type="text"
                    value={formData.nit}
                    onChange={(e) => setFormData({...formData, nit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 900123456-7"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Debe coincidir con la primera columna de Google Sheets
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Copropiedad *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Conjunto Residencial Los Alpes"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Debe coincidir con la segunda columna de Google Sheets
                  </p>
                </div>
              </div>

              {/* Fila 2: Resolución */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Resolución *
                  </label>
                  <input
                    type="text"
                    value={formData.resolucionNumero}
                    onChange={(e) => setFormData({...formData, resolucionNumero: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 001-2024"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Resolución de nombramiento de la alcaldía
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de la Resolución *
                  </label>
                  <input
                    type="date"
                    value={formData.resolucionFecha}
                    onChange={(e) => setFormData({...formData, resolucionFecha: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Fila 3: Google Sheets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link de Google Sheets - Datos de Residentes *
                </label>
                <input
                  type="url"
                  value={formData.hojaGoogleSheetsId}
                  onChange={(e) => setFormData({...formData, hojaGoogleSheetsId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  required
                />
                <div className="flex items-center mt-2 space-x-4">
                  <p className="text-xs text-gray-500">
                    Hoja de cálculo con datos de propietarios
                  </p>
                  <button 
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Descargar formato base
                  </button>
                  <button 
                    type="button"
                    className="text-green-600 hover:text-green-800 text-xs flex items-center"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Ver manual
                  </button>
                </div>
              </div>

              {/* Fila 4: Google Docs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link de Google Docs - Plantilla Paz y Salvos *
                </label>
                <input
                  type="url"
                  value={formData.plantillaGoogleDocsId}
                  onChange={(e) => setFormData({...formData, plantillaGoogleDocsId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://docs.google.com/document/d/..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Documento modelo donde se generarán los paz y salvos
                </p>
              </div>

              {/* Información importante */}
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Información importante</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>El NIT y nombre deben estar en las primeras dos columnas de Google Sheets</li>
                        <li>Los datos NO se almacenan en base de datos por políticas de tratamiento de datos</li>
                        <li>Las consultas se realizan en tiempo real desde Google Sheets</li>
                        <li>Tendrá 60 días gratis, luego $20.000 COP/mes por copropiedad</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button 
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={cargandoRegistro}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {cargandoRegistro ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Validando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Copropiedad
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Últimas actividades - Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No hay actividad reciente para mostrar</p>
            <p className="text-sm mt-2">Las actividades aparecerán aquí cuando propietarios consulten paz y salvos</p>
          </div>
        </div>
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
