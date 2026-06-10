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
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
import { uploadImageToSupabase } from "@/lib/dataBase/databaseService";

export default function ProductsPage() {
  const dispatch = useAppDispatch();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.description.trim()) newErrors.description = "La descripción es obligatoria";
    if (!formData.categoryId || formData.categoryId === 0) newErrors.categoryId = "Selecciona una categoría";
    if (!formData.price || formData.price <= 0) newErrors.price = "El precio debe ser mayor a 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      setLoading(false);
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
      message: isCurrentlyFeatured ? "Exito" : "Exito",
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

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
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
        categoryId: categories[0]?.id || 0,
        groupId: "",
        code: "",
        legend: "",
        isPromotion: false,
        isFeatured: false,
        displayOrder: products.length + 1,
        isAvailable: true,
        piecesOfChicken: 0,
        state: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    try {
      let finalImageUrl = formData.imageUrl;

      if (formData.imageUrl && formData.imageUrl.startsWith('data:image')) {
        try {
          finalImageUrl = await uploadImageToSupabase(formData.imageUrl, 'products');
        } catch (uploadError) {
          toast.error("Error al subir la imagen");
          return;
        }
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
        legend: formData.legend || "",
        isPromotion: formData.isPromotion,
        imageUrl: finalImageUrl,
        isFeatured: editingProduct ? editingProduct.isFeatured : false,
        displayOrder: editingProduct ? editingProduct.displayOrder : 0,
        state: editingProduct ? editingProduct.state : true,
        isAvailable: true,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success("Producto actualizado");
      } else {
        await createProduct(productData, formData.imageUrl?.startsWith('data:image') ? formData.imageUrl : undefined);
        toast.success("Producto creado");
      }

      await loadData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Ocurrió un error al guardar");
    } finally {

    }
  };

  // const handleSave = async () => {
  //   if (!validateForm()) {
  //     toast.error("Por favor, corrige los errores en el formulario");
  //     return;
  //   }

  //   try {
  //     if (editingProduct) {
  //       await updateProduct(editingProduct.id, {
  //         ...formData,
  //         categoryId: formData.categoryId,
  //         isPromotion: editingProduct.isPromotion,
  //         isFeatured: editingProduct.isFeatured,
  //         displayOrder: editingProduct.displayOrder,
  //         state: editingProduct.state,
  //         isAvailable: true,
  //       });
  //     } else {

  //       const imageBase64 = formData.imageUrl;

  //       await createProduct({
  //         name: formData.name,
  //         description: formData.description,
  //         price: formData.price,
  //         imageUrl: formData.imageUrl,
  //         categoryId: formData.categoryId,
  //         legend: "",
  //         isPromotion: false,
  //         isFeatured: false,
  //         displayOrder: 0,
  //         state: true,
  //         isAvailable: true,
  //       }, imageBase64);
  //     }
  //     await loadData();
  //     setIsDialogOpen(false);
  //   } catch (error) {
  //     console.error("Error saving product:", error);
  //   }
  // };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await deleteProduct(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || "N/A";
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="flex flex-col justify-center ">
          <h1 className="text-3xl text-rest-primary font-bold">Productos</h1>
          <p className="text-muted-foreground">
            Selecciona y ordena productos destacados
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-row gap-2">
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => {
              const isFeatured = featuredProducts.some(
                (p) => p.id === product.id,
              );
              return (
                <ProductCard
                  key={index}
                  product={product}
                  onEdit={(p) => handleOpenDialog(p)}
                  onDelete={(id) => handleDelete(id)}
                  onClick={(p) => handleToggleFeatured(p)}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className=" flex justify-end w-full">
            <ButtonGeneric
              variant="primaryRed"
              onClick={() => handleOpenDialog()}
              className=" w-1/2 "
            >
              {/* <Plus size={20} /> */}
              Nuevo Producto
            </ButtonGeneric>
          </div>
          <Card className="p-4">
            <div className="flex flex-row justify-between">
              <h2 className="font-semibold">
                Destacados ({featuredProducts.length})
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
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

      {/* 💡 REEMPLAZO LOGRADO CON TU RESPONSIVE MODAL REUTILIZABLE */}
      <ResponsiveModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleSave} // Ejecuta la persistencia directo desde el botón "Aceptar" nativo
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        subtitle={
          editingProduct
            ? "Modifica los datos del producto en el catálogo"
            : "Crea un nuevo producto con todos sus atributos requeridos"
        }
        size="xl" // Asigna el ancho max-w-2xl para contener cómodamente las dos columnas
        confirmText={editingProduct ? "Guardar cambios" : "Crear producto"}
        cancelText="Cancelar"
        isProcessing={false} // Puedes enlazarlo aquí a un estado local 'isSaving' si lo requieres en el futuro
      >
        {/* Contenedor en dos columnas adaptativo para el formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {/* COLUMNA IZQUIERDA (Atributos principales de identificación y costos) */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del producto"
                className={errors.name ? "border-red-500" : ""}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Descripción *</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción o ingredientes..."
                className={errors.description ? "border-red-500" : ""}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Categoría *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                className={`w-full border ${errors.categoryId ? "border-red-500" : "border-input"} rounded-lg h-10 px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring`}
              >
                <option value={0}>Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Leyenda del Ticket</label>
              <Input
                value={formData.legend}
                onChange={(e) => setFormData({ ...formData, legend: e.target.value })}
                placeholder="Ej: Con papas fritas y gaseosa"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Precio *</label>
              <Input
                type="number"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="0"
                className={errors.price ? "border-red-500" : ""}
              />
            </div>

            <div className="">
              <label className="text-xs font-semibold text-slate-600 block mb-2">
                ¿Es Promoción / Combo?
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={formData.isPromotion}
                onClick={() => setFormData({ ...formData, isPromotion: !formData.isPromotion })}
                className={`
                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500
                            ${formData.isPromotion ? 'bg-yellow-500' : 'bg-gray-300'}
                          `}
              >
                <span
                  className={`
                            inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform 
                            ${formData.isPromotion ? 'translate-x-6' : 'translate-x-0.5'}
                          `}
                />
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 block">Imagen del Producto</label>
          <ImageUpload
            value={formData.imageUrl}
            onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
          />
        </div>
      </ResponsiveModal>
    </div>
  );
}



{/* <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Piezas de Pollo (Si aplica)</label>
              <Input
                type="number"
                value={formData.piecesOfChicken || ""}
                onChange={(e) => setFormData({ ...formData, piecesOfChicken: Number(e.target.value) })}
                placeholder="0"
              />
            </div> */}

{/* <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Prioridad de Visualización</label>
              <Input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                placeholder="0"
              />
            </div> */}

{/* <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">¿Disponible para Venta?</label>
              <select
                value={String(formData.isAvailable)}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === "true" })}
                className="w-full border border-input rounded-lg h-10 px-3 py-2 text-sm bg-background focus:outline-none"
              >
                <option value="true">Sí (En Stock)</option>
                <option value="false">No (Agotado)</option>
              </select>
            </div> */}

{/* <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Estado del Registro</label>
              <select
                value={String(formData.state)}
                onChange={(e) => setFormData({ ...formData, state: e.target.value === "true" })}
                className="w-full border border-input rounded-lg h-10 px-3 py-2 text-sm bg-background focus:outline-none"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div> */}


{/* <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Precio *</label>
              <Input
                type="number"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="0"
              />
            </div> */}


{/* <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Código Interno (SKU)</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ej: POL-001"
              />
            </div> */}

{/* <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">ID Grupo (groupId)</label>
              <Input
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                placeholder="Ej: Combos"
              />
            </div> */}