/**
 * Utilidades para manejar llamadas a la API y autenticación
 */

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Constantes
const TOKEN_KEY = 'ph_auth_token';
const USER_DATA_KEY = 'ph_user_data';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
    // Si el error es 401 (no autorizado), limpiamos la autenticación
    if (error.response && error.response.status === 401) {
      clearAuth();
      // En un entorno real, aquí podríamos redirigir al login
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
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
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
};
