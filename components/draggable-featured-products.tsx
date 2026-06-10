"use client";

import { Product, ToastType } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GripVertical, Save, Trash2 } from "lucide-react";
import { getImageUrl } from "@/utils/format";
import Image from "next/image";
import { updateFeaturedProductsOrder } from "@/services/productsSservice";
import ButtonGeneric from "./common/button/ButtonGeneric";
import { toast } from "sonner";
import { CustomNotification } from "./common/toast/CustomNotification";

interface DraggableFeaturedProductsProps {
  products: Product[];
  onRemove: (productId: number) => void;
  onReorder: (products: Product[]) => void;
  onSaveSuccess: () => void;
}

export function DraggableFeaturedProducts({
  products,
  onRemove,
  onReorder,
  onSaveSuccess,
}: DraggableFeaturedProductsProps) {
  const [isSaving, setIsSaving] = useState(false);
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

    // NUEVO: Al reordenar, actualizamos las propiedades en la lista temporal de la UI
    const finalOrderedList = newProducts.map((product, idx) => ({
      ...product,
      isFeatured: true,
      displayOrder: idx + 1, // Ej: Posición 1, 2, 3...
    }));

    setDraggedItem(null);
    onReorder(finalOrderedList); // Le avisa al padre cómo quedó la nueva lista armada
  };
  // const handleDrop = (targetIndex: number) => {
  //   if (draggedItem === null || draggedItem === targetIndex) {
  //     setDraggedItem(null);
  //     return;
  //   }

  //   const newProducts = [...products];
  //   const draggedProduct = newProducts[draggedItem];
  //   newProducts.splice(draggedItem, 1);
  //   newProducts.splice(targetIndex, 0, draggedProduct);

  //   setDraggedItem(null);
  //   onReorder(newProducts);
  // };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSaveToStorage = async () => {
    setIsSaving(true);
    try {
      await updateFeaturedProductsOrder(products);
      const currentToastBody = {
        type: ToastType.Successfully,
        message: "Exito",
        description: "Productos agregados a Favoritos correctamente.",
        image: null,
      };
      toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
      onSaveSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (products.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>Selecciona productos para ver aquí</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col w-full gap-4">
      {" "}
      {/* Aumentamos el gap general a 4 */}
      {/* LISTA DE TARJETAS */}
      <div className="flex flex-col w-full gap-2">
        {products.map((product, index) => (
          <Card
            key={product.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`flex flex-row items-center gap-3 p-2 w-full
            cursor-move transition-all border-none bg-slate-50/80 shadow-sm rounded-2xl
            ${draggedItem === index ? "opacity-40 ring-2 ring-blue-500 scale-[0.98]" : "hover:bg-white hover:shadow-md"}
          `}
          >
            <div className="relative w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden shadow-inner bg-gray-200">
              {product.imageUrl ? (
                <Image
                  src={getImageUrl(product.imageUrl)}
                  alt={product.name}
                  fill
                  sizes="48px"
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">
                  🍔
                </div>
              )}
            </div>

            {/* Información del Producto */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm truncate uppercase tracking-tight">
                {product.name}
              </p>
              <p className="text-[11px] font-semibold text-blue-600/70">
                Bs {product.price.toLocaleString("es-BO")}
              </p>
            </div>

            {/* Indicador de orden (Muestra el número real guardado en displayOrder) */}
            <span className="text-[10px] font-bold text-gray-400 bg-gray-200/50 px-2 py-1 rounded-md">
              Pos. {product.displayOrder || index + 1}
            </span>

            {/* Botón de eliminar */}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(product.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
      <div className="flex justify-end border-t border-gray-100">
        <ButtonGeneric variant="primary" onClick={handleSaveToStorage}>
          {/* <Save className="w-4 h-4" /> */}
          {isSaving ? "Guardando cambios..." : "Guardar Cambios"}
        </ButtonGeneric>
      </div>
    </div>
  );

  // return (
  //   <div className="flex flex-col w-full gap-2 ">
  //     {products.map((product, index) => (
  //       <Card
  //         key={product.productId}
  //         draggable
  //         onDragStart={() => handleDragStart(index)}
  //         onDragOver={handleDragOver}
  //         onDrop={() => handleDrop(index)}
  //         onDragEnd={handleDragEnd}
  //         className={`flex flex-row items-center gap-3 p-2 w-full
  //         cursor-move transition-all border-none bg-slate-50/80 shadow-sm rounded-2xl
  //         ${draggedItem === index ? 'opacity-40 ring-2 ring-blue-500 scale-[0.98]' : 'hover:bg-white hover:shadow-md'}
  //       `}
  //       >
  //         <div className=" relative w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden shadow-inner bg-gray-200">
  //           {product.imageUrl ? (
  //             <Image
  //               src={getImageUrl(product.imageUrl)}
  //               alt={product.name}
  //               fill
  //               sizes="48px"
  //               priority
  //               className="object-cover"
  //             />
  //           ) : (
  //             <div className="w-full h-full flex items-center justify-center text-xl">🍔</div>
  //           )}
  //         </div>

  //         <div className="flex-1 min-w-0">
  //           <p className="font-bold text-gray-800 text-sm truncate uppercase tracking-tight">
  //             {product.name}
  //           </p>
  //           <p className="text-[11px] font-semibold text-blue-600/70">
  //             Bs {product.price.toLocaleString('es-BO')}
  //           </p>
  //         </div>

  //         <span className="text-[10px] font-bold text-gray-300 px-1">
  //           #{index + 1}
  //         </span>

  //         <Button
  //           size="icon"
  //           variant="ghost"
  //           className="h-8 w-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             onRemove(product.productId);
  //           }}
  //         >
  //           <Trash2 className="w-4 h-4" />
  //         </Button>
  //       </Card>
  //     ))}
  //   </div>
  // );
}
