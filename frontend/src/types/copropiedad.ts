export interface Copropiedad {
  id: string
  nit: string
  nombre: string
  direccion?: string
  administrador?: {
    id: string
    nombre: string
    email: string
    telefono: string
  }
  estado: 'activa' | 'inactiva' | 'pendiente'
  fechaCreacion: string
  fechaVencimiento?: string
  estadoPago: 'al_dia' | 'vencido' | 'gracia'
  googleSheetsUrl?: string
  googleDocsTemplateUrl?: string
}

export interface Property {
  id: string
  tipo: 'apartamento' | 'casa' | 'parqueadero' | 'bodega' | 'local'
  numero: string // Número del inmueble (ej: "101", "A-15")
  area?: number // Área en m2 (opcional)
  identificacion: string
  direccion: string
  propietario: {
    nombre: string
    telefono: string
    email?: string
  }
  estado: 'al_dia' | 'pendiente' | 'mora'
  valorCuota: number
  cuotasPendientes: number
  ultimoPago?: string
  saldoPendiente: number // Fundamental para saber si puede descargar paz y salvo
}
