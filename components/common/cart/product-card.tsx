'use client';

import { Product } from '@/types/index';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IMAGE_DEFAULT } from '@/lib/constants/constants';
import { getImageUrl } from '@/utils/format';

// Definimos las props para que sea flexible
interface ProductCardProps {
  product: Product;
  onEdit?: ((product: Product) => void) | null;
  onDelete?: ((productId: number) => void) | null;
  onClick?: (product: Product) => void;
  showActions?: boolean; // Para ocultar editar/eliminar en el POS
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
  
  // Helper para manejar el renderizado de imagen Base64
//   const getImageUrl = (url?: string) => {
//     if (!url) return `data:image/avif;base64,${IMAGE_DEFAULT}`;
//     return url.startsWith('data:') ? url : `data:image/avif;base64,${url}`;
//   };

  return (
    <Card
      className={cn(
        "relative h-[200px] w-full rounded-xl border-none overflow-hidden group cursor-pointer hover:translate-y-[-8px] transition-all duration-300 shadow-md",
        className
      )}
      onClick={() => onClick?.(product)}
    >
      {/* IMAGEN DE FONDO */}
      <div className="absolute inset-0 z-0">
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* PRECIO (Superior Derecha) */}
      <div className="absolute top-3 right-2 z-10">
        <span className="bg-[#011631] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border border-white/10">
          {product.price.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
        </span>
      </div>

      {/* INFO (Inferior) */}
      <div className="absolute bottom-0 left-0 w-full p-5 z-10 text-white">
        <h3 className="text-xl font-extrabold truncate drop-shadow-md">
          {product.name}
        </h3>
        <p className="text-gray-200 text-sm line-clamp-2 mt-1 leading-snug font-medium">
          {product.description || "Sin descripción disponible."}
        </p>
      </div>

      {/* ACCIONES (Solo si showActions es true) */}
      {showActions && (
        <div className="absolute top-2 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            { onEdit && (
                <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md border-none hover:bg-white hover:text-black transition-colors"
                    onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(product);
                    }}
                >
                    <Edit2 size={14} />
                </Button>
                )
            }
            { onDelete && (
                <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 rounded-full shadow-lg"
                    onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(product.productId);
                    }}
                >
                    <Trash2 size={14} />
                </Button>
            )}
        </div>
      )}

      {/* INDICADOR DESTACADO */}
      {product.isFeatured && (
        <div className="absolute bottom-4 right-2 text-yellow-400 drop-shadow-md">
          <Star size={20} fill="currentColor" />
        </div>
      )}
    </Card>
  );
}