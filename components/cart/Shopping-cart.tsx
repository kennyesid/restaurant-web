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
import { createSale } from "@/services/salesService";
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

export function ShoppingCart() {
  const dispatch = useAppDispatch();
  // const { user } = useAppSelector((state) => state.auth);

  const [showSummary, setShowSummary] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<any | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderTypeEnum>(OrderTypeEnum.CONSUMO_LOCAL);

  // const { items, paymentType } = useAppSelector((state) => state.cart) as {
  //   items: CartItem[];
  //   paymentType: string;
  // };
  const { items, paymentType, user } = useAppSelector((state) => ({
    items: state.cart.items,
    paymentType: state.cart.paymentType,
    user: state.auth.user
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
    nit: ""
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
    debugger;
    let userSendId = 0;
    if (items.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    setIsProcessing(true);
    try {
      // const saleItems = items.map((item) => ({
      //   productId: item.productId,
      //   name: item.name,
      //   quantity: item.quantity,
      //   price: item.price,
      //   categoryId: item.categoryId,
      //   productDetailProduct: item.productDetailProduct,
      //   isCountable: item.isCountable
      // }));

      const saleItems = items.flatMap((item) => {
        const mainItem = {
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          categoryId: item.categoryId,
          productDetailProduct: item.productDetailProduct,
          isCountable: true,
          // isCountable: item.isCountable ?? false,
        };
        const isPromo = item.isPromotion || (item.productDetailProduct && item.productDetailProduct.length > 0);

        if (isPromo && item.productDetailProduct) {
          const flatSubProducts = item.productDetailProduct.map((sub: any) => ({
            productId: sub.productId,
            name: `${sub.name} ${sub.productFittings && sub.productFittings.length > 0 ? `(${sub.productFittings.join(", ")})` : ""}`,
            quantity: 0,
            price: 0,
            categoryId: sub.categoryId || item.categoryId,
            productFitting: sub.productFittings || [],
            isCountable: false,
            productDetailProduct: undefined
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

      const response = await createSale({
        detail: saleItems,
        paymentType: paymentType as any,
        userId: user?.id || 1,
        userCustomerId: userSendId,
        userName: selectedClient?.fullName ?? "SIN NOMBRE",
        userDocument: selectedClient?.nit ?? "0",
        orderNumber: 1,
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
      cartItem.productId === selectedPromo.productId ? selectedPromo : cartItem,
    );
    handleChangeSubTotal(updatedCartItems);
    setIsPromoModalOpen(false);
  };

  const handlePromoSelected = (item: CartItem) => {
    setSelectedPromo(item);
    setIsPromoModalOpen(true);
    // setPromoColumns(promoColumns);
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

  // CHANGE FORM
  // Estados locales para el mini-formulario dentro del modal
  const [formProductId, setFormProductId] = useState<number | "">("");
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [selectedFittings, setSelectedFittings] = useState<number[]>([]); // Guarda los IDs [1, 2, 3] activos

  // 💡 TU NUEVA FUNCIÓN PARA AGREGAR EL PLATO CONFIGURADO AL ARRAY DE LA PROMO
  const handleAddProductToPromo = () => {
    if (!formProductId || !selectedPromo) return;

    // Supongamos que tienes una lista global con todos los platos disponibles para el dropdown (ej: listadoBaseProductos)
    // Reemplaza 'listadoBaseProductos' por el nombre de tu array de productos del backend
    const baseProduct = productsList.find((p: any) => p.productId === formProductId);
    if (!baseProduct) return;

    // Convertimos los IDs de guarniciones seleccionadas en strings para tu interfaz ProductFittings?: string[]
    const namesOfFittings = CONSTANT_PRODUCT_FITTING
      .filter(f => selectedFittings.includes(f.id))
      .map(f => f.name || "");

    // Creamos el nuevo objeto con la interfaz ProductDetailProduct
    const newSubProduct: ProductDetailProduct = {
      id: Date.now(), // ID temporal para la fila
      productId: baseProduct.productId,
      name: baseProduct.name,
      price: baseProduct.price,
      quantity: formQuantity,
      productFittings: namesOfFittings, // ["Arroz", "Papa"]
      imageUrl: baseProduct.imageUrl,
      state: true
    };

    // Actualizamos el estado general agregando el plato a la lista
    setSelectedPromo({
      ...selectedPromo,
      productDetailProduct: [...(selectedPromo.productDetailProduct || []), newSubProduct]
    });

    // Limpiamos el formulario para el siguiente registro
    setFormProductId("");
    setFormQuantity(1);
    setSelectedFittings([]);
  };
  // CHANGE FORM FIN


  const promoColumns: Column<any>[] = [
    {
      header: "Plato",
      accessor: "name",
    },
    {
      header: "Cantidad",
      accessor: (item) => <span className="font-semibold">{item.quantity} u</span>,
    },
    {
      header: "Guarniciones Seleccionadas",
      accessor: (item) => (
        <div className="flex flex-wrap gap-1.5">
          {item.ProductFittings && item.ProductFittings.length > 0 ? (
            item.ProductFittings.map((fittingName: string, index: number) => (
              <span key={index} className="px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-medium">
                {fittingName}
              </span>
            ))
          ) : (
            <span className="text-slate-300 italic text-xs">Sin guarnición</span>
          )}
        </div>
      ),
    },
  ];

  // const promoColumns: Column<any>[] = [
  //   {
  //     header: "Plato",
  //     accessor: "name",
  //   },
  //   {
  //     header: "Precio Ref.",
  //     accessor: (item) => <span className="text-slate-400">Bs {item.price}</span>,
  //   },
  //   {
  //     header: "Cantidad",
  //     accessor: (item) => {
  //       // Buscamos el valor más fresco directamente desde el estado reactivo 'selectedPromo'
  //       const currentSubItem = selectedPromo?.productDetailProduct?.find(
  //         (sub: any) => sub.productId === item.productId
  //       );

  //       return (
  //         <div className="flex justify-center">
  //           <input
  //             type="number"
  //             min="0"
  //             value={currentSubItem ? currentSubItem.quantity : item.quantity}
  //             onChange={(e) =>
  //               handleUpdatePromoQuantity(item.productId, parseInt(e.target.value) || 0)
  //             }
  //             className="w-16 text-center border border-border rounded p-1 bg-gray-50 focus:ring-2 focus:ring-yellow-400 outline-none"
  //           />
  //         </div>
  //       );
  //     },
  //   },
  // ];

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
          confirmText="Confirmar"
          size="lg"
        >
          {/* 🛠️ CONTENEDOR DEL FORMULARIO INYECTOR */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-4">
            <p className="font-semibold text-xs text-[#052A3D] uppercase tracking-wider">Agregar Plato al Combo</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. Dropdownlist de Selección */}
              <div className="md:col-span-2 flex flex-col gap-1">
                {/* <label className="text-xs text-slate-500 font-medium">Seleccionar Producto</label> */}
                {/* 1. Reemplazo del viejo select por el nuevo DropdownSearchable */}
                <div className="md:col-span-2">
                  <DropdownSearchable
                    label="Seleccionar Producto"
                    placeholder="-- Elige un plato o escribe para buscar --"
                    value={formProductId}
                    onChange={(id) => setFormProductId(id)}
                    options={productsList.map((p: any) => ({
                      id: p.productId, // Conversión rápida a la interfaz que espera el componente
                      name: p.name,
                      price: p.price,
                    }))}
                  />
                </div>
                {/* <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(Number(e.target.value) || "")}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">-- Elige un plato --</option>
                  {productsList?.map((p: any) => (
                    <option key={p.productId} value={p.productId}>
                      {p.name} (Bs {p.price})
                    </option>
                  ))}
                </select> */}
              </div>

              {/* 2. Input de Cantidad */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 text-center"
                />
              </div>
            </div>

            {/* 3. Selección Interactiva de Guarniciones */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-medium">Guarniciones de Acompañamiento</label>
              <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 bg-white p-2.5 rounded-lg border border-slate-200 w-full overflow-x-auto">
                {CONSTANT_PRODUCT_FITTING.map((fitting) => {
                  const isActive = selectedFittings.includes(fitting.id);
                  const handleToggleImage = () => {
                    if (isActive) {
                      setSelectedFittings(selectedFittings.filter(id => id !== fitting.id));
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
                      <span className={`text-[9px] sm:text-[10px] font-bold text-center truncate w-full ${isActive ? "text-yellow-600" : "text-slate-400"
                        }`}>
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
              {/* <button
                type="button"
                onClick={handleAddProductToPromo}
                disabled={!formProductId}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-[#052A3D] font-bold rounded-lg text-xs shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                + Agregar a la Lista
              </button> */}
            </div>
          </div>

          {/* 📊 TABLA RESUMEN INFERIOR */}
          <div className="space-y-2">
            <p className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Componentes del Combo actual</p>
            <GenericDataTable
              columns={promoColumns}
              data={selectedPromo?.productDetailProduct || []}
              showActions={false}
              rowKey="id"
            />
          </div>
        </ResponsiveModal>
        // <ResponsiveModal
        //   isOpen={isPromoModalOpen}
        //   onClose={() => setIsPromoModalOpen(false)}
        //   onConfirm={handleSavePromoConfig}
        //   title={selectedPromo?.name || "Detalle de Promoción"}
        //   subtitle="Personaliza los platos incluidos en este combo"
        //   confirmText="Confirmar"
        //   size="lg"
        // >
        //   <GenericDataTable
        //     columns={promoColumns}
        //     data={selectedPromo?.productDetailProduct || []}
        //     showActions={false}
        //     rowKey="id"
        //   />
        // </ResponsiveModal>
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
        orderType={orderType}
        setOrderType={setOrderType}
      />
    </>
  );
}
