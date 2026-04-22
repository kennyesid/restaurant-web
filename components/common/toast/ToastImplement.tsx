import { Plus } from "lucide-react";
import { toast } from "sonner";

export const SuccessToastImplement = ({
  total,
  t,
}: {
  total: number;
  t: any;
}) => (
  <div className="bg-white border-l-4 border-green-500 p-4 flex items-center shadow-lg gap-4">
    <div className="bg-green-100 p-2 rounded-full">
      <Plus size={20} className="text-green-600" />
    </div>
    <div>
      <h4 className="font-bold text-gray-800">¡Venta Exitosa!</h4>
      <p className="text-xs text-gray-500">Monto: Bs {total}</p>
    </div>
    <button
      onClick={() => toast.dismiss(t)}
      className="ml-auto text-gray-400 hover:text-gray-600"
    >
      ✕
    </button>
  </div>
);
