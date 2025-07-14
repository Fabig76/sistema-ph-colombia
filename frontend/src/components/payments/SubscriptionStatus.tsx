'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  CreditCard,
  Info,
  Loader2,
  Shield,
  Zap
} from 'lucide-react';

interface SubscriptionStatusProps {
  copropiedadId: string;
  onPaymentClick?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface SubscriptionData {
  success: boolean;
  copropiedad: {
    id: string;
    nombre: string;
    nit: string;
  };
  subscription: {
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
  provider: string;
}

export default function SubscriptionStatus({ 
  copropiedadId, 
  onPaymentClick,
  autoRefresh = false,
  refreshInterval = 30000 
}: SubscriptionStatusProps) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSubscriptionStatus = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/payments/subscription-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ copropiedadId }),
      });

      const result = await response.json();

      if (result.success) {
        setSubscriptionData(result);
        setLastUpdated(new Date());
      } else {
        setError(result.message || 'Error consultando estado de suscripción');
      }
    } catch (err) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [copropiedadId]);

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchSubscriptionStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, copropiedadId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'trial':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'grace_period':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'trial':
        return <Zap className="h-4 w-4" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      case 'grace_period':
        return <Clock className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Consultando estado de suscripción...</span>
        </CardContent>
      </Card>
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
            onClick={fetchSubscriptionStatus}
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionData) return null;

  const { copropiedad, subscription, provider } = subscriptionData;
  const isMockMode = provider === 'mock';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Estado de Suscripción
            </CardTitle>
            <CardDescription>
              {copropiedad.nombre} • NIT: {copropiedad.nit}
            </CardDescription>
          </div>
          {isMockMode && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Info className="h-3 w-3 mr-1" />
              Modo Demo
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estado principal */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(subscription.status)}
            <div>
              <p className="font-semibold">
                {subscription.status === 'trial' ? 'Período de Prueba' :
                 subscription.status === 'active' ? 'Suscripción Activa' :
                 subscription.status === 'expired' ? 'Suscripción Vencida' :
                 subscription.status === 'grace_period' ? 'Período de Gracia' :
                 'Estado Desconocido'}
              </p>
              <p className="text-sm text-muted-foreground">
                {subscription.message}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status.toUpperCase()}
          </Badge>
        </div>

        {/* Información de vencimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Calendar className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium">Expira el</p>
              <p className="text-sm text-gray-600">
                {formatDate(subscription.expiraEn)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Clock className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium">Días restantes</p>
              <p className={`text-sm font-semibold ${
                subscription.daysLeft <= 7 ? 'text-red-600' :
                subscription.daysLeft <= 15 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {subscription.daysLeft} días
              </p>
            </div>
          </div>
        </div>

        {/* Precio mensual */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <span className="text-sm font-medium">Precio mensual:</span>
          <span className="font-semibold">{formatCurrency(subscription.monthlyPrice)}</span>
        </div>

        {/* Alertas */}
        {subscription.needsPayment && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Pago requerido:</strong> Su suscripción necesita renovación para continuar 
              accediendo a todos los servicios.
            </AlertDescription>
          </Alert>
        )}

        {subscription.daysLeft <= 7 && subscription.canAccess && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Renovación próxima:</strong> Su suscripción vence en {subscription.daysLeft} días. 
              Renueve pronto para evitar interrupciones.
            </AlertDescription>
          </Alert>
        )}

        {!subscription.canAccess && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Acceso suspendido:</strong> Renueve su suscripción para continuar 
              usando los servicios de la plataforma.
            </AlertDescription>
          </Alert>
        )}

        {isMockMode && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Modo demostración:</strong> Esta suscripción está en modo de prueba. 
              Los pagos son simulados.
            </AlertDescription>
          </Alert>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2">
          {subscription.needsPayment && onPaymentClick && (
            <Button onClick={onPaymentClick} className="flex-1">
              <CreditCard className="mr-2 h-4 w-4" />
              Renovar Suscripción
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={fetchSubscriptionStatus}
            size={subscription.needsPayment ? "default" : "default"}
            className={subscription.needsPayment ? "" : "flex-1"}
          >
            Actualizar Estado
          </Button>
        </div>

        {/* Última actualización */}
        {lastUpdated && (
          <p className="text-xs text-center text-muted-foreground">
            Última actualización: {lastUpdated.toLocaleTimeString('es-CO')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
