export interface AdminPh {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface DashboardStats {
  totalCopropiedades: number;
  copropiedadesActivas: number;
  trialActivos: number;
  propietariosConsultas: number;
  pazYSalvosGenerados: number;
  ultimasActividades: Activity[];
}

export interface Activity {
  id: string;
  tipo: 'consulta' | 'paz_y_salvo' | 'registro_copropiedad' | 'pago';
  descripcion: string;
  fecha: Date;
  copropiedadId?: string;
  copropiedadNombre?: string;
  propietarioId?: string;
  propietarioNombre?: string;
}

export interface SectionItem {
  id: string;
  label: string;
  icon: string;
}

export interface NotificationItem {
  id: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  leida: boolean;
  fecha: Date;
  url?: string;
}
