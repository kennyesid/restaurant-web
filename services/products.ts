import { storage } from '@/lib/storage';
import { Product, Category } from '@/lib/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
        id_category: 'cat-1',
        name: 'Burgers',
        description: 'Hamburguesas variadas',
        id_tenant: DEFAULT_TENANT_ID,
      },
      {
        id_category: 'cat-2',
        name: 'Pollo',
        description: 'Productos de pollo',
        id_tenant: DEFAULT_TENANT_ID,
      },
      {
        id_category: 'cat-3',
        name: 'Acompañamientos',
        description: 'Papas, aros y más',
        id_tenant: DEFAULT_TENANT_ID,
      },
      {
        id_category: 'cat-4',
        name: 'Bebidas',
        description: 'Bebidas variadas',
        id_tenant: DEFAULT_TENANT_ID,
      },
    ];
    storage.setCollection(CATEGORIES_KEY, defaultCategories);
  }

  const existingProducts = storage.getCollection<Product>(PRODUCTS_KEY);
  if (existingProducts.length === 0) {
    const defaultProducts: Product[] = [
      {
        id_product: 'prod-1',
        name: 'Hamburguesa',
        description: 'Hamburguesa clásica',
        price: 25000,
        image: '',
        id_category: 'cat-1',
        id_ingredient_group: 'ing-1',
        is_available: true,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_product: 'prod-2',
        name: 'Cheeseburger',
        description: 'Hamburguesa con queso',
        price: 28000,
        image: '',
        id_category: 'cat-1',
        id_ingredient_group: 'ing-1',
        is_available: true,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_product: 'prod-3',
        name: 'Double Burger',
        description: 'Doble carne',
        price: 35000,
        image: '',
        id_category: 'cat-1',
        id_ingredient_group: 'ing-1',
        is_available: true,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_product: 'prod-4',
        name: 'Pollo Frito',
        description: 'Pollo crujiente',
        price: 22000,
        image: '',
        id_category: 'cat-2',
        id_ingredient_group: 'ing-2',
        is_available: true,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_product: 'prod-5',
        name: 'Alitas BBQ',
        description: 'Alitas con salsa BBQ',
        price: 20000,
        image: '',
        id_category: 'cat-2',
        id_ingredient_group: 'ing-2',
        is_available: true,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_product: 'prod-6',
        name: 'Papas Fritas',
        description: 'Papas crujientes',
        price: 8000,
        image: '',
        id_category: 'cat-3',
        id_ingredient_group: 'ing-3',
        is_available: true,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_product: 'prod-7',
        name: 'Aros de Cebolla',
        description: 'Aros crujientes',
        price: 10000,
        image: '',
        id_category: 'cat-3',
        id_ingredient_group: 'ing-3',
        is_available: true,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_product: 'prod-8',
        name: 'Coca-Cola',
        description: 'Bebida gaseosa',
        price: 5000,
        image: '',
        id_category: 'cat-4',
        id_ingredient_group: 'ing-4',
        is_available: true,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_product: 'prod-9',
        name: 'Jugo Natural',
        description: 'Jugo fresco',
        price: 7000,
        image: '',
        id_category: 'cat-4',
        id_ingredient_group: 'ing-4',
        is_available: true,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    storage.setCollection(PRODUCTS_KEY, defaultProducts);
  }
}

if (typeof window !== 'undefined') {
  initializeDefaults();
}

// Product CRUD
export async function getProducts(): Promise<Product[]> {
  return storage.getCollection<Product>(PRODUCTS_KEY);
}

export async function getProductById(id: string): Promise<Product | null> {
  return storage.getFromCollection<Product>(PRODUCTS_KEY, id, 'id_product');
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const products = storage.getCollection<Product>(PRODUCTS_KEY);
  return products.filter(p => p.id_category === categoryId);
}

export async function createProduct(product: Omit<Product, 'id_product' | 'created_at' | 'updated_at'>): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id_product: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  storage.addToCollection(PRODUCTS_KEY, newProduct, 'id_product');
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
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

export async function deleteProduct(id: string): Promise<boolean> {
  return storage.removeFromCollection(PRODUCTS_KEY, id, 'id_product');
}

// Category CRUD
export async function getCategories(): Promise<Category[]> {
  return storage.getCollection<Category>(CATEGORIES_KEY);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return storage.getFromCollection<Category>(CATEGORIES_KEY, id, 'id_category');
}

export async function createCategory(category: Omit<Category, 'id_category'>): Promise<Category> {
  const newCategory: Category = {
    ...category,
    id_category: generateId(),
  };
  storage.addToCollection(CATEGORIES_KEY, newCategory, 'id_category');
  return newCategory;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const success = storage.updateInCollection(CATEGORIES_KEY, id, updates, 'id_category');
  return success ? storage.getFromCollection<Category>(CATEGORIES_KEY, id, 'id_category') : null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  return storage.removeFromCollection(CATEGORIES_KEY, id, 'id_category');
}
