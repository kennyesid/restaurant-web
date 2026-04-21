'use client';

import { useEffect, useState } from 'react';
import { Sale, getSales, deleteSale } from '@/services/sales';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterShift, setFilterShift] = useState<string>('all');
  const [filterPaymentType, setFilterPaymentType] = useState<string>('all');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getSales();
      setSales(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
      try {
        await deleteSale(id);
        await loadSales();
      } catch (error) {
        console.error('Error deleting sale:', error);
      }
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDialogOpen(true);
  };

  const filteredSales = sales.filter(sale => {
    const shiftMatch = filterShift === 'all' || sale.shift === filterShift;
    const paymentMatch = filterPaymentType === 'all' || sale.payment_type === filterPaymentType;
    return shiftMatch && paymentMatch;
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Get unique shifts and payment types
  const uniqueShifts = Array.from(new Set(sales.map(s => s.shift)));
  const uniquePaymentTypes = Array.from(new Set(sales.map(s => s.payment_type)));

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      qr: 'QR/Transferencia',
      mixed: 'Mixto',
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Historial de Ventas</h1>
          <p className="text-muted-foreground">Visualiza todas las transacciones realizadas</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
          <p className="text-3xl font-bold mt-2">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">{filteredSales.length} transacciones</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Transacciones</p>
          <p className="text-3xl font-bold mt-2">{totalTransactions}</p>
          <p className="text-xs text-muted-foreground mt-2">Promedio: ${averageTransaction.toLocaleString()} por transacción</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Tipos de Pago</p>
          <div className="mt-2 space-y-1">
            {uniquePaymentTypes.map(type => {
              const count = filteredSales.filter(s => s.payment_type === type).length;
              return (
                <div key={type} className="flex justify-between text-sm">
                  <span>{getPaymentTypeLabel(type)}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Filtrar por Turno</label>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="w-full mt-2 border border-input rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Todos los Turnos</option>
              {uniqueShifts.map(shift => (
                <option key={shift} value={shift}>
                  {shift}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Filtrar por Tipo de Pago</label>
            <select
              value={filterPaymentType}
              onChange={(e) => setFilterPaymentType(e.target.value)}
              className="w-full mt-2 border border-input rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Todos los Tipos</option>
              {uniquePaymentTypes.map(type => (
                <option key={type} value={type}>
                  {getPaymentTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Sales List */}
      <div className="space-y-3">
        {filteredSales.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No hay ventas que mostrar con los filtros seleccionados</p>
          </Card>
        ) : (
          filteredSales.map(sale => (
            <Card key={sale.id_sale} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div>
                      <p className="font-semibold text-lg">${sale.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.timestamp).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-primary/10 text-primary">
                        {sale.shift}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        sale.payment_type === 'cash'
                          ? 'bg-green-100 text-green-800'
                          : sale.payment_type === 'qr'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {getPaymentTypeLabel(sale.payment_type)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground font-medium mb-2">
                      {sale.items.length} artículos
                    </p>
                    <ul className="space-y-1 text-xs">
                      {sale.items.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          • {item.name} (x{item.quantity}) - ${item.price.toLocaleString()}
                        </li>
                      ))}
                      {sale.items.length > 2 && (
                        <li className="text-muted-foreground">
                          • +{sale.items.length - 2} artículos más
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(sale)}
                  >
                    Ver Detalles
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(sale.id_sale)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Venta</DialogTitle>
            <DialogDescription>
              Información completa de la transacción
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">ID de Venta</p>
                  <p className="font-mono text-sm">{selectedSale.id_sale}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha y Hora</p>
                  <p className="font-medium text-sm">
                    {new Date(selectedSale.timestamp).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Turno</p>
                  <p className="font-medium text-sm">{selectedSale.shift}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tipo de Pago</p>
                  <p className="font-medium text-sm">{getPaymentTypeLabel(selectedSale.payment_type)}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-3">Artículos ({selectedSale.items.length})</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">${item.price.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          ${(item.price * item.quantity).toLocaleString()} subtotal
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">Total</p>
                  <p className="text-2xl font-bold text-primary">
                    ${selectedSale.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
