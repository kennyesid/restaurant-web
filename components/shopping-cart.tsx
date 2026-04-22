"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  setPaymentType,
} from "@/lib/slices/cartSlice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { createSale } from "@/services/sales";
import { toast } from "sonner";
import { CartItem } from "@/types";
import { SuccessToastImplement } from "./common/toast/ToastImplement";
import { CustomNotification } from "./common/toast/CustomNotification";
import { ToastType } from "@/types";
import { getImageUrl } from "@/utils/format";
import { GenericModal } from "./common/modal/GenericModal";

export function ShoppingCart() {
  const dispatch = useAppDispatch();

  const [showSummary, setShowSummary] = useState(false);

  const { items, paymentType } = useAppSelector((state) => state.cart) as {
    items: CartItem[];
    paymentType: string;
  };
  const [isProcessing, setIsProcessing] = useState(false);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const getCurrentShift = (): "morning" | "afternoon" | "night" => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "night";
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    setIsProcessing(true);
    try {
      const saleItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        categoryId: item.categoryId,
        // imageUrl: item.imageUrl,
      }));

      await createSale({
        detail: saleItems,
        payment_type: paymentType as any,
        userId: 1,
        tenantId: 1,
        state: true,
        total,
        shift: getCurrentShift(),
      });

      // toast.success("Venta completada exitosamente");
      // toast.custom((t) => <SuccessToastImplement total={total} t={t} />);
      toast.custom((t) => (
        <CustomNotification
          t={t}
          type={ToastType.Successfully}
          message="Venta Completada"
          description="El registro se guardó en la base de datos local."
          // image="/path-to-your-image.png" // Opcional
        />
      ));

      dispatch(clearCart());
    } catch (error) {
      toast.error("Error al procesar la venta");
    } finally {
      setIsProcessing(false);
    }
  };

  // const getImageUrl = (url?: string) => {
  //   if (!url) return `data:image/avif;base64`;
  //   return url.startsWith("data:") ? url : `data:image/avif;base64,${url}`;
  // };

  const handlePreCheckout = () => {
    if (items.length === 0) return toast.error("Carrito vacío");
    setShowSummary(true);
  };

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden rounded-none">
        <div className="p-4 flex justify-between items-center bg-[#052A3D] text-white ">
          <h3 className="font-semibold text-lg tracking-wide">Carrito</h3>
          <p className="text-sm opacity-90 tracking-wide">
            {items.length} artículos
          </p>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#052A3D]/20 to-transparent">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-2xl mb-2">🛒</p>
                <p className="text-sm">Carrito vacío</p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="border bg-white border-border rounded-lg p-2 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="h-12 w-12 rounded-md bg-muted overflow-hidden flex-shrink-0 border border-border">
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-center min-w-0 px-1">
                    <p className="font-medium text-sm tracking-normal leading-tight">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground tracking-wider">
                      Bs {item.price.toString()}
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          productId: item.productId,
                          quantity: Math.max(1, item.quantity - 1),
                        }),
                      )
                    }
                    className="p-1 border border-border rounded hover:bg-muted"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      dispatch(
                        updateQuantity({
                          productId: item.productId,
                          quantity: parseInt(e.target.value) || 1,
                        }),
                      )
                    }
                    className="w-12 text-center text-sm border border-border rounded"
                  />
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          productId: item.productId,
                          quantity: item.quantity + 1,
                        }),
                      )
                    }
                    className="p-1 border border-border rounded hover:bg-muted"
                  >
                    <Plus size={14} />
                  </button>
                  <p className="ml-auto font-semibold text-base">
                    Bs {(item.price * item.quantity).toString()}
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
              <label className="block text-sm font-medium mb-2">
                Método de Pago
              </label>
              <div className="flex gap-2">
                {["cash", "qr", "mixed"].map((method) => (
                  <button
                    key={method}
                    onClick={() => dispatch(setPaymentType(method as any))}
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors cursor-pointer ${
                      paymentType === method
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {method === "cash"
                      ? "Efectivo"
                      : method === "qr"
                        ? "QR"
                        : "Mixto"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${total.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Total:</span>
                <span className="text-primary">
                  ${total.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <Button
              className="w-full rounded-none cursor-pointer"
              size="lg"
              // onClick={handleCheckout}
              onClick={handlePreCheckout}
              disabled={isProcessing || items.length === 0}
            >
              {isProcessing ? "Procesando..." : "Completar Venta"}
            </Button>

            {items.length > 0 && (
              <Button
                variant="outline"
                className="w-full rounded-none cursor-pointer"
                onClick={() => dispatch(clearCart())}
                disabled={isProcessing}
              >
                Limpiar Carrito
              </Button>
            )}
          </div>
        )}
      </Card>

      <GenericModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        items={items}
        total={total}
        onConfirm={handleCheckout}
        isProcessing={isProcessing}
      />
    </>
  );
}
