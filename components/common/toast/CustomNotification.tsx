import { toast } from "sonner";
import { Check, AlertTriangle, XCircle } from "lucide-react";
import { ToastType } from "@/types";
import { ToastBody } from "@/types/generic/toastBody";

interface CustomToastProps {
  t: string | number;
  body: ToastBody;
}

export const CustomNotification = ({ t, body }: CustomToastProps) => {
  const { type, message, description } = body;

  /**
   * Configuración visual por tipo
   */
  const configs: Record<
    ToastType,
    {
      icon: JSX.Element;
      iconWrapper: string;
      titleColor: string;
      descriptionColor: string;
      buttonColor: string;
    }
  > = {
    [ToastType.Successfully]: {
      icon: <Check size={22} />,
      iconWrapper:
        "bg-green-100 text-green-600 border-green-500",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-500",
      buttonColor: "text-gray-700 hover:bg-gray-200",
    },

    [ToastType.Warning]: {
      icon: <AlertTriangle size={22} />,
      iconWrapper:
        "bg-yellow-100 text-yellow-600 border-yellow-500",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-500",
      buttonColor: "text-gray-700 hover:bg-gray-200",
    },

    [ToastType.Fail]: {
      icon: <XCircle size={22} />,
      iconWrapper:
        "bg-red-100 text-red-600 border-red-500",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-500",
      buttonColor: "text-gray-700 hover:bg-gray-200",
    },
  };

  const style = configs[type];

  return (
    <div className="pointer-events-auto">
      <div
        className="
          flex items-center
          bg-white
          rounded-lg
          shadow-2xl
          overflow-hidden
          min-w-[360px]
        "
      >
        {/* ICON */}
        <div className="px-5 py-4 flex items-center">
          <div
            className={`
              flex items-center justify-center
              w-10 h-10
              rounded-full
              border-2
              ${style.iconWrapper}
            `}
          >
            {style.icon}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col pr-6 py-4">
          <span className={`font-semibold ${style.titleColor}`}>
            {message}
          </span>

          {description && (
            <span
              className={`text-sm ${style.descriptionColor}`}
            >
              {description}
            </span>
          )}
        </div>

        {/* DIVIDER */}
        <div className="self-stretch w-px bg-gray-300" />

        {/* ACTION */}
        <button
          onClick={() => toast.dismiss(t)}
          className={`
            px-2 py-1
            text-sm font-semibold
            transition
            ${style.buttonColor}
          `}
        >
          OK
        </button>
      </div>
    </div>
  );
};





// import { toast } from "sonner";
// import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
// import { ToastType } from "@/types";
// import { ToastBody } from "@/types/generic/toastBody";

// interface CustomToastProps {
//   t: any;
//   // type: ToastType;
//   // message: string;
//   // description?: string;
//   // image?: string; 
//   body: ToastBody;
// }

// export const CustomNotification = ({
//   t,
//   body
//   // message,
//   // description,
//   // image,
  
// }: CustomToastProps) => {
//   // 2. Mapeo de estilos por tipo
// const { type, message, description, image } = body;

//   const configs: Record<ToastType, { bg: string; icon: JSX.Element; textColor: string }> = {
//     [ToastType.Successfully]: {
//       bg: "bg-green-50 border-green-500",
//       icon: <CheckCircle2 className="text-green-600" size={24} />,
//       textColor: "text-green-800",
//     },
//     [ToastType.Warning]: {
//       bg: "bg-yellow-50 border-yellow-500",
//       icon: <AlertTriangle className="text-yellow-600" size={24} />,
//       textColor: "text-yellow-800",
//     },
//     [ToastType.Fail]: {
//       bg: "bg-red-50 border-red-500",
//       icon: <XCircle className="text-red-600" size={24} />,
//       textColor: "text-red-800",
//     },
//   };

//   const style = configs[type];

// return (
  //   <div
  //     className={`${style.bg} border-l-4 p-4 shadow-xl rounded-r-lg flex items-start gap-4 min-w-[350px] pointer-events-auto`}
  //   >
  //     {image ? (
  //       <img
  //         src={image}
  //         alt="toast-img"
  //         className="h-12 w-12 rounded-full object-cover border border-gray-200"
  //       />
  //     ) : (
  //       <div className="flex-shrink-0">{style.icon}</div>
  //     )}

  //     <div className="flex-1">
  //       <h4 className={`font-bold text-sm ${style.textColor}`}>{message}</h4>
  //       {description && (
  //         <p className="text-xs text-gray-600 mt-1">{description}</p> 
  //       )}
  //     </div>

  //     <button
  //       onClick={() => toast.dismiss(t)}
  //       className="text-gray-400 hover:text-gray-600 transition-colors"
  //     >
  //       <X size={18} />
  //     </button>
  //   </div>
  // );
  // );