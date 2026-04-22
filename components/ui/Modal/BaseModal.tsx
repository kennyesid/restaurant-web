import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React, { ReactNode } from "react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: BaseModalProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Overlay - Fondo oscuro */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in duration-200" />

        {/* Contenido del Modal */}
        <Dialog.Content
          className={`fixed left-[50%] top-[50%] z-[101] w-full ${sizeClasses[size]} translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg animate-in zoom-in-95 duration-200 focus:outline-none`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              {title && (
                <Dialog.Title className="text-xl font-bold text-[#052A3D]">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="text-sm text-muted-foreground mt-1">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Cuerpo del Modal */}
          <div className="py-2">{children}</div>

          {/* Footer opcional */}
          {footer && (
            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
