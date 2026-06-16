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
import { useEffect, useState } from "react";
import { createSale, obtenerSiguienteOrdenDiariaSupabase } from "@/services/salesService";
import { toast } from "sonner";
import { CartItem } from "@/types";
import { CustomNotification } from "@/components/common/toast/CustomNotification";
import { ToastType } from "@/types";
import { getImageUrl } from "@/utils/format";
import { GenericModal } from "@/components/common/modal/GenericModal";
import { ButtonGeneric } from "@/components/common/button/ButtonGeneric";
import { STYLE_INTERNAL } from "@/lib/constants/constantStyle";
import { OrderStatusEnum } from "@/types/enum/orderStatusEnum";
import { User } from "@/types/";
import { createUser } from "@/services/usersService";
import Image from "next/image";
import { ResponsiveModal } from "../common/modal/ResponsiveModal";
import { Column, GenericDataTable } from "../common/table/GenericDataTable";
import { CONSTANT_PRODUCT_FITTING } from "@/lib/constants/constantsFitting";
import { ProductFittings } from "@/types/product/productFittings";
import { ProductDetailProduct } from "@/types/product/productDetailProduct";
import { getProducts } from "@/services/productsSservice";
import { Product } from "@/types";
import { DropdownSearchable } from "@/components/common";
import { OrderTypeEnum } from "@/types/enum/orderTypeEnum";
import { ApiService } from "@/services/apiService";
import { DateUtils } from "@/utils/date-utils";
import { parameterService } from "@/services/parameterService";

