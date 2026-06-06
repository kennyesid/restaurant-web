"use client";

import { useEffect, useState } from "react";
import { Product, Category, ToastType } from "@/types/index";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productsSservice";
import { getCategories } from "@/services/categoriesService";
import { DraggableFeaturedProducts } from "@/components/draggable-featured-products";
import ButtonGeneric from "@/components/common/button/ButtonGeneric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/image-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ProductCard } from "@/components/cart/Product-card";
import { useAppDispatch } from "@/store/store/hooks";
import { CustomNotification } from "@/components/common/toast/CustomNotification";
import { toast } from "sonner";

export default function ProductsPage() {
  const dispatch = useAppDispatch();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  // 💡 ESTADO DEL FORMULARIO EXTENDIDO CON TODOS LOS CAMPOS DE LA INTERFAZ PRODUCT
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    categoryId: 0,
    groupId: "",
    code: "",
    legend: "",
    isPromotion: false,
    isFeatured: false,
    displayOrder: 0,
    isAvailable: true,
    piecesOfChicken: 0,
    state: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);

      const initialFeatured = productsData
        .filter((p) => p.isFeatured)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      setFeaturedProducts(initialFeatured);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      loading && setLoading(false);
    }
  };

  const filteredProducts =
    selectedCategory !== null
      ? products.filter(
        (p) =>
          p.categoryId === selectedCategory ||
          p.categoryId === Number(selectedCategory),
      )
      : products.filter((p) => p.isFeatured);

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleToggleFeatured = (product: Product) => {
    const isCurrentlyFeatured = featuredProducts.some(
      (p) => p.id === product.id,
    );

    const currentToastBody = {
      type: isCurrentlyFeatured ? ToastType.Warning : ToastType.Successfully,
      message: isCurrentlyFeatured ? "Éxito" : "Éxito",
      description: isCurrentlyFeatured
        ? "Producto eliminado de la lista."
        : "Producto agregado correctamente.",
      image: null,
    };

    if (isCurrentlyFeatured) {
      setFeaturedProducts(
        featuredProducts.filter((p) => p.id !== product.id),
      );
    } else {
      setFeaturedProducts([...featuredProducts, product]);
    }
    toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
  };

  const handleRemoveFeatured = (id: number) => {
    setFeaturedProducts(
      featuredProducts.filter((p) => p.id !== id),
    );
  };

  const handleReorderFeatured = (reorderedProducts: Product[]) => {
    setFeaturedProducts(reorderedProducts);
  };

  // 💡 ASIGNACIÓN ABSOLUTA DE VALORES AL ABRIR EL DIALOG (ALTA O EDICIÓN)
  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        imageUrl: product.imageUrl || "",
        categoryId: product.categoryId || 0,
        groupId: product.groupId || "",
        code: product.code || "",
        legend: product.legend || "",
        isPromotion: !!product.isPromotion,
        isFeatured: !!product.isFeatured,
        displayOrder: product.displayOrder || 0,
        isAvailable: product.isAvailable ?? true,
        piecesOfChicken: product.piecesOfChicken || 0,
        state: product.state ?? true,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        categoryId: categories[0]?.id || 0, // Fallback dinámico si existen categorías
        groupId: "",
        code: "",
        legend: "",
        isPromotion: false,
        isFeatured: false,
        displayOrder: products.length + 1, // Auto-asignar el final de la lista de prioridad
        isAvailable: true,
        piecesOfChicken: 0,
        state: true,
      });
    }
    setIsDialogOpen(true);
  };

  // 💡 CONTROL DEL BOTÓN GUARDAR (PERSISTENCIA TOTAL EN CASCADA COMPLETA)
  const handleSave = async () => {
    if (formData.categoryId === 0) {
      toast.error("Por favor, selecciona una categoría válida.");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        imageUrl: formData.imageUrl,
        categoryId: Number(formData.categoryId),
        groupId: formData.groupId || undefined,
        code: formData.code || undefined,
        legend: formData.legend,
        isPromotion: Boolean(formData.isPromotion),
        isFeatured: Boolean(formData.isFeatured),
        displayOrder: Number(formData.displayOrder),
        isAvailable: Boolean(formData.isAvailable),
        piecesOfChicken: formData.piecesOfChicken ? Number(formData.piecesOfChicken) : undefined,
        state: Boolean(formData.state),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          ...payload,
          productIngredientDetail: editingProduct.productIngredientDetail,
          productDetailProduct: editingProduct.productDetailProduct,
        });
      } else {
        await createProduct({
          ...payload,
          productIngredientDetail: [],
          productDetailProduct: [],
        });
      }

      const successToast = {
        type: ToastType.Successfully,
        message: "Operación Exitosa",
        description: editingProduct ? "Producto actualizado correctamente." : "Producto creado correctamente.",
        image: null,
      };
      toast.custom((t) => <CustomNotification t={t} body={successToast} />);

      await loadData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Ocurrió un error al intentar guardar el producto.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await deleteProduct(id);
        const deleteToast = {
          type: ToastType.Successfully,
          message: "Eliminado",
          description: "Producto removido del catálogo satisfactoriamente.",
          image: null,
        };
        toast.custom((t) => <CustomNotification t={t} body={deleteToast} />);
        await loadData();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center font-medium text-muted-foreground">Cargando catálogo...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="flex flex-col justify-center text-center">
          <h1 className="text-3xl text-rest-primary font-bold">Productos</h1>
          <p className="text-muted-foreground">
            Gestiona el catálogo completo, precios y destacados de cocina
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            <ButtonGeneric
              variant={selectedCategory === null ? "red" : "primaryRed"}
              onClick={() => handleCategoryFilter(null)}
            >
              Favoritos
            </ButtonGeneric>
            {categories.map((category) => (
              <ButtonGeneric
                key={category.id}
                variant={selectedCategory === category.id ? "red" : "primaryRed"}
                onClick={() => handleCategoryFilter(category.id)}
              >
                {category.name}
              </ButtonGeneric>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id || index}
                product={product}
                onEdit={(p) => handleOpenDialog(p)}
                onDelete={(id) => handleDelete(id)}
                onClick={(p) => handleToggleFeatured(p)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-end w-full">
            <ButtonGeneric
              variant="primaryRed"
              onClick={() => handleOpenDialog()}
              className="w-full sm:w-1/2"
            >
              Nuevo Producto
            </ButtonGeneric>
          </div>
          <Card className="p-4">
            <div className="flex flex-row justify-between items-center mb-2">
              <h2 className="font-semibold">
                Destacados ({featuredProducts.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Arrastra para reordenar
              </p>
            </div>
            <DraggableFeaturedProducts
              products={featuredProducts}
              onRemove={handleRemoveFeatured}
              onReorder={handleReorderFeatured}
              onSaveSuccess={loadData}
            />
          </Card>
        </div>
      </div>

      {/* MODAL DE ALTA Y EDICIÓN - FORMULARIO CON CAMPOS INTEGRALES */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? `Editar Producto: ${editingProduct.name}` : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              Completa detalladamente todos los atributos técnicos e informativos requeridos para el menú.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            {/* COLUMNA 1 */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Nombre del Producto *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Pollo Crujiente 4 Presas"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Precio (Bs.) *</label>
                <Input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Categoría del Menú *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                  className="w-full h-10 border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={0}>Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Código de Barra / Identificador Interno</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ej: P-0012"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Grupo de Producto (ID Agrupador)</label>
                <Input
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  placeholder="Ej: CombosFamiliares"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Cantidad Piezas de Pollo (Si aplica)</label>
                <Input
                  type="number"
                  value={formData.piecesOfChicken || ""}
                  onChange={(e) => setFormData({ ...formData, piecesOfChicken: Number(e.target.value) })}
                  placeholder="Ej: 4"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Orden de Visualización (Prioridad)</label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* COLUMNA 2 */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Descripción Corta *</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredientes o detalles de preparación..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Leyenda Alternativa (Texto del Ticket)</label>
                <Input
                  value={formData.legend}
                  onChange={(e) => setFormData({ ...formData, legend: e.target.value })}
                  placeholder="Ej: Con papas y refresco mediano"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">¿Es una Promoción / Combo?</label>
                <select
                  value={String(formData.isPromotion)}
                  onChange={(e) => setFormData({ ...formData, isPromotion: e.target.value === "true" })}
                  className="w-full h-10 border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none"
                >
                  <option value="false">No, es un producto normal</option>
                  <option value="true">Sí, contiene subproductos</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">¿Mostrar en Lista de Destacados?</label>
                <select
                  value={String(formData.isFeatured)}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.value === "true" })}
                  className="w-full h-10 border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none"
                >
                  <option value="false">No destacar automáticamente</option>
                  <option value="true">Destacar en la pantalla principal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Disponibilidad Inmediata (Stock de Cocina)</label>
                <select
                  value={String(formData.isAvailable)}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === "true" })}
                  className="w-full h-10 border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none"
                >
                  <option value="true">Disponible para la venta</option>
                  <option value="false">Agotado temporalmente</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Estado del Registro (Habilitación del ABM)</label>
                <select
                  value={String(formData.state)}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value === "true" })}
                  className="w-full h-10 border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none"
                >
                  <option value="true">Activo (Visible en Catálogo)</option>
                  <option value="false">Inactivo (Archivado u oculto)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Imagen (Mapeo Temporal Base64)</label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <ButtonGeneric variant="primaryRed" onClick={handleSave} className="px-6">
              {editingProduct ? "Guardar cambios" : "Crear producto"}
            </ButtonGeneric>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



