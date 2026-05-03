import { storage } from '@/lib/storage';
import { Ingredient, IngredientCategories } from '@/types';

const INGREDIENTS_KEY = 'ingredients';
const CATEGORIES_KEY = 'ingredient_categories';

// Helper para autoincrementar IDs numéricos
function getNextId(collection: any[]): number {
  if (collection.length === 0) return 1;
  const ids = collection.map(item => Number(item.id)).filter(id => !isNaN(id));
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

export function initializeDefaults() {
  // 1. Inicializar Categorías por Defecto
  const existingCategories = storage.getCollection<IngredientCategories>(CATEGORIES_KEY);
  let defaultCategories: IngredientCategories[] = [];

  if (existingCategories.length === 0) {
    defaultCategories = [
      { id: 1, name: 'Carnes y Aves', description: 'Todo tipo de carnes frescas y congeladas', state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 2, name: 'Abarrotes y Granos', description: 'Arroz, fideos, aceites y condimentos secos', state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 3, name: 'Vegetales y Verduras', description: 'Frutas, verduras y hortalizas frescas', state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 4, name: 'Lácteos', description: 'Quesos, leche y derivados lácteos', state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 5, name: 'Panadería', description: 'Panes, bases de pizza y masas', state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 6, name: 'Gastos Operativos y Pagos', description: 'Pagos fijos, servicios y mano de obra del local', state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    storage.setCollection(CATEGORIES_KEY, defaultCategories);
  }

  // 2. Inicializar Ingredientes y Gastos por Defecto
  const existingIngredients = storage.getCollection<Ingredient>(INGREDIENTS_KEY);
  if (existingIngredients.length === 0) {
    const defaultIngredients: Ingredient[] = [
      // Carnes y Aves (Cat 1)
      { id: 1, ingredientCategoriesId: 1, supplierId: 1, name: 'Carne de Res Molida', description: 'Para hamburguesas premium', quantity: 50, price: 35.0, unitType: 'kg', currentStock: 50, state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 2, ingredientCategoriesId: 1, supplierId: 1, name: 'Pollo Entero', description: 'Para platos y broster', quantity: 40, price: 15.5, unitType: 'kg', currentStock: 40, quantitypiecesOfChicken: 8, state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      
      // Abarrotes y Granos (Cat 2)
      { id: 3, ingredientCategoriesId: 2, supplierId: 2, name: 'Arroz Grano Largo', description: 'Acompañamiento principal', quantity: 100, price: 7.5, unitType: 'kg', currentStock: 100, state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 4, ingredientCategoriesId: 2, supplierId: 2, name: 'Aceite de Girasol', description: 'Aceite para freír', quantity: 20, price: 12.0, unitType: 'liters', currentStock: 20, state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      
      // Vegetales y Verduras (Cat 3)
      { id: 5, ingredientCategoriesId: 3, supplierId: 3, name: 'Papas Holandesa', description: 'Papas para freír', quantity: 120, price: 4.5, unitType: 'kg', currentStock: 120, state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 6, ingredientCategoriesId: 3, supplierId: 3, name: 'Tomate Perita', description: 'Ensaladas y salsas', quantity: 25, price: 6.0, unitType: 'kg', currentStock: 25, state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      
      // Lácteos (Cat 4)
      { id: 7, ingredientCategoriesId: 4, supplierId: 4, name: 'Queso Mozzarella', description: 'Rallado para fundir', quantity: 15, price: 45.0, unitType: 'kg', currentStock: 15, state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Panadería (Cat 5)
      { id: 8, ingredientCategoriesId: 5, supplierId: 5, name: 'Pan Brioche Hamburguesa', description: 'Pan artesanal', quantity: 200, price: 1.5, unitType: 'units', currentStock: 200, state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Gastos Operativos y Pagos (Cat 6)
      { id: 9, ingredientCategoriesId: 6, supplierId: 6, name: 'Alquiler del Establecimiento', description: 'Mensualidad fija del local', quantity: 1, price: 2500.0, unitType: 'mes', currentStock: 1, state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 10, ingredientCategoriesId: 6, supplierId: 6, name: 'Sueldo Ayudante de Cocina', description: 'Pago de servicios mensuales', quantity: 1, price: 2200.0, unitType: 'mes', currentStock: 1, state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    storage.setCollection(INGREDIENTS_KEY, defaultIngredients);
  }
}

if (typeof window !== 'undefined') {
  initializeDefaults();
}

// ==========================================
// ABM CATEGORÍAS (CRUD)
// ==========================================

export async function getCategories(): Promise<IngredientCategories[]> {
  return storage.getCollection<IngredientCategories>(CATEGORIES_KEY);
}

export async function createCategory(category: Omit<IngredientCategories, 'id' | 'createdAt' | 'updatedAt'>): Promise<IngredientCategories> {
  const collection = storage.getCollection<IngredientCategories>(CATEGORIES_KEY);
  const newCategory: IngredientCategories = {
    ...category,
    id: getNextId(collection),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  storage.addToCollection(CATEGORIES_KEY, newCategory, 'id');
  return newCategory;
}

export async function updateCategory(id: number, updates: Partial<IngredientCategories>): Promise<IngredientCategories | null> {
  const success = storage.updateInCollection(
    CATEGORIES_KEY,
    id,
    { ...updates, updatedAt: new Date().toISOString() },
    'id'
  );
  return success ? storage.getFromCollection<IngredientCategories>(CATEGORIES_KEY, id, 'id') : null;
}

export async function deleteCategory(id: number): Promise<boolean> {
  return storage.removeFromCollection(CATEGORIES_KEY, id, 'id');
}

// ==========================================
// ABM INGREDIENTES (CRUD)
// ==========================================

export async function getIngredients(): Promise<Ingredient[]> {
  return storage.getCollection<Ingredient>(INGREDIENTS_KEY);
}

export async function getIngredientById(id: number): Promise<Ingredient | null> {
  return storage.getFromCollection<Ingredient>(INGREDIENTS_KEY, id, 'id');
}

export async function createIngredient(ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ingredient> {
  const collection = storage.getCollection<Ingredient>(INGREDIENTS_KEY);
  const newIngredient: Ingredient = {
    ...ingredient,
    id: getNextId(collection),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  storage.addToCollection(INGREDIENTS_KEY, newIngredient, 'id');
  return newIngredient;
}

export async function updateIngredient(id: number, updates: Partial<Ingredient>): Promise<Ingredient | null> {
  const success = storage.updateInCollection(
    INGREDIENTS_KEY,
    id,
    { ...updates, updatedAt: new Date().toISOString() },
    'id'
  );
  return success ? storage.getFromCollection<Ingredient>(INGREDIENTS_KEY, id, 'id') : null;
}

export async function deleteIngredient(id: number): Promise<boolean> {
  return storage.removeFromCollection(INGREDIENTS_KEY, id, 'id');
}

// import { storage } from '@/lib/storage';
// import { Ingredient } from '@/lib/types';

// function generateId(): string {
//   return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
// }

// const INGREDIENTS_KEY = 'ingredients';
// const DEFAULT_TENANT_ID = 'tenant-1';

// // Initialize default data
// function initializeDefaults() {
//   const existingIngredients = storage.getCollection<Ingredient>(INGREDIENTS_KEY);
//   if (existingIngredients.length === 0) {
//     const defaultIngredients: Ingredient[] = [
//       {
//         id_ingredient: 'ing-1',
//         name: 'Carne Molida',
//         quantity: 50,
//         unit: 'kg',
//         supplier: 'Carnes Premium',
//         cost: 15000,
//         id_tenant: DEFAULT_TENANT_ID,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       },
//       {
//         id_ingredient: 'ing-2',
//         name: 'Pan de Hamburguesa',
//         quantity: 200,
//         unit: 'units',
//         supplier: 'Panadería Local',
//         cost: 1500,
//         id_tenant: DEFAULT_TENANT_ID,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       },
//       {
//         id_ingredient: 'ing-3',
//         name: 'Queso',
//         quantity: 30,
//         unit: 'kg',
//         supplier: 'Lácteos S.A.',
//         cost: 20000,
//         id_tenant: DEFAULT_TENANT_ID,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       },
//       {
//         id_ingredient: 'ing-4',
//         name: 'Lechuga',
//         quantity: 20,
//         unit: 'units',
//         supplier: 'Verduras Frescas',
//         cost: 2000,
//         id_tenant: DEFAULT_TENANT_ID,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       },
//       {
//         id_ingredient: 'ing-5',
//         name: 'Tomate',
//         quantity: 25,
//         unit: 'units',
//         supplier: 'Verduras Frescas',
//         cost: 1500,
//         id_tenant: DEFAULT_TENANT_ID,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       },
//       {
//         id_ingredient: 'ing-6',
//         name: 'Pollo',
//         quantity: 40,
//         unit: 'kg',
//         supplier: 'Carnes Premium',
//         cost: 12000,
//         id_tenant: DEFAULT_TENANT_ID,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       },
//       {
//         id_ingredient: 'ing-7',
//         name: 'Aceite de Cocina',
//         quantity: 20,
//         unit: 'liters',
//         supplier: 'Distribuidora General',
//         cost: 8000,
//         id_tenant: DEFAULT_TENANT_ID,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       },
//       {
//         id_ingredient: 'ing-8',
//         name: 'Sal y Condimentos',
//         quantity: 5,
//         unit: 'kg',
//         supplier: 'Distribuidora General',
//         cost: 5000,
//         id_tenant: DEFAULT_TENANT_ID,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       },
//       {
//         id_ingredient: 'ing-9',
//         name: 'Papas',
//         quantity: 100,
//         unit: 'kg',
//         supplier: 'Verduras Frescas',
//         cost: 1000,
//         id_tenant: DEFAULT_TENANT_ID,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       },
//       {
//         id_ingredient: 'ing-10',
//         name: 'Cebolla',
//         quantity: 30,
//         unit: 'kg',
//         supplier: 'Verduras Frescas',
//         cost: 1200,
//         id_tenant: DEFAULT_TENANT_ID,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       },
//     ];
//     storage.setCollection(INGREDIENTS_KEY, defaultIngredients);
//   }
// }

// if (typeof window !== 'undefined') {
//   initializeDefaults();
// }

// // Ingredient CRUD
// export async function getIngredients(): Promise<Ingredient[]> {
//   return storage.getCollection<Ingredient>(INGREDIENTS_KEY);
// }

// export async function getIngredientById(id: string): Promise<Ingredient | null> {
//   return storage.getFromCollection<Ingredient>(INGREDIENTS_KEY, id, 'id_ingredient');
// }

// export async function createIngredient(ingredient: Omit<Ingredient, 'id_ingredient' | 'created_at' | 'updated_at'>): Promise<Ingredient> {
//   const newIngredient: Ingredient = {
//     ...ingredient,
//     id_ingredient: generateId(),
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//   };
//   storage.addToCollection(INGREDIENTS_KEY, newIngredient, 'id_ingredient');
//   return newIngredient;
// }

// export async function updateIngredient(id: string, updates: Partial<Ingredient>): Promise<Ingredient | null> {
//   const success = storage.updateInCollection(
//     INGREDIENTS_KEY,
//     id,
//     {
//       ...updates,
//       updated_at: new Date().toISOString(),
//     },
//     'id_ingredient'
//   );
//   return success ? storage.getFromCollection<Ingredient>(INGREDIENTS_KEY, id, 'id_ingredient') : null;
// }

// export async function deleteIngredient(id: string): Promise<boolean> {
//   return storage.removeFromCollection(INGREDIENTS_KEY, id, 'id_ingredient');
// }
