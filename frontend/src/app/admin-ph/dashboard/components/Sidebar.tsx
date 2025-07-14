'use client'

import { BarChart3, PlusCircle, Building2, CreditCard, TrendingUp, User, X } from 'lucide-react'
import Link from 'next/link'

interface SidebarProps {
  sections: {
    id: string
    label: string
    icon: string
  }[]
  activeSection: string
  onSectionChange: (section: string) => void
  onClose: () => void
}

export default function Sidebar({
  sections,
  activeSection,
  onSectionChange,
  onClose
}: SidebarProps) {
  // Función para renderizar el icono correcto según el nombre
  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'BarChart3':
        return <BarChart3 className={className} />
      case 'PlusCircle':
        return <PlusCircle className={className} />
      case 'Building2':
        return <Building2 className={className} />
      case 'CreditCard':
        return <CreditCard className={className} />
      case 'TrendingUp':
        return <TrendingUp className={className} />
      case 'User':
        return <User className={className} />
      default:
        return <BarChart3 className={className} />
    }
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Logo y Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 rounded-md p-2">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-800">PH Colombia</span>
        </div>
        <button className="lg:hidden" onClick={onClose}>
          <X className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      {/* Navegación */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {sections.map((section) => {
            const isActive = section.id === activeSection
            
            return (
              <Link
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  onSectionChange(section.id)
                }}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {renderIcon(
                  section.icon,
                  `mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'
                  }`
                )}
                {section.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-800 font-medium">Soporte Técnico</p>
          <p className="text-xs text-blue-600 mt-1">
            ¿Necesita ayuda? Contáctenos al
            <a href="tel:+573001234567" className="font-bold ml-1">
              300 123 4567
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
