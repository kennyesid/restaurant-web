import * as React from "react";
import { Search, ChevronDown, X } from "lucide-react";

export interface DropdownOption {
    id: number;
    name: string;
    price?: number;
}

interface DropdownSearchableProps {
    options: DropdownOption[];
    value: number | "";
    onChange: (value: number | "") => void;
    placeholder?: string;
    label?: string;
}

export default function DropdownSearchable({
    options,
    value,
    onChange,
    placeholder = "-- Seleccionar --",
    label,
}: DropdownSearchableProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Encontrar el item seleccionado actualmente para mostrar su nombre en el botón
    const selectedOption = options.find((opt) => opt.id === value);

    // Filtrar las opciones basadas en lo que escribe el usuario
    const filteredOptions = options.filter((opt) =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Cerrar el dropdown si el usuario hace clic afuera del componente
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Limpiar el buscador cada vez que se abre el panel
    React.useEffect(() => {
        if (isOpen) setSearchTerm("");
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative w-full flex flex-col gap-1">
            {label && <label className="text-xs text-slate-500 font-medium">{label}</label>}

            {/* Botón Principal (Muestra la opción seleccionada o el placeholder) */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 text-left flex justify-between items-center shadow-sm cursor-pointer transition-all"
            >
                <span className={`truncate ${selectedOption ? "text-slate-800 font-medium" : "text-slate-400"}`}>
                    {selectedOption
                        ? `${selectedOption.name} ${selectedOption.price !== undefined ? `(Bs ${selectedOption.price})` : ""}`
                        : placeholder
                    }
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Desplegable Flotante con el Buscador (Súper adaptado a móviles) */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col overflow-hidden max-h-60 animate-in fade-in slide-in-from-top-2 duration-150">

                    {/* Caja de Texto del Buscador Interno */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 sticky top-0 z-10">
                        <Search size={14} className="text-slate-400 flex-shrink-0" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar plato..."
                            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder-slate-400 py-1"
                            autoFocus
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Lista de Resultados Opciones */}
                    <div className="overflow-y-auto flex-1 text-sm text-slate-700 divide-y divide-slate-50">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400 italic">
                                No se encontraron resultados
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left p-2.5 px-3 hover:bg-slate-50 transition-colors text-xs sm:text-sm flex justify-between items-center cursor-pointer ${value === option.id ? "bg-yellow-50/60 font-semibold text-yellow-700 hover:bg-yellow-50" : "text-slate-700"
                                        }`}
                                >
                                    <span className="truncate pr-2">{option.name}</span>
                                    {option.price !== undefined && (
                                        <span className={`flex-shrink-0 text-xs font-medium ${value === option.id ? "text-yellow-600" : "text-slate-400"}`}>
                                            Bs {option.price}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}