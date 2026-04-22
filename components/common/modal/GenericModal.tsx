import { BaseModal } from "@/components/ui/Modal/BaseModal";
import { CartItem } from "@/types";

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
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium bg-[#052A3D] text-white rounded-md hover:bg-[#052A3D]/90 disabled:opacity-50"
          >
            {isProcessing ? "Procesando..." : "Confirmar y Guardar"}
          </button>
        </>
      }
    >
      <div className="max-h-[40vh] overflow-y-auto mb-4 border rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="p-2">Producto</th>
              <th className="p-2 text-center">Cant.</th>
              <th className="p-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.productId} className="border-t">
                <td className="p-2 font-medium">{item.name}</td>
                <td className="p-2 text-center">{item.quantity}</td>
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
