"use client";

import { useEffect, useState } from "react";
import { Product, Category, ToastType, ProductIngredientDetail } from "@/types/index";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productsSservice";
import { getCategories } from "@/services/categoriesService";
import { DraggableFeaturedProducts } from "@/components/draggable-featured-products";
import ButtonGeneric from "@/components/common/button/ButtonGeneric";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/image-upload";
import { ProductCard } from "@/components/cart/Product-card";
import { useAppDispatch } from "@/store/store/hooks";
import { CustomNotification } from "@/components/common/toast/CustomNotification";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
import { uploadImageToSupabase } from "@/lib/dataBase/databaseService";
import { Trash2, Plus } from "lucide-react";
import { createProductsByProduct, getProductsByMainId, updateProductsByProduct } from "@/services/productByProducts";
import { constructFromSymbol } from "date-fns/constants";

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
  const [comboProducts, setComboProducts] = useState<Product[]>([]);
  const [selectedSubProductId, setSelectedSubProductId] = useState<number>(0);
  const [loadingComboProducts, setLoadingComboProducts] = useState(false);
  const [ingredientsList, setIngredientsList] = useState<ProductIngredientDetail[]>([]);
  const [newIngredientName, setNewIngredientName] = useState<string>("");

  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    categoryId: 0,
    groupId: 0,
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

      console.log("Data: ", JSON.stringify(productsData));

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
      message: "Éxito",
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

  const handleOpenDialog = async (product?: Product) => {
    setErrors({});
    setSelectedSubProductId(0);
    setNewIngredientName(""); // Resetear campo de texto del ingrediente

    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        groupId: product.groupId || 0,
        code: product.code || "",
        legend: product.legend || "",
        isPromotion: !!product.isPromotion,
        isFeatured: !!product.isFeatured,
        displayOrder: product.displayOrder || 0,
        isAvailable: product.isAvailable ?? true,
        piecesOfChicken: product.piecesOfChicken || 0,
        state: product.state ?? true,
      });

      // Cargar ingredientes existentes del producto (vienen incluidos gracias a tu getProducts)
      setIngredientsList(product.productIngredientDetail || []);

      // Cargar subproductos si es Combo (ID 6)
      if (product.categoryId === 6) {
        try {
          setLoadingComboProducts(true);
          const subProducts = await getProductsByMainId(product.id);
          setComboProducts(subProducts || []);
        } catch (error) {
          console.error("Error al obtener los productos del combo:", error);
          setComboProducts([]);
        } finally {
          setLoadingComboProducts(false);
        }
      } else {
        setComboProducts([]);
      }
    } else {
      // Si es una creación, vaciar todo
      setEditingProduct(null);
      setComboProducts([]);
      setIngredientsList([]); // Lista vacía para nuevo producto
      setFormData({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        categoryId: categories[0]?.id || 0,
        groupId: 0,
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

  // const handleOpenDialog = async (product?: Product) => {
  //   setErrors({});
  //   setSelectedSubProductId(0);

  //   if (product) {
  //     setEditingProduct(product);
  //     setFormData({
  //       name: product.name,
  //       description: product.description,
  //       price: product.price,
  //       imageUrl: product.imageUrl,
  //       categoryId: product.categoryId,
  //       groupId: product.groupId || 0,
  //       code: product.code || "",
  //       legend: product.legend || "",
  //       isPromotion: !!product.isPromotion,
  //       isFeatured: !!product.isFeatured,
  //       displayOrder: product.displayOrder || 0,
  //       isAvailable: product.isAvailable ?? true,
  //       piecesOfChicken: product.piecesOfChicken || 0,
  //       state: product.state ?? true,
  //     });

  //     // Si es categoría Combo (6), consumir servicio para traer sus productos asociados
  //     if (product.categoryId === 6) {
  //       try {
  //         setLoadingComboProducts(true);
  //         const subProducts = await getProductsByMainId(product.id);
  //         setComboProducts(subProducts || []);
  //       } catch (error) {
  //         console.error("Error al obtener los productos del combo:", error);
  //         toast.error("No se pudieron cargar los productos del combo");
  //         setComboProducts([]);
  //       } finally {
  //         setLoadingComboProducts(false);
  //       }
  //     } else {
  //       setComboProducts([]);
  //     }
  //   } else {
  //     setEditingProduct(null);
  //     setComboProducts([]);
  //     setFormData({
  //       name: "",
  //       description: "",
  //       price: 0,
  //       imageUrl: "",
  //       categoryId: categories[0]?.id || 0,
  //       groupId: 0,
  //       code: "",
  //       legend: "",
  //       isPromotion: false,
  //       isFeatured: false,
  //       displayOrder: products.length + 1,
  //       isAvailable: true,
  //       piecesOfChicken: 0,
  //       state: true,
  //     });
  //   }
  //   setIsDialogOpen(true);
  // };

  const handleAddIngredient = () => {
    if (!newIngredientName.trim()) return;

    // Evitar duplicados por nombre
    if (ingredientsList.some(i => i.name.toLowerCase() === newIngredientName.trim().toLowerCase())) {
      toast.error("Este ingrediente ya está en la lista");
      return;
    }

    const newIngredient: ProductIngredientDetail = {
      id: Date.now(), // ID temporal en memoria
      productId: editingProduct?.id || 0,
      groupId: formData.groupId || 0,
      name: newIngredientName.trim(),
      description: "",
      createdAt: null,
      createdBy: null,
      state: true
    };

    setIngredientsList([...ingredientsList, newIngredient]);
    setNewIngredientName(""); // Limpiar input
  };

  const handleRemoveIngredient = (id: number) => {
    setIngredientsList(ingredientsList.filter(i => i.id !== id));
  };

  // Agregar un producto al combo en memoria local
  const handleAddProductToCombo = () => {
    if (selectedSubProductId === 0) return;

    // Verificar si ya está añadido
    if (comboProducts.some(p => p.id === selectedSubProductId)) {
      toast.error("Este producto ya forma parte del combo");
      return;
    }

    const productToAdd = products.find(p => p.id === selectedSubProductId);
    if (productToAdd) {
      setComboProducts([...comboProducts, productToAdd]);
      setSelectedSubProductId(0);
    }
  };

  // Remover un producto del combo en memoria local
  const handleRemoveProductFromCombo = (productId: number) => {
    setComboProducts(comboProducts.filter(p => p.id !== productId));
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

      // Estructura completa incluyendo los datos relacionales en memoria
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
        legend: formData.legend || "",
        isPromotion: formData.categoryId === 6 ? true : formData.isPromotion,
        imageUrl: finalImageUrl,
        isFeatured: editingProduct ? editingProduct.isFeatured : false,
        displayOrder: editingProduct ? editingProduct.displayOrder : 0,
        state: editingProduct ? editingProduct.state : true,
        isAvailable: true,
        // Dentro del objeto productData en handleSave:
        productIngredientDetail: ingredientsList.map((ingredient) => {
          const { id, ...rest } = ingredient; // Ignoramos el id temporal de memoria
          return {
            ...rest,
            groupId: formData.groupId || 0
          };
        }) as any, // Hacemos un bypass de tipo seguro aquí para que TS no te pida obligatoriamente el id en el front
      };

      if (editingProduct) {
        // 1. Guardar Producto e Ingredientes (se encarga nuestro nuevo updateProduct)
        await updateProduct(editingProduct.id, productData);

        // 2. Si es Combo (Categoría 6), procesar relaciones de subproductos
        if (formData.categoryId === 6) {
          const currentRelations = await getProductsByMainId(editingProduct.id);
          if (currentRelations && currentRelations.length > 0) {
            await Promise.all(currentRelations.map((rel) => updateProductsByProduct(rel.id, { state: false })));
          }
          await Promise.all(
            comboProducts.map((subProduct, index) =>
              createProductsByProduct({
                productMainId: editingProduct.id,
                productId: subProduct.id,
                groupId: formData.groupId || null,
                name: subProduct.name,
                description: subProduct.description || "",
                sortOrder: index + 1,
                state: true
              })
            )
          );
        }
        toast.success("Producto actualizado");
      } else {
        // Creación del producto (el servicio createProduct original ya itera y guarda ingredientes de forma nativa)
        const newProduct = await createProduct(productData, formData.imageUrl?.startsWith('data:image') ? formData.imageUrl : undefined);

        // Si el nuevo producto es un combo, guardar subproductos
        if (formData.categoryId === 6 && newProduct?.id) {
          await Promise.all(
            comboProducts.map((subProduct, index) =>
              createProductsByProduct({
                productMainId: newProduct.id,
                productId: subProduct.id,
                groupId: formData.groupId || null,
                name: subProduct.name,
                description: subProduct.description || "",
                sortOrder: index + 1,
                state: true
              })
            )
          );
        }
        toast.success("Producto creado");
      }

      await loadData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Ocurrió un error al guardar");
    }
  };

  // const handleSave = async () => {
  //   if (!validateForm()) {
  //     toast.error("Por favor, corrige los errores en el formulario");
  //     return;
  //   }

  //   try {
  //     let finalImageUrl = formData.imageUrl;

  //     if (formData.imageUrl && formData.imageUrl.startsWith('data:image')) {
  //       try {
  //         finalImageUrl = await uploadImageToSupabase(formData.imageUrl, 'products');
  //       } catch (uploadError) {
  //         toast.error("Error al subir la imagen");
  //         return;
  //       }
  //     }

  //     // 1. Objeto limpio para la tabla 'products' (SIN columnas fantasmas)
  //     const productData = {
  //       name: formData.name,
  //       description: formData.description,
  //       price: formData.price,
  //       categoryId: formData.categoryId,
  //       legend: formData.legend || "",
  //       isPromotion: formData.categoryId === 6 ? true : formData.isPromotion,
  //       imageUrl: finalImageUrl,
  //       isFeatured: editingProduct ? editingProduct.isFeatured : false,
  //       displayOrder: editingProduct ? editingProduct.displayOrder : 0,
  //       state: editingProduct ? editingProduct.state : true,
  //       isAvailable: true,
  //     };

  //     if (editingProduct) {
  //       // === CASO: EDICIÓN DE PRODUCTO ===
  //       await updateProduct(editingProduct.id, productData);

  //       // Si es un combo, gestionamos los subproductos
  //       if (formData.categoryId === 6) {
  //         try {
  //           // A. Obtener las relaciones actuales en la Base de Datos para saber qué ID intermedio borrar/desactivar
  //           const currentRelations = await getProductsByMainId(editingProduct.id);

  //           // B. Eliminar (o desactivar) las relaciones viejas una por una
  //           if (currentRelations && currentRelations.length > 0) {
  //             const deletePromises = currentRelations.map((rel) =>
  //               // Si tu backend elimina físicamente usa tu método delete, 
  //               // si es eliminación lógica usamos el update que nos pasaste:
  //               updateProductsByProduct(rel.id, { state: false })
  //             );
  //             await Promise.all(deletePromises);
  //           }

  //           // C. Insertar la nueva lista que el usuario dejó en memoria
  //           const insertPromises = comboProducts.map((subProduct, index) =>
  //             createProductsByProduct({
  //               productMainId: editingProduct.id,
  //               productId: subProduct.id,
  //               groupId: formData.groupId || null,
  //               name: subProduct.name,
  //               description: subProduct.description || "",
  //               sortOrder: index + 1,
  //               state: true
  //             })
  //           );
  //           await Promise.all(insertPromises);

  //         } catch (relError) {
  //           console.error("Error al actualizar las relaciones del combo:", relError);
  //           toast.error("El producto se actualizó, pero hubo un problema con los componentes del combo.");
  //         }
  //       }

  //       toast.success("Producto actualizado con éxito");
  //     } else {
  //       // === CASO: NUEVO PRODUCTO ===
  //       const newProduct = await createProduct(productData, formData.imageUrl?.startsWith('data:image') ? formData.imageUrl : undefined);

  //       // Si el producto creado es un combo, guardamos sus hijos uno por uno
  //       if (formData.categoryId === 6 && newProduct?.id) {
  //         try {
  //           const insertPromises = comboProducts.map((subProduct, index) =>
  //             createProductsByProduct({
  //               productMainId: newProduct.id,
  //               productId: subProduct.id,
  //               groupId: formData.groupId || null,
  //               name: subProduct.name,
  //               description: subProduct.description || "",
  //               sortOrder: index + 1,
  //               state: true
  //             })
  //           );
  //           // Ejecutamos las inserciones en paralelo
  //           await Promise.all(insertPromises);
  //         } catch (relError) {
  //           console.error("Error al guardar los productos del combo:", relError);
  //           toast.error("Se creó el combo pero no se pudieron asociar los subproductos.");
  //         }
  //       }

  //       toast.success("Producto creado con éxito");
  //     }

  //     await loadData();
  //     setIsDialogOpen(false);
  //   } catch (error) {
  //     console.error("Error saving product:", error);
  //     toast.error("Ocurrió un error al guardar");
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={index}
                product={product}
                onEdit={(p) => handleOpenDialog(p)}
                onDelete={(id) => handleDelete(id)}
                onClick={(p) => handleToggleFeatured(p)}
                componentIn='product'
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className=" flex justify-end w-full">
            <ButtonGeneric
              variant="primaryRed"
              onClick={() => handleOpenDialog()}
              className=" w-1/2 "
            >
              Nuevo Producto
            </ButtonGeneric>
          </div>
          <Card className="p-4">
            <div className="flex flex-row justify-between">
              <h2 className="font-semibold">
                Destacados ({featuredProducts.length})
              </h2>
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
      <ResponsiveModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleSave}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        subtitle={
          editingProduct
            ? "Modifica los datos del producto en el catálogo"
            : "Crea un nuevo producto con todos sus atributos requeridos"
        }
        size="4xl"
        confirmText={editingProduct ? "Guardar" : "Crear"}
        cancelText="Cancelar"
        isProcessing={false}
      >
        {/* CONTENEDOR PRINCIPAL DIVIDIDO EN 2 SECCIONES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ================= SECCIÓN IZQUIERDA: TABLAS Y CONFIGURACIONES ================= */}
          <div className="space-y-6">
            {/* === SECCIÓN DINÁMICA: GESTIÓN DE INGREDIENTES === */}
            <div className="space-y-4">
              <div className="space-y-4 ">
                <div className="flex items-center justify-between ">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Ingredientes del Producto ({ingredientsList.length})
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 bg-white p-3 rounded-xl border border-slate-200/60 shadow-inner">
                  <div className="flex-1 w-full">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Escribir nombre del ingrediente
                    </label>
                    <Input
                      value={newIngredientName}
                      onChange={(e) => setNewIngredientName(e.target.value)}
                      placeholder="Ej: Extra Queso, Salsa Barbacoa, Cebolla..."
                      className="w-full border border-slate-200 rounded-lg h-10 px-3 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddIngredient();
                        }
                      }}
                    />
                  </div>

                  <ButtonGeneric
                    type="button"
                    variant="primary"
                    onClick={handleAddIngredient}
                    disabled={!newIngredientName.trim()}
                    className="h-10 px-5 flex items-center justify-center gap-1 shrink-0 rounded-lg w-full sm:w-auto font-medium text-sm transition-all"
                  >
                    <Plus className="w-4 h-4" /> Añadir
                  </ButtonGeneric>
                </div>

                <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-white shadow-sm">
                  {ingredientsList.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400 bg-slate-50/20">
                      Este producto no cuenta con ingredientes especiales listados.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase">
                          <tr>
                            <th className="p-3">Ingrediente</th>
                            <th className="p-3 text-center w-20">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ingredientsList.map((ingredient) => (
                            <tr key={ingredient.id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="p-3 font-medium text-slate-800">{ingredient.name}</td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveIngredient(ingredient.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Quitar ingrediente"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* === SECCIÓN DINÁMICA: DETALLE DE PRODUCTOS ASOCIADOS (SOLO SI ES COMBO/ID 6) === */}
            {formData.categoryId === 6 && (
              <div className="space-y-4">
                <div className="bg-blue-50/90 p-4 rounded-2xl border border-blue-100/80 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Configuración del Combo ({comboProducts.length})
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end gap-3 bg-white p-3 rounded-xl border border-blue-100/60 shadow-inner">
                    <div className="flex-1 w-full">
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Asociar Producto al Combo
                      </label>
                      <select
                        value={selectedSubProductId}
                        onChange={(e) => setSelectedSubProductId(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg h-10 px-3 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-shadow"
                      >
                        <option value={0}>Selecciona un producto para agregar...</option>
                        {products
                          .filter((p) => p.id !== editingProduct?.id && p.categoryId !== 6)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — (Bs {p.price.toLocaleString("es-BO")})
                            </option>
                          ))}
                      </select>
                    </div>

                    <ButtonGeneric
                      type="button"
                      variant="primary"
                      onClick={handleAddProductToCombo}
                      disabled={selectedSubProductId === 0}
                      className="h-10 px-5 flex items-center justify-center gap-1 shrink-0 rounded-lg w-full sm:w-auto font-medium text-sm transition-all"
                    >
                      <Plus className="w-4 h-4" /> Agregar
                    </ButtonGeneric>
                  </div>

                  <div className="border border-blue-100/60 rounded-xl overflow-hidden bg-white shadow-sm">
                    {loadingComboProducts ? (
                      <div className="p-4 text-center text-sm text-blue-600/70 animate-pulse font-medium">
                        Cargando subproductos...
                      </div>
                    ) : comboProducts.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-400 bg-slate-50/40">
                        No hay productos asociados a este combo todavía.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase">
                            <tr>
                              <th className="p-3">Producto</th>
                              <th className="p-3">Precio Base</th>
                              <th className="p-3 text-center w-20">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {comboProducts.map((subProduct) => (
                              <tr key={subProduct.id} className="hover:bg-blue-50/20 transition-colors">
                                <td className="p-3 font-medium text-slate-800">{subProduct.name}</td>
                                <td className="p-3 text-slate-600">Bs {subProduct.price.toLocaleString("es-BO")}</td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProductFromCombo(subProduct.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar del combo"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= SECCIÓN DERECHA: FORMULARIO E IMAGEN ================= */}
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
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({ ...formData, categoryId: val });
                  if (val !== 6) setComboProducts([]);
                }}
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

            <div className="pt-2">
              <ImageUpload
                value={formData.imageUrl}
                onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
              />
            </div>
          </div>

        </div>
      </ResponsiveModal>
      {/* <ResponsiveModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleSave}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        subtitle={
          editingProduct
            ? "Modifica los datos del producto en el catálogo"
            : "Crea un nuevo producto con todos sus atributos requeridos"
        }
        size="4xl"
        confirmText={editingProduct ? "Guardar" : "Crear"}
        cancelText="Cancelar"
        isProcessing={false}
      >
        <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData({ ...formData, categoryId: val });
                    if (val !== 6) setComboProducts([]); // Reiniciar si cambia de categoría
                  }}
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
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-4 shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ingredientes del Producto ({ingredientsList.length})
                </label>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 bg-white p-3 rounded-xl border border-slate-200/60 shadow-inner">
                <div className="flex-1 w-full">
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Escribir nombre del ingrediente
                  </label>
                  <Input
                    value={newIngredientName}
                    onChange={(e) => setNewIngredientName(e.target.value)}
                    placeholder="Ej: Extra Queso, Salsa Barbacoa, Cebolla..."
                    className="w-full border border-slate-200 rounded-lg h-10 px-3 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddIngredient();
                      }
                    }}
                  />
                </div>

                <ButtonGeneric
                  type="button"
                  variant="primary"
                  onClick={handleAddIngredient}
                  disabled={!newIngredientName.trim()}
                  className="h-10 px-5 flex items-center justify-center gap-1 shrink-0 rounded-lg w-full sm:w-auto font-medium text-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Añadir
                </ButtonGeneric>
              </div>
              <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-white shadow-sm">
                {ingredientsList.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400 bg-slate-50/20">
                    Este producto no cuenta con ingredientes especiales listados.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase">
                        <tr>
                          <th className="p-3">Ingrediente</th>
                          <th className="p-3 text-center w-20">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ingredientsList.map((ingredient) => (
                          <tr key={ingredient.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="p-3 font-medium text-slate-800">{ingredient.name}</td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveIngredient(ingredient.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Quitar ingrediente"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
          {formData.categoryId === 6 && (
            <div className="mt-6 space-y-4">
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/80 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                  <label className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Configuración del Combo ({comboProducts.length})
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 bg-white p-3 rounded-xl border border-blue-100/60 shadow-inner">
                  <div className="flex-1 w-full">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Asociar Producto al Combo
                    </label>
                    <select
                      value={selectedSubProductId}
                      onChange={(e) => setSelectedSubProductId(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg h-10 px-3 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-shadow"
                    >
                      <option value={0}>Selecciona un producto para agregar...</option>
                      {products
                        .filter((p) => p.id !== editingProduct?.id && p.categoryId !== 6)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — (Bs {p.price.toLocaleString("es-BO")})
                          </option>
                        ))}
                    </select>
                  </div>
                  <ButtonGeneric
                    type="button"
                    variant="primary"
                    onClick={handleAddProductToCombo}
                    disabled={selectedSubProductId === 0}
                    className="h-10 px-5 flex items-center justify-center gap-1 shrink-0 rounded-lg w-full sm:w-auto font-medium text-sm transition-all"
                  >
                    <Plus className="w-4 h-4" /> Agregar
                  </ButtonGeneric>
                </div>
                <div className="border border-blue-100/60 rounded-xl overflow-hidden bg-white shadow-sm">
                  {loadingComboProducts ? (
                    <div className="p-4 text-center text-sm text-blue-600/70 animate-pulse font-medium">
                      Cargando subproductos...
                    </div>
                  ) : comboProducts.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400 bg-slate-50/40">
                      No hay productos asociados a este combo todavía.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase">
                          <tr>
                            <th className="p-3">Producto</th>
                            <th className="p-3">Precio Base</th>
                            <th className="p-3 text-center w-20">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {comboProducts.map((subProduct) => (
                            <tr key={subProduct.id} className="hover:bg-blue-50/20 transition-colors">
                              <td className="p-3 font-medium text-slate-800">{subProduct.name}</td>
                              <td className="p-3 text-slate-600">Bs {subProduct.price.toLocaleString("es-BO")}</td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProductFromCombo(subProduct.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar del combo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="space-y-4 mb-4">
            <div className="space-y-1.5">
              <ImageUpload
                value={formData.imageUrl}
                onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
              />
            </div>
          </div>
        </div>
      </ResponsiveModal> */}
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
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { ImageUpload } from "@/components/image-upload";
// import { ProductCard } from "@/components/cart/Product-card";
// import { useAppDispatch } from "@/store/store/hooks";
// import { CustomNotification } from "@/components/common/toast/CustomNotification";
// import { toast } from "sonner";
// import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
// import { uploadImageToSupabase } from "@/lib/dataBase/databaseService";

// export default function ProductsPage() {
//   const dispatch = useAppDispatch();

//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
//   const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
//     name: "",
//     description: "",
//     price: 0,
//     imageUrl: "",
//     categoryId: 0,
//     groupId: 0,
//     code: "",
//     legend: "",
//     isPromotion: false,
//     isFeatured: false,
//     displayOrder: 0,
//     isAvailable: true,
//     piecesOfChicken: 0,
//     state: true,
//   });

//   useEffect(() => {
//     loadData();
//   }, []);

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
//     if (!formData.description.trim()) newErrors.description = "La descripción es obligatoria";
//     if (!formData.categoryId || formData.categoryId === 0) newErrors.categoryId = "Selecciona una categoría";
//     if (!formData.price || formData.price <= 0) newErrors.price = "El precio debe ser mayor a 0";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

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
//         categoryId: product.categoryId,
//         groupId: product.groupId || 0,
//         code: product.code || "",
//         legend: product.legend || "",
//         isPromotion: !!product.isPromotion,
//         isFeatured: !!product.isFeatured,
//         displayOrder: product.displayOrder || 0,
//         isAvailable: product.isAvailable ?? true,
//         piecesOfChicken: product.piecesOfChicken || 0,
//         state: product.state ?? true,
//       });
//     } else {
//       setEditingProduct(null);
//       setFormData({
//         name: "",
//         description: "",
//         price: 0,
//         imageUrl: "",
//         categoryId: categories[0]?.id || 0,
//         groupId: 0,
//         code: "",
//         legend: "",
//         isPromotion: false,
//         isFeatured: false,
//         displayOrder: products.length + 1,
//         isAvailable: true,
//         piecesOfChicken: 0,
//         state: true,
//       });
//     }
//     setIsDialogOpen(true);
//   };

//   const handleSave = async () => {
//     if (!validateForm()) {
//       toast.error("Por favor, corrige los errores en el formulario");
//       return;
//     }

//     try {
//       let finalImageUrl = formData.imageUrl;

//       if (formData.imageUrl && formData.imageUrl.startsWith('data:image')) {
//         try {
//           finalImageUrl = await uploadImageToSupabase(formData.imageUrl, 'products');
//         } catch (uploadError) {
//           toast.error("Error al subir la imagen");
//           return;
//         }
//       }

//       const productData = {
//         name: formData.name,
//         description: formData.description,
//         price: formData.price,
//         categoryId: formData.categoryId,
//         legend: formData.legend || "",
//         isPromotion: formData.isPromotion,
//         imageUrl: finalImageUrl,
//         isFeatured: editingProduct ? editingProduct.isFeatured : false,
//         displayOrder: editingProduct ? editingProduct.displayOrder : 0,
//         state: editingProduct ? editingProduct.state : true,
//         isAvailable: true,
//       };

//       if (editingProduct) {
//         await updateProduct(editingProduct.id, productData);
//         toast.success("Producto actualizado");
//       } else {
//         await createProduct(productData, formData.imageUrl?.startsWith('data:image') ? formData.imageUrl : undefined);
//         toast.success("Producto creado");
//       }

//       await loadData();
//       setIsDialogOpen(false);
//     } catch (error) {
//       console.error("Error saving product:", error);
//       toast.error("Ocurrió un error al guardar");
//     } finally {

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

//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     const handleResize = () => {
//       const width = window.innerWidth;
//       if (width < 640) {
//         // alert('mobile');
//         // setDevice('mobile');
//       } else if (width >= 640 && width < 1024) {
//         // alert('tablet');
//         // setDevice('tablet');
//       } else {
//         // alert('desktop');
//         // setDevice('desktop');
//       }
//     };

//     handleResize();

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

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
//           <div className="grid grid-cols-2 sm:flex sm:flex-wrap md:flex-nowrap md:overflow-x-auto gap-2 pb-2 md:scrollbar-none">
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
//                   componentIn='product'
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
//       <ResponsiveModal
//         isOpen={isDialogOpen}
//         onClose={() => setIsDialogOpen(false)}
//         onConfirm={handleSave}
//         title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
//         subtitle={
//           editingProduct
//             ? "Modifica los datos del producto en el catálogo"
//             : "Crea un nuevo producto con todos sus atributos requeridos"
//         }
//         size="xl"
//         confirmText={editingProduct ? "Guardar cambios" : "Crear producto"}
//         cancelText="Cancelar"
//         isProcessing={false}
//       >
//         <div className="max-h-[calc(100vh-220px)] md:max-h-none overflow-y-auto px-1 pb-2">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//             <div className="space-y-4">
//               <div>
//                 <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre *</label>
//                 <Input
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   placeholder="Nombre del producto"
//                   className={errors.name ? "border-red-500" : ""}
//                 />
//               </div>

//               <div>
//                 <label className="text-xs font-semibold text-slate-600 block mb-1">Descripción *</label>
//                 <Input
//                   value={formData.description}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   placeholder="Descripción o ingredientes..."
//                   className={errors.description ? "border-red-500" : ""}
//                 />
//               </div>
//               <div>
//                 <label className="text-xs font-semibold text-slate-600 block mb-1">Categoría *</label>
//                 <select
//                   value={formData.categoryId}
//                   onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
//                   className={`w-full border ${errors.categoryId ? "border-red-500" : "border-input"} rounded-lg h-10 px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring`}
//                 >
//                   <option value={0}>Selecciona una categoría</option>
//                   {categories.map((cat) => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="text-xs font-semibold text-slate-600 block mb-1">Leyenda del Ticket</label>
//                 <Input
//                   value={formData.legend}
//                   onChange={(e) => setFormData({ ...formData, legend: e.target.value })}
//                   placeholder="Ej: Con papas fritas y gaseosa"
//                 />
//               </div>

//               <div>
//                 <label className="text-xs font-semibold text-slate-600 block mb-1">Precio *</label>
//                 <Input
//                   type="number"
//                   value={formData.price || ""}
//                   onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
//                   placeholder="0"
//                   className={errors.price ? "border-red-500" : ""}
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-xs font-semibold text-slate-600 block">Imagen del Producto</label>
//             <ImageUpload
//               value={formData.imageUrl}
//               onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
//             />
//           </div>
//         </div>
//       </ResponsiveModal>
//     </div>
//   );
// }