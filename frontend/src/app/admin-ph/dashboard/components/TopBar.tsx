'use client'

import React from 'react'
import { Bell, Menu, LogOut, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface TopBarProps {
  user: any
  onMenuClick: () => void
  onLogout: () => void
}

export default function TopBar({ user, onMenuClick, onLogout }: TopBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Función para obtener las iniciales del nombre del usuario
  const getInitials = (name: string) => {
    if (!name) return 'A'
    const names = name.split(' ')
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Botón menú mobile */}
        <button
          className="lg:hidden text-gray-600 focus:outline-none"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Título de la página */}
        <div className="ml-4 lg:ml-0">
          <h1 className="text-lg font-semibold text-gray-900">Panel Administrador PH</h1>
        </div>

        {/* Acciones a la derecha */}
        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <div className="relative">
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
              <Bell className="h-6 w-6" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-800">Notificaciones</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">No hay notificaciones</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Perfil usuario */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 text-gray-700 focus:outline-none"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center text-blue-700 font-medium">
                {getInitials(user?.nombre || 'Admin')}
              </div>
              <span className="hidden md:inline-block text-sm font-medium">
                {user?.nombre || 'Administrador'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <div className="py-1">
                  <button
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => {
                      setShowUserMenu(false)
                      // Navegar a perfil
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </button>
                  <button
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    onClick={() => {
                      setShowUserMenu(false)
                      onLogout()
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
