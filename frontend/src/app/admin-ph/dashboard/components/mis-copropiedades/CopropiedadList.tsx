'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building, Calendar, Users, ExternalLink, MoreVertical, Trash2, Edit, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Tipo para la copropiedad
interface Copropiedad {
  id: string
  nit: string
  nombre: string
  fechaRegistro: string
  propietariosCount: number
  sheetsUrl: string
  docsUrl: string
}

interface CopropiedadListProps {
  copropiedades: Copropiedad[]
  onDelete: (id: string) => Promise<void>
}

export default function CopropiedadList({ copropiedades, onDelete }: CopropiedadListProps) {
  const router = useRouter()
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  
  // Manejar clic en el menú de opciones
  const handleMenuToggle = (id: string) => {
    if (expandedMenuId === id) {
      setExpandedMenuId(null)
    } else {
      setExpandedMenuId(id)
    }
  }
  
  // Eliminar copropiedad con confirmación
  const handleDeleteClick = (id: string) => {
    if (confirmDeleteId === id) {
      // Confirmación aceptada, proceder con eliminación
      setDeletingId(id)
      onDelete(id).finally(() => {
        setDeletingId(null)
        setConfirmDeleteId(null)
      })
    } else {
      // Solicitar confirmación
      setConfirmDeleteId(id)
      // Auto-cancelar después de 3 segundos
      setTimeout(() => {
        setConfirmDeleteId(null)
      }, 3000)
    }
  }
  
  // Ver detalles de copropiedad
  const handleViewCopropiedad = (id: string) => {
    toast.success('Funcionalidad de ver detalles en desarrollo')
    // router.push(`/admin-ph/dashboard/mis-copropiedades/${id}`)
  }
  
  // Editar copropiedad
  const handleEditCopropiedad = (id: string) => {
    toast.success('Funcionalidad de edición en desarrollo')
    // router.push(`/admin-ph/dashboard/mis-copropiedades/${id}/editar`)
  }
  
  // Visitar Google Sheets
  const handleVisitGoogleSheets = (url: string) => {
    window.open(url, '_blank')
  }
  
  // Visitar Google Docs
  const handleVisitGoogleDocs = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {copropiedades.map((copropiedad) => (
        <div 
          key={copropiedad.id}
          className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 transition-all hover:shadow-md"
        >
          <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {copropiedad.nombre}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                NIT: {copropiedad.nit}
              </p>
            </div>
            
            {/* Menú de opciones */}
            <div className="relative">
              <button
                onClick={() => handleMenuToggle(copropiedad.id)}
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </button>
              
              {/* Dropdown menu */}
              {expandedMenuId === copropiedad.id && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      onClick={() => handleViewCopropiedad(copropiedad.id)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Eye className="mr-3 h-4 w-4 text-gray-500" />
                      Ver detalles
                    </button>
                    
                    <button
                      onClick={() => handleEditCopropiedad(copropiedad.id)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Edit className="mr-3 h-4 w-4 text-gray-500" />
                      Editar
                    </button>
                    
                    <button
                      onClick={() => handleDeleteClick(copropiedad.id)}
                      disabled={deletingId === copropiedad.id}
                      className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                    >
                      <Trash2 className="mr-3 h-4 w-4 text-red-500" />
                      {confirmDeleteId === copropiedad.id
                        ? 'Confirmar eliminación'
                        : deletingId === copropiedad.id
                          ? 'Eliminando...'
                          : 'Eliminar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Información detallada */}
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Building className="mr-1 h-4 w-4" />
                  Copropiedad
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{copropiedad.nombre}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Fecha de registro
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(copropiedad.fechaRegistro).toLocaleDateString('es-CO')}
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  Propietarios registrados
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{copropiedad.propietariosCount}</dd>
              </div>
            </dl>
          </div>
          
          {/* Enlaces y acciones */}
          <div className="px-4 py-4 sm:px-6 flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleVisitGoogleSheets(copropiedad.sheetsUrl)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Ver hoja de datos
              </button>
              
              <button
                onClick={() => handleVisitGoogleDocs(copropiedad.docsUrl)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Ver plantilla Docs
              </button>
            </div>
            
            <button
              onClick={() => handleViewCopropiedad(copropiedad.id)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ver detalles
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
