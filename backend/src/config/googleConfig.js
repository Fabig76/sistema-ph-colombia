/**
 * Configuración de Google APIs - URLs REALES FUNCIONANDO
 * Actualizado: 2025-07-11T03:36:03.784Z
 */

module.exports = {
  // URLs de ejemplo que funcionan (REEMPLAZAR con las del usuario)
  EXAMPLE_SHEETS_URL: 'https://docs.google.com/spreadsheets/d/18v2nv4vROwn7z-JTI2ix__W6No6ZJuGOI3ooOCxn9xI/edit',
  EXAMPLE_SHEETS_ID: '18v2nv4vROwn7z-JTI2ix__W6No6ZJuGOI3ooOCxn9xI',
  
  EXAMPLE_DOCS_URL: 'https://docs.google.com/document/d/1ohOpvNzG1r2R_Dy373wnUKUOK5o0j74sP0V1dw4hv4o/edit',
  EXAMPLE_DOCS_ID: '1ohOpvNzG1r2R_Dy373wnUKUOK5o0j74sP0V1dw4hv4o',
  
  // Scopes necesarios
  SCOPES: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive'
  ],
  
  // Configuración de caché
  CACHE_TTL: 300, // 5 minutos
  
  // Configuración de rate limiting
  RATE_LIMIT: {
    SHEETS: { rpm: 100 }, // 100 requests per minute
    DOCS: { rpm: 60 },    // 60 requests per minute
    DRIVE: { rpm: 120 }   // 120 requests per minute
  },
  
  // Timeout configuraciones
  TIMEOUT_MS: 30000, // 30 segundos
  
  // Retry configuración
  RETRY_CONFIG: {
    attempts: 3,
    delay: 1000
  }
}
