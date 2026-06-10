import { DatabaseService, uploadImageToSupabase } from '@/lib/dataBase/databaseService';
import { Product, ProductIngredientDetail, ProductDetailProduct } from '@/types';

// 1. Instanciamos los servicios genéricos para cada tabla involucrada
const productService = new DatabaseService<Product>('products');
const ingredientService = new DatabaseService<ProductIngredientDetail>('product_ingredient_details');
const detailProductService = new DatabaseService<ProductDetailProduct>('product_detail_products');

// ========================================================
// PRODUCT SERVICES
// ========================================================

// Obtener todos los productos armando sus detalles correspondientes
export async function getProducts(): Promise<Product[]> {
  // Traemos la información en paralelo de las 3 tablas para máxima velocidad
  const [allProducts, allIngredients, allDetails] = await Promise.all([
    productService.getAll('id', true),
    ingredientService.getAll('id', true),
    detailProductService.getAll('id', true)
  ]);

  // Armamos y estructuramos cada producto inyectándole sus arreglos desde el código
  return allProducts.map(product => ({
    ...product,
    productIngredientDetail: allIngredients.filter(i => i.productId === product.id),
    productDetailProduct: allDetails.filter(d => d.productId === product.id)
  }));
}

// Obtener un producto específico por ID con sus detalles
export async function getProductById(id: number): Promise<Product | null> {
  const product = await productService.getByField('id', id);
  if (!product) return null;

  // En paralelo buscamos los ingredientes y subproductos que le corresponden por código
  const [ingredients, details] = await Promise.all([
    // Usamos el servicio genérico buscando específicamente en la columna productId
    ingredientService.getAll('id', true).then(list => list.filter(i => i.productId === id)),
    detailProductService.getAll('id', true).then(list => list.filter(d => d.productId === id))
  ]);

  return {
    ...product,
    productIngredientDetail: ingredients,
    productDetailProduct: details
  };
}

// Obtener productos filtrados por categoría
export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  // Obtenemos los productos que corresponden a la categoría
  const allProducts = await productService.getAll('id', true);
  const filteredProducts = allProducts.filter(p => p.categoryId === categoryId);

  if (filteredProducts.length === 0) return [];

  // Traemos los ingredientes y detalles para completarlos
  const [allIngredients, allDetails] = await Promise.all([
    ingredientService.getAll('id', true),
    detailProductService.getAll('id', true)
  ]);

  return filteredProducts.map(product => ({
    ...product,
    productIngredientDetail: allIngredients.filter(i => i.productId === product.id),
    productDetailProduct: allDetails.filter(d => d.productId === product.id)
  }));
}

// Crear un nuevo producto guardando en cascada lógica
export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, imageBase64?: string): Promise<Product> {
  try{
let imageUrl = product.imageUrl || '';

  if (imageBase64) {
    try {
      imageUrl = await uploadImageToSupabase(imageBase64, 'products');
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw new Error('No se pudo guardar la imagen');
    }
  }

  const { productIngredientDetail, productDetailProduct, ...mainProduct } = product;

  const newProduct = await productService.create({ ...mainProduct, imageUrl });

  let insertedIngredients: ProductIngredientDetail[] = [];
  let insertedDetails: ProductDetailProduct[] = [];

  // 2. Si vienen ingredientes, les inyectamos el nuevo productId y los creamos secuencialmente
  if (productIngredientDetail && productIngredientDetail.length > 0) {
    for (const ingredient of productIngredientDetail) {
      const savedIngredient = await ingredientService.create({
        ...ingredient,
        productId: newProduct.id
      });
      insertedIngredients.push(savedIngredient);
    }
  }

  // 3. Si vienen subproductos/detalles, hacemos exactamente lo mismo
  if (productDetailProduct && productDetailProduct.length > 0) {
    for (const detail of productDetailProduct) {
      const savedDetail = await detailProductService.create({
        ...detail,
        productId: newProduct.id
      });
      insertedDetails.push(savedDetail);
    }
  }

  // Retornamos el objeto unificado tal como lo requiere el tipado original
  return {
    ...newProduct,
    productIngredientDetail: insertedIngredients,
    productDetailProduct: insertedDetails
  };
  }catch(exception){
    console.error('Error creando producto:', exception);
    throw new Error('No se pudo crear el producto');
  }
}

// export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
//   const { productIngredientDetail, productDetailProduct, ...mainProduct } = product;

//   // 1. Guardamos los datos base del producto en la tabla principal
//   const newProduct = await productService.create(mainProduct);

//   let insertedIngredients: ProductIngredientDetail[] = [];
//   let insertedDetails: ProductDetailProduct[] = [];

