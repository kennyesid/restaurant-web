import * as React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

// Definición genérica para las columnas
export interface Column<T> {
    header: string;
    // Puede ser una clave del objeto T, o una función personalizada para renderizar JSX (ej: badges, imágenes)
    accessor: keyof T | ((item: T) => React.ReactNode);
}

// Acciones soportadas por la tabla
export interface TableActions<T> {
    onView?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
}

export interface GenericDataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    actions?: TableActions<T>;
    showActions?: boolean;
    rowKey: keyof T;
}

export function GenericDataTable<T>({
    columns,
    data,
    actions,
    showActions = false,
    rowKey,
}: GenericDataTableProps<T>) {

    return (
        <div className="w-full border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0 text-sm text-slate-600">
                    <thead>
                        <tr className="border-b border-border bg-rest-primary text-gray-300 font-semibold tracking-wide text-xs uppercase">
                            {columns.map((column, index) => (
                                <th key={index} className="p-3.5 px-4">
                                    {column.header}
                                </th>
                            ))}

                            {showActions && actions && (
                                <th className="p-3.5 px-4 text-center w-28">Opciones</th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (showActions ? 1 : 0)}
                                    className="p-8 text-center text-muted-foreground bg-slate-50/50"
                                >
                                    <div className="flex flex-col items-center justify-center space-y-1">
                                        <span className="text-xl">📂</span>
                                        <p className="text-xs font-medium">No se encontraron registros disponibles.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={String(item[rowKey])}
                                    className="hover:bg-slate-50/60 transition-colors duration-150 group"
                                >
                                    {/* CELDAS DINÁMICAS */}
                                    {columns.map((column, colIndex) => (
                                        <td key={colIndex} className="p-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                                            {typeof column.accessor === "function"
                                                ? column.accessor(item) // Si pasas una función renderizadora (JSX)
                                                : (item[column.accessor] as React.ReactNode) // Si pasas un texto directo
                                            }
                                        </td>
                                    ))}

                                    {/* COLUMNA DE ACCIONES GENERICA */}
                                    {showActions && actions && (
                                        <td className="p-2 px-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1.5">

                                                {/* VER */}
                                                {actions.onView && (
                                                    <button
                                                        onClick={() => actions.onView?.(item)}
                                                        className="p-1.5 rounded-md text-slate-500 hover:text-[#052A3D] hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                                                        title="Ver detalle"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                )}

                                                {/* EDITAR */}
                                                {actions.onEdit && (
                                                    <button
                                                        onClick={() => actions.onEdit?.(item)}
                                                        className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
                                                        title="Editar"
                                                    >
                                                        <Edit size={15} />
                                                    </button>
                                                )}

                                                {/* ELIMINAR */}
                                                {actions.onDelete && (
                                                    <button
                                                        onClick={() => actions.onDelete?.(item)}
                                                        className="p-1.5 rounded-md text-slate-500 hover:text-destructive hover:bg-red-50 active:scale-95 transition-all cursor-pointer"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    );
}