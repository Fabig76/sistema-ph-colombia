import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// URL base del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    // Obtener token de cookies
    const token = Cookies.get('auth-token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Error en response interceptor:', error);
    
    // Si el token expiró o es inválido
    if (error.response?.status === 401) {
      // Limpiar token y redirigir a login
      Cookies.remove('auth-token');
      Cookies.remove('user-data');
      
      // Solo mostrar toast si no estamos ya en login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        window.location.href = '/admin-ph';
      }
    }
    
    // Manejar otros errores
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Error de conexión con el servidor';
    
    // No mostrar toast para requests automáticos o de verificación
    const isAutoRequest = error.config?.url?.includes('/auth/me');
    if (!isAutoRequest) {
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

// Tipos TypeScript
export interface LoginCredentials {
  telefono: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  telefono: string;
  email: string;
  password: string;
}

export interface Administrador {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  verificado: boolean;
  activo: boolean;
  createdAt: string;
  copropiedades?: Copropiedad[];
}

export interface Copropiedad {
  id: string;
  nit: string;
  nombre: string;
  activa: boolean;
  trial_hasta: string;
  ultimo_pago?: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: string[];
}

// Funciones de autenticación
export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<{ token: string; administrador: Administrador }> => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // Registro
  register: async (data: RegisterData): Promise<{ token: string; administrador: Administrador }> => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  // Obtener perfil actual
  getProfile: async (): Promise<Administrador> => {
    const response = await api.get('/api/auth/me');
    return response.data.administrador;
  },

  // Renovar token
  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  }
};

// Funciones de sistema
export const systemApi = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Info del sistema
  getInfo: async () => {
    const response = await api.get('/api/info');
    return response.data;
  }
};

// Utility functions
export const apiUtils = {
  // Guardar token en cookies
  saveAuthToken: (token: string) => {
    Cookies.set('auth-token', token, { 
      expires: 7, // 7 días
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  },

  // Guardar datos de usuario
  saveUserData: (user: Administrador) => {
    Cookies.set('user-data', JSON.stringify(user), {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  },

  // Obtener datos de usuario
  getUserData: (): Administrador | null => {
    try {
      const userData = Cookies.get('user-data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },

  // Limpiar autenticación
  clearAuth: () => {
    Cookies.remove('auth-token');
    Cookies.remove('user-data');
  },

  // Verificar si está autenticado
  isAuthenticated: (): boolean => {
    return !!Cookies.get('auth-token');
  }
};

export default api;
