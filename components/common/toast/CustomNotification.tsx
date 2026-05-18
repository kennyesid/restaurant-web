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
      iconWrapper: "bg-green-100 text-green-600 border-green-500",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-500",
      buttonColor: "text-gray-700 hover:bg-gray-200",
    },

    [ToastType.Warning]: {
      icon: <AlertTriangle size={22} />,
      iconWrapper: "bg-yellow-100 text-yellow-600 border-yellow-500",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-500",
      buttonColor: "text-gray-700 hover:bg-gray-200",
    },

    [ToastType.Fail]: {
      icon: <XCircle size={22} />,
      iconWrapper: "bg-red-100 text-red-600 border-red-500",
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
          w-full max-w-[92vw] sm:max-w-md sm:min-w-[360px]
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
          <span className={`font-semibold ${style.titleColor}`}>{message}</span>

          {description && (
            <span className={`text-sm ${style.descriptionColor}`}>
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
