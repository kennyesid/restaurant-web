import { CONSTANT_PRODUCT } from '@/lib/constants/constantProduct';
import { storage } from '@/lib/storage';
import { Product, Category } from '@/types';

function generateNumericId(collection: Product[]): number {
  if (collection.length === 0) return 1;
  const maxId = Math.max(...collection.map(p => p.productId));
  return maxId + 1;
}

const PRODUCTS_KEY = 'products';
const CATEGORIES_KEY = 'categories';
const DEFAULT_TENANT_ID = 'tenant-1';

// Initialize default data
function initializeDefaults() {
  const existingCategories = storage.getCollection<Category>(CATEGORIES_KEY);
  if (existingCategories.length === 0) {
    const defaultCategories: Category[] = [
      {
  id: 1,
  name: 'Sopas',
  description: 'Sopas tradicionales y cremas',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  state: true,
},
{
  id: 2,
  name: 'Segundos',
  description: 'Platos de fondo, carnes, pastas y más',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  state: true,
},
{
  id: 3,
  name: 'Extras',
  description: 'Platos especiales o combinaciones adicionales',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  state: true,
},
// {
//   id: 4,
//   name: 'Refrescos',
//   description: 'Bebidas refrescantes naturales y artificiales',
//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString(),
//   state: true,
// },
{
  id: 5,
  name: 'Gaseosas',
  description: 'Gaseosas nacionales e importadas',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  state: true,
},
{
  id: 6,
  name: 'Jugos',
  description: 'Jugos naturales de frutas',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  state: true,
},
    ];
    storage.setCollection(CATEGORIES_KEY, defaultCategories);
  }
}

const existingProducts = storage.getCollection<Product>(PRODUCTS_KEY);
if (existingProducts.length === 0) {
  const defaultProducts: Product[] = CONSTANT_PRODUCT;
  storage.setCollection(PRODUCTS_KEY, defaultProducts);
}

if (typeof window !== 'undefined') {
  initializeDefaults();
}

// Product CRUD
export async function getProducts(): Promise<Product[]> {
  return storage.getCollection<Product>(PRODUCTS_KEY);
}

export async function getProductById(id: string): Promise<Product | null> {
  return storage.getFromCollection<Product>(PRODUCTS_KEY, id, 'ProductId');
}

export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  const products = storage.getCollection<Product>(PRODUCTS_KEY);
  return products.filter(p => p.categoryId === categoryId);
}

export async function createProduct(product: Omit<Product, 'ProductId' | 'created_at' | 'updated_at'>): Promise<Product> {
  const currentProducts = storage.getCollection<Product>(PRODUCTS_KEY);
  const newProduct: Product = {
    ...product,
    productId: generateNumericId(currentProducts),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  storage.addToCollection(PRODUCTS_KEY, newProduct, 'ProductId');
  return newProduct;
}

export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
  const success = storage.updateInCollection(
    PRODUCTS_KEY,
    id,
    {
      ...updates,
      updated_at: new Date().toISOString(),
    },
    'id_product'
  );
  return success ? storage.getFromCollection<Product>(PRODUCTS_KEY, id, 'id_product') : null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  return storage.removeFromCollection(PRODUCTS_KEY, id, 'id_product');
}

// Category CRUD
export async function getCategories(): Promise<Category[]> {
  return storage.getCollection<Category>(CATEGORIES_KEY);
}

export async function getCategoryById(id: number): Promise<Category | null> {
  return storage.getFromCollection<Category>(CATEGORIES_KEY, id, 'id');
}

export async function createCategory(category: Omit<Category, 'id'>): Promise<Category> {
  const currentCategories = storage.getCollection<Category>(CATEGORIES_KEY);
  const nextId = currentCategories.length > 0 
    ? Math.max(...currentCategories.map(c => Number(c.id))) + 1 
    : 1;
  const newCategory: Category = {
    ...category,
    id: nextId,
  };
  storage.addToCollection(CATEGORIES_KEY, newCategory, 'id');
  return newCategory;
}

export async function updateCategory(id: number, updates: Partial<Category>): Promise<Category | null> {
  const success = storage.updateInCollection(CATEGORIES_KEY, id, updates, 'id');
  return success ? storage.getFromCollection<Category>(CATEGORIES_KEY, id, 'id') : null;
}

export async function deleteCategory(id: number): Promise<boolean> {
  return storage.removeFromCollection(CATEGORIES_KEY, id, 'id');
}

export async function updateFeaturedProductsOrder(reorderedFeaturedProducts: Product[]): Promise<void> {
  // 1. Obtenemos todos los productos existentes del LocalStorage
  const allProducts = storage.getCollection<Product>(PRODUCTS_KEY);

  // 2. Mapeamos la colección completa aplicando la nueva lógica
  const updatedProducts = allProducts.map((product) => {
    // Buscamos si el producto actual está en la lista que viene del frontend
    const matchedIdx = reorderedFeaturedProducts.findIndex(p => p.productId === product.productId);

    if (matchedIdx !== -1) {
      // SI ESTÁ EN LA LISTA: Activamos el destacado y le ponemos su orden real del frontend
      return {
        ...product,
        isFeatured: true,
        displayOrder: reorderedFeaturedProducts[matchedIdx].displayOrder || (matchedIdx + 1),
        updated_at: new Date().toISOString()
      };
    } else {
      // NO ESTÁ EN LA LISTA: Nos aseguramos de resetearlo por completo para que deje de ser destacado
      return {
        ...product,
        isFeatured: false,
        displayOrder: 0,
        updated_at: new Date().toISOString()
      };
    }
  });

  // 3. Reemplazamos la colección corregida en el LocalStorage
  storage.setCollection(PRODUCTS_KEY, updatedProducts);
}