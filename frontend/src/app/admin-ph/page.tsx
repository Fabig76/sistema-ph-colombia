'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Phone, 
  Lock, 
  User, 
  Mail,
  Building2,
  LogIn,
  UserPlus,
  FileText,
  Calendar
} from 'lucide-react'
import { authApi, apiUtils } from '@/lib/api'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type FormMode = 'login' | 'register'

interface LoginForm {
  telefono: string
  password: string
}

interface RegisterForm {
  nombre: string
  telefono: string
  email: string
  password: string
  nitResolucion: string
  fechaResolucion: string
}

export default function AdminPHPage() {
  const router = useRouter()
  const [mode, setMode] = useState<FormMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [loginForm, setLoginForm] = useState<LoginForm>({
    telefono: '',
    password: ''
  })
  
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    nombre: '',
    telefono: '',
    email: '',
    password: '',
    nitResolucion: '',
    fechaResolucion: ''
  })

  // Verificar si ya está autenticado
  useEffect(() => {
    if (apiUtils.isAuthenticated()) {
      router.push('/admin-ph/dashboard')
    }
  }, [router])

  // Manejar login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authApi.loginAdminPh(loginForm.telefono, loginForm.password)
      
      // Guardar token y datos del usuario
      apiUtils.saveAuthToken(response.token)
      apiUtils.saveUserData(response.admin)
      
      toast.success(`¡Bienvenido, ${response.admin.nombre}!`)
      
      // Redirigir al dashboard
      router.push('/admin-ph/dashboard')
      
    } catch (error: any) {
      console.error('Error en login:', error)
      toast.error('Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authApi.registerAdminPh(registerForm)
      
      if (response.requiresSmsVerification) {
        toast.success(response.message || 'Registro exitoso. Revisa tu teléfono para el código de verificación.')
        // Redirigir a página de verificación SMS
        router.push(`/admin-ph/verificar-sms?telefono=${encodeURIComponent(registerForm.telefono)}`)
      } else {
        toast.success('Registro exitoso')
        // Redirigir al dashboard
        router.push('/admin-ph/dashboard')
      }
      
    } catch (error: any) {
      console.error('Error en registro:', error)
      toast.error('Error al registrarse. Intenta con otro número de teléfono.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      {/* Botón de regreso */}
      <Link 
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Volver al inicio</span>
      </Link>

      {/* Card principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Admin PH</h1>
          </div>
          <p className="text-blue-100 text-sm">
            Portal para administradores de propiedad horizontal
          </p>
        </div>

        {/* Toggles de modo */}
        <div className="px-8 pt-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode('login')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-all text-sm font-medium",
                mode === 'login' 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              )}
            >
              <LogIn className="w-4 h-4" />
              Ingresar
            </button>
            <button
              onClick={() => setMode('register')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-all text-sm font-medium",
                mode === 'register' 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              )}
            >
              <UserPlus className="w-4 h-4" />
              Registrarse
            </button>
          </div>
        </div>

        {/* Formularios */}
        <div className="px-8 py-6">
          {mode === 'login' ? (
            /* Formulario de Login */
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de celular
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="3001234567"
                    value={loginForm.telefono}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Botón de login */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </motion.form>
          ) : (
            /* Formulario de Registro */
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Juan Carlos Pérez"
                    value={registerForm.nombre}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de celular
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="3001234567"
                    value={registerForm.telefono}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Número colombiano de 10 dígitos
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Campo de NIT de resolución */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Resolución de Nombramiento
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Resolución de la alcaldía"
                    value={registerForm.nitResolucion}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, nitResolucion: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Campo de fecha de resolución */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de la Resolución
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={registerForm.fechaResolucion}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, fechaResolucion: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 6 caracteres
                </p>
              </div>

              {/* Botón de registro */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Registrando...' : 'Crear cuenta'}
              </button>
            </motion.form>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <p className="text-xs text-gray-500">
            Al continuar, acepta nuestros{' '}
            <Link href="/terminos" className="text-blue-600 hover:text-blue-700">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacidad" className="text-blue-600 hover:text-blue-700">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
