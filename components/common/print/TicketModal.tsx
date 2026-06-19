"use client";

import { ReactNode } from "react";

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

export default function TicketModal({ isOpen, onClose, children }: TicketModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botón cerrar (X) simple */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition text-2xl"
                    aria-label="Cerrar"
                >
                    ×
                </button>

                {children}
            </div>
        </div>
    );
}