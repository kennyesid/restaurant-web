'use client';

import { Product } from '@/lib/types';
import { useAppDispatch } from '@/lib/hooks';
import { addToCart } from '@/lib/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  onProductSelect?: (product: Product) => void;
}

export function ProductGrid({ products, onProductSelect }: ProductGridProps) {
  const dispatch = useAppDispatch();

  const handleAddToCart = (product: Product) => {
    dispatch(
      addToCart({
        id: product.id_product,
        name: product.name,
        price: product.price,
        category: product.id_category,
        quantity: 1,
      })
    );
    onProductSelect?.(product);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card
          key={product.id_product}
          className={cn(
            'p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 group',
            product.is_available ? 'bg-card' : 'opacity-50'
          )}
          onClick={() => !product.is_available || handleAddToCart(product)}
        >
          {/* Product Image */}
          <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-3 flex items-center justify-center group-hover:shadow-lg transition-shadow overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <p className="text-2xl">🍔</p>
                <p className="text-xs text-muted-foreground mt-1 truncate px-1">Sin imagen</p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
          <p className="text-lg font-bold text-primary mt-2">
            ${product.price.toLocaleString('es-CO')}
          </p>

          {/* Add Button */}
          <Button
            size="sm"
            className="w-full mt-3"
            disabled={!product.is_available}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
          >
            <Plus size={16} className="mr-1" />
            Agregar
          </Button>
        </Card>
      ))}
    </div>
  );
}
