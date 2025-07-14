'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  History, 
  Search, 
  Download, 
  CreditCard, 
  Calendar,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Info,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentHistoryProps {
  administradorId?: string;
  copropiedadId?: string;
  limit?: number;
  showFilters?: boolean;
}

interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'approved' | 'declined' | 'processing';
  description: string;
  provider: string;
  timestamp: string;
  fechaPago: string;
  copropiedad: {
    id: string;
    nombre: string;
    nit: string;
  };
  mockData?: {
    cardLastFour: string;
    cardType: string;
    authCode: string;
    processingTime: string;
    bankResponse: string;
    bank: string;
  };
}

interface PaymentHistoryData {
  success: boolean;
  transactions: Transaction[];
  count: number;
  provider: string;
}

export default function PaymentHistory({ 
  administradorId, 
  copropiedadId, 
  limit = 50,
  showFilters = true 
}: PaymentHistoryProps) {
  const [historyData, setHistoryData] = useState<PaymentHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  const fetchPaymentHistory = async () => {
    try {
      setError(null);
      setLoading(true);

      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      if (administradorId) params.append('administradorId', administradorId);
      if (copropiedadId) params.append('copropiedadId', copropiedadId);

      const response = await fetch(`/api/payments/history?${params}`);
      const result = await response.json();

      if (result.success) {
        setHistoryData(result);
        setFilteredTransactions(result.transactions);
      } else {
        setError(result.message || 'Error consultando historial de pagos');
      }
    } catch (err) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, [administradorId, copropiedadId, limit]);

  // Filtrar transacciones
  useEffect(() => {
    if (!historyData) return;

    let filtered = historyData.transactions;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.copropiedad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.copropiedad.nit.includes(searchTerm)
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  }, [historyData, searchTerm, statusFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-3 w-3" />;
      case 'declined':
        return <X className="h-3 w-3" />;
      case 'processing':
        return <Clock className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const exportToCSV = () => {
    if (!filteredTransactions.length) return;

    const headers = ['Fecha', 'ID Transacción', 'Copropiedad', 'Monto', 'Estado', 'Descripción'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(transaction => [
        formatDate(transaction.fechaPago),
        transaction.transactionId,
        transaction.copropiedad.nombre,
        transaction.amount,
        transaction.status,
        transaction.description
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-pagos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando historial de pagos...</span>
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
            onClick={fetchPaymentHistory}
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!historyData) return null;

  const isMockMode = historyData.provider === 'mock';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Pagos
            </CardTitle>
            <CardDescription>
              {historyData.count} transacciones registradas
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
        {/* Filtros */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, descripción, copropiedad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="declined">Rechazados</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || statusFilter !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar
              </Button>
            )}

            <Button variant="outline" onClick={exportToCSV} disabled={!filteredTransactions.length}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        )}

        {/* Lista de transacciones */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron transacciones</p>
            {(searchTerm || statusFilter !== 'all') && (
              <p className="text-sm">Prueba ajustando los filtros</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm font-medium">
                        {transaction.transactionId}
                      </span>
                      <Badge className={getStatusColor(transaction.status)}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1">{transaction.status.toUpperCase()}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Copropiedad:</p>
                        <p className="font-medium">{transaction.copropiedad.nombre}</p>
                        <p className="text-xs text-muted-foreground">NIT: {transaction.copropiedad.nit}</p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Descripción:</p>
                        <p>{transaction.description}</p>
                      </div>
                    </div>

                    {transaction.mockData && (
                      <div className="mt-2 text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                        <strong>Datos simulados:</strong> Tarjeta *{transaction.mockData.cardLastFour} 
                        ({transaction.mockData.cardType}) • Banco: {transaction.mockData.bank} • 
                        Auth: {transaction.mockData.authCode}
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(transaction.fechaPago)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alerta modo demo */}
        {isMockMode && filteredTransactions.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Historial de demostración:</strong> Estas transacciones fueron simuladas 
              para propósitos de prueba y desarrollo.
            </AlertDescription>
          </Alert>
        )}

        {/* Mostrar total filtrado vs total */}
        {filteredTransactions.length !== historyData.count && (
          <p className="text-sm text-center text-muted-foreground">
            Mostrando {filteredTransactions.length} de {historyData.count} transacciones
          </p>
        )}
      </CardContent>
    </Card>
  );
}
