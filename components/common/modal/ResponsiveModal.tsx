import * as React from "react";
import { X } from "lucide-react";
import ButtonGeneric from "../button/ButtonGeneric";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ResponsiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void; // 👈 Callback para el botón Aceptar
    title: string;
    subtitle?: string;
    size?: ModalSize;
    children: React.ReactNode;
    confirmText?: string;  // Opcional por si quieres cambiar "Confirmar" por otra palabra
    cancelText?: string;   // Opcional por si quieres cambiar "Cancelar"
    isProcessing?: boolean; // Para deshabilitar botones si está cargando
}

const sizeClasses: Record<ModalSize, string> = {
    sm: "max-w-sm w-full",
    md: "max-w-md w-full",
    lg: "max-w-lg w-full",
    xl: "max-w-2xl w-full",
    full: "max-w-[95vw] h-[90vh] w-full",
};

export function ResponsiveModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    subtitle,
    size = "md",
    children,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    isProcessing = false,
}: ResponsiveModalProps) {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={`bg-white rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col relative z-10 transform transition-all animate-in zoom-in-95 duration-200 ${sizeClasses[size]}`}
            >
                <div className="p-4 bg-[#052A3D] text-white flex justify-between items-start flex-shrink-0">
                    <div className="space-y-0.5">
                        <h3 className="font-bold text-base tracking-wide leading-none">{title}</h3>
                        {subtitle && (
                            <p className="text-xs text-yellow-400 font-medium opacity-90">{subtitle}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 text-sm text-slate-700 bg-background">
                    {children}
                </div>
                <div className="p-4 border-t border-border bg-gray-50 flex justify-end gap-2 flex-shrink-0">
                    <ButtonGeneric
                        onClick={onClose}
                        disabled={isProcessing}
                        variant="cancelGray"
                    >
                        {cancelText}
                    </ButtonGeneric>
                    {/* <button
                        type="button"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded hover:bg-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {cancelText}
                    </button> */}

                    <ButtonGeneric
                        onClick={onConfirm}
                        disabled={isProcessing}
                        variant="primary"
                    >
                        {confirmText}
                    </ButtonGeneric>

                    {/* <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-[#052A3D] text-white text-xs font-bold rounded hover:bg-[#0c3d54] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                        {isProcessing ? "Procesando..." : confirmText}
                    </button> */}
                </div>
            </div>
        </div>
    );
}