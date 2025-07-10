export interface User {
  id: string
  nombre: string
  email: string
  telefono: string
  tipo: 'admin_ph' | 'admin_sistema' | 'propietario'
}

export interface LoginCredentials {
  telefono?: string
  email?: string
  password: string
  nit?: string
}

export interface VerificationData {
  telefono: string
  codigo: string
}
