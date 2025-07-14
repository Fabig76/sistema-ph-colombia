'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Alert } from '@/components/ui';
import { Badge } from '@/components/ui';
import { 
  CreditCard, 
  BarChart3, 
  History, 
  Shield,
  Info,
  Settings,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { 
  PaymentForm, 
  SubscriptionStatus, 
  PaymentHistory, 
  PaymentDashboard 
} from '@/components/payments';
import { useAuth } from '@/lib/hooks/useAuth';

// Interface para datos de usuario/administrador
interface AdminData {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  copropiedades: Array<{
    id: string;
    nombre: string;
    nit: string;
  }>;
}

export default function PagosPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCopropiedad, setSelectedCopropiedad] = useState<string>('');
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [providerInfo, setProviderInfo] = useState<any>(null);

  // Simular datos del administrador (en producción vendrá del contexto/API)
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Simular datos del administrador y sus copropiedades
        // En producción, esto se obtendría de la API
        setAdminData({
          id: '990ddfc9-c6de-4b07-9088-8f2bbbb296d2', // ID del admin de prueba
          nombre: 'Admin Prueba Pagos',
          email: 'admin.pagos@test.com',
          telefono: '+573193406647',
          copropiedades: [
            {
              id: '7ee6d2f7-ba10-4292-bd76-ff7f90431af4', // ID de la copropiedad de prueba
              nombre: 'Copropiedad Prueba Pagos',
              nit: '900123456-1'
            }
          ]
        });

        // Establecer la primera copropiedad como seleccionada por defecto
        setSelectedCopropiedad('7ee6d2f7-ba10-4292-bd76-ff7f90431af4');
      } catch (err) {
        setError('Error cargando datos del administrador');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Obtener información del proveedor de pagos
  useEffect(() => {
    const fetchProviderInfo = async () => {
      try {
        const response = await fetch('/api/payments/provider-info');
        const result = await response.json();
        if (result.success) {
          setProviderInfo(result);
        }
      } catch (err) {
        console.error('Error fetching provider info:', err);
      }
    };

    fetchProviderInfo();
  }, []);

  const handlePaymentSuccess = (result: any) => {
    // Mostrar notificación de éxito
    console.log('Pago exitoso:', result);
    
    // Cambiar a la pestaña de historial para mostrar el nuevo pago
    setActiveTab('history');
    
    // Opcional: Mostrar toast o notificación
    // toast.success('Pago procesado exitosamente');
  };

  const handlePaymentError = (error: string) => {
    console.error('Error en pago:', error);
    // Opcional: Mostrar toast o notificación de error
    // toast.error(error);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando sistema de pagos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !adminData) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Error cargando datos del sistema de pagos'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const selectedCopropiedadData = adminData.copropiedades.find(
    c => c.id === selectedCopropiedad
  );

  const isMockMode = providerInfo?.provider === 'mock';

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Sistema de Pagos
          </h1>
          <p className="text-muted-foreground">
            Gestión de suscripciones y transacciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isMockMode && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Info className="h-3 w-3 mr-1" />
              Modo Demo
            </Badge>
          )}
          {providerInfo && (
            <Badge variant="outline">
              Proveedor: {providerInfo.provider.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>

      {/* Alerta modo demo */}
      {isMockMode && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Sistema en modo demostración:</strong> Los pagos y transacciones 
            mostrados son simulados para propósitos de desarrollo y testing. 
            No se procesa dinero real.
          </AlertDescription>
        </Alert>
      )}

      {/* Selector de copropiedad */}
      {adminData.copropiedades.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Copropiedad</CardTitle>
            <CardDescription>
              Elige la copropiedad para gestionar pagos y suscripciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {adminData.copropiedades.map((copropiedad) => (
                <Button
                  key={copropiedad.id}
                  variant={selectedCopropiedad === copropiedad.id ? "default" : "outline"}
                  className="p-4 h-auto flex flex-col items-start"
                  onClick={() => setSelectedCopropiedad(copropiedad.id)}
                >
                  <span className="font-semibold">{copropiedad.nombre}</span>
                  <span className="text-xs opacity-70">NIT: {copropiedad.nit}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido principal */}
      {selectedCopropiedadData && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Suscripción</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Pagar</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historial</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="overview" className="space-y-6">
            <PaymentDashboard 
              administradorId={adminData.id}
              autoRefresh={true}
              refreshInterval={60000}
            />
          </TabsContent>

          {/* Estado de Suscripción */}
          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionStatus
              copropiedadId={selectedCopropiedad}
              onPaymentClick={() => setActiveTab('payment')}
              autoRefresh={true}
              refreshInterval={30000}
            />
          </TabsContent>

          {/* Formulario de Pago */}
          <TabsContent value="payment" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <PaymentForm
                copropiedadId={selectedCopropiedad}
                copropiedadName={selectedCopropiedadData.nombre}
                currentAmount={20000}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          </TabsContent>

          {/* Historial de Pagos */}
          <TabsContent value="history" className="space-y-6">
            <PaymentHistory
              administradorId={adminData.id}
              copropiedadId={selectedCopropiedad}
              limit={100}
              showFilters={true}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Footer con información adicional */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Administrador: {adminData.nombre}</span>
              <span>•</span>
              <span>Teléfono: {adminData.telefono}</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Configuración</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
