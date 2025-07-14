/**
 * RUTAS API DE PAGOS - MOCK Y REAL
 * 
 * Endpoints para procesar pagos simulados y reales
 * con switch automático según configuración.
 * 
 * @author Sistema PH Colombia Team
 * @version 1.0.0
 * @date 2025-07-12
 */

const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const { authenticateAdmin } = require('../middleware/auth');

// =====  PROCESAR PAGO =====
router.post('/process', authenticateAdmin, async (req, res) => {
  try {
    const { copropiedadId, amount = 20000, description } = req.body;
    const adminId = req.admin.id;
    
    // Validaciones
    if (!copropiedadId) {
      return res.status(400).json({
        success: false,
        error: 'ID de copropiedad requerido'
      });
    }

    if (amount < 1000 || amount > 1000000) {
      return res.status(400).json({
        success: false,
        error: 'Monto inválido (debe estar entre $1,000 y $1,000,000 COP)'
      });
    }

    console.log(`💳 API - Procesando pago: ${amount} COP para copropiedad ${copropiedadId}`);
    
    const result = await paymentService.processPayment(
      req.admin.id, // administradorId
      copropiedadId, 
      amount, 
      description || 'Pago mensual Sistema PH Colombia'
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        transaction: {
          id: result.transactionId,
          amount: result.amount,
          currency: result.currency,
          status: result.status,
          activatedUntil: result.activatedUntil,
          processingTime: result.processingTime,
          mock: result.mock,
          mockData: result.mockData
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        transactionId: result.transactionId,
        processingTime: result.processingTime,
        mock: result.mock
      });
    }
  } catch (error) {
    console.error('❌ Error endpoint procesar pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno procesando pago: ' + error.message
    });
  }
});

// ===== CONSULTAR ESTADO DE SUSCRIPCIÓN =====
router.get('/subscription/:copropiedadId', authenticateAdmin, async (req, res) => {
  try {
    const { copropiedadId } = req.params;
    
    if (!copropiedadId) {
      return res.status(400).json({
        success: false,
        error: 'ID de copropiedad requerido'
      });
    }

    console.log(`📊 API - Consultando suscripción: ${copropiedadId}`);
    
    const status = await paymentService.getSubscriptionStatus(copropiedadId);
    
    res.json(status);
  } catch (error) {
    console.error('❌ Error consultando suscripción:', error);
    res.status(500).json({
      success: false,
      error: 'Error consultando estado de suscripción: ' + error.message
    });
  }
});

// ===== HISTORIAL DE TRANSACCIONES =====
router.get('/history', authenticateAdmin, async (req, res) => {
  try {
    const administradorId = req.admin.id;
    const limit = parseInt(req.query.limit) || 50;
    
    console.log(`📋 API - Consultando historial pagos admin: ${administradorId}`);
    
    const history = await paymentService.getTransactionHistory(administradorId, limit);
    
    res.json(history);
  } catch (error) {
    console.error('❌ Error consultando historial:', error);
    res.status(500).json({
      success: false,
      error: 'Error consultando historial de pagos: ' + error.message
    });
  }
});

// ===== RESUMEN DE PAGOS =====
router.get('/summary', authenticateAdmin, async (req, res) => {
  try {
    const administradorId = req.admin.id;
    
    console.log(`📊 API - Consultando resumen pagos admin: ${administradorId}`);
    
    const summary = await paymentService.getPaymentSummary(administradorId);
    
    res.json(summary);
  } catch (error) {
    console.error('❌ Error consultando resumen:', error);
    res.status(500).json({
      success: false,
      error: 'Error consultando resumen de pagos: ' + error.message
    });
  }
});

