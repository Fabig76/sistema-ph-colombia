/**
 * Utilidades para manejar llamadas a la API y autenticación
 */

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Constantes de configuración
const TOKEN_KEY = 'ph_auth_token';
const USER_DATA_KEY = 'ph_user_data';

// URL base de la API usando nuevas variables de entorno
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// Configuración adicional
const IS_DEVELOPMENT = process.env.NEXT_PUBLIC_NODE_ENV === 'development';
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
const MOCK_APIS = process.env.NEXT_PUBLIC_MOCK_APIS === 'true';

// Creamos una instancia de axios con la configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('🚨 INTERCEPTOR - Error detectado:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.response?.data?.message
    })
    
    // Si el error es 401 (no autorizado), limpiamos la autenticación
    if (error.response && error.response.status === 401) {
      console.log('❌ INTERCEPTOR - Error 401: Limpiando autenticación')
      clearAuth();
      // En un entorno real, aquí podríamos redirigir al login
    } else if (error.response && error.response.status === 403) {
      console.log('⚠️ INTERCEPTOR - Error 403: Acceso denegado, NO limpiando auth')
    }
    return Promise.reject(error);
  }
);

/**
 * Guarda el token de autenticación
 */
const saveAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Obtiene el token de autenticación
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Verifica si el token es válido
 */
const isTokenValid = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    // Verificar si el token ha expirado
    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

/**
 * Guarda los datos del usuario
 */
const saveUserData = (userData: any): void => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

/**
 * Obtiene los datos del usuario
 */
const getUserData = (): any | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem(USER_DATA_KEY);
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    return null;
  }
};

/**
 * Limpia todos los datos de autenticación
 */
const clearAuth = (): void => {
  console.log('🧹 CLEAR_AUTH - Limpiando localStorage:', {
    hadToken: !!localStorage.getItem(TOKEN_KEY),
    hadUserData: !!localStorage.getItem(USER_DATA_KEY)
  })
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  console.log('❌ CLEAR_AUTH - localStorage limpiado')
};

/**
 * Verifica si el usuario está autenticado
 */
const isAuthenticated = (): boolean => {
  return isTokenValid() && !!getUserData();
};

/**
 * Obtiene el rol del usuario
 */
const getUserRole = (): string | null => {
  const userData = getUserData();
  return userData?.role || null;
};

/**
 * Verifica si el usuario tiene un rol específico
 */
const hasRole = (role: string): boolean => {
  return getUserRole() === role;
};

/**
 * Obtiene las iniciales del nombre del usuario
 */
const getUserInitials = (): string => {
  const userData = getUserData();
  if (!userData?.nombre) return '?';
  
  const nameParts = userData.nombre.split(' ');
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Función de debugging para verificar configuración
 */
const debugApiConfig = () => {
  if (DEBUG_MODE) {
    console.log('🔧 API Configuration:', {
      API_BASE_URL,
      API_VERSION,
      API_URL,
      IS_DEVELOPMENT,
      DEBUG_MODE,
      MOCK_APIS
    });
  }
};

/**
 * Función para probar conectividad con el backend
 */
const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/health`);
    const data = await response.json();
    
    if (DEBUG_MODE) {
      console.log('✅ Backend conectado:', data);
    }
    
    return { success: true, data };
  } catch (error) {
    if (DEBUG_MODE) {
      console.error('❌ Error conectando al backend:', error);
    }
    
    return { success: false, error };
  }
};

// Ejecutar debug al cargar si está habilitado
if (typeof window !== 'undefined' && DEBUG_MODE) {
  debugApiConfig();
}

export const apiUtils = {
  api,
  saveAuthToken,
  getAuthToken,
  isTokenValid,
  saveUserData,
  getUserData,
  clearAuth,
  isAuthenticated,
  getUserRole,
  hasRole,
  getUserInitials,
  debugApiConfig,
  testBackendConnection,
  // Constantes útiles
  API_URL,
  API_BASE_URL,
  IS_DEVELOPMENT,
  DEBUG_MODE,
  MOCK_APIS
};
