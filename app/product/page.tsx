'use client';

import { useEffect, useState } from 'react';
import { Product, Category } from '@/types/index';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '@/services/productsSservice';
import { DraggableFeaturedProducts } from '@/components/draggable-featured-products';
import ButtonGeneric from '@/components/common/button/ButtonGeneric';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/image-upload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ProductCard } from '@/components/cart/Product-card';
import { useAppDispatch } from '@/lib/hooks';

export default function ProductsPage() {

const dispatch = useAppDispatch();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // Cambiado a string | null para coincidir con Category.categoryId
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
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
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ajustado para filtrar usando p.CategoryId (number) comparado con la categoría seleccionada
  const filteredProducts = selectedCategory !== null
    ? products.filter(p => p.categoryId === selectedCategory || p.categoryId === Number(selectedCategory))
    : products;

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleToggleFeatured = (product: Product) => {
    const isCurrentlyFeatured = featuredProducts.some(p => p.productId === product.productId);
    
    if (isCurrentlyFeatured) {
      setFeaturedProducts(featuredProducts.filter(p => p.productId !== product.productId));
    } else {
      setFeaturedProducts([...featuredProducts, product]);
    }
  };

  const handleRemoveFeatured = (productId: number) => {
    setFeaturedProducts(featuredProducts.filter(p => p.productId !== productId));
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
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
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
          legend: '',
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
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await deleteProduct(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.categoryId === categoryId)?.name || 'N/A';
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className='flex flex-col justify-center '>
          <h1 className="text-3xl text-rest-primary font-bold">Productos</h1>
          <p className="text-muted-foreground">Selecciona y ordena productos destacados</p>
        </div>
        {/* <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button> */}
        {/* <div>
          <ButtonGeneric
              variant="primary"
              onClick={() => handleOpenDialog()}
          >
              Nuevo Producto
          </ButtonGeneric>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-row gap-2">
            <ButtonGeneric
              variant={selectedCategory === null ? 'red' : 'primaryRed'}
              onClick={() => handleCategoryFilter(null)}
            >
              Todos
            </ButtonGeneric>
            {categories.map((category) => (
              <ButtonGeneric
                key={category.categoryId}
                variant={selectedCategory === category.categoryId ? 'red' : 'primaryRed'}
                onClick={() => handleCategoryFilter(category.categoryId)}
              >
                {category.name}
              </ButtonGeneric>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => {
              const isFeatured = featuredProducts.some(p => p.productId === product.productId);
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
          <div className=' flex justify-end w-full'>
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
            <div className='flex flex-row justify-between'>
              <h2 className="font-semibold">Destacados ({featuredProducts.length})</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Arrastra para reordenar
              </p>
            </div>
            <DraggableFeaturedProducts
              products={featuredProducts}
              onRemove={handleRemoveFeatured}
              onReorder={handleReorderFeatured}
            />
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Modifica los datos del producto' : 'Crea un nuevo producto en el catálogo'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del producto"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Precio</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Categoría</label>
              <select
                value={formData.CategoryId}
                onChange={(e) => setFormData({ ...formData, CategoryId: Number(e.target.value) })}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm"
              >
                <option value={0}>Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
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
              {editingProduct ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// 'use client';

// import { useEffect, useState } from 'react';
// import { getProducts, createProduct, updateProduct, deleteProduct, Product } from '@/services/products';
// import { CrudTable } from '@/components/crud-table';
// import { FormModal } from '@/components/form-modal';
// import { Button } from '@/components/ui/button';
// import { Plus } from 'lucide-react';
// import { toast } from 'sonner';

// export default function ProductsPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     loadProducts();
//   }, []);

//   const loadProducts = async () => {
//     setIsLoading(true);
//     try {
//       const data = await getProducts();
//       setProducts(data);
//     } catch (error) {
//       toast.error('Error al cargar productos');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCreate = () => {
//     setSelectedProduct(null);
//     setIsModalOpen(true);
//   };

//   const handleEdit = (product: Product) => {
//     setSelectedProduct(product);
//     setIsModalOpen(true);
//   };

//   const handleDelete = async (product: Product) => {
//     if (!confirm(`¿Estás seguro que deseas eliminar ${product.name}?`)) return;
    
//     try {
//       await deleteProduct(product.id);
//       setProducts(products.filter(p => p.id !== product.id));
//       toast.success('Producto eliminado');
//     } catch (error) {
//       toast.error('Error al eliminar producto');
//     }
//   };

//   const handleSubmit = async (data: any) => {
//     setIsSubmitting(true);
//     try {
//       if (selectedProduct) {
//         const updated = await updateProduct(selectedProduct.id, data);
//         setProducts(products.map(p => p.id === selectedProduct.id ? updated : p));
//         toast.success('Producto actualizado');
//       } else {
//         const created = await createProduct(data);
//         setProducts([...products, created]);
//         toast.success('Producto creado');
//       }
//     } catch (error) {
//       toast.error('Error al guardar producto');
//       throw error;
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const columns = [
//     { key: 'name', label: 'Nombre' },
//     { key: 'category', label: 'Categoría' },
//     {
//       key: 'price',
//       label: 'Precio',
//       render: (value: number) => `$${value.toLocaleString('es-CO')}`,
//     },
//     {
//       key: 'available',
//       label: 'Disponible',
//       render: (value: boolean) => (
//         <span className={value ? 'text-green-600' : 'text-red-600'}>
//           {value ? 'Sí' : 'No'}
//         </span>
//       ),
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Gestión de Productos</h1>
//           <p className="text-muted-foreground">Administra el catálogo de productos</p>
//         </div>
//         <Button onClick={handleCreate}>
//           <Plus className="mr-2" size={20} />
//           Nuevo Producto
//         </Button>
//       </div>

//       <CrudTable
//         columns={columns}
//         data={products}
//         onEdit={handleEdit}
//         onDelete={handleDelete}
//         isLoading={isLoading}
//       />

//       <FormModal
//         isOpen={isModalOpen}
//         title={selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
//         fields={[
//           { name: 'name', label: 'Nombre', required: true, placeholder: 'Nombre del producto' },
//           { name: 'category', label: 'Categoría', required: true, placeholder: 'ej. Burgers' },
//           {
//             name: 'price',
//             label: 'Precio',
//             type: 'number',
//             required: true,
//             placeholder: '0',
//           },
//           {
//             name: 'description',
//             label: 'Descripción',
//             placeholder: 'Descripción del producto',
//           },
//         ]}
//         data={selectedProduct}
//         onSubmit={handleSubmit}
//         onClose={() => setIsModalOpen(false)}
//         isLoading={isSubmitting}
//       />
//     </div>
//   );
// }

///////////////////////////////////////////////////////////////////////////////////////////////
// BEFORE
///////////////////////////////////////////////////////////////////////////////////////////////

// 'use client';

// import { useEffect, useState } from 'react';
// import { Product, Category } from '@/lib/types';
// import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '@/services/products';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { ImageUpload } from '@/components/image-upload';
// import { Plus, Trash2, Edit2 } from 'lucide-react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// export default function ProductsPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     price: 0,
//     image: '',
//     id_category: '',
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
//     } catch (error) {
//       console.error('Error loading data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOpenDialog = (product?: Product) => {
//     if (product) {
//       setEditingProduct(product);
//       setFormData({
//         name: product.name,
//         description: product.description,
//         price: product.price,
//         image: product.image,
//         id_category: product.id_category,
//       });
//     } else {
//       setEditingProduct(null);
//       setFormData({
//         name: '',
//         description: '',
//         price: 0,
//         image: '',
//         id_category: '',
//       });
//     }
//     setIsDialogOpen(true);
//   };

//   const handleSave = async () => {
//     try {
//       if (editingProduct) {
//         await updateProduct(editingProduct.id_product, {
//           ...formData,
//           id_ingredient_group: editingProduct.id_ingredient_group,
//           is_available: editingProduct.is_available,
//           id_tenant: editingProduct.id_tenant,
//         });
//       } else {
//         await createProduct({
//           ...formData,
//           id_ingredient_group: 'ing-1',
//           is_available: true,
//           id_tenant: 'tenant-1',
//         });
//       }
//       await loadData();
//       setIsDialogOpen(false);
//     } catch (error) {
//       console.error('Error saving product:', error);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
//       try {
//         await deleteProduct(id);
//         await loadData();
//       } catch (error) {
//         console.error('Error deleting product:', error);
//       }
//     }
//   };

//   const getCategoryName = (categoryId: string) => {
//     return categories.find(c => c.id_category === categoryId)?.name || 'N/A';
//   };

//   if (loading) {
//     return <div className="p-6">Cargando...</div>;
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Productos</h1>
//           <p className="text-muted-foreground">Gestiona el catálogo de productos</p>
//         </div>
//         <Button onClick={() => handleOpenDialog()}>
//           <Plus className="w-4 h-4 mr-2" />
//           Nuevo Producto
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {products.map((product) => (
//           <Card key={product.id_product} className="overflow-hidden flex flex-col">
//             {product.image ? (
//               <img
//                 src={product.image}
//                 alt={product.name}
//                 className="w-full h-48 object-cover"
//               />
//             ) : (
//               <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
//                 Sin imagen
//               </div>
//             )}
//             <div className="p-4 flex-1 flex flex-col">
//               <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
//               <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
//               <div className="space-y-2 mt-auto">
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-muted-foreground">Categoría</span>
//                   <span className="font-medium">{getCategoryName(product.id_category)}</span>
//                 </div>
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-muted-foreground">Precio</span>
//                   <span className="font-semibold text-lg">${product.price.toLocaleString()}</span>
//                 </div>
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-muted-foreground">Estado</span>
//                   <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
//                     product.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                   }`}>
//                     {product.is_available ? 'Disponible' : 'No disponible'}
//                   </span>
//                 </div>
//               </div>
//               <div className="flex gap-2 mt-4">
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="flex-1"
//                   onClick={() => handleOpenDialog(product)}
//                 >
//                   <Edit2 className="w-4 h-4 mr-2" />
//                   Editar
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="text-destructive hover:bg-destructive/10"
//                   onClick={() => handleDelete(product.id_product)}
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           </Card>
//         ))}
//       </div>

//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
//             <DialogDescription>
//               {editingProduct ? 'Modifica los datos del producto' : 'Crea un nuevo producto en el catálogo'}
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4">
//             <div>
//               <label className="text-sm font-medium">Nombre</label>
//               <Input
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 placeholder="Nombre del producto"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium">Descripción</label>
//               <Input
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 placeholder="Descripción"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium">Precio</label>
//               <Input
//                 type="number"
//                 value={formData.price}
//                 onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
//                 placeholder="0"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium">Categoría</label>
//               <select
//                 value={formData.id_category}
//                 onChange={(e) => setFormData({ ...formData, id_category: e.target.value })}
//                 className="w-full border border-input rounded-lg px-3 py-2 text-sm"
//               >
//                 <option value="">Selecciona una categoría</option>
//                 {categories.map((cat) => (
//                   <option key={cat.id_category} value={cat.id_category}>
//                     {cat.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="text-sm font-medium">Imagen</label>
//               <ImageUpload
//                 value={formData.image}
//                 onChange={(image) => setFormData({ ...formData, image })}
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
//               Cancelar
//             </Button>
//             <Button onClick={handleSave}>
//               {editingProduct ? 'Guardar cambios' : 'Crear producto'}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
