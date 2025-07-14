'use client'

import { Building2, Users, FileCheck, Search } from 'lucide-react'

interface EstadisticasResumenProps {
  totalCopropiedades: number
  totalPropietarios: number
  pazYSalvosGenerados: number
  consultasRealizadas: number
}

export default function EstadisticasResumen({
  totalCopropiedades,
  totalPropietarios,
  pazYSalvosGenerados,
  consultasRealizadas
}: EstadisticasResumenProps) {
  // Array con los datos para cada tarjeta
  const cards = [
    {
      title: 'Copropiedades',
      value: totalCopropiedades,
      icon: Building2,
      color: 'bg-blue-500',
      increase: '+14%',
      period: 'desde el mes pasado'
    },
    {
      title: 'Propietarios',
      value: totalPropietarios,
      icon: Users,
      color: 'bg-purple-500',
      increase: '+5%',
      period: 'desde el mes pasado'
    },
    {
      title: 'Paz y Salvos',
      value: pazYSalvosGenerados,
      icon: FileCheck,
      color: 'bg-green-500',
      increase: '+7%',
      period: 'desde el mes pasado'
    },
    {
      title: 'Consultas',
      value: consultasRealizadas,
      icon: Search,
      color: 'bg-amber-500',
      increase: '+23%',
      period: 'desde el mes pasado'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div 
            key={index}
            className="bg-white rounded-lg shadow p-6 transition-transform hover:scale-105 hover:shadow-md"
          >
            <div className="flex items-center">
              <div className={`rounded-md p-3 ${card.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.title}
                  </dt>
                  <dd>
                    <div className="text-lg font-bold text-gray-900">
                      {card.value.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <span className="text-sm text-green-600 font-medium">
                  {card.increase}
                </span>
                <span className="ml-1 text-xs text-gray-500">
                  {card.period}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
