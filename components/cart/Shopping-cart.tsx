"use client";

import { useAppDispatch, useAppSelector } from "@/store/store/hooks";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  setPaymentType,
  updateCartItems,
  toggleCartSide,
} from "@/store/store/slices/cartSlice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { createSale } from "@/services/salesService";
import { toast } from "sonner";
import { CartItem } from "@/types";
import { CustomNotification } from "@/components/common/toast/CustomNotification";
import { ToastType } from "@/types";
import { getImageUrl } from "@/utils/format";
import { GenericModal } from "@/components/common/modal/GenericModal";
import ButtonGeneric from "../common/button/ButtonGeneric";
import { STYLE_INTERNAL } from "@/lib/constants/constantStyle";
import { OrderStatusEnum } from "@/types/enum/orderStatusEnum";
import { User } from "@/types/";
import { createUser } from "@/services/usersService";
import Image from "next/image";
import { ResponsiveModal } from "../common/modal/ResponsiveModal";
import { Column, GenericDataTable } from "../common/table/GenericDataTable";

export function ShoppingCart() {
  const dispatch = useAppDispatch();

  const [showSummary, setShowSummary] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<any | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const { items, paymentType } = useAppSelector((state) => state.cart) as {
    items: CartItem[];
    paymentType: string;
  };
  const [isProcessing, setIsProcessing] = useState(false);

  const [needsInvoice, setNeedsInvoice] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [customNit, setCustomNit] = useState("");
  // const [promoColumns, setPromoColumns] = useState<Column<any>[]>([]);

  let total = items.reduce(
    (sum, item) => sum + (item.modifiedSubtotal ?? item.price * item.quantity),
    0,
  );

  const getCurrentShift = (): "morning" | "afternoon" | "night" => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "night";
  };

  const handleCheckout = async () => {
    let userSendId = 0;
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
      }));

      if (selectedClient) {
        if (selectedClient.id === 0) {
          const selectedClientResponse = await createUser({
            username: selectedClient.username,
            password: selectedClient.password,
            fullName: `${selectedClient.username} ${selectedClient.fullName || ""}`,
            address: "S/N",
            document: selectedClient.document || "S/N",
            email: selectedClient.email || "S/N",
            phone: selectedClient.phone || "S/N",
            roleId: 1,
            state: true,
            nit: selectedClient.nit,
            avatarUrl: "S/N",
            branchId: 1,
          });
          userSendId = selectedClientResponse.id;
        } else {
          userSendId = selectedClient.id;
        }
      }

      const response = await createSale({
        detail: saleItems,
        paymentType: paymentType as any,
        userId: 1,
        userCustomerId: userSendId,
        orderNumber: 1,
        orderStatus: OrderStatusEnum.EN_COCINA,
        tenantId: 1,
        state: true,
        total,
        shift: getCurrentShift(),
      });
      const isSuccess = response.codigo >= 200 && response.codigo <= 299;
      const currentToastBody = {
        type: isSuccess ? ToastType.Successfully : ToastType.Fail,
        message: isSuccess ? "Exito" : "Error",
        description: isSuccess
          ? "Venta realizada satisfactoriamente."
          : response.mensaje,
        image: null,
      };

      toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);

      if (!isSuccess) {
        return;
      }
      dispatch(clearCart());
      setShowSummary(false);
      dispatch(toggleCartSide());
    } catch (error) {
      toast.error("Error al procesar la venta");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreCheckout = () => {
    if (items.length === 0) return toast.error("Carrito vacío");
    setShowSummary(true);
  };

  const handleChangeSubTotal = (newItems: CartItem[]) => {
    dispatch(updateCartItems(newItems));
    total = items.reduce(
      (sum, item) =>
        sum + (item.modifiedSubtotal ?? item.price * item.quantity),
      0,
    );
  };

  const handleUpdatePromoQuantity = (subProductId: number, newQty: number) => {
    if (!selectedPromo) return;

    const updatedDetails = selectedPromo.productDetailProduct.map(
      (subItem: any) =>
        subItem.productId === subProductId
          ? { ...subItem, quantity: Math.max(0, newQty) }
          : subItem,
    );

    const updatedPromoItem = {
      ...selectedPromo,
      productDetailProduct: updatedDetails,
    };
    setSelectedPromo(updatedPromoItem);
  };

  const handleSavePromoConfig = () => {
    const updatedCartItems = items.map((cartItem) =>
      cartItem.productId === selectedPromo.productId ? selectedPromo : cartItem
    );
    handleChangeSubTotal(updatedCartItems);
    setIsPromoModalOpen(false);
  };

  const handlePromoSelected = (item: CartItem) => {
    setSelectedPromo(item);
    setIsPromoModalOpen(true);
    // setPromoColumns(promoColumns);
  };

  const promoColumns: Column<any>[] = [
    {
      header: "Plato",
      accessor: "name",
    },
    {
      header: "Precio Ref.",
      accessor: (item) => <span className="text-slate-400">Bs {item.price}</span>,
    },
    {
      header: "Cantidad",
      accessor: (item) => {
        // Buscamos el valor más fresco directamente desde el estado reactivo 'selectedPromo'
        const currentSubItem = selectedPromo?.productDetailProduct?.find(
          (sub: any) => sub.productId === item.productId
        );

        return (
          <div className="flex justify-center">
            <input
              type="number"
              min="0"
              value={currentSubItem ? currentSubItem.quantity : item.quantity}
              onChange={(e) =>
                handleUpdatePromoQuantity(item.productId, parseInt(e.target.value) || 0)
              }
              className="w-16 text-center border border-border rounded p-1 bg-gray-50 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden rounded-none">
        <div
          className={`p-4 flex justify-between items-center text-white/80 ${STYLE_INTERNAL.headerModalPrimary} `}
        >
          <h3 className=" text-lg tracking-wide">Carrito</h3>
          <p className="text-sm tracking-wide">{items.length} artículos</p>
        </div>
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
                className="border bg-white border-border rounded-lg p-2"
              >
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      onClick={() => handlePromoSelected(item)}
                      // onClick={() => {
                      //   if (item.isPromotion) {
                      //     setSelectedPromo(item);
                      //     setIsPromoModalOpen(true);
                      //   }
                      // }}
                      className={`relative h-12 w-12 rounded-md bg-muted overflow-hidden flex-shrink-0 border transition-all ${item.isPromotion
                        ? "border-rest-yellow ring-2 ring-rest-yellow/20 cursor-pointer hover:opacity-80 scale-105 z-10" // 👈 Usamos color arbitrario o red-500 y sumamos z-10
                        : "border-border"
                        }`}
                    >
                      <Image
                        src={getImageUrl(item.imageUrl)}
                        alt={item.name}
                        fill
                        sizes="48px"
                        priority
                        className="object-cover"
                      />
                      {item.isPromotion && (
                        <span className="absolute bottom-0 right-0 bg-rest-yellow text-[8px] text-rest-primary font-black px-1 rounded-tl-sm uppercase tracking-tighter">
                          OPCION
                        </span>
                      )}
                    </div>
                    {/* <div className="relative h-12 w-12 rounded-md bg-muted overflow-hidden flex-shrink-0 border border-border">
                      <Image
                        src={getImageUrl(item.imageUrl)}
                        alt={item.name}
                        fill
                        sizes="48px"
                        priority
                        className="object-cover"
                      />
                    </div> */}

                    <div className="min-w-0">
                      <p className="font-medium text-sm leading-tight truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bs {item.price.toString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-muted rounded-full border border-border overflow-hidden">
                    {/* MINUS */}
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.productId,
                            quantity: Math.max(1, item.quantity - 1),
                          }),
                        )
                      }
                      className="px-2 py-1 hover:bg-background/60 transition-colors cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>

                    {/* INPUT */}
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
                      className="
                        w-10 text-center text-sm
                        bg-transparent
                        outline-none
                        border-0
                        [-moz-appearance:textfield]
                      "
                    />

                    {/* PLUS */}
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.productId,
                            quantity: item.quantity + 1,
                          }),
                        )
                      }
                      className="px-2 py-1 hover:bg-background/60 transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      onClick={() => dispatch(removeFromCart(item.productId))}
                      className="cursor-pointer text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <p className="font-semibold text-rest-primary text-sm whitespace-nowrap">
                      Bs {(item.price * item.quantity).toString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-rest-primary">
                Método de Pago
              </label>
              <div className="flex gap-2">
                {["cash", "qr", "mixed"].map((method) => (
                  <button
                    key={method}
                    onClick={() => dispatch(setPaymentType(method as any))}
                    className={`flex-1 py-1 px-1 text-sm font-medium transition-colors cursor-pointer ${paymentType === method
                      ? "bg-[#facc15]  text-rest-primary"
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
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span className="text-rest-primary">Total:</span>
                <span className="text-rest-primary">Bs {total.toString()}</span>
              </div>
            </div>

            <ButtonGeneric
              variant="confirmModalPrimary"
              onClick={handlePreCheckout}
              disabled={isProcessing || items.length === 0}
            >
              {isProcessing ? "Procesando..." : "Completar Venta"}
            </ButtonGeneric>

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
      {/* NUEVO MODAL: DETALLE Y EDICIÓN DE LA PROMOCIÓN */}
      {isPromoModalOpen && selectedPromo && (
        <ResponsiveModal
          isOpen={isPromoModalOpen}
          onClose={() => setIsPromoModalOpen(false)}
          onConfirm={handleSavePromoConfig}
          title={selectedPromo?.name || "Detalle de Promoción"}
          subtitle="Personaliza los platos incluidos en este combo"
          confirmText="Confirmar Configuración"
          size="lg"
        >
          <GenericDataTable
            columns={promoColumns}
            data={selectedPromo?.productDetailProduct || []}
            showActions={false}
            rowKey="id"
          />
          {/* El Children queda 100% aislado de botones */}
          {/* <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-slate-500 font-bold">
                  <th className="p-2">Platillo</th>
                  <th className="p-2 text-right">Precio Ref.</th>
                  <th className="p-2 text-center w-24">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {selectedPromo?.productDetailProduct?.map((subItem: any) => (
                  <tr key={subItem.id} className="border-b border-border hover:bg-slate-50/50 transition-colors">
                    <td className="p-2 font-medium text-slate-800">{subItem.name}</td>
                    <td className="p-2 text-right text-slate-400">Bs {subItem.price}</td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={subItem.quantity}
                        onChange={(e) => handleUpdatePromoQuantity(subItem.productId, parseInt(e.target.value) || 0)}
                        className="w-16 text-center border border-border rounded p-1 bg-gray-50 focus:ring-2 focus:ring-yellow-400 outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}
        </ResponsiveModal>
        // <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        //   <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col">
        //     {/* Header del Modal */}
        //     <div className="p-4 bg-[#052A3D] text-white flex justify-between items-center">
        //       <div>
        //         <h4 className="font-bold text-base">{selectedPromo.name}</h4>
        //         <p className="text-xs text-yellow-400 font-medium">
        //           Personaliza los platos incluidos
        //         </p>
        //       </div>
        //       <button
        //         onClick={() => setIsPromoModalOpen(false)}
        //         className="text-white/80 hover:text-white font-bold text-sm cursor-pointer"
        //       >
        //         ✕
        //       </button>
        //     </div>

        //     {/* Contenido / Datatable */}
        //     <div className="p-4 overflow-x-auto">
        //       <table className="w-full text-left border-collapse text-xs">
        //         <thead>
        //           <tr className="border-b border-border bg-slate-50 text-slate-500 font-bold">
        //             <th className="p-2">Platillo</th>
        //             <th className="p-2 text-right">Precio Ref.</th>
        //             <th className="p-2 text-center w-24">Cantidad</th>
        //           </tr>
        //         </thead>
        //         <tbody>
        //           {selectedPromo.productDetailProduct?.map((subItem: any) => (
        //             <tr
        //               key={subItem.id}
        //               className="border-b border-border hover:bg-slate-50/50 transition-colors"
        //             >
        //               <td className="p-2 font-medium text-slate-800">
        //                 {subItem.name}
        //               </td>
        //               <td className="p-2 text-right text-slate-400">
        //                 Bs {subItem.price}
        //               </td>
        //               <td className="p-2 text-center">
        //                 <input
        //                   type="number"
        //                   min="0"
        //                   value={subItem.quantity}
        //                   onChange={(e) =>
        //                     handleUpdatePromoQuantity(
        //                       subItem.productId,
        //                       parseInt(e.target.value) || 0,
        //                     )
        //                   }
        //                   className="w-16 text-center border border-border rounded p-1 bg-gray-50 focus:ring-2 focus:ring-yellow-400 outline-none"
        //                 />
        //               </td>
        //             </tr>
        //           ))}
        //         </tbody>
        //       </table>
        //     </div>

        //     {/* Footer del Modal */}
        //     <div className="p-4 border-t border-border bg-gray-50 flex justify-end gap-2">
        //       <button
        //         onClick={() => setIsPromoModalOpen(false)}
        //         className="px-4 py-2 bg-[#052A3D] text-white text-xs font-bold rounded hover:bg-[#0c3d54] cursor-pointer transition-colors"
        //       >
        //         Confirmar Configuración
        //       </button>
        //     </div>
        //   </div>
        // </div>
      )}
      {/* En ShoppingCart.tsx (al final, donde invocas el modal) */}
      <GenericModal
        isOpen={showSummary}
        // onClose={() => setShowSummary(false)}
        onClose={() => {
          setShowSummary(false); // Cierra el modal
          setSelectedClient(null); // Resetea el cliente seleccionado
        }}
        items={items}
        total={total}
        onConfirm={handleCheckout}
        isProcessing={isProcessing}
        // PASA LAS NUEVAS PROPS:
        needsInvoice={needsInvoice}
        setNeedsInvoice={setNeedsInvoice}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        onOpenCreateClientModal={() => {
          // Aquí abrirías el modal de creación de cliente=
          console.log("Abrir modal de nuevo cliente");
        }}
        changeSubTotal={handleChangeSubTotal}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
      />
    </>
  );
}
