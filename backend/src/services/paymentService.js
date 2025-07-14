/**
 * SERVICIO DE PAGOS HÍBRIDO - MOCK Y REAL
 * Compatible con esquema Prisma actualizado
 * 
 * Este servicio maneja pagos simulados (mock) y reales (Bold)
 * con un switch simple para cambiar entre modos.
 * 
 * @author Sistema PH Colombia Team
 * @version 2.0.0 - Actualizado para Prisma
 * @date 2025-01-12
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

class PaymentService {
  constructor() {
    this.provider = process.env.PAYMENT_PROVIDER || 'mock';
    this.prisma = new PrismaClient();
    this.monthlyPrice = parseInt(process.env.MONTHLY_SUBSCRIPTION_PRICE) || 20000;
    this.trialDays = parseInt(process.env.TRIAL_PERIOD_DAYS) || 60;
    this.subscriptionDays = parseInt(process.env.SUBSCRIPTION_PERIOD_DAYS) || 30;
    this.successRate = parseFloat(process.env.MOCK_PAYMENT_SUCCESS_RATE) || 0.95;
    
    console.log(`💳 PaymentService iniciado en modo: ${this.provider.toUpperCase()}`);
  }

  /**
   * Procesar pago - Mock o Real según configuración
   */
  async processPayment(adminId, copropiedadId, amount = 20000, description = 'Pago mensual Sistema PH Colombia') {
    console.log(`💳 Procesando pago: ${amount} COP para copropiedad ${copropiedadId}`);
    
    if (this.provider === 'mock') {
      return await this.processMockPayment(adminId, copropiedadId, amount, description);
    } else if (this.provider === 'bold') {
      return await this.processBoldPayment(adminId, copropiedadId, amount, description);
    } else {
      throw new Error(`Proveedor de pagos no soportado: ${this.provider}`);
    }
  }

  /**
   * Procesar pago simulado (MOCK)
   */
  async processMockPayment(administradorId, copropiedadId, amount, description) {
    try {
      console.log('🧪 Procesando pago SIMULADO...');
      
      // Simular delay de procesamiento
      const delayMin = parseInt(process.env.MOCK_PAYMENT_DELAY_MIN) || 1000;
      const delayMax = parseInt(process.env.MOCK_PAYMENT_DELAY_MAX) || 3000;
      const delay = delayMin + Math.random() * (delayMax - delayMin);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Generar ID de transacción mock realista
      const transactionId = 'MOCK_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex').toUpperCase();
      
      // Simular diferentes resultados usando tasa de éxito configurable
      const success = Math.random() < this.successRate;
      
      if (success) {
        // Generar datos mock realistas
        const datosMock = {
          cardLastFour: Math.floor(1000 + Math.random() * 9000).toString(),
          cardType: ['Visa', 'MasterCard', 'AmEx'][Math.floor(Math.random() * 3)],
          authCode: 'AUTH_' + crypto.randomBytes(3).toString('hex').toUpperCase(),
          processingTime: Math.round(delay / 100) / 10 + 's',
          bankResponse: 'APPROVED',
          bank: ['Bancolombia', 'Banco de Bogotá', 'BBVA', 'Davivienda'][Math.floor(Math.random() * 4)],
          mockWarning: 'Esta es una transacción simulada - No se procesó dinero real'
        };

        // Guardar pago en base de datos con Prisma
        const pago = await this.prisma.pago.create({
          data: {
            transactionId,
            copropiedadId,
            administradorId,
            monto: amount,
            moneda: 'COP',
            estado: 'APPROVED',
            descripcion: description,
            proveedor: 'mock',
            datosMock,
            fechaPago: new Date()
          }
        });

        // Activar suscripción
        const subscription = await this.activateSubscription(copropiedadId, administradorId);

        console.log('✅ Pago mock exitoso:', transactionId);

        return {
          success: true,
          transactionId,
          paymentId: pago.id,
          amount,
          currency: 'COP',
          status: 'approved',
          subscription,
          mockData: datosMock,
          message: '💳 Pago procesado exitosamente (SIMULADO)',
          activatedUntil: subscription.expiraEn,
          processingTime: datosMock.processingTime
        };
      } else {
        // Simular fallo de pago
        const errorCodes = [
          { code: 'INSUFFICIENT_FUNDS', message: 'Fondos insuficientes' },
          { code: 'EXPIRED_CARD', message: 'Tarjeta vencida' },
          { code: 'BANK_DECLINED', message: 'Rechazado por el banco' },
          { code: 'INVALID_DATA', message: 'Datos inválidos' },
          { code: 'NETWORK_ERROR', message: 'Error de red' }
        ];
        
        const errorInfo = errorCodes[Math.floor(Math.random() * errorCodes.length)];
        
        // Guardar pago fallido en BD
        const pagoFallido = await this.prisma.pago.create({
          data: {
            transactionId,
            copropiedadId,
            administradorId,
            monto: amount,
            moneda: 'COP',
            estado: 'DECLINED',
            descripcion: description,
            proveedor: 'mock',
            datosMock: {
              errorCode: errorInfo.code,
              errorMessage: errorInfo.message,
              processingTime: Math.round(delay / 100) / 10 + 's',
              mockWarning: 'Esta es una transacción simulada - No se procesó dinero real'
            }
          }
        });

        console.log('❌ Pago mock rechazado:', errorInfo.message);
        
        return {
          success: false,
          transactionId,
          paymentId: pagoFallido.id,
          error: `Pago rechazado: ${errorInfo.message}`,
          errorCode: errorInfo.code,
          amount,
          currency: 'COP',
          mockData: pagoFallido.datosMock,
          processingTime: Math.round(delay / 100) / 10 + 's'
        };
      }
    } catch (error) {
      console.error('❌ Error en pago mock:', error);
      return {
        success: false,
        error: 'Error procesando pago simulado: ' + error.message,
        mock: true
      };
    }
  }

  /**
   * Procesar pago real con Bold (futuro)
   */
  async processBoldPayment(adminId, copropiedadId, amount, description) {
    console.log('💰 Procesando pago REAL con Bold...');
    
    try {
      // TODO: Implementar cuando Bold esté activado
      
      // Placeholder para integración Bold
      const boldResult = await this.callBoldAPI({
        amount,
        currency: 'COP',
        description,
        adminId,
        copropiedadId,
        // otros parámetros Bold
      });
      
      if (boldResult.success) {
        // Activar copropiedad si pago exitoso
        const activationResult = await this.activatePropertyForDays(copropiedadId, 30);
        
        return {
          success: true,
          transactionId: boldResult.transactionId,
          status: boldResult.status,
          amount,
          currency: 'COP',
          activatedUntil: activationResult.expiresAt,
          mock: false,
          message: 'Pago procesado exitosamente con Bold'
        };
      } else {
        return {
          success: false,
          error: boldResult.error,
          transactionId: boldResult.transactionId,
          mock: false
        };
      }
    } catch (error) {
      console.error('❌ Error pago Bold:', error);
      return {
        success: false,
        error: 'Error procesando pago con Bold: ' + error.message,
        mock: false
      };
    }
  }

  /**
   * Placeholder para API Bold (implementar cuando esté disponible)
   */
  async callBoldAPI(paymentData) {
    // TODO: Implementar integración real con Bold
    throw new Error('Bold API no implementada aún - usar modo mock');
  }

  /**
   * Activar suscripción de copropiedad
   */
  async activateSubscription(copropiedadId, administradorId) {
    try {
      const now = new Date();
      const expiraEn = new Date(now.getTime() + this.subscriptionDays * 24 * 60 * 60 * 1000);

      // Buscar suscripción existente o crear nueva
      let subscription = await this.prisma.subscription.findUnique({
        where: { copropiedadId }
      });

      if (subscription) {
        // Actualizar suscripción existente
        subscription = await this.prisma.subscription.update({
          where: { copropiedadId },
          data: {
            activa: true,
            activadaEn: now,
            expiraEn,
            ultimoPago: now
          }
        });
        console.log(`🔄 Suscripción renovada para copropiedad ${copropiedadId}`);
      } else {
        // Crear nueva suscripción
        subscription = await this.prisma.subscription.create({
          data: {
            copropiedadId,
            administradorId,
            activa: true,
            activadaEn: now,
            expiraEn,
            ultimoPago: now
          }
        });
        console.log(`✨ Nueva suscripción creada para copropiedad ${copropiedadId}`);
      }

      return subscription;
    } catch (error) {
      console.error('❌ Error activando suscripción:', error);
      throw error;
    }
  }

  /**
   * Activar copropiedad por X días (método legacy)
   */
  async activatePropertyForDays(copropiedadId, days) {
    try {
      const activationDate = new Date();
      const expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      
      const updatedProperty = await this.prisma.copropiedad.update({
        where: { id: copropiedadId },
        data: {
          isActive: true,
          activatedAt: activationDate,
          expiresAt: expirationDate,
          lastPayment: activationDate
        }
      });
      
      console.log(`✅ Copropiedad ${copropiedadId} activada hasta ${expirationDate.toLocaleDateString()}`);
      
      return {
        success: true,
        activatedAt: activationDate,
        expiresAt: expirationDate,
        daysActivated: days
      };
    } catch (error) {
      console.error('❌ Error activando copropiedad:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de transacciones
   */
  async getTransactionHistory(administradorId, limit = 50) {
    try {
      const pagos = await this.prisma.pago.findMany({
        where: { administradorId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          copropiedad: {
            select: { nombre: true, nit: true }
          }
        }
      });

      const transactions = pagos.map(pago => ({
        id: pago.id,
        transactionId: pago.transactionId,
        amount: parseFloat(pago.monto),
        currency: pago.moneda,
        status: pago.estado.toLowerCase(),
        description: pago.descripcion,
        provider: pago.proveedor,
        timestamp: pago.createdAt,
        fechaPago: pago.fechaPago,
        copropiedad: pago.copropiedad,
        mockData: pago.datosMock
      }));
      
      return {
        success: true,
        transactions,
        count: transactions.length,
        provider: this.provider
      };
    } catch (error) {
      console.error('❌ Error obteniendo historial:', error);
      return {
        success: false,
        error: 'Error obteniendo historial de transacciones',
        transactions: []
      };
    }
  }

  /**
   * Consultar estado de suscripción de copropiedad
   */
  async getSubscriptionStatus(copropiedadId) {
    try {
      const copropiedad = await this.prisma.copropiedad.findUnique({
        where: { id: copropiedadId },
        include: {
          subscription: true
        }
      });
      
      if (!copropiedad) {
        return { 
          success: false, 
          error: 'Copropiedad no encontrada' 
        };
      }

      const now = new Date();
      const subscription = copropiedad.subscription;

      // Verificar período de prueba gratis
      const inTrial = copropiedad.periodoGratis && 
                     copropiedad.periodoGratisHasta && 
                     copropiedad.periodoGratisHasta > now;
      
      let status = 'inactive';
      let daysLeft = 0;
      let expiraEn = null;
      let message = 'Suscripción inactiva';
      
      if (inTrial) {
        // En período de prueba
        status = 'trial';
        daysLeft = Math.max(0, Math.ceil((copropiedad.periodoGratisHasta - now) / (1000 * 60 * 60 * 24)));
        expiraEn = copropiedad.periodoGratisHasta;
        message = `Período de prueba - ${daysLeft} días restantes`;
      } else if (subscription && subscription.activa) {
        // Suscripción paga activa
        const isExpired = subscription.expiraEn && subscription.expiraEn < now;
        daysLeft = subscription.expiraEn 
          ? Math.max(0, Math.ceil((subscription.expiraEn - now) / (1000 * 60 * 60 * 24)))
          : 0;
        expiraEn = subscription.expiraEn;
        
        if (!isExpired) {
          if (daysLeft > 7) {
            status = 'active';
            message = `Suscripción activa - ${daysLeft} días restantes`;
          } else if (daysLeft > 1) {
            status = 'expiring_soon';
            message = `Suscripción por vencer - ${daysLeft} días restantes`;
          } else if (daysLeft === 1) {
            status = 'expiring_today';
            message = 'Suscripción vence hoy';
          } else {
            status = 'expiring_hours';
            const hoursLeft = Math.max(0, Math.ceil((subscription.expiraEn - now) / (1000 * 60 * 60)));
            message = `Suscripción vence en ${hoursLeft} horas`;
          }
        } else {
          status = 'expired';
          message = 'Suscripción vencida';
        }
      } else {
        message = 'Suscripción requerida para acceder';
      }
      
      return {
        success: true,
        copropiedad: {
          id: copropiedad.id,
          nombre: copropiedad.nombre,
          nit: copropiedad.nit
        },
        subscription: {
          status,
          message,
          expiraEn,
          daysLeft,
          inTrial,
          needsPayment: status === 'expired' || status === 'inactive',
          canAccess: status === 'active' || status === 'trial' || status === 'expiring_soon' || status === 'expiring_today' || status === 'expiring_hours',
          subscriptionData: subscription,
          monthlyPrice: this.monthlyPrice
        },
        provider: this.provider
      };
    } catch (error) {
      console.error('❌ Error consultando suscripción:', error);
      return {
        success: false,
        error: 'Error consultando estado de suscripción: ' + error.message
      };
    }
  }

  /**
   * Obtener resumen de pagos por administrador
   */
  async getPaymentSummary(administradorId) {
    try {
      // Obtener copropiedades con suscripciones
      const copropiedades = await this.prisma.copropiedad.findMany({
        where: { administradorId },
        include: {
          subscription: true,
          pagos: {
            where: { estado: 'APPROVED' },
            orderBy: { createdAt: 'desc' },
            take: 3
          }
        }
      });

      const now = new Date();
      
      const summary = {
        totalProperties: copropiedades.length,
        activeSubscriptions: 0,
        expiredSubscriptions: 0,
        trialSubscriptions: 0,
        expiringSoon: 0, // próximos 7 días
        totalRevenue: 0,
        monthlyRevenue: this.monthlyPrice,
        recentPayments: []
      };

      // Calcular estadísticas
      for (const prop of copropiedades) {
        const inTrial = prop.periodoGratis && 
                       prop.periodoGratisHasta && 
                       prop.periodoGratisHasta > now;
        
        if (inTrial) {
          summary.trialSubscriptions++;
          const daysLeft = Math.ceil((prop.periodoGratisHasta - now) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 7) summary.expiringSoon++;
        } else if (prop.subscription && prop.subscription.activa) {
          const isExpired = prop.subscription.expiraEn < now;
          if (!isExpired) {
            summary.activeSubscriptions++;
            const daysLeft = Math.ceil((prop.subscription.expiraEn - now) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 7) summary.expiringSoon++;
          } else {
            summary.expiredSubscriptions++;
          }
        } else {
          summary.expiredSubscriptions++;
        }
      }

      // Obtener pagos recientes
      const pagosRecientes = await this.prisma.pago.findMany({
        where: { administradorId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          copropiedad: {
            select: { nombre: true }
          }
        }
      });

      summary.recentPayments = pagosRecientes.map(pago => ({
        id: pago.id,
        transactionId: pago.transactionId,
        amount: parseFloat(pago.monto),
        currency: pago.moneda,
        status: pago.estado,
        copropiedadName: pago.copropiedad.nombre,
        timestamp: pago.createdAt,
        provider: pago.proveedor
      }));

      // Calcular ingresos totales
      const totalPagos = await this.prisma.pago.aggregate({
        where: {
          administradorId,
          estado: 'APPROVED'
        },
        _sum: {
          monto: true
        }
      });

      summary.totalRevenue = parseFloat(totalPagos._sum.monto || 0);

      return {
        success: true,
        summary,
        provider: this.provider
      };
    } catch (error) {
      console.error('❌ Error obteniendo resumen pagos:', error);
      return {
        success: false,
        error: 'Error obteniendo resumen de pagos'
      };
    }
  }

  /**
   * Cambiar proveedor de pagos
   */
  switchToRealPayments() {
    this.provider = 'bold';
    console.log('💰 ✅ Cambiado a pagos REALES con Bold');
  }

  switchToMockPayments() {
    this.provider = 'mock';
    console.log('🧪 ✅ Cambiado a pagos SIMULADOS');
  }

  getCurrentProvider() {
    return {
      provider: this.provider,
      isMock: this.provider === 'mock',
      isReal: this.provider === 'bold'
    };
  }

  /**
   * Inicializar período de prueba para nueva copropiedad
   */
  async initializeTrial(copropiedadId) {
    try {
      const now = new Date();
      const trialEnds = new Date(now.getTime() + this.trialDays * 24 * 60 * 60 * 1000);

      const updatedCopropiedad = await this.prisma.copropiedad.update({
        where: { id: copropiedadId },
        data: {
          periodoGratis: true,
          periodoGratisHasta: trialEnds
        }
      });

      console.log(`✨ Período de prueba iniciado para ${copropiedadId} hasta ${trialEnds.toLocaleDateString()}`);

      return {
        success: true,
        trialStarted: now,
        trialEnds,
        trialDays: this.trialDays,
        message: `Período de prueba de ${this.trialDays} días activado`
      };
    } catch (error) {
      console.error('❌ Error inicializando período de prueba:', error);
      return {
        success: false,
        error: 'Error inicializando período de prueba: ' + error.message
      };
    }
  }

  /**
   * Obtener estadísticas del sistema de pagos
   */
  async getSystemStats() {
    try {
      const stats = await this.prisma.$transaction([
        // Total de pagos
        this.prisma.pago.count(),
        // Pagos exitosos
        this.prisma.pago.count({ where: { estado: 'APPROVED' } }),
        // Pagos fallidos
        this.prisma.pago.count({ where: { estado: 'DECLINED' } }),
        // Suscripciones activas
        this.prisma.subscription.count({ where: { activa: true } }),
        // Ingresos totales
        this.prisma.pago.aggregate({
          where: { estado: 'APPROVED' },
          _sum: { monto: true }
        })
      ]);

      const [totalPayments, successfulPayments, failedPayments, activeSubscriptions, totalRevenue] = stats;

      return {
        success: true,
        stats: {
          totalPayments,
          successfulPayments,
          failedPayments,
          successRate: totalPayments > 0 ? (successfulPayments / totalPayments * 100).toFixed(2) + '%' : '0%',
          activeSubscriptions,
          totalRevenue: parseFloat(totalRevenue._sum.monto || 0),
          provider: this.provider,
          monthlyPrice: this.monthlyPrice
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        success: false,
        error: 'Error obteniendo estadísticas del sistema'
      };
    }
  }

  /**
   * Limpiar recursos
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

// Exportar instancia singleton
const paymentService = new PaymentService();

// Graceful shutdown
process.on('beforeExit', async () => {
  await paymentService.disconnect();
});

module.exports = paymentService;
