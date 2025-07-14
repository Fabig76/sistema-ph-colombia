/**
 * Servicio de Google APIs listo para PRODUCCIÓN
 * URLs reales verificadas y funcionando
 * Creado: 2025-07-11T03:36:03.794Z
 */

const googleSheetsService = require('./googleSheetsService.custom')
const googleDocsService = require('./googleDocsService.custom')
const logger = require('../utils/logger')

class GoogleApisProductionService {
  
  /**
   * Buscar copropiedad por NIT en hoja real
   */
  async buscarCopropiedadPorNit(sheetUrl, nit) {
    try {
      logger.info('Buscando copropiedad por NIT:', { nit, sheetUrl })
      
      const result = await googleSheetsService.buscarCopropiedadPorNit(sheetUrl, nit)
      
      if (result.encontrada) {
        logger.info('Copropiedad encontrada:', result.copropiedad)
        return {
          success: true,
          copropiedad: result.copropiedad
        }
      } else {
        logger.warn('Copropiedad no encontrada:', { nit })
        return {
          success: false,
          error: 'Copropiedad no encontrada'
        }
      }
      
    } catch (error) {
      logger.error('Error buscando copropiedad:', error)
      throw error
    }
  }
  
  /**
   * Obtener inmuebles de propietario por teléfono
   */
  async obtenerInmueblesPorTelefono(sheetUrl, telefono) {
    try {
      logger.info('Obteniendo inmuebles por teléfono:', { telefono, sheetUrl })
      
      const inmuebles = await googleSheetsService.obtenerInmueblesPorTelefono(sheetUrl, telefono)
      
      logger.info('Inmuebles encontrados:', inmuebles.length)
      return {
        success: true,
        inmuebles: inmuebles
      }
      
    } catch (error) {
      logger.error('Error obteniendo inmuebles:', error)
      throw error
    }
  }
  
  /**
   * Generar paz y salvo usando plantilla real
   */
  async generarPazYSalvo(docUrl, datos) {
    try {
      logger.info('Generando paz y salvo:', { docUrl, propietario: datos.propietario })
      
      const pdf = await googleDocsService.generarPazYSalvoPersonalizado(docUrl, datos)
      
      logger.info('Paz y salvo generado exitosamente')
      return {
        success: true,
        pdf: pdf
      }
      
    } catch (error) {
      logger.error('Error generando paz y salvo:', error)
      throw error
    }
  }
  
  /**
   * Validar configuración de URLs
   */
  async validarConfiguracion(sheetUrl, docUrl) {
    try {
      logger.info('Validando configuración Google APIs')
      
      // Validar Google Sheets
      const sheetValid = await googleSheetsService.validarEstructuraHoja(sheetUrl)
      
      // Validar Google Docs  
      const docValid = await googleDocsService.validarPlantillaPazYSalvo(docUrl)
      
      const result = {
        sheets: sheetValid,
        docs: docValid,
        overall: sheetValid.valida && docValid.valida
      }
      
      logger.info('Validación completada:', result)
      return result
      
    } catch (error) {
      logger.error('Error en validación:', error)
      throw error
    }
  }
}

module.exports = new GoogleApisProductionService()
