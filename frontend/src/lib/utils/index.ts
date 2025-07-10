/**
 * Utilidades generales para la aplicación
 */

/**
 * Valida si un número de teléfono es un celular colombiano válido
 * Los celulares colombianos comienzan con 3 y tienen 10 dígitos
 */
export const isValidColombianPhone = (phone: string): boolean => {
  // Eliminar espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/\s+|-|\(|\)/g, '');
  
  // Validar que comience con 3 y tenga 10 dígitos
  return /^3\d{9}$/.test(cleanPhone);
};

/**
 * Formatea un número de teléfono colombiano para mostrar
 * Formato: 3XX XXX XXXX
 */
export const formatColombianPhone = (phone: string): string => {
  // Eliminar espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/\s+|-|\(|\)/g, '');
  
  // Si no tiene 10 dígitos, devolver el original
  if (cleanPhone.length !== 10) {
    return phone;
  }
  
  // Formatear como 3XX XXX XXXX
  return `${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6, 10)}`;
};

/**
 * Formatea un NIT colombiano (con o sin guión)
 */
export const formatNit = (nit: string): string => {
  // Eliminar espacios y guiones
  const cleanNit = nit.replace(/\s+|-/g, '');
  
  // Si tiene menos de 2 caracteres, devolver el original
  if (cleanNit.length < 2) {
    return nit;
  }
  
  // Formatear como XXXXXXXXX-Y
  return `${cleanNit.substring(0, cleanNit.length - 1)}-${cleanNit.substring(cleanNit.length - 1)}`;
};

/**
 * Formatea una fecha en formato ISO a formato legible en español
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Obtiene las iniciales de un nombre
 */
export const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const nameParts = name.split(' ');
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Trunca un texto a una longitud máxima y agrega puntos suspensivos
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Genera un color aleatorio basado en una cadena
 * Útil para generar colores consistentes para avatares basados en nombres
 */
export const stringToColor = (str: string): string => {
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

/**
 * Formatea un valor monetario en pesos colombianos
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Calcula la diferencia en días entre dos fechas
 */
export const daysBetweenDates = (date1: string | Date, date2: string | Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Convertir a UTC para evitar problemas con horario de verano
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  
  // Calcular diferencia en milisegundos y convertir a días
  const diffMs = Math.abs(utc2 - utc1);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Valida si una URL es válida
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Valida si una URL es una URL de Google Sheets
 */
export const isGoogleSheetsUrl = (url: string): boolean => {
  if (!isValidUrl(url)) return false;
  return url.includes('docs.google.com/spreadsheets');
};

/**
 * Valida si una URL es una URL de Google Docs
 */
export const isGoogleDocsUrl = (url: string): boolean => {
  if (!isValidUrl(url)) return false;
  return url.includes('docs.google.com/document');
};
