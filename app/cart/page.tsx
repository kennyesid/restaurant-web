"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/productsSservice";
import { getCategories } from "@/services/categoriesService";
import { Product, Category } from "@/types/index";
import { ProductGrid } from "@/components/cart/Product-grid";
import { ShoppingCart } from "@/components/cart/Shopping-cart";
import { Loader2, X } from "lucide-react";
import ButtonGeneric from "@/components/common/button/ButtonGeneric";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/store/hooks";
import { setToggleCartFalse, toggleCartSide } from "@/store/store/slices/cartSlice";
import PageHeader from "@/components/page/header/PageHeader";

const getFeaturedProducts = (products: Product[]) => {
  return products
    .filter((p) => p.isFeatured)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
};

export default function CartPage() {
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isCartSideOpen = useAppSelector((state) => state.cart.isCartOpen);

  useEffect(() => {
    dispatch(setToggleCartFalse());
  }, [dispatch]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allProducts, allCategories] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(allProducts);
        setFilteredProducts(getFeaturedProducts(allProducts));
        setCategories(allCategories);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setFilteredProducts(products.filter((p) => p.categoryId === categoryId));
    } else {
      setFilteredProducts(getFeaturedProducts(products));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleDebuugTest = () => {
    let vg = "";
    console.log("prueba del handleDebuugTest");
    alert('asdasd');
    const hhgg = "sadsad";
  }

  return (
    <div className="space-y-3">
      <PageHeader
        title="Gestión de Ventas"
        subtitle="Punto de Venta (POS) y facturación de la sucursall"
      />

      <div
        className={cn(
          "grid grid-cols-1 gap-6 transition-all duration-300",
          isCartSideOpen ? "lg:grid-cols-3" : "lg:grid-cols-1",
        )}
      >
        {/* 2. CONTENEDOR DE PRODUCTOS Y CATEGORÍAS */}
        <div
          className={cn(
            "space-y-4 transition-all duration-300",
            isCartSideOpen ? "lg:col-span-2" : "lg:col-span-1",
          )}
        >
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap md:flex-nowrap md:overflow-x-auto gap-2 pb-2 md:scrollbar-none">
            <ButtonGeneric
              variant={selectedCategory === null ? "red" : "primaryRed"}
              onClick={() => handleCategoryFilter(null)}
            >
              Favoritos
            </ButtonGeneric>
            {categories.map((category) => (
              <ButtonGeneric
                key={category.id}
                variant={
                  selectedCategory === category.id ? "red" : "primaryRed"
                }
                onClick={() => handleCategoryFilter(category.id)}
              >
                {category.name}
              </ButtonGeneric>
            ))}
          </div>
          <ProductGrid products={filteredProducts} />
        </div>
        {isCartSideOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
              onClick={() => dispatch(toggleCartSide())}
            />
            <div
              className={cn(
                "fixed top-0 right-0 h-full w-full max-w-md bg-card z-50 p-4 shadow-2xl flex flex-col justify-between",
                "animate-in slide-in-from-right duration-300",
                "lg:static lg:h-auto lg:w-auto lg:max-w-none lg:z-0 lg:p-0 lg:shadow-none lg:bg-transparent lg:col-span-1",
              )}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b lg:hidden">
                <span className="font-bold text-lg text-rest-primary">
                  Pedido Actual
                </span>
                <button
                  onClick={() => dispatch(toggleCartSide())}
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-170px)] overflow-y-auto border rounded-xl shadow-sm bg-card">
                <ShoppingCart />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
