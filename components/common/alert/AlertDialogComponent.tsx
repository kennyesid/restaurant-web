// components/common/AlertDialog.tsx
"use client";

import { ReactNode } from "react";
import { AlertVariant } from "@/types/enum/alertVariant";
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react";

interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title?: string;
    message?: string;
    variant?: AlertVariant;
    confirmText?: string;
    cancelText?: string;
    children?: ReactNode;
}

const variantStyles = {
    [AlertVariant.INFO]: {
        icon: Info,
        iconColor: "text-blue-500",
        borderColor: "border-blue-500",
        bgColor: "bg-blue-50",
        buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    [AlertVariant.SUCCESS]: {
        icon: CheckCircle,
        iconColor: "text-green-500",
        borderColor: "border-green-500",
        bgColor: "bg-green-50",
        buttonColor: "bg-green-600 hover:bg-green-700",
    },
    [AlertVariant.WARNING]: {
        icon: AlertTriangle,
        iconColor: "text-yellow-500",
        borderColor: "border-yellow-500",
        bgColor: "bg-yellow-50",
        buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    },
    [AlertVariant.DANGER]: {
        icon: AlertCircle,
        iconColor: "text-red-500",
        borderColor: "border-red-500",
        bgColor: "bg-red-50",
        buttonColor: "bg-red-600 hover:bg-red-700",
    },
    [AlertVariant.CONFIRM]: {
        icon: AlertTriangle,
        iconColor: "text-red-500",
        borderColor: "border-red-500",
        bgColor: "bg-red-50",
        buttonColor: "bg-red-600 hover:bg-red-700",
    },
};

export default function AlertDialogComponent({
    isOpen,
    onClose,
    onConfirm,
    title = "¿Estás seguro?",
    message = "Esta acción no se puede deshacer.",
    variant = AlertVariant.CONFIRM,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    children,
}: AlertDialogProps) {
    if (!isOpen) return null;

    const styles = variantStyles[variant] || variantStyles[AlertVariant.INFO];
    const Icon = styles.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border-l-4 border-l-red-500 transition-all">
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                >
                    <X size={20} />
                </button>

                <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${styles.bgColor}`}>
                        <Icon className={`w-6 h-6 ${styles.iconColor}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                        {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
                        {children && <div className="mt-3">{children}</div>}
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                        {cancelText}
                    </button>
                    {onConfirm && (
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${styles.buttonColor}`}
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}