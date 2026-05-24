import { BaseModal } from "@/components/ui/Modal/BaseModal";
import { CartItem, User } from "@/types";
import { ButtonGeneric } from "@/components/common/button/ButtonGeneric";
import { Save, Search, UserPlus, X } from "lucide-react";
import { STYLE_INTERNAL } from "@/lib/constants/constantStyle";
import { storage } from "@/lib/storage";
import { useEffect, useState } from "react";
import { OrderTypeEnum } from "@/types/enum/orderTypeEnum";

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onConfirm: () => void;
  isProcessing: boolean;
  needsInvoice: boolean;
  setNeedsInvoice: (val: boolean) => void;
  selectedClient: User | null;
  setSelectedClient: (user: User | null) => void;
  onOpenCreateClientModal: () => void;
  changeSubTotal: (newItem: CartItem[]) => void;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  orderType: OrderTypeEnum;
  setOrderType: React.Dispatch<React.SetStateAction<OrderTypeEnum>>;
}

export function GenericModal({
  isOpen,
  onClose,
  items,
  total,
  onConfirm,
  isProcessing,
  needsInvoice,
  setNeedsInvoice,
  selectedClient,
  setSelectedClient,
  onOpenCreateClientModal,
  changeSubTotal,
  isEditMode,
  setIsEditMode,
  orderType,
  setOrderType,
}: SaleModalProps) {
  const [isNewClient, setIsNewClient] = useState(false);
  // const [isEditMode, setIsEditMode] = useState(false);
  const [editableItems, setEditableItems] = useState<CartItem[]>(items);
  const [isLocked, setIsLocked] = useState(false);
  // const [orderType, setOrderType] = useState<OrderTypeEnum>(OrderTypeEnum.CONSUMO_LOCAL);


  const handleSearchClient = (query: string) => {
    if (!query || query.length < 3) {
      setSelectedClient(null);
      // setIsNewClient(false);
      return;
    }

    const users = storage.getCollection<any>("users") ?? [];

    const search = query.toLowerCase();

    const found = users.find((u: any) => {
      // Convertimos todo a string por si vienen números del storage
      const fullName = (u.full_name || u.fullName || "")
        .toString()
        .toLowerCase();
      const email = (u.email || "").toString().toLowerCase();
      const document = (u.document || u.nit || u.ci || "")
        .toString()
        .toLowerCase();

      return (
        fullName.includes(search) ||
        email.includes(search) ||
        document.includes(search)
      );
    });

    if (found) {
      setSelectedClient({
        id: found.id_user,
        username: "S/N",
        password: "S/N",
        address: "S/N",
        phone: "S/N",
        nit: found.nit === null || undefined ? "S/N" : found.nit,
        avatarUrl: "S/N",
        roleId: 1,
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
        state: true,
        // fullName: found.full_name,
        fullName: found.full_name ?? found.fullName ?? "",
        document: "",
        email: found.email,
      });

      // setCustomNit("");
      // setIsNewClient(false);
    } else {
      setSelectedClient(null);
    }
  };

  const handleSaveModifications = () => {
    // 🟡 Normalizamos items
    const normalizedItems = editableItems.map((item) => {
      // 👇 CAMBIO: Validamos si existe un subtotal modificado O si se escribió una razón
      if (item.modifiedSubtotal !== undefined || item.reasonModification !== undefined) {
        return {
          ...item,
          // Si no se escribió nada, se guarda el texto por defecto
          reasonModification: item.reasonModification?.trim() || "Venta Modificada",
        };
      }
      return item;
    });
    // 🔢 Recalcular total
    const newTotal = normalizedItems.reduce(
      (sum, item) =>
        sum + (item.modifiedSubtotal ?? item.price * item.quantity),
      0,
    );
    setIsLocked(true);
    changeSubTotal(normalizedItems);
    setEditableItems(normalizedItems);
    setIsEditMode(false);
  };

  // const total = items.reduce(
  //   (sum, item) => sum + (item.modifiedSubtotal ?? item.price * item.quantity),
  //   0,
  // );

  useEffect(() => {
    setEditableItems(
      items.map((item) => ({
        ...item,
        modified: false,
      })),
    );
  }, [items]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Venta"
      description="Revisa los detalles antes de completar la transacción."
      size="lg"
      footer={
        <>
          <ButtonGeneric
            onClick={onClose}
            variant="cancelModalRed"
            disabled={isProcessing}
          >
            Cancelar
            <X size={16} />
          </ButtonGeneric>

          <ButtonGeneric
            onClick={onConfirm}
            variant="confirmModalPrimary"
            disabled={isEditMode}
          // disabled={isProcessing}
          >
            {isProcessing ? "Procesando..." : "Confirmar"}
            <Save size={16} />
          </ButtonGeneric>
        </>
      }
    >

      {/* NO ELIMINAR - ESTA SECCION ES PARA MODIFICAR EN LA TABLA        */}
      {/* <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-sm font-medium">Modificar subtotales</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isLocked) return;
              setIsEditMode(!isEditMode);
            }}
            disabled={isLocked}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${isLocked
              ? "bg-gray-200 cursor-not-allowed"
              : isEditMode
                ? "bg-green-500"
                : "bg-gray-300"
              }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isEditMode ? "translate-x-6" : "translate-x-0"
                }`}
            />
          </button>
          {isEditMode && (
            <button
              onClick={handleSaveModifications}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors shadow-sm hover:scale-105 active:scale-95"
              title="Guardar modificaciones"
            >
              <Save size={16} />
            </button>
          )}
        </div>
      </div> */}
      {/* NO ELIMINAR - ESTA SECCION ES PARA MODIFICAR EN LA TABLA        */}
      {/* </div> */}
      <div className="max-h-[40vh] overflow-y-auto mb-4 border rounded-sm">
        <table className="w-full text-sm text-left">
          {/* <thead className={`sticky text-white ${STYLE_INTERNAL.headerModalPrimary}`} > */}
          <thead className="sticky top-0 bg-gray-100/95 backdrop-blur-sm text-gray-800 border-b shadow-sm">
            <tr>
              <th className="p-2">Producto</th>
              <th className="p-2 text-center">Cant.</th>
              {/* <th className="p-2 text-right">Subtotal</th> */}
              {!isEditMode && <th className="p-2 text-right">Subtotal</th>}

              {isEditMode && (
                <>
                  <th className="p-2 text-left">Razón</th>
                  <th className="p-2 text-right">Nuevo Subtotal</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {editableItems.map((item) => (
              // className="border-t"
              <tr key={item.productId}>
                <td className="p-2 font-medium">{item.name}</td>
                <td className="p-2 text-center">
                  <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-1 text-xs font-semibold bg-gray-100 rounded-md">
                    {item.quantity}
                  </span>
                </td>
                {/* <td className="p-2 text-right">
                  Bs {(item.price * item.quantity).toLocaleString()}
                </td> */}
                {/* MODO NORMAL */}
                {!isEditMode && (
                  <td className="p-2 text-right">
                    Bs{" "}
                    {(
                      item.modifiedSubtotal ?? item.price * item.quantity
                    ).toLocaleString()}
                  </td>
                )}

                {/* MODO EDICIÓN */}
                {isEditMode && (
                  <>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.reasonModification ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          setEditableItems((prev) =>
                            prev.map((i) =>
                              i.productId === item.productId
                                ? { ...i, reasonModification: value }
                                : i,
                            ),
                          );
                        }}
                        className="w-full border-b outline-none text-sm"
                        placeholder="Motivo..."
                      />
                    </td>

                    <td className="p-2 text-right">
                      <input
                        type="number"
                        value={
                          item.modifiedSubtotal ?? item.price * item.quantity
                        }
                        onChange={(e) => {
                          const value = Number(e.target.value);

                          setEditableItems((prev) =>
                            prev.map((i) =>
                              i.productId === item.productId
                                ? { ...i, modifiedSubtotal: value }
                                : i,
                            ),
                          );
                        }}
                        min={1}
                        className="w-24 text-right border-b outline-none"
                      />
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NEW FORMULARIO */}
      <div className="border-t space-y-4 bg-gray-50/50 p-3 rounded-xl border border-slate-100">
        {/* 🍔 SELECCIÓN DE TIPO DE ORDEN (Responsive & Touch Friendly) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#052A3D] uppercase tracking-wider">
            Tipo de Orden
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrderType(OrderTypeEnum.CONSUMO_LOCAL)}
              className={`p-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer border text-center ${orderType === OrderTypeEnum.CONSUMO_LOCAL
                ? "bg-[#052A3D] text-white border-[#052A3D] shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
            >
              🍽️ Para Consumir Aquí
            </button>
            <button
              type="button"
              onClick={() => setOrderType(OrderTypeEnum.PARA_LLEVAR)}
              className={`p-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer border text-center ${orderType === OrderTypeEnum.PARA_LLEVAR
                ? "bg-[#052A3D] text-white border-[#052A3D] shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
            >
              🛍️ Para Llevar
            </button>
          </div>
        </div>

        <hr className="border-slate-200/60" />

        {/* 📄 SECCIÓN DE FACTURACIÓN (Siempre visible) */}
        <div className="space-y-3">
          <div className="p-3 bg-yellow-50/60 border rounded-xl border-yellow-200/70 space-y-3">
            <p className="text-xs font-bold text-yellow-800 uppercase tracking-wide">
              Datos de Factura
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {/* Razón Social */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Nombre / Razón Social
                </label>
                <input
                  type="text"
                  value={selectedClient?.fullName ?? ""}
                  onChange={(e) =>
                    setSelectedClient({
                      ...(selectedClient || {}),
                      fullName: e.target.value,
                    } as any)
                  }
                  className="w-full pb-1 bg-transparent outline-none font-semibold text-slate-800 border-b border-yellow-300 focus:border-yellow-600 text-sm placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="Control Tributario / Nombre"
                />
              </div>

              {/* NIT / CI */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  NIT / CI
                </label>
                <input
                  type="text"
                  value={selectedClient?.nit ?? ""} // El '?? ""' mitiga el error de null al leer el value
                  onChange={(e) =>
                    setSelectedClient({
                      ...(selectedClient || {}), // Si es null, esparce un objeto vacío
                      id: selectedClient?.id || 1, // Forzamos a que siempre tenga un ID numérico válido
                      nit: e.target.value,
                    } as any) // El 'as any' silencia los choques de propiedades opcionales de la interfaz User
                  }
                  className="w-full pb-1 bg-transparent outline-none font-semibold text-slate-800 border-b border-yellow-300 focus:border-yellow-600 text-sm placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="0 (Sin NIT)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* NEW FORMUALRIO FIN */}


      {/* <div className=" border-t space-y-4 bg-gray-50/50 pb-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">
            ¿Requiere Factura?
          </label>
          <button
            onClick={() => setNeedsInvoice(!needsInvoice)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${needsInvoice ? "bg-green-500" : "bg-gray-300"}`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${needsInvoice ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>

        {needsInvoice && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 w-full">
              {" "}
              <div className="relative grow min-w-0">
                {" "}
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  onChange={(e) => handleSearchClient(e.target.value)}
                />
              </div>
              <div className="shrink-0  h-10 flex items-center justify-center">
                <ButtonGeneric
                  variant="primaryRed"
                  onClick={() => {
                    setSelectedClient({
                      id: 0,
                      username: "",
                      fullName: "",
                      email: "",
                      document: "",
                    } as any);
                  }}
                >
                  <UserPlus size={18} />
                </ButtonGeneric>
              </div>
            </div>

            {selectedClient && (
              <div className="p-3 bg-yellow-50 border rounded-md border-yellow-200 space-y-3">
                <p className="text-xs font-bold text-yellow-800 uppercase">
                  Nuevo Cliente
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase">
                      Nombre / Razón Social
                    </label>
                    <input
                      value={selectedClient?.fullName ?? ""}
                      onChange={(e) =>
                        setSelectedClient({
                          ...selectedClient,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full border-b bg-transparent outline-none font-medium border-yellow-300 focus:border-yellow-600"
                      placeholder="Nombre cliente"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase">
                      NIT / CI
                    </label>
                    <input
                      value={selectedClient?.nit ?? ""}
                      onChange={(e) =>
                        setSelectedClient({
                          ...selectedClient,
                          nit: e.target.value,
                        })
                      }
                      className="w-full border-b bg-transparent outline-none font-medium border-yellow-300 focus:border-yellow-600"
                      placeholder="1234567"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div> */}
      <div className="flex justify-between items-center px-2">
        <span className="text-lg font-bold">Total a pagar:</span>
        <span className="text-2xl font-black text-[#052A3D]">
          Bs {total.toLocaleString()}
        </span>
      </div>
    </BaseModal>
  );
}