//   // 2. Si vienen ingredientes, les inyectamos el nuevo productId y los creamos secuencialmente
//   if (productIngredientDetail && productIngredientDetail.length > 0) {
//     for (const ingredient of productIngredientDetail) {
//       const savedIngredient = await ingredientService.create({
//         ...ingredient,
//         productId: newProduct.id
//       });
//       insertedIngredients.push(savedIngredient);
//     }
//   }

//   // 3. Si vienen subproductos/detalles, hacemos exactamente lo mismo
//   if (productDetailProduct && productDetailProduct.length > 0) {
//     for (const detail of productDetailProduct) {
//       const savedDetail = await detailProductService.create({
//         ...detail,
//         productId: newProduct.id
//       });
//       insertedDetails.push(savedDetail);
//     }
//   }

//   // Retornamos el objeto unificado tal como lo requiere el tipado original
//   return {
//     ...newProduct,
//     productIngredientDetail: insertedIngredients,
//     productDetailProduct: insertedDetails
//   };
// }

// Actualizar un producto y sus propiedades
export async function updateProduct(
  id: number,
  updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Product | null> {
  // Si no necesitas manejar ingredientes/subproductos por ahora, puedes hacer:
  return productService.update('id', id, updates);
}
// export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
//   const { productIngredientDetail, productDetailProduct, id: _, createdAt, updatedAt, ...mainUpdates } = updates;

//   const updatedProduct = await productService.update('id', id, mainUpdates);
//   if (!updatedProduct) return null;

//   return getProductById(id);
// }

// Eliminar un producto por completo
export async function deleteProduct(id: number): Promise<boolean> {
  // Como están desvinculadas de forma física en la BD, limpiamos primero de forma lógica las tablas hijas 
  // para no dejar datos huérfanos por ahí flotando.
  const currentIngredients = await ingredientService.getAll('id', true).then(list => list.filter(i => i.productId === id));
  const currentDetails = await detailProductService.getAll('id', true).then(list => list.filter(d => d.productId === id));

  await Promise.all([
    ...currentIngredients.map(i => ingredientService.delete('id', i.id)),
    ...currentDetails.map(d => detailProductService.delete('id', d.id))
  ]);

  // Finalmente borramos el producto de la tabla principal
  return productService.delete('id', id);
}

// ========================================================
// FEATURED PRODUCTS ORDER SERVICE
// ========================================================
export async function updateFeaturedProductsOrder(reorderedFeaturedProducts: Product[]): Promise<void> {
  const allProducts = await productService.getAll('id', true);

  // Mapeamos y actualizamos uno por uno en la base de datos aplicando la nueva lógica de ordenamiento
  const updatePromises = allProducts.map(async (product) => {
    const matchedIdx = reorderedFeaturedProducts.findIndex(p => p.id === product.id);

    if (matchedIdx !== -1) {
      return productService.update('id', product.id, {
        isFeatured: true,
        displayOrder: reorderedFeaturedProducts[matchedIdx].displayOrder || (matchedIdx + 1)
      });
    } else {
      return productService.update('id', product.id, {
        isFeatured: false,
        displayOrder: 0
      });
    }
  });

  await Promise.all(updatePromises);
}

// import { createClient } from '@supabase/supabase-js';
// import { EnvConfig } from '@/config/env.config';
// import { CONSTANT_PRODUCT } from '@/lib/constants/constantProduct';
// import { storage } from '@/lib/storage';
// import { Product, Category } from '@/types';

// const supabase = createClient(EnvConfig.supabaseUrl, EnvConfig.supabaseKey);

// function generateNumericId(collection: Product[]): number {
//   if (collection.length === 0) return 1;
//   const maxId = Math.max(...collection.map(p => p.id));
//   return maxId + 1;
// }

// const PRODUCTS_KEY = 'products';
// const CATEGORIES_KEY = 'categories';
// const DEFAULT_TENANT_ID = 'tenant-1';

// // Initialize default data
// function initializeDefaults() {
//   const existingCategories = storage.getCollection<Category>(CATEGORIES_KEY);
//   if (existingCategories.length === 0) {
//     const defaultCategories: Category[] = [
//       {
//   id: 1,
//   name: 'Sopas',
//   description: 'Sopas tradicionales y cremas',
//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString(),
//   state: true,
// },
// {
//   id: 2,
//   name: 'Segundos',
//   description: 'Platos de fondo, carnes, pastas y más',
//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString(),
//   state: true,
// },
// {
//   id: 3,
//   name: 'Extras',
//   description: 'Platos especiales o combinaciones adicionales',
//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString(),
//   state: true,
// },
// // {
// //   id: 4,
// //   name: 'Refrescos',
// //   description: 'Bebidas refrescantes naturales y artificiales',
// //   createdAt: new Date().toISOString(),
// //   updatedAt: new Date().toISOString(),
// //   state: true,
// // },
// {
//   id: 5,
//   name: 'Gaseosas',
//   description: 'Gaseosas nacionales e importadas',
//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString(),
//   state: true,
// },
// {
//   id: 6,
//   name: 'Jugos',
//   description: 'Jugos naturales de frutas',
//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString(),
//   state: true,
// },
//     ];
//     storage.setCollection(CATEGORIES_KEY, defaultCategories);
//   }
// }

// const existingProducts = storage.getCollection<Product>(PRODUCTS_KEY);
// if (existingProducts.length === 0) {
//   const defaultProducts: Product[] = CONSTANT_PRODUCT;
//   storage.setCollection(PRODUCTS_KEY, defaultProducts);
// }

// if (typeof window !== 'undefined') {
//   initializeDefaults();
// }

// // Product CRUD
// export async function getProducts(): Promise<Product[]> {
//   return storage.getCollection<Product>(PRODUCTS_KEY);
// }

// export async function getProductById(id: string): Promise<Product | null> {
//   return storage.getFromCollection<Product>(PRODUCTS_KEY, id, 'id');
// }

// export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
//   const products = storage.getCollection<Product>(PRODUCTS_KEY);
//   return products.filter(p => p.categoryId === categoryId);
// }

// export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
//   const currentProducts = storage.getCollection<Product>(PRODUCTS_KEY);
//   const newProduct: Product = {
//     ...product,
//     id: generateNumericId(currentProducts),
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   };
//   storage.addToCollection(PRODUCTS_KEY, newProduct, 'id');
//   return newProduct;
// }

