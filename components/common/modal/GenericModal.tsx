import { BaseModal } from "@/components/ui/Modal/BaseModal";
import { BolivianCashCuts, CartItem, User } from "@/types";
import { ButtonGeneric } from "@/components/common/button/ButtonGeneric";
import { Save, Search, UserPlus, X } from "lucide-react";
import { STYLE_INTERNAL } from "@/lib/constants/constantStyle";
import { storage } from "@/lib/storage";
import { useEffect, useState } from "react";
import { OrderTypeEnum } from "@/types/enum/orderTypeEnum";
import { ResponsiveModal } from "./ResponsiveModal";

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  amountPaid: number;
  changeReturned: number;
  setAmountPaid: (value: number) => void;
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
  amountPaid,
  changeReturned,
  setAmountPaid,
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
  const [editableItems, setEditableItems] = useState<CartItem[]>(items);
  const [isLocked, setIsLocked] = useState(false);

  const handleSearchClient = (query: string) => {
    if (!query || query.length < 3) {
      setSelectedClient(null);
      return;
    }

    const users = storage.getCollection<any>("users") ?? [];

    const search = query.toLowerCase();

    const found = users.find((u: any) => {
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
        groupId: 1,
        groupCode: "1",
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
        state: true,
        fullName: found.full_name ?? found.fullName ?? "",
        document: "",
        email: found.email,
      });
    } else {
      setSelectedClient(null);
    }
  };

  const handleSaveModifications = () => {
    const normalizedItems = editableItems.map((item) => {
      if (item.modifiedSubtotal !== undefined || item.reasonModification !== undefined) {
        return {
          ...item,
          reasonModification: item.reasonModification?.trim() || "Venta Modificada",
        };
      }
      return item;
    });
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

  useEffect(() => {
    setEditableItems(
      items.map((item) => ({
        ...item,
        modified: false,
      })),
    );
  }, [items]);

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Confirmar Venta"
      subtitle="Revisa los detalles antes de completar la transacción."
      size="xl"
      confirmText={isProcessing ? "Procesando..." : "Confirmar"}
      cancelText="Cancelar"
      isProcessing={isProcessing || isEditMode}
    >
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
              <tr key={item.id}>
                <td className="p-2 font-medium">{item.name}</td>
                <td className="p-2 text-center">
                  <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-1 text-xs font-semibold bg-gray-100 rounded-md">
                    {item.quantity}
                  </span>
                </td>
                {!isEditMode && (
                  <td className="p-2 text-right">
                    Bs{" "}
                    {(
                      item.modifiedSubtotal ?? item.price * item.quantity
                    ).toLocaleString()}
                  </td>
                )}
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
                              i.id === item.id
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
                              i.id === item.id
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
      <div className="border-t space-y-4 bg-gray-50/50 p-3 rounded-xl border border-slate-100">
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
              Para Consumir Aquí
            </button>
            <button
              type="button"
              onClick={() => setOrderType(OrderTypeEnum.PARA_LLEVAR)}
              className={`p-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer border text-center ${orderType === OrderTypeEnum.PARA_LLEVAR
                ? "bg-[#052A3D] text-white border-[#052A3D] shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
            >
              Para Llevar
            </button>
          </div>
        </div>

        {/* <hr className="border-slate-200/60" /> */}
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
        {/* CAMBIOS */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#052A3D] uppercase tracking-wide">
            Pago en Efectivo y Cambio
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {Object.values(BolivianCashCuts)
              .filter((v) => typeof v === "number")
              .map((cutValue) => (
                <button
                  key={cutValue}
                  type="button"
                  onClick={() => setAmountPaid(Number(cutValue))}
                  className={`p-2 rounded-lg text-xs font-black transition-all active:scale-95 cursor-pointer border text-center ${amountPaid === cutValue
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  Bs {cutValue}
                </button>
              ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Monto Recibido
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-0 text-sm font-semibold text-slate-500 pb-0.5">Bs</span>
                <input
                  type="number"
                  value={amountPaid === 0 ? "" : amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  min={0}
                  className="w-full pl-6 pb-1 bg-transparent outline-none font-bold text-slate-800 border-b border-slate-300 focus:border-[#052A3D] text-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Cambio a Devolver
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-0 text-sm font-semibold text-emerald-600 pb-0.5">Bs</span>
                <input
                  type="text"
                  readOnly
                  value={changeReturned.toFixed(2)}
                  className={`w-full pl-6 pb-1 bg-transparent outline-none font-black border-b border-transparent text-lg ${changeReturned > 0 ? "text-emerald-600" : "text-slate-400"
                    }`}
                />
              </div>
            </div>
          </div>
        </div>
        {/* FIN CAMBIOS */}
      </div>

      {/* CAMBIOS */}
      {/* <div className="p-3 bg-slate-50 border rounded-xl border-slate-200 space-y-3">
        <p className="text-xs font-bold text-[#052A3D] uppercase tracking-wide">
          Pago en Efectivo y Cambio
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {Object.values(BolivianCashCuts)
            .filter((v) => typeof v === "number")
            .map((cutValue) => (
              <button
                key={cutValue}
                type="button"
                onClick={() => setAmountPaid(Number(cutValue))}
                className={`p-2 rounded-lg text-xs font-black transition-all active:scale-95 cursor-pointer border text-center ${amountPaid === cutValue
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                Bs {cutValue}
              </button>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Monto Recibido
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-0 text-sm font-semibold text-slate-500 pb-0.5">Bs</span>
              <input
                type="number"
                value={amountPaid === 0 ? "" : amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                min={0}
                className="w-full pl-6 pb-1 bg-transparent outline-none font-bold text-slate-800 border-b border-slate-300 focus:border-[#052A3D] text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Cambio a Devolver
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-0 text-sm font-semibold text-emerald-600 pb-0.5">Bs</span>
              <input
                type="text"
                readOnly
                value={changeReturned.toFixed(2)}
                className={`w-full pl-6 pb-1 bg-transparent outline-none font-black border-b border-transparent text-sm ${changeReturned > 0 ? "text-emerald-600" : "text-slate-400"
                  }`}
              />
            </div>
          </div>
        </div>
      </div> */}

      {/* FIN CAMBIOS */}


      <div className="flex justify-between items-center px-2">
        <span className="text-lg font-bold">Total a pagar:</span>
        <span className="text-2xl font-black text-[#052A3D]">
          Bs {total.toLocaleString()}
        </span>
      </div>
    </ResponsiveModal>
  );
}
