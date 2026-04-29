// 'use client';

// import { useEffect, useState } from 'react';
// import { getProducts, getCategories } from '@/services/products';
// import { Product, Category } from '@/types/index';
// import { ProductGrid } from '@/components/product-grid';
// import { ShoppingCart } from '@/components/shopping-cart';
// import { Button } from '@/components/ui/button';
// import { Loader2 } from 'lucide-react';

// export default function POSPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const [allProducts, allCategories] = await Promise.all([
//           getProducts(),
//           getCategories(),
//         ]);
//         setProducts(allProducts);
//         setFilteredProducts(allProducts);
//         setCategories(allCategories);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   const handleCategoryFilter = (categoryId: number | null) => {
//     setSelectedCategory(categoryId);
//     if (categoryId) {
//       setFilteredProducts(products.filter(p => p.categoryId === categoryId));
//     } else {
//       setFilteredProducts(products);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold mb-2">Sistema POS</h1>
//         <p className="text-muted-foreground">Gestión de ventas en punto de venta</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Products Section */}
//         <div className="lg:col-span-2 space-y-4">
//           {/* Category Filter */}
//           <div className="flex flex-wrap gap-2">
//             <Button
//               variant={selectedCategory === null ? 'default' : 'outline'}
//               onClick={() => handleCategoryFilter(null)}
//             >
//               Todos
//             </Button>
//             {categories.map((category) => (
//               <Button
//                 key={category.categoryId}
//                 variant={selectedCategory === category.categoryId ? 'default' : 'outline'}
//                 onClick={() => handleCategoryFilter(category.categoryId)}
//               >
//                 {category.name}
//               </Button>
//             ))}
//           </div>

//           {/* Product Grid */}
//           <ProductGrid products={filteredProducts} />
//         </div>

//         {/* Shopping Cart */}
//         <div className="lg:col-span-1">
//           <ShoppingCart />
//         </div>
//       </div>
//     </div>
//   );
// }
