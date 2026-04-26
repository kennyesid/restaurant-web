import { BaseModal } from "@/components/ui/Modal/BaseModal";
import { CartItem } from "@/types";
import { ButtonGeneric } from "@/components/common/button/ButtonGeneric";
import { Save, X } from "lucide-react";
import { STYLE_INTERNAL } from "@/lib/constants/constantStyle";

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onConfirm: () => void;
  isProcessing: boolean;
}

export function GenericModal({
  isOpen,
  onClose,
  items,
  total,
  onConfirm,
  isProcessing,
}: SaleModalProps) {
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
            disabled={isProcessing}
          >
            
            {isProcessing ? "Procesando..." : "Confirmar"}
            <Save size={16} />
          </ButtonGeneric>
        </>
      }
    >
      <div className="max-h-[40vh] overflow-y-auto mb-4 border rounded-sm">
        <table className="w-full text-sm text-left">
          {/* <thead className={`sticky text-white ${STYLE_INTERNAL.headerModalPrimary}`} > */}
          <thead className="sticky top-0 bg-gray-100/95 backdrop-blur-sm text-gray-800 border-b shadow-sm">
            <tr>
              <th className="p-2">Producto</th>
              <th className="p-2 text-center">Cant.</th>
              <th className="p-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              // className="border-t" 
              <tr key={item.productId} >
                <td className="p-2 font-medium">{item.name}</td>
                <td className="p-2 text-center">
                  <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-1 text-xs font-semibold bg-gray-100 rounded-md">
                    {item.quantity}
                  </span>
                </td>
                <td className="p-2 text-right">
                  Bs {(item.price * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center px-2">
        <span className="text-lg font-bold">Total a pagar:</span>
        <span className="text-2xl font-black text-[#052A3D]">
          Bs {total.toLocaleString()}
        </span>
      </div>
    </BaseModal>
  );
}