export function ShoppingCart() {
  const dispatch = useAppDispatch();

  const [showSummary, setShowSummary] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<any | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderTypeEnum>(
    OrderTypeEnum.CONSUMO_LOCAL,
  );
  const [formReason, setFormReason] = useState("");
  const [formModifiedPrice, setFormModifiedPrice] = useState<number | "">("");
  const [formProductId, setFormProductId] = useState<number | "">("");
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [selectedFittings, setSelectedFittings] = useState<number[]>([]);

  const { items, paymentType, user } = useAppSelector((state) => ({
    items: state.cart.items,
    paymentType: state.cart.paymentType,
    user: state.auth.user,
  })) as {
    items: CartItem[];
    paymentType: string;
    user: User | null;
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [needsInvoice, setNeedsInvoice] = useState(false);
  // const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [selectedClient, setSelectedClient] = useState<any>({
    id: 1,
    fullName: "",
    nit: "",
  });
  const [customNit, setCustomNit] = useState("");
  const [productsList, setProductsList] = useState<Product[]>([]);
  // const [promoColumns, setPromoColumns] = useState<Column<any>[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        // Filtrar opcional: Si quieres evitar que en el dropdown salgan otras promociones
        const onlySingleProducts = data.filter((p) => !p.isPromotion);
        setProductsList(onlySingleProducts);
      } catch (error) {
        console.error("Error al cargar los productos en el modal:", error);
      }
    };

    loadProducts();
  }, []);

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

    console.log("que cagada", JSON.stringify(items, null, 2));

    try {
      const saleItems = items.flatMap((item) => {
        const mainItem = {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          categoryId: item.categoryId,
          productId: item.productId,
          productDetailProduct: item.productDetailProduct,
          modifiedSubtotal: item.modifiedSubtotal,
          reasonModification: item.reasonModification,
          isCountable: true,
          // isCountable: item.isCountable ?? false,
        };
        const isPromo =
          item.isPromotion ||
          (item.productDetailProduct && item.productDetailProduct.length > 0);

        if (isPromo && item.productDetailProduct) {
          const flatSubProducts = item.productDetailProduct.map((sub: any) => ({
            id: sub.id,
            // name: `${sub.name} ${sub.productFittings && sub.productFittings.length > 0 ? `(${sub.productFittings.join(", ")})` : ""}`,
            name: sub.name,
            quantity: 0,
            price: 0,
            categoryId: sub.categoryId || item.categoryId,
            productId: sub.productId,
            productFittings: sub.productFittings ? sub.productFittings : [],
            modifiedSubtotal: sub.modifiedSubtotal,
            reasonModification: sub.reasonModification,
            isCountable: false,
            productDetailProduct: undefined,
          }));
          return [mainItem, ...flatSubProducts];
        }
        return [mainItem];
      });

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

      const numeroOrdenCalculado = await obtenerSiguienteOrdenDiariaSupabase();

      const response = await createSale({
        detail: saleItems,
        paymentType: paymentType as any,
        userId: user?.id || 1,
        userCustomerId: userSendId,
        userName: selectedClient?.fullName ?? "SIN NOMBRE",
        userDocument: selectedClient?.nit ?? "0",
        orderNumber: numeroOrdenCalculado,
        orderStatus: OrderStatusEnum.EN_COCINA,
        tenantId: 1,
        state: true,
        total,
        orderType: orderType as any,
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

      // ========================================================
      // 💡 NUEVO: CONSUMO DEL ENDPOINT DE IMPRESIÓN (.NET)
      try {
        const printPayload = {
          detail: saleItems.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            categoryId: item.categoryId,
            reasonModification: item.reasonModification || "",
            isCountable: item.isCountable,
            // Si el item tiene productFitting mapeado como objetos, extraemos solo sus nombres en texto plano
            productFittings: Array.isArray((item as any).productFittings)
              ? (item as any).productFittings.map((f: any) => f.name || f)
              : [],
            // Mapeamos también los subproductos internos si existieran con la misma lógica
            productDetailProduct: Array.isArray(item.productDetailProduct)
              ? item.productDetailProduct.map((sub: any) => ({
                id: sub.id,
                productId: sub.productId || 0,
                name: sub.name,
                // price: sub.price || 0,
                price: 0,
                reasonModification: sub.reasonModification || "",
                quantity: sub.quantity || 0,
                productFittings: Array.isArray(sub.productFittings)
                  ? sub.productFittings.map((f: any) => f.name || f)
                  : [],
                state: sub.state ?? true
              }))
              : []
          })),
          paymentType: paymentType,
          userId: user?.id || 1,
          userCustomerId: userSendId,
          userName: selectedClient?.fullName ?? "SIN NOMBRE",
          userDocument: selectedClient?.nit ?? "0",
          orderNumber: numeroOrdenCalculado,
          orderStatus: 1,
          tenantId: 1,
          state: true,
          total: total,
          orderType: orderType,
          shift: getCurrentShift(),
          createdAt: DateUtils.obtenerFechaBoliviaISO(),
          updatedAt: DateUtils.obtenerFechaBoliviaISO()
        };


        const urlImpresion = await parameterService.obtenerValorUrl(
          'API_PRINT_URL',
          'https://localhost:7175/api/Print/PrintRestaurant'
        );
        console.log('api_impresion: ' + urlImpresion);
        await ApiService.post(urlImpresion, printPayload);

        // console.log("printPayload: ", JSON.stringify(printPayload));
        // await ApiService.post("https://localhost:7175/api/Print/PrintRestaurant", printPayload);

      } catch (printError) {
        console.error("Error en el servicio de impresión física:", printError);
        toast.error("La venta se guardó, pero hubo un problema con la ticketera.");
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
    // Aseguramos que si el precio fue alterado, lleve un motivo de cambio por defecto
    const finalPromoConfig = {
      ...selectedPromo,
      reasonModification:
        selectedPromo.reasonModification?.trim() ||
        "Precio de Combo Modificado",
    };

    const updatedCartItems = items.map((cartItem) =>
      cartItem.id === finalPromoConfig.id ? finalPromoConfig : cartItem
    );

    handleChangeSubTotal(updatedCartItems); // Notifica el cambio al estado global/padre
    setIsPromoModalOpen(false);
  };

  // const handleSavePromoConfig = () => {
  //   const updatedCartItems = items.map((cartItem) =>
  //     cartItem.productId === selectedPromo.productId ? selectedPromo : cartItem,
  //   );
  //   handleChangeSubTotal(updatedCartItems);
  //   setIsPromoModalOpen(false);
  // };

  const handlePromoSelected = (item: CartItem) => {
    setSelectedPromo(item);
    setIsPromoModalOpen(true);
    // setPromoColumns(promoColumns);
    setFormReason("");
    setFormModifiedPrice("");
  };

  const handleUpdateProductFittings = (
    productId: number,
    updatedFittings: any[],
  ) => {
    if (!selectedPromo) return;

    // 1. Clonamos y recorremos los subproductos de la promoción seleccionada
    const updatedProducts = selectedPromo.productDetailProduct.map(
      (product: any) => {
        // Si es el plato que estamos editando, le actualizamos sus ProductFittings
        if (product.productId === productId) {
          return {
            ...product,
            ProductFittings: updatedFittings,
          };
        }
        return product;
      },
    );

    // 2. Guardamos el nuevo estado en tu setter de React
    setSelectedPromo({
      ...selectedPromo,
      productDetailProduct: updatedProducts,
    });
  };

  const handleAddProductToPromo = () => {
    const selectedProduct = productsList.find((p: any) => p.id === formProductId);
    if (!selectedProduct) return;

    const newSubProduct = {
      // id: Date.now(),
      id: selectedProduct.id,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price:
        formModifiedPrice !== "" ? formModifiedPrice : selectedProduct.price,
      reasonModification: formReason.trim() || null,
      quantity: formQuantity,
      productFittings: selectedFittings.map(id => CONSTANT_PRODUCT_FITTING.find(f => f.id === id)).filter(Boolean),
      state: true
    };
    setSelectedPromo({
      ...selectedPromo,
      productDetailProduct: [
        ...(selectedPromo.productDetailProduct || []),
        newSubProduct,
      ],
    });

    setFormProductId("");
    setFormQuantity(1);
    setSelectedFittings([]);
    setFormReason("");
    setFormModifiedPrice("");

    const currentToastBody = {
      type: ToastType.Successfully,
      message: "Exito",
      description: `Se agrego el producto ${selectedProduct.name} al combo`,
    };
    toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);

  };

  const promoColumns: Column<any>[] = [
    {
      header: "Producto",
      accessor: "name",
    },
    {
      header: "Cant",
      accessor: (item) => (
        <span className="font-semibold">{item.quantity} u</span>
      ),
    },
    {
      header: "Acomp",
      accessor: (item: any) => {
        const guarniciones = item.productFittings;

        // Validamos que sea un array y tenga elementos
        if (Array.isArray(guarniciones) && guarniciones.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {guarniciones.map((g: ProductFittings, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {g.name}
                </span>
              ))}
            </div>
          );
        }

        return <span className="text-slate-400 text-xs italic">Ninguna</span>;
      },
    },
    {
      /* 👇 NUEVA COLUMNA ADICIONADA */
      header: "Obs",
      accessor: (item) => (
        <span className="text-slate-600 font-medium text-xs break-words max-w-[150px] block">
          {item.reasonModification || (
            <span className="text-slate-300 italic">Ninguna</span>
          )}
        </span>
      ),
    },
  ];

  const handleRemoveProductFromPromo = (itemToDelete: any) => {
    const updatedSubProducts = (selectedPromo.productDetailProduct || []).filter(
      (item: any) => item.id !== itemToDelete.id
    );

    setSelectedPromo({
      ...selectedPromo,
      productDetailProduct: updatedSubProducts,
    });
  };

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
                key={item.id}
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
                            id: item.id,
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
                            id: item.id,
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
                            id: item.id,
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
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="cursor-pointer text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <p className="font-semibold text-rest-primary text-sm whitespace-nowrap">
                      {/* Bs {(item.price * item.quantity).toString()} */}
                      Bs{" "}
                      {(
                        item.modifiedSubtotal ?? item.price * item.quantity
                      ).toString()}
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

      {isPromoModalOpen && selectedPromo && (
        <ResponsiveModal
          isOpen={isPromoModalOpen}
          onClose={() => setIsPromoModalOpen(false)}
          onConfirm={handleSavePromoConfig}
          title={selectedPromo?.name || "Detalle de Promoción"}
          subtitle="Personaliza los platos incluidos en este combo"
          confirmText="Confirmar"
          size="lg"
        >
          {/* 🌟 NUEVA SECCIÓN: Modificar Datos del Producto Principal (Combo) */}
          <div className="bg-yellow-50/60 p-4 rounded-xl border border-yellow-200 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-xs font-bold text-yellow-800 uppercase tracking-wide">
                Precio (Bs)
              </label>
              <input
                onFocus={(e) => e.target.select()}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                value={
                  selectedPromo.modifiedSubtotal ??
                  selectedPromo.price * (selectedPromo.quantity || 1)
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, '');
                  const parts = raw.split('.');
                  let sanitized = parts[0];
                  if (parts.length > 1) sanitized += '.' + parts.slice(1).join('');
                  const newPrice = sanitized === '' ? 0 : parseFloat(sanitized);
                  setSelectedPromo({
                    ...selectedPromo,
                    price: selectedPromo.price * (selectedPromo.quantity || 1),
                    modifiedSubtotal: isNaN(newPrice) ? 0 : newPrice,
                  });
                }}
                className="w-full p-2 bg-white border border-yellow-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 font-bold text-slate-800 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-yellow-800 uppercase tracking-wide">
                Motivo Cambio
              </label>
              <input
                type="text"
                value={selectedPromo.reasonModification || ""}
                onChange={(e) => {
                  setSelectedPromo({
                    ...selectedPromo,
                    reasonModification: e.target.value,
                  });
                }}
                className="w-full p-2 bg-white border border-yellow-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 text-sm font-medium text-slate-700"
                placeholder="Ej: Descuento autorizado por administrador / Ajuste de precio..."
              />
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-4">
            <p className="font-semibold text-xs text-[#052A3D] uppercase tracking-wider">
              Agregar Plato al Combo
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <DropdownSearchable
                  label="Seleccionar Producto"
                  placeholder="-- Elige un plato o escribe para buscar --"
                  value={formProductId}
                  onChange={(id) => setFormProductId(id)}
                  options={productsList.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                  }))}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">
                  Cantidad
                </label>
                <input
                  onFocus={(e) => e.target.select()}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formQuantity}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    const num = raw === '' ? 1 : Math.max(1, parseInt(raw, 10));
                    setFormQuantity(num);
                  }}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 text-center"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-3">
                <label className="text-xs text-slate-500 font-medium">
                  Observación
                </label>
                <input
                  type="text"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Ej: Sin cebolla, término medio, cambio de ingrediente..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 text-sm text-slate-700"
                />
              </div>
            </div>
            {/* 3. Selección Interactiva de Guarniciones (Se mantiene igual que antes) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-medium">
                Guarniciones de Acompañamiento
              </label>
              <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 bg-white p-2.5 rounded-lg border border-slate-200 w-full overflow-x-auto">
                {CONSTANT_PRODUCT_FITTING.map((fitting) => {
                  const isActive = selectedFittings.includes(fitting.id);
                  const handleToggleImage = () => {
                    if (isActive) {
                      setSelectedFittings(
                        selectedFittings.filter((id) => id !== fitting.id),
                      );
                    } else {
                      setSelectedFittings([...selectedFittings, fitting.id]);
                    }
                  };

                  return (
                    <button
                      key={fitting.id}
                      type="button"
                      onClick={handleToggleImage}
                      className="flex-1 min-w-[64px] focus:outline-none transition-transform active:scale-95 flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <img
                        src={fitting.imageUrl ?? ""}
                        alt={fitting.name}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 shadow-sm transition-all duration-200 ${isActive
                          ? "border-yellow-400 opacity-100 scale-105"
                          : "border-transparent opacity-30 grayscale"
                          }`}
                      />
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold text-center truncate w-full ${isActive ? "text-yellow-600" : "text-slate-400"}`}
                      >
                        {fitting.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <ButtonGeneric
                variant="confirmYellow"
                onClick={handleAddProductToPromo}
                disabled={!formProductId}
              >
                + Agregar a la Lista
              </ButtonGeneric>
            </div>
          </div>

          {/* 📊 TABLA RESUMEN INFERIOR (Muestra los subproductos normales) */}
          <div className="space-y-2">
            <p className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
              Componentes del Combo actual
            </p>
            <GenericDataTable
              columns={promoColumns}
              data={selectedPromo?.productDetailProduct || []}
              showActions={true}
              actions={{
                onDelete: handleRemoveProductFromPromo
              }}
              rowKey="id"
            />
          </div>
        </ResponsiveModal>
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
        needsInvoice={needsInvoice}
        setNeedsInvoice={setNeedsInvoice}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        onOpenCreateClientModal={() => {
          console.log("Abrir modal de nuevo cliente");
        }}
        changeSubTotal={handleChangeSubTotal}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        orderType={orderType}
        setOrderType={setOrderType}
      />
    </>
  );
}
