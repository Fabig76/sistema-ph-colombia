'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Smartphone, RefreshCw } from 'lucide-react'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function VerificarSMSPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const telefono = searchParams.get('telefono') || ''
  const tipoVerificacion = searchParams.get('tipo') || 'registro' // 'registro' o 'login'
  const [codigo, setCodigo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    if (!telefono) {
      router.push('/admin-ph')
      return
    }

    // Countdown para reenvío
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [telefono, router])

  const handleVerificar = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!codigo.trim()) {
      toast.error('Por favor ingrese el código de verificación')
      return
    }

    setIsLoading(true)

    try {
      let response
      
      // Usar la función correcta según el tipo de verificación
      if (tipoVerificacion === 'login') {
        response = await authApi.verifyLoginSmsCode(telefono, codigo.trim())
      } else {
        response = await authApi.verifySmsCodeAdminPh(telefono, codigo.trim())
      }

      // GUARDAR TOKENS Y DATOS DEL ADMINISTRADOR SOLO SI SON VÁLIDOS
      if (response.data?.token && response.data?.id && response.data?.nombre) {
        localStorage.setItem('ph_auth_token', response.data.token)
        
        // Guardar refreshToken si existe
        if (response.data.refreshToken) {
          localStorage.setItem('ph_refresh_token', response.data.refreshToken)
        }
        
        // Guardar datos del admin SOLO si están completos
        const adminData = {
          id: response.data.id,
          nombre: response.data.nombre,
          telefono: response.data.telefono,
          email: response.data.email,
          tipo: 'administrador',
          copropiedades: response.data.copropiedades || []
        }
        
        // Validar que adminData es válido antes de guardar
        if (adminData.id && adminData.nombre) {
          localStorage.setItem('ph_user_data', JSON.stringify(adminData))
        } else {
          console.error('AdminData inválido:', adminData)
        }
      } else {
        console.error('Respuesta SMS inválida - faltan datos:', response.data)
      }

      const mensaje = tipoVerificacion === 'login' 
        ? 'Inicio de sesión exitoso. ¡Bienvenido!'
        : 'Registro exitoso. ¡Bienvenido!'
      
      toast.success(mensaje)
      
      // Sincronizar con AuthProvider antes de redireccionar
      setTimeout(() => {
        // Forzar restauración si está disponible
        if (typeof window !== 'undefined' && (window as any).forceRestoreAuth) {
          ;(window as any).forceRestoreAuth()
        }
        router.push('/admin-ph/dashboard')
      }, 200)
      
    } catch (error: any) {
      console.error('Error en verificación SMS:', error)
      toast.error(error.message || 'Código de verificación inválido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    
    try {
      // Usar el endpoint específico para reenviar código
      const response = await authApi.resendSmsCode(telefono)
      toast.success(response.message || 'Código reenviado exitosamente')
      setCountdown(60)
      
      // Reiniciar countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (error: any) {
      console.error('Error al reenviar código:', error)
      
      // Si el registro expiró, redirigir al registro
      if (error.message?.includes('registro temporal') || error.message?.includes('expirado')) {
        toast.error('El tiempo de verificación ha expirado. Debe registrarse nuevamente.')
        router.push('/admin-ph')
        return
      }
      
      toast.error(error.message || 'Error al reenviar código')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      {/* Botón de regreso */}
      <Link 
        href="/admin-ph"
        className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Volver</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {tipoVerificacion === 'login' ? 'Verificación de Acceso' : 'Verificación de Registro'}
            </h1>
            <p className="text-blue-100 text-sm">
              {tipoVerificacion === 'login' 
                ? 'Para completar el inicio de sesión, ingresa el código enviado al'
                : 'Para completar el registro, ingresa el código enviado al'
              }
            </p>
            <p className="text-white font-semibold mt-1">
              {telefono}
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <form onSubmit={handleVerificar} className="space-y-6">
              {/* Campo de código */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Código de verificación
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 text-center">
                  Ingrese el código de 6 dígitos que recibió por SMS
                </p>
              </div>

              {/* Botón de verificar */}
              <button
                type="submit"
                disabled={isLoading || codigo.length !== 6}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verificando...' : 'Verificar código'}
              </button>
            </form>

            {/* Reenviar código */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                ¿No recibiste el código?
              </p>
              <button
                onClick={handleResendCode}
                disabled={countdown > 0 || isResending}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                {countdown > 0 
                  ? `Reenviar en ${countdown}s` 
                  : isResending 
                    ? 'Reenviando...' 
                    : 'Reenviar código'
                }
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-gray-500">
              Si no recibe el código en unos minutos, verifique que el número esté correcto
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
