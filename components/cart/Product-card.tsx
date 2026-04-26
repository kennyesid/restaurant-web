'use client';

import { Product } from '@/types/index';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/utils/format';

interface ProductCardProps {
  product: Product;
  onEdit?: ((product: Product) => void) | null;
  onDelete?: ((productId: number) => void) | null;
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
      // className={cn("group aspect-[4/3] w-full [perspective:1000px]", className)}
      className={cn(
        "group w-full h-[50px] sm:h-[80px] md:h-[120px] lg:h-[160px] xl:h-[200px] [perspective:1000px]",
        className
      )}  
      onClick={() => onClick?.(product)}
    >
      {/* CONTENEDOR QUE GIRA */}
      <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-2xl">
        
        {/* --- CARA FRONTAL (Solo Imagen y Nombre) --- */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          {/* rounded-none */}
          <Card className="h-full w-full border-none rounded-xs overflow-hidden relative">
            <img
              src={getImageUrl(product.imageUrl)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Overlay elegante para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            {/* Nombre del Producto */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-lg font-bold uppercase tracking-wider drop-shadow-lg">
                {product.name}
              </h3>
            </div>

            {/* Precio siempre visible en el frente */}
            <div className="absolute top-0 right-0 p-2">
              <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 text-xs font-mono">
                {product.price.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
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
      <h3 className="text-gray-900 text-2xl font-black tracking-tighter ">
        {product.name}
      </h3>
      
      {/* Línea divisora simple */}
      {/* <div className="h-0.5 w-10 bg-gray-900 mb-4" /> */}

      {/* 2. DESCRIPCIÓN - Texto compacto */}
      <p className="text-gray-900 text-xs font-bold opacity-80  leading-tight">
        {product.description || "Descripción del producto"}
      </p>

      {/* 3. DETALLES - Lista con puntos negros sencillos */}
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
          onClick={(e) => { e.stopPropagation(); onEdit?.(product); }}
          className="p-1.5 bg-black/10 hover:bg-black/20 rounded text-gray-900"
        >
          <Edit2 size={14} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete?.(product.productId); }}
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


// 'use client';

// import { Product } from '@/types/index';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Edit2, Trash2, Star } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { getImageUrl } from '@/utils/format';

// interface ProductCardProps {
//   product: Product;
//   onEdit?: ((product: Product) => void) | null;
//   onDelete?: ((productId: number) => void) | null;
//   onClick?: (product: Product) => void;
//   showActions?: boolean;
//   className?: string;
// }

// export function ProductCard({
//   product,
//   onEdit,
//   onDelete,
//   onClick,
//   showActions = true,
//   className,
// }: ProductCardProps) {
  
//   return (
    
//     //  h-[220px] 
//     <div 
//       className={cn("group aspect-[4/3] w-full [perspective:1000px]", className)}
//       onClick={() => onClick?.(product)}
//     >
//       {/* CONTENEDOR QUE GIRA */}
//       <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-2xl">
        
//         {/* --- CARA FRONTAL (Solo Imagen y Nombre) --- */}
//         <div className="absolute inset-0 [backface-visibility:hidden]">
//           {/* rounded-none */}
//           <Card className="h-full w-full border-none rounded-xs overflow-hidden relative">
//             <img
//               src={getImageUrl(product.imageUrl)}
//               alt={product.name}
//               className="w-full h-full object-cover"
//             />
//             {/* Overlay elegante para legibilidad */}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
//             {/* Nombre del Producto */}
//             <div className="absolute bottom-4 left-4 right-4 text-white">
//               <h3 className="text-lg font-bold uppercase tracking-wider drop-shadow-lg">
//                 {product.name}
//               </h3>
//             </div>

//             {/* Precio siempre visible en el frente */}
//             <div className="absolute top-0 right-0 p-2">
//               <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 text-xs font-mono">
//                 {product.price.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
//               </span>
//             </div>
//           </Card>
//         </div>

//         {/* --- CARA TRASERA (Info y Acciones) --- */}
//         <div className="absolute inset-0 h-full w-full [transform:rotateY(180deg)] [backface-visibility:hidden]">
//           <Card className="h-full w-full border-none rounded-xs bg-[#facc15] flex flex-col justify-center items-center p-6 text-center">
            
//             <h3 className="text-white text-xl font-black mb-2 uppercase border-b border-white/20 pb-2 w-full">
//               {product.name}
//             </h3>
            
//             <p className="text-gray-400 text-sm leading-relaxed line-clamp-4 italic">
//               {product.description || "Insumos de alta calidad seleccionados para este plato."}
//             </p>

//             {/* Acciones movidas aquí para que no estorben en el frente */}
//             {showActions && (
//               <div className="mt-4 flex gap-3">
//                 {onEdit && (
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="h-9 w-9 rounded-none border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-all"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onEdit?.(product);
//                     }}
//                   >
//                     <Edit2 size={16} />
//                   </Button>
//                 )}
//                 {onDelete && (
//                   <Button
//                     size="sm"
//                     variant="destructive"
//                     className="h-9 w-9 rounded-none bg-red-600/80 hover:bg-red-600 shadow-lg"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onDelete?.(product.productId);
//                     }}
//                   >
//                     <Trash2 size={16} />
//                   </Button>
//                 )}
//               </div>
//             )}

//             {product.isFeatured && (
//               <div className="absolute top-4 right-4 text-yellow-500 animate-pulse">
//                 <Star size={18} fill="currentColor" />
//               </div>
//             )}
//           </Card>
//         </div>

//       </div>
//     </div>
//   );
// }




///////// BEFORE

// 'use client';

// import { Product } from '@/types/index';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Edit2, Trash2, Star } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { IMAGE_DEFAULT } from '@/lib/constants/constants';
// import { getImageUrl } from '@/utils/format';

// // Definimos las props para que sea flexible
// interface ProductCardProps {
//   product: Product;
//   onEdit?: ((product: Product) => void) | null;
//   onDelete?: ((productId: number) => void) | null;
//   onClick?: (product: Product) => void;
//   showActions?: boolean; // Para ocultar editar/eliminar en el POS
//   className?: string;
// }

// export function ProductCard({
//   product,
//   onEdit,
//   onDelete,
//   onClick,
//   showActions = true,
//   className,
// }: ProductCardProps) {
  
//   return (
//     <Card
//       className={cn(
//         "relative h-[200px] w-full rounded-xl border-none overflow-hidden group cursor-pointer hover:translate-y-[-8px] transition-all duration-300 shadow-md",
//         className
//       )}
//       onClick={() => onClick?.(product)}
//     >
//       {/* IMAGEN DE FONDO */}
//       <div className="absolute inset-0 z-0">
//         <img
//           src={getImageUrl(product.imageUrl)}
//           alt={product.name}
//           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
//       </div>

//       {/* PRECIO (Superior Derecha) */}
//       <div className="absolute top-3 right-2 z-10">
//         <span className="bg-[#011631] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border border-white/10">
//           {product.price.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
//         </span>
//       </div>

//       {/* INFO (Inferior) */}
//       <div className="absolute bottom-0 left-0 w-full p-5 z-10 text-white">
//         <h3 className="text-xl font-extrabold truncate drop-shadow-md">
//           {product.name}
//         </h3>
//         <p className="text-gray-200 text-sm line-clamp-2 mt-1 leading-snug font-medium">
//           {product.description || "Sin descripción disponible."}
//         </p>
//       </div>

//       {/* ACCIONES (Solo si showActions es true) */}
//       {showActions && (
//         <div className="absolute top-2 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
//             { onEdit && (
//                 <Button
//                     size="icon"
//                     variant="secondary"
//                     className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md border-none hover:bg-white hover:text-black transition-colors"
//                     onClick={(e) => {
//                     e.stopPropagation();
//                     onEdit?.(product);
//                     }}
//                 >
//                     <Edit2 size={14} />
//                 </Button>
//                 )
//             }
//             { onDelete && (
//                 <Button
//                     size="icon"
//                     variant="destructive"
//                     className="h-8 w-8 rounded-full shadow-lg"
//                     onClick={(e) => {
//                     e.stopPropagation();
//                     onDelete?.(product.productId);
//                     }}
//                 >
//                     <Trash2 size={14} />
//                 </Button>
//             )}
//         </div>
//       )}

//       {/* INDICADOR DESTACADO */}
//       {product.isFeatured && (
//         <div className="absolute bottom-4 right-2 text-yellow-400 drop-shadow-md">
//           <Star size={20} fill="currentColor" />
//         </div>
//       )}
//     </Card>
//   );
// }