// export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
//   const success = storage.updateInCollection(
//     PRODUCTS_KEY,
//     id,
//     {
//       ...updates,
//       updatedAt: new Date().toISOString(),
//     },
//     'id'
//   );
//   return success ? storage.getFromCollection<Product>(PRODUCTS_KEY, id, 'id') : null;
// }

// export async function deleteProduct(id: number): Promise<boolean> {
//   return storage.removeFromCollection(PRODUCTS_KEY, id, 'id');
// }

// // Category CRUD
// export async function getCategories(): Promise<Category[]> {
//   return storage.getCollection<Category>(CATEGORIES_KEY);
// }

// export async function getCategoryById(id: number): Promise<Category | null> {
//   return storage.getFromCollection<Category>(CATEGORIES_KEY, id, 'id');
// }

// export async function createCategory(category: Omit<Category, 'id'>): Promise<Category> {
//   const currentCategories = storage.getCollection<Category>(CATEGORIES_KEY);
//   const nextId = currentCategories.length > 0 
//     ? Math.max(...currentCategories.map(c => Number(c.id))) + 1 
//     : 1;
//   const newCategory: Category = {
//     ...category,
//     id: nextId,
//   };
//   storage.addToCollection(CATEGORIES_KEY, newCategory, 'id');
//   return newCategory;
// }

// export async function updateCategory(id: number, updates: Partial<Category>): Promise<Category | null> {
//   const success = storage.updateInCollection(CATEGORIES_KEY, id, updates, 'id');
//   return success ? storage.getFromCollection<Category>(CATEGORIES_KEY, id, 'id') : null;
// }

// export async function deleteCategory(id: number): Promise<boolean> {
//   return storage.removeFromCollection(CATEGORIES_KEY, id, 'id');
// }

// export async function updateFeaturedProductsOrder(reorderedFeaturedProducts: Product[]): Promise<void> {
//   // 1. Obtenemos todos los productos existentes del LocalStorage
//   const allProducts = storage.getCollection<Product>(PRODUCTS_KEY);

//   // 2. Mapeamos la colección completa aplicando la nueva lógica
//   const updatedProducts = allProducts.map((product) => {
//     // Buscamos si el producto actual está en la lista que viene del frontend
//     const matchedIdx = reorderedFeaturedProducts.findIndex(p => p.id === product.id);

//     if (matchedIdx !== -1) {
//       // SI ESTÁ EN LA LISTA: Activamos el destacado y le ponemos su orden real del frontend
//       return {
//         ...product,
//         isFeatured: true,
//         displayOrder: reorderedFeaturedProducts[matchedIdx].displayOrder || (matchedIdx + 1),
//         updatedAt: new Date().toISOString()
//       };
//     } else {
//       // NO ESTÁ EN LA LISTA: Nos aseguramos de resetearlo por completo para que deje de ser destacado
//       return {
//         ...product,
//         isFeatured: false,
//         displayOrder: 0,
//         updatedAt: new Date().toISOString()
//       };
//     }
//   });

//   storage.setCollection(PRODUCTS_KEY, updatedProducts);
// }