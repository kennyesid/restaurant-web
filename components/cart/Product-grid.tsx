"use client";

import { Product } from "@/types/index";
import { useAppDispatch } from "@/store/store/hooks";
import { addToCart } from "@/store/store/slices/cartSlice";
import { ProductCard } from "@/components/cart/Product-card";

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
      }),
    );
    onProductSelect?.(product);
  };

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      suppressHydrationWarning
    >
      {products.map((product, index) => (
        <ProductCard
          key={index}
          product={product}
          showActions={false}
          onEdit={null}
          onDelete={null}
          onClick={(e) => {
            // e.stopPropagation();
            handleAddToCart(product);
          }}
        />
      ))}
    </div>
  );
}
