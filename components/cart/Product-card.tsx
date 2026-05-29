"use client";

import { Product } from "@/types/index";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/utils/format";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
  onEdit?: ((product: Product) => void) | null;
  onDelete?: ((id: number) => void) | null;
  onClick?: (product: Product) => void;
  showActions?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onClick,
  showActions = true,
  className,
}: ProductCardProps) {
  return (
    <div
      className={cn(
        // "group w-full h-[50px] sm:h-[80px] md:h-[120px] lg:h-[160px] xl:h-[200px] [perspective:1000px]",
        "group w-full aspect-square md:aspect-[4/3] lg:h-[180px] xl:h-[200px] [perspective:1000px]",
        className,
      )}
      onClick={() => onClick?.(product)}
    >
      <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-2xl">
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <Card className="h-full w-full border-none rounded-xs overflow-hidden relative">
            <Image
              src={getImageUrl(product.imageUrl)}
              alt={product.name}
              fill
              className="w-full h-full object-cover"
            />
            {/* Overlay elegante para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Nombre del Producto */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-sm font-bold uppercase tracking-wider drop-shadow-lg">
                {product.name}
              </h3>
            </div>

            {/* Precio siempre visible en el frente */}
            <div className="absolute top-0 right-0 p-2">
              <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 text-xs font-mono">
                {product.price.toLocaleString("es-BO", {
                  style: "currency",
                  currency: "BOB",
                })}
              </span>
            </div>
          </Card>
        </div>

        {/* --- CARA TRASERA (Info y Acciones) --- */}
        <div className="absolute inset-0 h-full w-full [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <Card className="h-full w-full border-none rounded-none bg-[#facc15] flex flex-col p-3 sm:p-4 lg:p-5 pt-2 relative shadow-md">
            {/* CONTENEDOR DE TEXTO - Se adapta al tamaño de la card */}
            <div className="flex-1 flex flex-col justify-start">
              {/* 1. NOMBRE - Bold y directo */}
              <h3 className="text-gray-900 text-lg font-black tracking-tighter leading-none mb-1">
                {product.name}
              </h3>
              <p className="text-gray-900 text-xs font-bold opacity-80  leading-tight">
                {product.description || "Descripción del producto"}
              </p>
              <div className="mt-2">
                {product.productIngredientDetail?.slice(0, 3).map((detail) => (
                  <div key={detail.id} className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-gray-900 rounded-full shrink-0" />
                    <span className="text-gray-900 text-[10px] font-semibold">
                      {detail.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTONES DE ACCIÓN - Abajo a la derecha */}
            {showActions && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(product);
                  }}
                  className="p-1.5 bg-black/10 hover:bg-black/20 rounded text-gray-900"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(product.id);
                  }}
                  className="p-1.5 bg-red-600 hover:bg-red-700 rounded text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
