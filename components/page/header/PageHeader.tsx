import React from "react";

// 1. Definimos la interfaz con las 3 propiedades (props) de entrada
interface PageHeaderProps {
    title: string;                  // Nombre principal
    subtitle?: string;              // Nombre secundario (opcional por si alguna página no tiene)
    action?: React.ReactNode;       // Acción/Botón a la derecha (opcional)
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div className="w-full text-center md:text-center flex flex-col items-center md:items-center">
                <h1 className="w-full text-center md:text-center text-3xl font-black text-[#052A3D] tracking-normal sm:tracking-tight leading-normal pt-2">
                    {title}
                </h1>
                {subtitle && (
                    <p className="w-full text-center md:text-center text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Contenedor de la Acción: Solo se muestra si pasas el parámetro 'action' */}
            {action && (
                <div className="flex justify-center md:justify-end gap-2 w-full md:w-auto">
                    {action}
                </div>
            )}
        </div>
    );
}