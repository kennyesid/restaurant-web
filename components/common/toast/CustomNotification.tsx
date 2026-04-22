import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { ToastType } from "@/types";

// 1. Enum de tipos
// export enum ToastType {
//   Warning = "Warning",
//   Successfully = "Successfully",
//   Fail = "Fail",
// }

interface CustomToastProps {
  t: any;
  type: ToastType;
  message: string;
  description?: string;
  image?: string; // Prop para imagen opcional
}

export const CustomNotification = ({
  t,
  type,
  message,
  description,
  image,
}: CustomToastProps) => {
  // 2. Mapeo de estilos por tipo
  const configs = {
    [ToastType.Successfully]: {
      bg: "bg-green-50 border-green-500",
      icon: <CheckCircle2 className="text-green-600" size={24} />,
      textColor: "text-green-800",
    },
    [ToastType.Warning]: {
      bg: "bg-yellow-50 border-yellow-500",
      icon: <AlertTriangle className="text-yellow-600" size={24} />,
      textColor: "text-yellow-800",
    },
    [ToastType.Fail]: {
      bg: "bg-red-50 border-red-500",
      icon: <XCircle className="text-red-600" size={24} />,
      textColor: "text-red-800",
    },
  };

  const style = configs[type];

  return (
    <div
      className={`${style.bg} border-l-4 p-4 shadow-xl rounded-r-lg flex items-start gap-4 min-w-[350px] pointer-events-auto`}
    >
      {/* 4. Soporte para Imagen o Icono */}
      {image ? (
        <img
          src={image}
          alt="toast-img"
          className="h-12 w-12 rounded-full object-cover border border-gray-200"
        />
      ) : (
        <div className="flex-shrink-0">{style.icon}</div>
      )}

      <div className="flex-1">
        <h4 className={`font-bold text-sm ${style.textColor}`}>{message}</h4>
        {description && (
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        )}
      </div>

      <button
        onClick={() => toast.dismiss(t)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
};
