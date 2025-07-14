'use client';

import { useState, useCallback } from 'react';

interface ProcessPaymentParams {
  copropiedadId: string;
  amount: number;
  description?: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentId?: string;
  amount?: number;
  status?: string;
  mockData?: {
    cardLastFour: string;
    cardType: string;
    authCode: string;
    processingTime: string;
    bankResponse: string;
    bank: string;
    mockWarning: string;
  };
  message?: string;
  error?: string;
}

interface SubscriptionStatusParams {
  copropiedadId: string;
}

interface SubscriptionStatusResult {
  success: boolean;
  copropiedad?: {
    id: string;
    nombre: string;
    nit: string;
  };
  subscription?: {
    status: 'active' | 'trial' | 'expired' | 'grace_period';
    message: string;
    expiraEn: string;
    daysLeft: number;
    inTrial: boolean;
    needsPayment: boolean;
    canAccess: boolean;
    subscriptionData: any;
    monthlyPrice: number;
  };
  provider?: string;
  error?: string;
}

interface PaymentHistoryParams {
  administradorId?: string;
  copropiedadId?: string;
  limit?: number;
}

interface PaymentHistoryResult {
  success: boolean;
  transactions?: any[];
  count?: number;
  provider?: string;
  error?: string;
}

export function usePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Procesar pago
  const processPayment = useCallback(async (params: ProcessPaymentParams): Promise<PaymentResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!result.success) {
        const errorMsg = result.message || 'Error procesando el pago';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      return { success: true, ...result };
    } catch (err) {
      const errorMsg = 'Error de conexión. Intente nuevamente.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estado de suscripción
  const getSubscriptionStatus = useCallback(async (params: SubscriptionStatusParams): Promise<SubscriptionStatusResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/subscription-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!result.success) {
        const errorMsg = result.message || 'Error consultando estado de suscripción';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      return { success: true, ...result };
    } catch (err) {
      const errorMsg = 'Error de conexión. Intente nuevamente.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener historial de pagos
  const getPaymentHistory = useCallback(async (params: PaymentHistoryParams = {}): Promise<PaymentHistoryResult> => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (params.administradorId) searchParams.append('administradorId', params.administradorId);
      if (params.copropiedadId) searchParams.append('copropiedadId', params.copropiedadId);
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await fetch(`/api/payments/history?${searchParams}`);
      const result = await response.json();

      if (!result.success) {
        const errorMsg = result.message || 'Error consultando historial de pagos';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      return { success: true, ...result };
    } catch (err) {
      const errorMsg = 'Error de conexión. Intente nuevamente.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener resumen de pagos
  const getPaymentSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/summary');
      const result = await response.json();

      if (!result.success) {
        const errorMsg = result.message || 'Error consultando resumen de pagos';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      return { success: true, ...result };
    } catch (err) {
      const errorMsg = 'Error de conexión. Intente nuevamente.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas del sistema
  const getSystemStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/system-stats');
      const result = await response.json();

      if (!result.success) {
        const errorMsg = result.message || 'Error consultando estadísticas del sistema';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      return { success: true, ...result };
    } catch (err) {
      const errorMsg = 'Error de conexión. Intente nuevamente.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicializar período de prueba
  const initializeTrial = useCallback(async (copropiedadId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/initialize-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ copropiedadId }),
      });

      const result = await response.json();

      if (!result.success) {
        const errorMsg = result.message || 'Error inicializando período de prueba';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      return { success: true, ...result };
    } catch (err) {
      const errorMsg = 'Error de conexión. Intente nuevamente.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener información del proveedor
  const getProviderInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/payments/provider-info');
      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.message };
      }

      return { success: true, ...result };
    } catch (err) {
      return { success: false, error: 'Error consultando información del proveedor' };
    }
  }, []);

  // Cambiar proveedor (solo admin)
  const switchProvider = useCallback(async (provider: 'mock' | 'bold') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/switch-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      const result = await response.json();

      if (!result.success) {
        const errorMsg = result.message || 'Error cambiando proveedor de pagos';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      return { success: true, ...result };
    } catch (err) {
      const errorMsg = 'Error de conexión. Intente nuevamente.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    loading,
    error,
    
    // Métodos
    processPayment,
    getSubscriptionStatus,
    getPaymentHistory,
    getPaymentSummary,
    getSystemStats,
    initializeTrial,
    getProviderInfo,
    switchProvider,
    clearError,
  };
}
