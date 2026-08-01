"use client";

import { Product, ToastType } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
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

  // Estado local para controlar el texto interno de cada input de forma independiente
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});

  // Sincronizar el estado de los inputs locales cada vez que la lista externa de productos cambie
  useEffect(() => {
    const initialInputs: { [key: number]: string } = {};
    products.forEach((product, idx) => {
      initialInputs[product.id] = String(product.displayOrder || idx + 1);
    });
    setInputValues(initialInputs);
  }, [products]);

  // Mover elemento hacia arriba o hacia abajo
  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newProducts = [...products];
    const itemToMove = newProducts[index];

    newProducts[index] = newProducts[targetIndex];
    newProducts[targetIndex] = itemToMove;

    const finalOrderedList = newProducts.map((product, idx) => ({
      ...product,
      isFeatured: true,
      displayOrder: idx + 1,
    }));

    onReorder(finalOrderedList);
  };

  // Actualiza solo el texto en pantalla mientras el usuario escribe o borra
  const handleInputChange = (productId: number, value: string) => {
    setInputValues((prev) => ({ ...prev, [productId]: value }));
  };

  // Aplica el cambio real en la lista al salir de la caja o presionar Enter
  const handleApplyPosition = (index: number, productId: number) => {
    const rawValue = inputValues[productId];
    let targetPosition = parseInt(rawValue, 10);
    const currentPosition = index + 1;

    // Si el usuario dejó la caja vacía o escribió algo inválido, revertimos al valor original
    if (isNaN(targetPosition) || targetPosition < 1) {
      setInputValues((prev) => ({ ...prev, [productId]: String(currentPosition) }));
      return;
    }

    // Acotar el valor máximo al límite de la lista
    if (targetPosition > products.length) {
      targetPosition = products.length;
    }

    const targetIndex = targetPosition - 1;

    // Si la posición es exactamente la misma, no hacemos nada extra
    if (index === targetIndex) {
      setInputValues((prev) => ({ ...prev, [productId]: String(targetPosition) }));
      return;
    }

    const newProducts = [...products];
    const [draggedProduct] = newProducts.splice(index, 1);
    newProducts.splice(targetIndex, 0, draggedProduct);

    const finalOrderedList = newProducts.map((product, idx) => ({
      ...product,
      isFeatured: true,
      displayOrder: idx + 1,
    }));

    onReorder(finalOrderedList);
  };

  const handleSaveToStorage = async () => {
    setIsSaving(true);
    try {
      await updateFeaturedProductsOrder(products);
      const currentToastBody = {
        type: ToastType.Successfully,
        message: "Éxito",
        description: "Orden de productos favoritos guardado correctamente.",
        image: null,
      };
      toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
      onSaveSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al guardar las posiciones.");
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
      <div className="flex flex-col w-full gap-2">
        {products.map((product, index) => {
          const displayValue = inputValues[product.id] ?? String(product.displayOrder || index + 1);

          return (
            <Card
              key={product.id}
              className="flex flex-row items-center gap-3 p-2.5 w-full border border-gray-100 bg-slate-50/90 shadow-sm rounded-2xl hover:bg-white hover:shadow-md transition-all duration-200"
            >
              {/* CONTROL: Input independiente + Botones de Ajuste Fino */}
              <div className="flex items-center gap-1 bg-white border border-gray-200 p-1.5 rounded-xl shadow-inner">
                <input
                  type="number"
                  value={displayValue}
                  min={1}
                  max={products.length}
                  onChange={(e) => handleInputChange(product.id, e.target.value)}
                  onBlur={() => handleApplyPosition(index, product.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleApplyPosition(index, product.id);
                      (e.target as HTMLInputElement).blur(); // Quita el foco tras presionar Enter
                    }
                  }}
                  onFocus={(e) => e.target.select()} // Selecciona todo el texto al hacer clic (Ideal para móviles)
                  className="w-10 text-center font-bold text-sm text-gray-700 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  title="Escribe la posición directa y presiona Enter"
                />

                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, "up")}
                    className="p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={index === products.length - 1}
                    onClick={() => moveItem(index, "down")}
                    className="p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Imagen del Producto */}
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

              {/* Detalles del Producto */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate uppercase tracking-tight">
                  {product.name}
                </p>
                <p className="text-[11px] font-semibold text-blue-600/70">
                  Bs {product.price.toLocaleString("es-BO")}
                </p>
              </div>

              {/* Botón Eliminar */}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(product.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <ButtonGeneric variant="primary" onClick={handleSaveToStorage}>
          {isSaving ? "Guardando cambios..." : "Guardar Cambios"}
        </ButtonGeneric>
      </div>
    </div>
  );
}


// "use client";

// import { Product, ToastType } from "@/types";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { useState } from "react";
// import { GripVertical, Save, Trash2 } from "lucide-react";
// import { getImageUrl } from "@/utils/format";
// import Image from "next/image";
// import { updateFeaturedProductsOrder } from "@/services/productsSservice";
// import ButtonGeneric from "./common/button/ButtonGeneric";
// import { toast } from "sonner";
// import { CustomNotification } from "./common/toast/CustomNotification";

// interface DraggableFeaturedProductsProps {
//   products: Product[];
//   onRemove: (productId: number) => void;
//   onReorder: (products: Product[]) => void;
//   onSaveSuccess: () => void;
// }

// export function DraggableFeaturedProducts({
//   products,
//   onRemove,
//   onReorder,
//   onSaveSuccess,
// }: DraggableFeaturedProductsProps) {
//   const [isSaving, setIsSaving] = useState(false);
//   const [draggedItem, setDraggedItem] = useState<number | null>(null);

//   const handleDragStart = (index: number) => {
//     setDraggedItem(index);
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//   };

//   const handleDrop = (targetIndex: number) => {
//     if (draggedItem === null || draggedItem === targetIndex) {
//       setDraggedItem(null);
//       return;
//     }

//     const newProducts = [...products];
//     const draggedProduct = newProducts[draggedItem];
//     newProducts.splice(draggedItem, 1);
//     newProducts.splice(targetIndex, 0, draggedProduct);

//     const finalOrderedList = newProducts.map((product, idx) => ({
//       ...product,
//       isFeatured: true,
//       displayOrder: idx + 1,
//     }));

//     setDraggedItem(null);
//     onReorder(finalOrderedList);
//   };

//   const handleDragEnd = () => {
//     setDraggedItem(null);
//   };

//   const handleSaveToStorage = async () => {
//     setIsSaving(true);
//     try {
//       await updateFeaturedProductsOrder(products);
//       const currentToastBody = {
//         type: ToastType.Successfully,
//         message: "Exito",
//         description: "Productos agregados a Favoritos correctamente.",
//         image: null,
//       };
//       toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
//       onSaveSuccess();
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (products.length === 0) {
//     return (
//       <Card className="p-8 text-center text-muted-foreground">
//         <p>Selecciona productos para ver aquí</p>
//       </Card>
//     );
//   }

//   return (
//     <div className="flex flex-col w-full gap-4">
//       {" "}
//       <div className="flex flex-col w-full gap-2">
//         {products.map((product, index) => (
//           <Card
//             key={product.id}
//             draggable
//             onDragStart={() => handleDragStart(index)}
//             onDragOver={handleDragOver}
//             onDrop={() => handleDrop(index)}
//             onDragEnd={handleDragEnd}
//             className={`flex flex-row items-center gap-3 p-2 w-full
//             cursor-move transition-all border-none bg-slate-50/80 shadow-sm rounded-2xl
//             ${draggedItem === index ? "opacity-40 ring-2 ring-blue-500 scale-[0.98]" : "hover:bg-white hover:shadow-md"}
//           `}
//           >
//             <div className="relative w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden shadow-inner bg-gray-200">
//               {product.imageUrl ? (
//                 <Image
//                   src={getImageUrl(product.imageUrl)}
//                   alt={product.name}
//                   fill
//                   sizes="48px"
//                   priority
//                   className="object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-xl">
//                   🍔
//                 </div>
//               )}
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="font-bold text-gray-800 text-sm truncate uppercase tracking-tight">
//                 {product.name}
//               </p>
//               <p className="text-[11px] font-semibold text-blue-600/70">
//                 Bs {product.price.toLocaleString("es-BO")}
//               </p>
//             </div>
//             <span className="text-[10px] font-bold text-gray-400 bg-gray-200/50 px-2 py-1 rounded-md">
//               Pos. {product.displayOrder || index + 1}
//             </span>
//             <Button
//               size="icon"
//               variant="ghost"
//               className="h-8 w-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onRemove(product.id);
//               }}
//             >
//               <Trash2 className="w-4 h-4" />
//             </Button>
//           </Card>
//         ))}
//       </div>
//       <div className="flex justify-end border-t border-gray-100">
//         <ButtonGeneric variant="primary" onClick={handleSaveToStorage}>
//           {isSaving ? "Guardando cambios..." : "Guardar Cambios"}
//         </ButtonGeneric>
//       </div>
//     </div>
//   );
// }
