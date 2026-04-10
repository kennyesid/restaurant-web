'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { removeFromCart, updateQuantity, clearCart, setPaymentType } from '@/lib/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { createSale } from '@/services/sales';
import { toast } from 'sonner';

export function ShoppingCart() {
  const dispatch = useAppDispatch();
  const { items, paymentType } = useAppSelector(state => state.cart);
  const [isProcessing, setIsProcessing] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getCurrentShift = (): 'morning' | 'afternoon' | 'night' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'night';
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setIsProcessing(true);
    try {
      const saleItems = items.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      await createSale({
        items: saleItems,
        total,
        paymentType: paymentType as any,
        timestamp: new Date(),
        shift: getCurrentShift(),
      });

      toast.success('Venta completada exitosamente');
      dispatch(clearCart());
    } catch (error) {
      toast.error('Error al procesar la venta');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-lg">Carrito</h3>
        <p className="text-sm text-muted-foreground">{items.length} artículos</p>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-2xl mb-2">🛒</p>
              <p className="text-sm">Carrito vacío</p>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">${item.price.toLocaleString('es-CO')}</p>
                </div>
                <button
                  onClick={() => dispatch(removeFromCart(item.id))}
                  className="text-destructive hover:bg-destructive/10 p-1 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch(updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) }))}
                  className="p-1 border border-border rounded hover:bg-muted"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    dispatch(updateQuantity({ id: item.id, quantity: parseInt(e.target.value) || 1 }))
                  }
                  className="w-12 text-center text-sm border border-border rounded"
                />
                <button
                  onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                  className="p-1 border border-border rounded hover:bg-muted"
                >
                  <Plus size={14} />
                </button>
                <p className="ml-auto font-semibold text-sm">
                  ${(item.price * item.quantity).toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment and Total */}
      {items.length > 0 && (
        <div className="border-t border-border p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Método de Pago</label>
            <div className="flex gap-2">
              {['cash', 'qr', 'mixed'].map((method) => (
                <button
                  key={method}
                  onClick={() => dispatch(setPaymentType(method as any))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    paymentType === method
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {method === 'cash' ? 'Efectivo' : method === 'qr' ? 'QR' : 'Mixto'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>Total:</span>
              <span className="text-primary">${total.toLocaleString('es-CO')}</span>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={isProcessing || items.length === 0}
          >
            {isProcessing ? 'Procesando...' : 'Completar Venta'}
          </Button>

          {items.length > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => dispatch(clearCart())}
              disabled={isProcessing}
            >
              Limpiar Carrito
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
