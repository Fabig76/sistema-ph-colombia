'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Alert } from '@/components/ui';
import { Loader2, CreditCard, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui';

interface PaymentFormProps {
  copropiedadId: string;
  copropiedadName: string;
  currentAmount?: number;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
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
  activatedUntil?: string;
  processingTime?: string;
}

export default function PaymentForm({ 
  copropiedadId, 
  copropiedadName, 
  currentAmount = 20000,
  onPaymentSuccess,
  onPaymentError 
}: PaymentFormProps) {
  const [amount, setAmount] = useState(currentAmount);
  const [description, setDescription] = useState('Pago mensual suscripción');
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Verificar si estamos en modo mock
  const isMockMode = process.env.NODE_ENV === 'development' || 
                     process.env.PAYMENT_PROVIDER === 'mock';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPaymentResult(null);

    try {
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          copropiedadId,
          amount,
          description,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPaymentResult(result);
        onPaymentSuccess?.(result);
      } else {
        const errorMsg = result.message || 'Error procesando el pago';
        setError(errorMsg);
        onPaymentError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Error de conexión. Intente nuevamente.';
      setError(errorMsg);
      onPaymentError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPaymentResult(null);
    setError(null);
    setAmount(currentAmount);
    setDescription('Pago mensual suscripción');
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Procesar Pago
            </CardTitle>
            <CardDescription>
              {copropiedadName}
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
        {/* Alerta modo mock */}
        {isMockMode && !paymentResult && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Modo demostración:</strong> Este pago será simulado. No se procesará dinero real.
            </AlertDescription>
          </Alert>
        )}

        {/* Resultado exitoso */}
        {paymentResult && paymentResult.success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <p><strong>¡Pago procesado exitosamente!</strong></p>
                <div className="text-sm space-y-1">
                  <p><strong>ID Transacción:</strong> {paymentResult.transactionId}</p>
                  <p><strong>Monto:</strong> {formatCurrency(paymentResult.amount || 0)}</p>
                  <p><strong>Estado:</strong> {paymentResult.status?.toUpperCase()}</p>
                  {paymentResult.processingTime && (
                    <p><strong>Tiempo:</strong> {paymentResult.processingTime}</p>
                  )}
                  {paymentResult.mockData && (
                    <>
                      <p><strong>Tarjeta:</strong> **** {paymentResult.mockData.cardLastFour} ({paymentResult.mockData.cardType})</p>
                      <p><strong>Banco:</strong> {paymentResult.mockData.bank}</p>
                      <p><strong>Código Auth:</strong> {paymentResult.mockData.authCode}</p>
                    </>
                  )}
                </div>
                {paymentResult.mockData?.mockWarning && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ {paymentResult.mockData.mockWarning}
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Formulario de pago */}
        {!paymentResult && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a pagar</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="1000"
                max="1000000"
                step="1000"
                className="text-lg font-semibold"
                placeholder="20000"
              />
              <p className="text-sm text-muted-foreground">
                Equivale a: {formatCurrency(amount)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del pago"
                maxLength={100}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || amount < 1000}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Procesar Pago {formatCurrency(amount)}
                </>
              )}
            </Button>

            {isMockMode && (
              <p className="text-xs text-center text-muted-foreground">
                Tasa de éxito simulada: 85% | Tiempo: 1-3.5 segundos
              </p>
            )}
          </form>
        )}

        {/* Botón para nuevo pago */}
        {paymentResult && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={resetForm}
          >
            Realizar Nuevo Pago
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
