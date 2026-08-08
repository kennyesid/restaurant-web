"use client";

import { useAppDispatch, useAppSelector } from "@/store/store/hooks";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  setPaymentType,
  updateCartItems,
  toggleCartSide,
  updateCartItemDetail,
} from "@/store/store/slices/cartSlice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createSale,
  createSaleCombo,
  obtenerSiguienteOrdenDiariaSupabase,
} from "@/services/salesService";
import { toast } from "sonner";
// SelectedProduct
import { CartItem, CartItemDetail, OrderTypeSend, ProductDetailProduct, Sale, ShoppingCartProps } from "@/types";
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
import { ProductFittings } from "@/types/product/productFittings";
import { getProducts } from "@/services/productsSservice";
import { Product } from "@/types";
import { DropdownSearchable, RestaurantTicket } from "@/components/common";
import { OrderTypeEnum } from "@/types/enum/orderTypeEnum";
import { ApiService } from "@/services/apiService";
import { DateUtils } from "@/utils/date-utils";
import { parameterService } from "@/services/parameterService";
import RoleGuard from "../auth/RoleGuard";
import { PaymentTypeEnum } from "@/types/enum/paymentTypeEnum";
import { ProductFittingsService } from "@/services/productFittingsService";
import { getProductsByMainId } from "@/services/productByProducts";
import { getOrderTypes } from "@/services/parameter/orderTypeSendService";
import { configService } from "@/services/configService";

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
  const [showTicket, setShowTicket] = useState(false);
  const [createdSale, setCreatedSale] = useState<Sale | null>(null);
  const [productFittings, setProductFittings] = useState<ProductFittings[]>([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [saleData, setSaleData] = useState<Sale | null>(null);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [selectedDishIndex, setSelectedDishIndex] = useState<CartItemDetail | null>(null);
  // const [selectedDishIndex, setSelectedDishIndex] = useState<CartItemDetailDetails | null>(null);
  const [openDish, setOpenDish] = useState(false);
  const [promoRows, setPromoRows] = useState<CartItemDetail[]>([]);
  const [table, setTable] = useState<number>(1);
  const [adminPermision, setAdminPermision] = useState<boolean>(false);
  // const [promoRows, setPromoRows] = useState<CartItemDetailDetails[]>([]);

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
  const [selectedClient, setSelectedClient] = useState<any>({
    id: 1,
    fullName: "",
    nit: "",
  });
  const [customNit, setCustomNit] = useState("");
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [orderTypeSendList, setOrderTypeSendList] = useState<OrderTypeSend[]>([]);
  const [selectedOrderTypeSend, setSelectedOrderTypeSend] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productFittings = await ProductFittingsService.getAll();
        setProductFittings(productFittings);
        const data = await getProducts();
        // const onlySingleProducts = data.filter((p) => !p.isPromotion);
        const onlySingleProducts = data;
        setProductsList(onlySingleProducts);
        const timeoutValue = configService.getParameterValue('PERMISION_SHIPPING_CART');
        setAdminPermision(timeoutValue === '1');
      } catch (error) {
        console.error("Error al cargar los productos en el modal:", error);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (isPromoModalOpen && selectedPromo?.productId) {
      const loadOrderTypes = async () => {
        const types = await getOrderTypes();
        setOrderTypeSendList(types);
      };
      loadOrderTypes();
    }
  }, [isPromoModalOpen, selectedPromo?.productId]);

  let total = items.reduce(
    (sum, item) => sum + (item.modifiedSubtotal ?? item.price * item.quantity),
    0,
  );

  const changeReturned = amountPaid > total ? amountPaid - total : 0;

  const handleCheckout = async () => {
    let userSendId = 0;
    if (items.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }
    setIsProcessing(true);
    try {
      console.log("carrito", JSON.stringify(items));
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
            groupId: user?.groupId ?? 1,
            groupCode: user?.groupCode ?? "",
          });
          userSendId = selectedClientResponse.id;
        } else {
          userSendId = selectedClient.id;
        }
      }

      const updatedItems = await Promise.all(
        items.map(async (currentItem) => {
          // Si no es categoría 6, devolvemos el ítem tal cual
          if (currentItem.categoryId !== 6) return currentItem;

          // 2. Verificar si ya tiene detalles con productos seleccionados
          const hasSelectedProducts = currentItem.cartItemDetail?.some(
            (detail) => detail.productDetailProduct?.some((p) => p.selected)
          );

          // 3. Si NO tiene una configuración previa, generamos la estructura por defecto
          if (!hasSelectedProducts) {
            console.log("Configurando productos por defecto para la promoción/combo...");

            // Obtener los productos dependientes del plato principal
            const productByProducts: Product[] = await getProductsByMainId(currentItem.productId);

            // Mapear los productos para que vengan seleccionados por defecto
            const defaultSelectedProducts: ProductDetailProduct[] = productByProducts.map((product) => ({
              ...product,
              productId: product.id,
              groupId: product.groupId ?? 0,
              selected: true, // Auto-seleccionado
            }));

            // Generar los platos según la cantidad que lleva en el carrito (ej: 2 platos si quantity es 2)
            const autoGeneratedDetails: CartItemDetail[] = Array.from(
              { length: currentItem.quantity },
              (_, dishIndex) => ({
                id: dishIndex + 1,
                cartItemId: currentItem.id,
                name: `Plato ${dishIndex + 1}`,
                price: 0,
                categoryId: currentItem.categoryId,
                productId: currentItem.productId,
                quantity: 1,
                modified: false,
                subTotal: 0,
                modifiedSubtotal: 0,
                reasonModification: "",
                orderTypeSend: "",
                // isPromotion: false,
                // isCountable: true,
                productFittings: [],
                productDetailProduct: defaultSelectedProducts, // Asignar la lista auto-seleccionada
                imageUrl: "",
                completed: true,
                selected: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                state: true,
              })
            );

            // Devolvemos un nuevo objeto ítem con los detalles generados (sin mutar el original)
            return {
              ...currentItem,
              cartItemDetail: autoGeneratedDetails
            };
          }

          // Si ya tenía productos configurados, lo devolvemos tal cual
          return currentItem;
        })
      );

      const numeroOrdenCalculado = await obtenerSiguienteOrdenDiariaSupabase();

      const newSaleData: Omit<Sale, "id" | "createdAt" | "updatedAt"> = {
        detail: updatedItems,
        // detail: items,
        // detail: normalizedItems,
        paymentType: paymentType as PaymentTypeEnum,
        userId: user?.id || 0,
        groupId: user?.groupId || 0,
        userName: user?.fullName,
        userCustomerId: 1,
        userCustomerName: selectedClient?.fullName ?? "S/N",
        userDocument: selectedClient?.nit ?? "0",
        orderNumber: numeroOrdenCalculado,
        orderStatus: OrderStatusEnum.EN_COCINA,
        tenantId: 1,
        state: true,
        total: total,
        amountPaid: amountPaid,
        changeReturned: changeReturned,
        orderType: orderType as OrderTypeEnum,
        // shift: getCurrentShift(),
        table: table
      };
      console.log('SAVE_TO_DATABASE :: ' + JSON.stringify(newSaleData))
      const response = await createSaleCombo(newSaleData);
      const isSuccess = response.codigo >= 200 && response.codigo <= 299;
      const currentToastBody = {
        type: isSuccess ? ToastType.Successfully : ToastType.Fail,
        message: isSuccess ? "Exito" : "Error",
        description: isSuccess
          ? "Venta realizada satisfactoriamente."
          : response.mensaje,
        image: null,
      };

      toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />, { position: "top-center" });

      if (!isSuccess) {
        return;
      }

      setSaleData(newSaleData as Sale);
      setIsTicketModalOpen(true);

      try {
        const printPayload = {
          detail: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            // price: item.isCountable ? item.price : 0,
            price: item.price,
            categoryId: item.categoryId,
            reasonModification: item.reasonModification || "",
            // isCountable: item.isCountable,
            productFittings: Array.isArray((item as any).productFittings)
              ? (item as any).productFittings.map((f: any) => f.name || f)
              : [],
            productDetailProduct: Array.isArray(item.productDetailProduct)
              ? item.productDetailProduct.map((sub: any) => ({
                id: sub.id,
                productId: sub.productId || 0,
                name: sub.name,
                price: 0,
                reasonModification: sub.reasonModification || "",
                quantity: sub.quantity || 0,
                productFittings: Array.isArray(sub.productFittings)
                  ? sub.productFittings.map((f: any) => f.name || f)
                  : [],
                state: sub.state ?? true,
              }))
              : [],
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
          // shift: getCurrentShift(),
          createdAt: DateUtils.obtenerFechaBoliviaISO(),
          updatedAt: DateUtils.obtenerFechaBoliviaISO(),
        };

        const urlImpresion = await parameterService.obtenerValorUrl(
          "API_PRINT_URL",
          "http://localhost/restauranteapi/api/Print/PrintRestaurant",
        );

        const response = await ApiService.post(
          urlImpresion,
          printPayload,
        );
      } catch (printError) {
        console.error("Error en el servicio de impresión física:", printError);
        toast.error(
          "La venta se guardó, pero hubo un problema con la ticketera.",
        );
      }
    } catch (error) {
      console.error("Error al procesar la venta", error);
      toast.error(
        "hubo un problema con la transacción.",
      );
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

  const handleDishClick = (cartDetail: CartItemDetail) => {

    if (cartDetail?.productDetailProduct?.length) {
      setOpenDish(true)
    }

    setSelectedOrderTypeSend(cartDetail?.orderTypeSend ?? null);
    setFormReason(cartDetail?.reasonModification ?? "");
    setSelectedDishIndex(cartDetail);
  };

  const handleAcceptPromo = () => {

    if (!selectedPromo) return;

    if (!selectedDishIndex) {
      toast.error("Seleccione un plato primero.");
      return;
    }

    const plateIndex = promoRows.findIndex((p) => p.id === selectedDishIndex.id);
    if (plateIndex === -1) {
      toast.error("El plato seleccionado no existe.");
      return;
    }
    const currentPlate = promoRows[plateIndex];
    const updatedPlate: CartItemDetail = {
      ...currentPlate,
      productDetailProduct: selectedDishIndex?.productDetailProduct,
      reasonModification: formReason || currentPlate.reasonModification,
      orderTypeSend: selectedOrderTypeSend,
      completed: true,
      selected: true,
    };
    const updatedRows = [...promoRows];
    updatedRows[plateIndex] = updatedPlate;
    setPromoRows(updatedRows);
    setSelectedDishIndex(null);
    setOpenDish(false);
    setFormReason("");
    setSelectedOrderTypeSend(null);
    toast.success("Productos agregados al plato correctamente.");
  };

  const handleSelectProductForDish = (product: ProductDetailProduct) => {
    setSelectedDishIndex((prev: any) => {
      if (!prev) return prev;
      const updatedProducts = prev.productDetailProduct.map((p: any) =>
        p.id === product.id ? { ...p, selected: !p.selected } : p
      );
      return { ...prev, productDetailProduct: updatedProducts };
    });
  };

  const handleSavePromoConfig = () => {
    dispatch(
      updateCartItemDetail({
        id: selectedPromo.id,
        cartItemDetail: promoRows
      })
    );
    setIsPromoModalOpen(false);
  }

  const handlePromoSelected = async (item: CartItem) => {
    setSelectedPromo(item);
    setOpenDish(false);

    const productByProducts: Product[] = await getProductsByMainId(item.productId);
    const productMap = new Map<number, Product>();
    productByProducts.forEach(p => productMap.set(p.id, p));

    const existingPlates = item.cartItemDetail || [];

    let initialDetails: CartItemDetail[] = [];

    const selectedProducts: ProductDetailProduct[] = productByProducts.map((product) => ({
      ...product,
      productId: product.id,
      groupId: product.groupId ?? 0,
      selected: false,
    }));

    if (existingPlates.length > 0) {
      const platesToUse = existingPlates.slice(0, item.quantity);

      initialDetails = platesToUse.map((plate) => {
        const productDetail: ProductDetailProduct[] = (plate.productDetailProduct || []).map((prod: any) => {
          const fullProduct = productMap.get(prod.id);
          return {
            ...(fullProduct || prod),
            selected: prod.selected ?? false,
          };
        });

        return {
          ...plate,
          productDetailProduct: productDetail,
          completed: (productDetail.some(p => p.selected === true)) ? true : false,
        };
      });

      const remaining = item.quantity - initialDetails.length;
      if (remaining > 0) {
        const emptyPlates: CartItemDetail[] = Array.from(
          { length: remaining },
          (_, index) => ({
            id: initialDetails.length + index + 1,
            cartItemId: item.id,
            name: `Plato ${initialDetails.length + index + 1}`,
            price: 0,
            categoryId: item.categoryId,
            productId: item.productId,
            quantity: 1,
            modified: false,
            subTotal: 0,
            modifiedSubtotal: 0,
            reasonModification: "",
            orderTypeSend: item.orderTypeSend,
            productFittings: [],
            productDetailProduct: selectedProducts, // Todos los productos disponibles
            imageUrl: "",
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            state: true,
          })
        );
        initialDetails = [...initialDetails, ...emptyPlates];
      }
    }
    else {
      initialDetails = Array.from(
        { length: item.quantity },
        (_, index) => ({
          id: index + 1,
          cartItemId: item.id,
          name: productByProducts.length ? `Plato ${index + 1}` : item.name,
          price: 0,
          categoryId: item.categoryId,
          productId: item.productId,
          quantity: 1,
          modified: false,
          subTotal: 0,
          modifiedSubtotal: 0,
          reasonModification: "",
          orderTypeSend: null,
          productFittings: [],
          productDetailProduct: selectedProducts,
          imageUrl: "",
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          state: true,
        })
      );
    }

    setPromoRows(initialDetails);

    setSelectedDishIndex(initialDetails[0]);
    if (initialDetails[0]?.productDetailProduct?.length) {
      setOpenDish(true)
    }
    setIsPromoModalOpen(true);
    setFormReason(initialDetails[0]?.reasonModification ?? "");
    setFormModifiedPrice(initialDetails[0]?.modifiedSubtotal ?? "");
  };

  const promoColumns: Column<any>[] = [
    {
      header: "Producto",
      accessor: (item: CartItemDetail) => (
        <div className="space-y-1">
          <div className="font-semibold">{item.name}</div>
          {item.productDetailProduct
            ?.filter((detail: any) => detail.selected === true)
            .map((detail: any) => (
              <div key={detail.id || `${item.id}-${detail.productId}`} className="ml-4 text-xs text-slate-500">
                • {detail.name}
              </div>
            ))}
        </div>
      ),
    },
    {
      header: "Cant",
      accessor: (item) => (<span className="font-semibold">{item.quantity} u</span>),
    },
    {
      header: "Observacion",
      accessor: (item: CartItemDetail) => {
        // Evaluación del tipo de envío
        const type = item.orderTypeSend;
        const isParaLlevar =
          type &&
          (type.toUpperCase().includes("LLEVAR") ||
            type.toUpperCase() === "PARA_LLEVAR");

        const sendLabel = isParaLlevar ? "Para Llevar" : "En Mesa";

        return (
          <div className="flex flex-col gap-1 items-start max-w-[140px]">

            {type ? (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${isParaLlevar
                  ? "bg-orange-100 text-orange-700 border border-orange-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}
              >
                {sendLabel}
              </span>
            ) : (
              <span className="text-slate-300 italic text-xs">-</span>
            )}

            <span className="text-slate-600 font-medium text-xs break-words leading-tight">
              {item.reasonModification ? (
                item.reasonModification
              ) : (
                <span className="text-slate-300 italic">Sin obs.</span>
              )}
            </span>
          </div>
        );
      },
    }
  ];

  const handleSelect = (typeCode: string) => {
    if (selectedOrderTypeSend === typeCode) {
      setSelectedOrderTypeSend(null);
    } else {
      setSelectedOrderTypeSend(typeCode);
    }
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
                      className={`relative h-12 w-12 rounded-md bg-muted overflow-hidden flex-shrink-0 border transition-all ${item
                        ? "border-rest-yellow ring-2 ring-rest-yellow/20 cursor-pointer hover:opacity-80 scale-105 z-10"
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
                      {/* {item.isPromotion && (
                        <span className="absolute bottom-0 right-0 bg-rest-yellow text-[8px] text-rest-primary font-black px-1 rounded-tl-sm uppercase tracking-tighter">
                          OPCION
                        </span>
                      )} */}
                    </div>

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
                      Bs {(item.modifiedSubtotal ?? item.subTotal ?? 0).toString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* ROJO REVISAR QR */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-4">
            {/* <div>
              <label className="block text-sm font-medium mb-2 text-rest-primary">
                Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["cash", "qr", "mixed"].map((method) => (
                  <button
                    key={method}
                    onClick={() => dispatch(setPaymentType(method as any))}
                    className={`py-2 px-3 text-sm font-medium transition-colors cursor-pointer rounded-md text-center ${paymentType === method
                      ? "bg-[#facc15] text-rest-primary"
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
            </div> */}

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
          size="4xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

            {/* ========================================== */}
            {/* SECCIÓN IZQUIERDA: TABLA DE RESUMEN DE PROMOS*/}
            {/* ========================================== */}
            <div className="lg:col-span-5 w-full">
              {promoRows.length > 0 && (
                <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                  <GenericDataTable
                    columns={promoColumns}
                    data={promoRows}
                    showActions={true}
                    rowKey="id"
                  />
                </div>
              )}
            </div>
            {/* ========================================== */}
            {/* SECCIÓN DERECHA: FORMULARIO Y SELECCIÓN  */}
            {/* ========================================== */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {adminPermision && (
                <div className="bg-yellow-50/60 p-4 rounded-xl border border-yellow-200 grid grid-cols-1 md:grid-cols-3 gap-3">
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
                        const raw = e.target.value.replace(/[^0-9.]/g, "");
                        const parts = raw.split(".");
                        let sanitized = parts[0];
                        if (parts.length > 1)
                          sanitized += "." + parts.slice(1).join("");
                        const newPrice = sanitized === "" ? 0 : parseFloat(sanitized);
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
              )}
              {promoRows.length > 0 && (
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                  {/* Grid principal de 12 columnas */}
                  <div className="grid grid-cols-12 gap-4 items-start">

                    {/* SECCIÓN IZQUIERDA (6 de 12): Comentario + Botones */}
                    <div className="col-span-12 md:col-span-6 flex flex-col gap-3">
                      {/* Comentario */}
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-xs text-slate-500 font-medium">
                          Comentario:
                        </label>
                        <input
                          type="text"
                          value={formReason}
                          onChange={(e) => setFormReason(e.target.value)}
                          placeholder="Ej: Sin cebolla, término medio..."
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 text-sm text-slate-700 h-[38px]"
                        />
                      </div>

                      {/* Botones orderTypeSendList */}
                      <div className="flex gap-2 w-full">
                        {orderTypeSendList.map((type) => {
                          const valueToSelect = type.code || type.name;
                          const isSelected = selectedOrderTypeSend === valueToSelect;

                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => handleSelect(valueToSelect)}
                              aria-pressed={isSelected}
                              className={`w-1/2 px-3 py-2 text-xs md:text-sm font-medium rounded-lg border-2 transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#052a3d]/30 text-center ${isSelected
                                ? "bg-[#052a3d] border-[#052a3d] text-white shadow-sm"
                                : "bg-white border-gray-200 text-gray-700 hover:border-[#052a3d] hover:bg-gray-50"
                                }`}
                            >
                              {type.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECCIÓN DERECHA (6 de 12): Selección de Plato */}
                    <div className="col-span-12 md:col-span-6 flex flex-col gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4">
                      <p className="font-semibold text-base text-[#052A3D] tracking-wider text-center">
                        Seleccione un Plato
                      </p>

                      <div className="flex flex-wrap justify-center gap-3">
                        {promoRows.map((plate, index) => {
                          const isSelected = selectedDishIndex?.id === plate.id;
                          return (
                            <div
                              key={plate.id}
                              onClick={() => handleDishClick(plate)}
                              className={`relative w-14 h-14 rounded-lg overflow-hidden shadow-sm flex-shrink-0 cursor-pointer hover:opacity-80 transition ${isSelected
                                ? "border-2 border-green-500 ring-2 ring-green-300"
                                : "bg-gray-300 border-2 border-transparent"
                                }`}
                            >
                              <Image
                                src="/images/others/select-dish.avif"
                                alt={`Plato ${index + 1}`}
                                fill
                                className={`w-full h-full object-cover transition ${isSelected || plate.completed
                                  ? "opacity-100 saturate-100"
                                  : "opacity-40 grayscale"
                                  }`}
                              />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-white text-2xl md:text-3xl font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                                  {plate.id}
                                </span>
                              </div>

                              {plate.completed && (
                                <div className="absolute top-0.5 right-0.5 bg-green-500 text-white rounded-full p-0.5 shadow-md">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECCIÓN OPEN DISH (Ocupa las 12 columnas debajo) */}
                    {openDish && (
                      <div className="col-span-12 flex flex-wrap justify-center gap-3 my-1 border-t border-gray-100 pt-3">
                        {selectedDishIndex?.productDetailProduct?.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleSelectProductForDish(product)}
                            className={`group relative flex flex-col items-center p-0 rounded-xl transition-all border text-center w-25 h-25 ${product.selected
                              ? "bg-blue-50/50 border-blue-500 shadow-sm ring-1 ring-blue-500"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                              }`}
                          >
                            <div
                              className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${product.selected
                                ? "border-green-500 ring-2 ring-green-300 shadow-lg"
                                : "border-gray-200 opacity-60 hover:opacity-100"
                                }`}
                            >
                              <Image
                                src={
                                  product.imageUrl || "/images/others/select-dish.avif"
                                }
                                alt={product.name ?? ""}
                                fill
                                className={`object-cover transition ${product.selected
                                  ? "opacity-100 saturate-100"
                                  : "opacity-40 grayscale"
                                  }`}
                              />
                              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                                <span
                                  className={`block text-base font-medium text-center text-white line-clamp-2 ${product.selected ? "font-semibold" : ""
                                    }`}
                                >
                                  {product.name}
                                </span>
                              </div>
                              {product.selected && (
                                <div className="absolute top-1.5 right-1.5 bg-green-500 text-white rounded-full p-1 shadow-md z-10">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* SECCIÓN BOTÓN FINAL (Ocupa las 12 columnas abajo a la derecha) */}
                    <div className="col-span-12 flex justify-end pt-1">
                      <ButtonGeneric
                        variant="confirmYellow"
                        onClick={handleAcceptPromo}
                      >
                        + Agregar a la Lista
                      </ButtonGeneric>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </ResponsiveModal>
      )}
      <GenericModal
        isOpen={showSummary}
        onClose={() => {
          setShowSummary(false);
          setSelectedClient(null);
        }}
        items={items}
        total={total}
        amountPaid={amountPaid}
        changeReturned={changeReturned}
        setAmountPaid={setAmountPaid}
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
      {showTicket && createdSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative max-w-full max-h-full overflow-auto">
            <button
              onClick={() => setShowTicket(false)}
              className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
            >
              ✕
            </button>
            <RestaurantTicket order={createdSale} />
          </div>
        </div>
      )}

      <ResponsiveModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          setSaleData(null);
          dispatch(clearCart());
          setShowSummary(false);
          dispatch(toggleCartSide());
        }}
        onConfirm={() => {
          setIsTicketModalOpen(false);
          setSaleData(null);
          dispatch(clearCart());
          setShowSummary(false);
          dispatch(toggleCartSide());
        }}
        title="Ticket de Venta"
        subtitle={`Pedido #${saleData?.orderNumber || ''}`}
        size="md"
        confirmText="Cerrar"
        cancelText=""
        isProcessing={false}
      >
        {saleData && <RestaurantTicket order={saleData} />}
      </ResponsiveModal>
    </>
  );
}
