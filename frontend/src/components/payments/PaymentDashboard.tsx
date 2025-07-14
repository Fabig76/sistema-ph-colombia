'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Info,
  Loader2,
  RefreshCw,
  Shield,
  Calendar
} from 'lucide-react';

interface PaymentDashboardProps {
  administradorId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface SystemStats {
  success: boolean;
  stats: {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    successRate: string;
    activeSubscriptions: number;
    totalRevenue: number;
    provider: string;
    monthlyPrice: number;
  };
}

interface PaymentSummary {
  success: boolean;
  summary: {
    totalProperties: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    trialSubscriptions: number;
    expiringSoon: number;
    totalRevenue: number;
    monthlyRevenue: number;
    recentPayments: any[];
  };
  provider: string;
}

export default function PaymentDashboard({ 
  administradorId,
  autoRefresh = false,
  refreshInterval = 60000 
}: PaymentDashboardProps) {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Fetch system stats
      const statsResponse = await fetch('/api/payments/system-stats');
      const statsResult = await statsResponse.json();

      // Fetch payment summary
      const summaryResponse = await fetch('/api/payments/summary');
      const summaryResult = await summaryResponse.json();

      if (statsResult.success && summaryResult.success) {
        setSystemStats(statsResult);
        setPaymentSummary(summaryResult);
        setLastUpdated(new Date());
      } else {
        setError('Error cargando datos del dashboard');
      }
    } catch (err) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: string | number) => {
    if (typeof value === 'string') return value;
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            className="w-full mt-4" 
            onClick={fetchDashboardData}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!systemStats || !paymentSummary) return null;

  const isMockMode = systemStats.stats.provider === 'mock';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Dashboard de Pagos
          </h2>
          <p className="text-muted-foreground">
            Resumen de suscripciones y transacciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isMockMode && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Info className="h-3 w-3 mr-1" />
              Modo Demo
            </Badge>
          )}
          <Button variant="outline" onClick={fetchDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(systemStats.stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemStats.stats.totalPayments} transacciones
            </p>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {paymentSummary.summary.activeSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              de {paymentSummary.summary.totalProperties} copropiedades
            </p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(systemStats.stats.successRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemStats.stats.successfulPayments}/{systemStats.stats.totalPayments} pagos
            </p>
          </CardContent>
        </Card>

        {/* Trial Subscriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Períodos de Prueba</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {paymentSummary.summary.trialSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              Cuentas en prueba
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalles adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Suscripciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estado de Suscripciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Activas</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {paymentSummary.summary.activeSubscriptions}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">En Prueba</span>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {paymentSummary.summary.trialSubscriptions}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Vencen Pronto</span>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {paymentSummary.summary.expiringSoon}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Vencidas</span>
              </div>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {paymentSummary.summary.expiredSubscriptions}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Resumen Financiero */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resumen Financiero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-sm font-medium">Ingresos Totales</span>
              <span className="font-bold text-green-700">
                {formatCurrency(paymentSummary.summary.totalRevenue)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium">Ingresos Mensuales</span>
              <span className="font-bold text-blue-700">
                {formatCurrency(paymentSummary.summary.monthlyRevenue)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Precio Mensual</span>
              <span className="font-semibold">
                {formatCurrency(systemStats.stats.monthlyPrice)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Pagos Exitosos</span>
              <span className="font-semibold text-green-600">
                {systemStats.stats.successfulPayments}
              </span>
            </div>

            {systemStats.stats.failedPayments > 0 && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Pagos Fallidos</span>
                <span className="font-semibold text-red-600">
                  {systemStats.stats.failedPayments}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas y notificaciones */}
      {paymentSummary.summary.expiringSoon > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Atención:</strong> {paymentSummary.summary.expiringSoon} suscripciones 
            vencen pronto. Considera contactar a los administradores para renovación.
          </AlertDescription>
        </Alert>
      )}

      {paymentSummary.summary.expiredSubscriptions > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Suscripciones vencidas:</strong> {paymentSummary.summary.expiredSubscriptions} 
            copropiedades tienen suscripciones vencidas que requieren renovación.
          </AlertDescription>
        </Alert>
      )}

      {isMockMode && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Dashboard en modo demostración:</strong> Todas las estadísticas mostradas 
            corresponden a transacciones simuladas para propósitos de desarrollo y testing.
          </AlertDescription>
        </Alert>
      )}

      {/* Última actualización */}
      {lastUpdated && (
        <p className="text-xs text-center text-muted-foreground">
          Última actualización: {lastUpdated.toLocaleString('es-CO')}
          {autoRefresh && ` • Actualización automática cada ${refreshInterval / 1000}s`}
        </p>
      )}
    </div>
  );
}
