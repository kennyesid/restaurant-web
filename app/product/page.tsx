"use client";

import { useEffect, useState } from "react";
import { Product, Category, ToastType } from "@/types/index";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "@/services/productsSservice";
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    CategoryId: 0,
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
      (p) => p.productId === product.productId,
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
        featuredProducts.filter((p) => p.productId !== product.productId),
      );
    } else {
      setFeaturedProducts([...featuredProducts, product]);
    }
    toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
  };

  const handleRemoveFeatured = (productId: number) => {
    setFeaturedProducts(
      featuredProducts.filter((p) => p.productId !== productId),
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
        CategoryId: product.categoryId,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        CategoryId: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.productId, {
          ...formData,
          categoryId: formData.CategoryId,
          isPromotion: editingProduct.isPromotion,
          isFeatured: editingProduct.isFeatured,
          displayOrder: editingProduct.displayOrder,
          state: editingProduct.state,
          isAvailable: true,
        });
      } else {
        await createProduct({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          imageUrl: formData.imageUrl,
          categoryId: formData.CategoryId,
          legend: "",
          isPromotion: false,
          isFeatured: false,
          displayOrder: 0,
          state: true,
          isAvailable: true,
          productId: 0,
        });
      }
      await loadData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

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
                (p) => p.productId === product.productId,
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Modifica los datos del producto"
                : "Crea un nuevo producto en el catálogo"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre del producto"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Precio</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Categoría</label>
              <select
                value={formData.CategoryId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    CategoryId: Number(e.target.value),
                  })
                }
                className="w-full border border-input rounded-lg px-3 py-2 text-sm"
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
              <label className="text-sm font-medium">Imagen (Base64)</label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingProduct ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
