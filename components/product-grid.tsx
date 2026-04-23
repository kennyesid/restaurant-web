'use client';

import { Product } from '@/types/index';
import { useAppDispatch } from '@/lib/hooks';
import { addToCart } from '@/lib/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard } from './common/cart/product-card';

interface ProductGridProps {
  products: Product[];
  onProductSelect?: (product: Product) => void;
}

export function ProductGrid({ products, onProductSelect }: ProductGridProps) {
  const dispatch = useAppDispatch();

  const handleAddToCart = (product: Product) => {

    dispatch(
      addToCart({
        productId: product.productId,
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        quantity: 1,
        imageUrl: product.imageUrl,
      })
    );
    onProductSelect?.(product);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    suppressHydrationWarning
    >
      {products.map((product) => (
                        <ProductCard 
                          product={product}
                          onEdit={null}
                          onDelete={null}
                          onClick={(e) => {
              // e.stopPropagation();
              handleAddToCart(product);
            }}
                        />
        // <Card
        //   key={product.productId}
        //   suppressHydrationWarning
        //   className={cn(
        //     'p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 group',
        //     product.isAvailable ? 'bg-card' : 'opacity-50'
        //   )}
        //   onClick={() => handleAddToCart(product)}
        // >
        //   <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-3 flex items-center justify-center group-hover:shadow-lg transition-shadow overflow-hidden">
        //     {product.imageUrl ? (
        //       <img
        //         src={product.imageUrl}
        //         alt={product.name}
        //         className="w-full h-full object-cover"
        //       />
        //     ) : (
        //       <div className="text-center">
        //         <p className="text-2xl">🍔</p>
        //         <p className="text-xs text-muted-foreground mt-1 truncate px-1">Sin imagen</p>
        //       </div>
        //     )}
        //   </div>
        //   <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
        //   <p className="text-lg font-bold text-primary mt-2">
        //     Bs {product.price.toString()}
        //   </p>
        //   <Button
        //     size="sm"
        //     className="w-full mt-3"
        //     disabled={!product.isAvailable}
        //     onClick={(e) => {
        //       e.stopPropagation();
        //       handleAddToCart(product);
        //     }}
        //   >
        //     <Plus size={16} className="mr-1" />
        //     Agregar
        //   </Button>
        // </Card>
      ))}
    </div>
  );
}