// "use client";

// import { useEffect, useState } from "react";
// import { Product, Category, ToastType } from "@/types/index";
// import {
//   getProducts,
//   createProduct,
//   updateProduct,
//   deleteProduct,
// } from "@/services/productsSservice";
// import { getCategories } from "@/services/categoriesService";
// import { DraggableFeaturedProducts } from "@/components/draggable-featured-products";
// import ButtonGeneric from "@/components/common/button/ButtonGeneric";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { ImageUpload } from "@/components/image-upload";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { ProductCard } from "@/components/cart/Product-card";
// import { useAppDispatch } from "@/store/store/hooks";
// import { CustomNotification } from "@/components/common/toast/CustomNotification";
// import { toast } from "sonner";

// export default function ProductsPage() {
//   const dispatch = useAppDispatch();

//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
//   const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     price: 0,
//     imageUrl: "",
//     CategoryId: 0,
//   });

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [productsData, categoriesData] = await Promise.all([
//         getProducts(),
//         getCategories(),
//       ]);
//       setProducts(productsData);
//       setCategories(categoriesData);

//       const initialFeatured = productsData
//         .filter((p) => p.isFeatured)
//         .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

//       setFeaturedProducts(initialFeatured);
//     } catch (error) {
//       console.error("Error loading data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredProducts =
//     selectedCategory !== null
//       ? products.filter(
//         (p) =>
//           p.categoryId === selectedCategory ||
//           p.categoryId === Number(selectedCategory),
//       )
//       : products.filter((p) => p.isFeatured);

//   const handleCategoryFilter = (categoryId: number | null) => {
//     setSelectedCategory(categoryId);
//   };

//   const handleToggleFeatured = (product: Product) => {
//     const isCurrentlyFeatured = featuredProducts.some(
//       (p) => p.id === product.id,
//     );

//     const currentToastBody = {
//       type: isCurrentlyFeatured ? ToastType.Warning : ToastType.Successfully,
//       message: isCurrentlyFeatured ? "Exito" : "Exito",
//       description: isCurrentlyFeatured
//         ? "Producto eliminado de la lista."
//         : "Producto agregado correctamente.",
//       image: null,
//     };

//     if (isCurrentlyFeatured) {
//       setFeaturedProducts(
//         featuredProducts.filter((p) => p.id !== product.id),
//       );
//     } else {
//       setFeaturedProducts([...featuredProducts, product]);
//     }
//     toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
//   };

//   const handleRemoveFeatured = (id: number) => {
//     setFeaturedProducts(
//       featuredProducts.filter((p) => p.id !== id),
//     );
//   };

//   const handleReorderFeatured = (reorderedProducts: Product[]) => {
//     setFeaturedProducts(reorderedProducts);
//   };

//   const handleOpenDialog = (product?: Product) => {
//     if (product) {
//       setEditingProduct(product);
//       setFormData({
//         name: product.name,
//         description: product.description,
//         price: product.price,
//         imageUrl: product.imageUrl,
//         CategoryId: product.categoryId,
//       });
//     } else {
//       setEditingProduct(null);
//       setFormData({
//         name: "",
//         description: "",
//         price: 0,
//         imageUrl: "",
//         CategoryId: 0,
//       });
//     }
//     setIsDialogOpen(true);
//   };

//   const handleSave = async () => {
//     try {
//       if (editingProduct) {
//         await updateProduct(editingProduct.id, {
//           ...formData,
//           categoryId: formData.CategoryId,
//           isPromotion: editingProduct.isPromotion,
//           isFeatured: editingProduct.isFeatured,
//           displayOrder: editingProduct.displayOrder,
//           state: editingProduct.state,
//           isAvailable: true,
//         });
//       } else {
//         await createProduct({
//           name: formData.name,
//           description: formData.description,
//           price: formData.price,
//           imageUrl: formData.imageUrl,
//           categoryId: formData.CategoryId,
//           legend: "",
//           isPromotion: false,
//           isFeatured: false,
//           displayOrder: 0,
//           state: true,
//           isAvailable: true,
//         });
//       }
//       await loadData();
//       setIsDialogOpen(false);
//     } catch (error) {
//       console.error("Error saving product:", error);
//     }
//   };

//   const handleDelete = async (id: number) => {
//     if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
//       try {
//         await deleteProduct(id);
//         await loadData();
//       } catch (error) {
//         console.error("Error deleting product:", error);
//       }
//     }
//   };

//   const getCategoryName = (categoryId: number) => {
//     return categories.find((c) => c.id === categoryId)?.name || "N/A";
//   };

//   if (loading) {
//     return <div className="p-6">Cargando...</div>;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-center">
//         <div className="flex flex-col justify-center ">
//           <h1 className="text-3xl text-rest-primary font-bold">Productos</h1>
//           <p className="text-muted-foreground">
//             Selecciona y ordena productos destacados
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-4">
//           <div className="flex flex-row gap-2">
//             <ButtonGeneric
//               variant={selectedCategory === null ? "red" : "primaryRed"}
//               onClick={() => handleCategoryFilter(null)}
//             >
//               Favoritos
//             </ButtonGeneric>
//             {categories.map((category) => (
//               <ButtonGeneric
//                 key={category.id}
//                 variant={
//                   selectedCategory === category.id ? "red" : "primaryRed"
//                 }
//                 onClick={() => handleCategoryFilter(category.id)}
//               >
//                 {category.name}
//               </ButtonGeneric>
//             ))}
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {filteredProducts.map((product, index) => {
//               const isFeatured = featuredProducts.some(
//                 (p) => p.id === product.id,
//               );
//               return (
//                 <ProductCard
//                   key={index}
//                   product={product}
//                   onEdit={(p) => handleOpenDialog(p)}
//                   onDelete={(id) => handleDelete(id)}
//                   onClick={(p) => handleToggleFeatured(p)}
//                 />
//               );
//             })}
//           </div>
//         </div>

//         <div className="space-y-4">
//           <div className=" flex justify-end w-full">
//             <ButtonGeneric
//               variant="primaryRed"
//               onClick={() => handleOpenDialog()}
//               className=" w-1/2 "
//             >
//               {/* <Plus size={20} /> */}
//               Nuevo Producto
//             </ButtonGeneric>
//           </div>
//           <Card className="p-4">
//             <div className="flex flex-row justify-between">
//               <h2 className="font-semibold">
//                 Destacados ({featuredProducts.length})
//               </h2>
//               <p className="text-xs text-muted-foreground mt-1">
//                 Arrastra para reordenar
//               </p>
//             </div>
//             <DraggableFeaturedProducts
//               products={featuredProducts}
//               onRemove={handleRemoveFeatured}
//               onReorder={handleReorderFeatured}
//               onSaveSuccess={loadData}
//             />
//           </Card>
//         </div>
//       </div>

//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               {editingProduct ? "Editar Producto" : "Nuevo Producto"}
//             </DialogTitle>
//             <DialogDescription>
//               {editingProduct
//                 ? "Modifica los datos del producto"
//                 : "Crea un nuevo producto en el catálogo"}
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4">
//             <div>
//               <label className="text-sm font-medium">Nombre</label>
//               <Input
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//                 placeholder="Nombre del producto"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium">Descripción</label>
//               <Input
//                 value={formData.description}
//                 onChange={(e) =>
//                   setFormData({ ...formData, description: e.target.value })
//                 }
//                 placeholder="Descripción"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium">Precio</label>
//               <Input
//                 type="number"
//                 value={formData.price}
//                 onChange={(e) =>
//                   setFormData({ ...formData, price: Number(e.target.value) })
//                 }
//                 placeholder="0"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium">Categoría</label>
//               <select
//                 value={formData.CategoryId}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     CategoryId: Number(e.target.value),
//                   })
//                 }
//                 className="w-full border border-input rounded-lg px-3 py-2 text-sm"
//               >
//                 <option value={0}>Selecciona una categoría</option>
//                 {categories.map((cat) => (
//                   <option key={cat.id} value={cat.id}>
//                     {cat.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="text-sm font-medium">Imagen (Base64)</label>
//               <ImageUpload
//                 value={formData.imageUrl}
//                 onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
//               Cancelar
//             </Button>
//             <Button onClick={handleSave}>
//               {editingProduct ? "Guardar cambios" : "Crear producto"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
