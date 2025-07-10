'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { 
  Settings, 
  Building2, 
  Home as HomeIcon, 
  Shield, 
  CheckCircle, 
  Users, 
  FileText, 
  CreditCard,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'

// Componente para las cards de módulos
const ModuleCard = ({ 
  icon: Icon, 
  title, 
  description, 
  href, 
  bgColor, 
  textColor,
  available = true,
  delay = 0 
}: {
  icon: any
  title: string
  description: string
  href: string
  bgColor: string
  textColor: string
  available?: boolean
  delay?: number
}) => {
  return (
    <div className="group">
      <div className={`
        bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center
        ${available ? 'transform hover:-translate-y-2' : 'opacity-75'}
        border border-gray-100 hover:border-gray-200
      `}>
        {/* Ícono */}
        <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-8 h-8 ${textColor}`} />
        </div>
        
        {/* Título */}
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {title}
        </h3>
        
        {/* Descripción */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>
        
        {/* Botón o estado */}
        {available ? (
          <Link 
            href={href}
            className={`
              inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg 
              font-semibold transition-all duration-300 hover:gap-3
              ${bgColor.replace('bg-', 'bg-').replace('-100', '-600')} 
              text-white hover:${bgColor.replace('bg-', 'bg-').replace('-100', '-700')}
            `}
          >
            Acceder
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <div className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed">
            Próximamente
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para las características
const FeatureCard = ({ icon: Icon, title, description }: {
  icon: any
  title: string
  description: string
}) => (
  <div className="flex items-start gap-4">
    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="w-6 h-6 text-green-600" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
)

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Header */}
          <div className="text-center text-white mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Sistema
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                PH Colombia
              </span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Plataforma integral para la gestión eficiente de propiedades horizontales en Colombia
            </p>
          </div>

          {/* Módulos principales */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <ModuleCard
              icon={Settings}
              title="Admin Sistema"
              description="Panel de control completo para la gestión integral del sistema, usuarios y configuraciones"
              href="/admin-sistema"
              bgColor="bg-red-100"
              textColor="text-red-600"
            />
            
            <ModuleCard
              icon={Building2}
              title="Administradores PH"
              description="Portal especializado para administradores de conjuntos residenciales y copropiedades"
              href="/admin-ph"
              bgColor="bg-blue-100"
              textColor="text-blue-600"
            />
            
            <ModuleCard
              icon={HomeIcon}
              title="Propietarios"
              description="Acceso directo para propietarios: consultas de estado de cuenta y descarga de paz y salvos"
              href="/propietarios"
              bgColor="bg-green-100"
              textColor="text-green-600"
            />
          </div>

          {/* Módulo futuro */}
          <div className="max-w-md mx-auto">
            <ModuleCard
              icon={Shield}
              title="Empresas de Vigilancia"
              description="Portal dedicado para empresas de vigilancia y seguridad"
              href="/vigilancia"
              bgColor="bg-purple-100"
              textColor="text-purple-600"
              available={false}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar propiedades horizontales de manera moderna y eficiente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={Users}
              title="Gestión de Propietarios"
              description="Administra la información de propietarios, apartamentos y estados de cuenta de forma centralizada"
            />
            
            <FeatureCard
              icon={FileText}
              title="Paz y Salvos Automáticos"
              description="Genera documentos de paz y salvo automáticamente con validación en tiempo real"
            />
            
            <FeatureCard
              icon={CreditCard}
              title="Pagos Integrados"
              description="Sistema de pagos con Bold para suscripciones mensuales con trial de 60 días"
            />
            
            <FeatureCard
              icon={CheckCircle}
              title="Validación SMS"
              description="Verificación segura mediante códigos SMS para acceso de propietarios"
            />
            
            <FeatureCard
              icon={Building2}
              title="Multi-Copropiedad"
              description="Gestiona múltiples conjuntos residenciales desde una sola cuenta"
            />
            
            <FeatureCard
              icon={Shield}
              title="Seguridad Avanzada"
              description="Protección de datos con encriptación y cumplimiento de normativas colombianas"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Moderniza la administración de tu propiedad horizontal con nuestra plataforma integral
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/admin-ph"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300"
              >
                Soy Administrador
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/propietarios"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
              >
                Soy Propietario
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Información */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Sistema PH Colombia</h3>
              <p className="text-gray-400 mb-4">
                Solución integral para la gestión moderna de propiedades horizontales en Colombia.
              </p>
              <div className="text-sm text-gray-500">
                Versión 1.0.0
              </div>
            </div>
            
            {/* Contacto */}
            <div>
              <h4 className="font-semibold text-white mb-4">Contacto</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>soporte@ph-colombia.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+57 300 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Colombia</span>
                </div>
              </div>
            </div>
            
            {/* Enlaces */}
            <div>
              <h4 className="font-semibold text-white mb-4">Enlaces</h4>
              <div className="space-y-2 text-sm">
                <Link href="/politica-privacidad" className="block hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
                <Link href="/terminos-servicio" className="block hover:text-white transition-colors">
                  Términos de Servicio
                </Link>
                <Link href="/ayuda" className="block hover:text-white transition-colors">
                  Centro de Ayuda
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 mt-8 text-center text-sm text-gray-500">
            © 2024 Sistema PH Colombia. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