// ===== INFORMACIÓN DEL PROVEEDOR =====
router.get('/provider-info', authenticateAdmin, async (req, res) => {
  try {
    const providerInfo = paymentService.getCurrentProvider();
    
    res.json({
      success: true,
      provider: providerInfo.provider,
      isMock: providerInfo.isMock,
      isReal: providerInfo.isReal,
      capabilities: {
        processPayments: true,
        transactionHistory: true,
        subscriptionManagement: true,
        realTimeStatus: providerInfo.isReal
      },
      pricing: {
        monthlyFee: 20000,
        currency: 'COP',
        activationDays: 30
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo info proveedor:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo información del proveedor'
    });
  }
});

// ===== VALIDAR PAGO DISPONIBLE =====
router.post('/validate', authenticateAdmin, async (req, res) => {
  try {
    const { copropiedadId, amount = 20000 } = req.body;
    const adminId = req.admin.id;
    
    // Verificar que la copropiedad pertenece al admin
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const copropiedad = await prisma.copropiedad.findFirst({
      where: {
        id: copropiedadId,
        administradorId: adminId
      },
      select: {
        id: true,
        nombre: true,
        isActive: true,
        expiresAt: true
      }
    });
    
    await prisma.$disconnect();
    
    if (!copropiedad) {
      return res.status(404).json({
        success: false,
        error: 'Copropiedad no encontrada o no autorizada'
      });
    }

    const now = new Date();
    const canPay = true; // Siempre se puede pagar para extender
    const isExpired = copropiedad.expiresAt && copropiedad.expiresAt < now;
    
    res.json({
      success: true,
      validation: {
        canPay,
        copropiedad: {
          id: copropiedad.id,
          nombre: copropiedad.nombre,
          isActive: copropiedad.isActive,
          isExpired,
          expiresAt: copropiedad.expiresAt
        },
        payment: {
          amount,
          currency: 'COP',
          description: 'Pago mensual Sistema PH Colombia',
          willExtendDays: 30
        }
      }
    });
  } catch (error) {
    console.error('❌ Error validando pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error validando disponibilidad de pago'
    });
  }
});

// ===== WEBHOOK PARA PAGOS REALES (FUTURO) =====
router.post('/webhook/bold', async (req, res) => {
  try {
    // TODO: Implementar cuando Bold esté configurado
    console.log('🔗 Webhook Bold recibido:', req.body);
    
    // Validar signature Bold
    // Procesar estado del pago
    // Actualizar base de datos
    
    res.json({ 
      success: true, 
      message: 'Webhook procesado (placeholder)' 
    });
  } catch (error) {
    console.error('❌ Error webhook Bold:', error);
    res.status(500).json({
      success: false,
      error: 'Error procesando webhook'
    });
  }
});

// ===== INICIALIZAR PERÍODO DE PRUEBA =====
router.post('/initialize-trial', authenticateAdmin, async (req, res) => {
  try {
    const { copropiedadId } = req.body;
    
    if (!copropiedadId) {
      return res.status(400).json({
        success: false,
        error: 'ID de copropiedad requerido'
      });
    }

    console.log(`✨ API - Inicializando período de prueba para: ${copropiedadId}`);
    
    const result = await paymentService.initializeTrial(copropiedadId);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error inicializando período de prueba:', error);
    res.status(500).json({
      success: false,
      error: 'Error inicializando período de prueba: ' + error.message
    });
  }
});

// ===== ESTADÍSTICAS DEL SISTEMA =====
router.get('/system-stats', authenticateAdmin, async (req, res) => {
  try {
    console.log('📊 API - Consultando estadísticas del sistema');
    
    const stats = await paymentService.getSystemStats();
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Error consultando estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error consultando estadísticas del sistema: ' + error.message
    });
  }
});

// ===== CAMBIAR PROVEEDOR DE PAGOS (SOLO PARA ADMIN) =====
router.post('/switch-provider', authenticateAdmin, async (req, res) => {
  try {
    const { provider } = req.body;
    
    if (!provider || !['mock', 'bold'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Proveedor inválido. Debe ser "mock" o "bold"'
      });
    }

    console.log(`🔄 API - Cambiando proveedor de pagos a: ${provider}`);
    
    if (provider === 'mock') {
      paymentService.switchToMockPayments();
    } else {
      paymentService.switchToRealPayments();
    }
    
    const currentProvider = paymentService.getCurrentProvider();
    
    res.json({
      success: true,
      message: `Proveedor de pagos cambiado a ${provider}`,
      provider: currentProvider
    });
  } catch (error) {
    console.error('❌ Error cambiando proveedor:', error);
    res.status(500).json({
      success: false,
      error: 'Error cambiando proveedor de pagos: ' + error.message
    });
  }
});

module.exports = router;
