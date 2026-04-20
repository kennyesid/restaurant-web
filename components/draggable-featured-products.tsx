'use client';

import { Product } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';

interface DraggableFeaturedProductsProps {
  products: Product[];
  onRemove: (productId: number) => void;
  onReorder: (products: Product[]) => void;
}

export function DraggableFeaturedProducts({
  products,
  onRemove,
  onReorder,
}: DraggableFeaturedProductsProps) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedItem === null || draggedItem === targetIndex) {
      setDraggedItem(null);
      return;
    }

    const newProducts = [...products];
    const draggedProduct = newProducts[draggedItem];
    newProducts.splice(draggedItem, 1);
    newProducts.splice(targetIndex, 0, draggedProduct);

    setDraggedItem(null);
    onReorder(newProducts);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  if (products.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>Selecciona productos para ver aquí</p>
      </Card>
    );
  }

  return (
  <div className="flex flex-col w-full gap-2 ">
    {products.map((product, index) => (
      <Card
        key={product.productId}
        draggable
        onDragStart={() => handleDragStart(index)}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(index)}
        onDragEnd={handleDragEnd}
        className={`flex flex-row items-center gap-3 p-2 w-full
          cursor-move transition-all border-none bg-slate-50/80 shadow-sm rounded-2xl
          ${draggedItem === index ? 'opacity-40 ring-2 ring-blue-500 scale-[0.98]' : 'hover:bg-white hover:shadow-md'}
        `}
      >
        <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden shadow-inner bg-gray-200">
          {product.imageUrl ? (
            <img
              src={product.imageUrl.startsWith('data:') ? product.imageUrl : `data:image/avif;base64,${product.imageUrl}`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">🍔</div>
          )}
        </div>

        {/* Información del Producto */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm truncate uppercase tracking-tight">
            {product.name}
          </p>
          <p className="text-[11px] font-semibold text-blue-600/70">
            Bs {product.price.toLocaleString('es-BO')}
          </p>
        </div>

        {/* Indicador de orden (opcional, ayuda visualmente en el drag) */}
        <span className="text-[10px] font-bold text-gray-300 px-1">
          #{index + 1}
        </span>

        {/* Botón de eliminar (Estilo estrella/limpio) */}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(product.productId);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </Card>
    ))}
  </div>
);
}
