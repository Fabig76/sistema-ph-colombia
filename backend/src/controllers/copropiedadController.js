const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const googleSheetsService = require('../services/googleSheetsService');
const prisma = new PrismaClient();

/**
 * Crear nueva copropiedad
 */
const crearCopropiedad = async (req, res) => {
  try {
    const { nit, nombre, resolucionNumero, resolucionFecha, hojaGoogleSheetsId, plantillaGoogleDocsId } = req.body;
    const administradorId = req.admin.id;

    // Validaciones
    if (!nit || !nombre || !hojaGoogleSheetsId || !plantillaGoogleDocsId) {
      return res.status(400).json({
        status: 'error',
        message: 'Todos los campos son obligatorios'
      });
    }

    // Verificar que el NIT no exista
    const existeCopropiedad = await prisma.copropiedad.findUnique({
      where: { nit }
    });

    if (existeCopropiedad) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe una copropiedad registrada con este NIT'
      });
    }

    // Validar formato del URL de Google Sheets
    if (!hojaGoogleSheetsId.includes('docs.google.com/spreadsheets')) {
      return res.status(400).json({
        status: 'error',
        message: 'El link de Google Sheets no es válido'
      });
    }
    
    // Extraer ID de la hoja de Google Sheets
    const sheetId = googleSheetsService.extractSheetId(hojaGoogleSheetsId);
    if (!sheetId) {
      return res.status(400).json({
        status: 'error',
        message: 'No se pudo extraer el ID de la hoja de Google Sheets'
      });
    }
    
    // Validar que la hoja sea accesible
    const formatValidation = await googleSheetsService.validateSheetFormat(sheetId);
    if (!formatValidation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: `Error en Google Sheets: ${formatValidation.message}`
      });
    }
    
    // Validar que el NIT y nombre estén en las columnas A y B
    const dataValidation = await googleSheetsService.validateCopropiedadData(sheetId, nit, nombre);
    if (!dataValidation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: `Error de validación: ${dataValidation.message}`
      });
    }

    if (!plantillaGoogleDocsId.includes('docs.google.com/document')) {
      return res.status(400).json({
        status: 'error',
        message: 'El link de Google Docs no es válido'
      });
    }

    // Crear la copropiedad
    const copropiedad = await prisma.copropiedad.create({
      data: {
        nit,
        nombre,
        administradorId,
        hojaGoogleSheetsId,
        plantillaGoogleDocsId,
        resolucionNumero,
        resolucionFecha: resolucionFecha ? new Date(resolucionFecha) : null,
        periodoGratis: true,
        periodoGratisHasta: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 días
      },
      include: {
        administrador: {
          select: {
            nombre: true,
            email: true
          }
        }
      }
    });

    logger.info(`Copropiedad creada: ${nombre} (${nit})`, 'copropiedad', { 
      copropiedadId: copropiedad.id,
      administradorId 
    });

    res.status(201).json({
      status: 'success',
      message: 'Copropiedad registrada exitosamente',
      data: copropiedad
    });

  } catch (error) {
    logger.error(`Error al crear copropiedad: ${error.message}`, 'copropiedad', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtener copropiedades del administrador
 */
const obtenerCopropiedades = async (req, res) => {
  try {
    const administradorId = req.admin.id;

    const copropiedades = await prisma.copropiedad.findMany({
      where: { 
        administradorId,
        activo: true 
      },
      include: {
        _count: {
          select: {
            eventos: true,
            pagos: true
          }
        },
        subscription: {
          select: {
            estado: true,
            fechaVencimiento: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      status: 'success',
      data: copropiedades
    });

  } catch (error) {
    logger.error(`Error al obtener copropiedades: ${error.message}`, 'copropiedad', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtener estadísticas del administrador
 */
const obtenerEstadisticas = async (req, res) => {
  try {
    const administradorId = req.admin.id;

    // Contar copropiedades activas
    const totalCopropiedades = await prisma.copropiedad.count({
      where: { 
        administradorId,
        activo: true 
      }
    });

    // Contar eventos (consultas de propietarios) del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const eventosEsteMes = await prisma.evento.count({
      where: {
        copropiedad: {
          administradorId
        },
        createdAt: {
          gte: inicioMes
        }
      }
    });

    // Contar paz y salvos generados este mes
    const pazySalvosEsteMes = await prisma.evento.count({
      where: {
        copropiedad: {
          administradorId
        },
        tipo: 'PAZ_Y_SALVO_GENERADO',
        createdAt: {
          gte: inicioMes
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalCopropiedades,
        propietariosConsultas: eventosEsteMes,
        pazySalvosGenerados: pazySalvosEsteMes
      }
    });

  } catch (error) {
    logger.error(`Error al obtener estadísticas: ${error.message}`, 'copropiedad', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Eliminar copropiedad (desactivar)
 */
const eliminarCopropiedad = async (req, res) => {
  try {
    const { id } = req.params;
    const administradorId = req.admin.id;

    // Verificar que la copropiedad pertenece al administrador
    const copropiedad = await prisma.copropiedad.findFirst({
      where: {
        id,
        administradorId
      }
    });

    if (!copropiedad) {
      return res.status(404).json({
        status: 'error',
        message: 'Copropiedad no encontrada'
      });
    }

    // Desactivar en lugar de eliminar
    await prisma.copropiedad.update({
      where: { id },
      data: { activo: false }
    });

    logger.info(`Copropiedad desactivada: ${copropiedad.nombre}`, 'copropiedad', { 
      copropiedadId: id,
      administradorId 
    });

    res.status(200).json({
      status: 'success',
      message: 'Copropiedad eliminada exitosamente'
    });

  } catch (error) {
    logger.error(`Error al eliminar copropiedad: ${error.message}`, 'copropiedad', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  crearCopropiedad,
  obtenerCopropiedades,
  obtenerEstadisticas,
  eliminarCopropiedad
};
