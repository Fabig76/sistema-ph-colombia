/**
 * Barra de navegación para el módulo de propietarios
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, FileText, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUtils } from '@/lib/api/apiUtils';
import { getInitials } from '@/lib/utils';

// Función para generar un color basado en una cadena
const stringToColor = (str: string): string => {
  if (!str) return '#6366F1'; // Color por defecto (indigo-500)
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#EF4444', // red-500
    '#F97316', // orange-500
    '#F59E0B', // amber-500
    '#10B981', // emerald-500
    '#06B6D4', // cyan-500
    '#3B82F6', // blue-500
    '#6366F1', // indigo-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
  ];
  
  // Usar el hash para seleccionar un color del array
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function NavbarPropietarios() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Obtener datos del usuario al cargar el componente
    const user = apiUtils.getUserData();
    if (user) {
      setUserData(user);
    }
  }, []);

  // Cerrar el menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Función para cerrar sesión
  const handleLogout = () => {
    apiUtils.clearAuth();
    window.location.href = '/propietarios/login';
  };

  // Determinar si un enlace está activo
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Enlaces de navegación
  const navLinks = [
    {
      name: 'Inmuebles',
      href: '/propietarios/inmuebles',
      icon: <Home className="w-5 h-5" />
    },
    {
      name: 'Paz y Salvos',
      href: '/propietarios/paz-y-salvos',
      icon: <FileText className="w-5 h-5" />
    },
    {
      name: 'Perfil',
      href: '/propietarios/perfil',
      icon: <User className="w-5 h-5" />
    }
  ];

  // Color de fondo para el avatar basado en el nombre
  const avatarBgColor = userData ? stringToColor(userData.nombre) : '#6366F1';

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y nombre */}
          <div className="flex items-center">
            <Link href="/propietarios/inmuebles" className="flex items-center">
              <span className="text-indigo-600 font-bold text-xl">PazySalvos</span>
              <span className="text-gray-500 ml-1 text-sm">PH</span>
            </Link>
          </div>

          {/* Enlaces de navegación - Escritorio */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {link.icon}
                <span className="ml-2">{link.name}</span>
              </Link>
            ))}

            {/* Avatar y menú de usuario */}
            {userData && (
              <div className="ml-3 relative flex items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: avatarBgColor }}
                >
                  {getInitials(userData.nombre)}
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Salir
                </button>
              </div>
            )}
          </div>

          {/* Botón de menú móvil */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Abrir menú principal</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t"
          >
            <div className="pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-3 text-base font-medium ${
                    isActive(link.href)
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {link.icon}
                  <span className="ml-3">{link.name}</span>
                </Link>
              ))}

              {/* Avatar y nombre de usuario en móvil */}
              {userData && (
                <div className="flex items-center px-4 py-3 border-t">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: avatarBgColor }}
                  >
                    {getInitials(userData.nombre)}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{userData.nombre}</div>
                    <div className="text-sm font-medium text-gray-500">{userData.telefono}</div>
                  </div>
                </div>
              )}

              {/* Botón de cerrar sesión en móvil */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5 text-gray-500" />
                <span className="ml-3">Cerrar sesión</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
