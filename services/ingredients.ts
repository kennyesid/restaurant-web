import { storage } from '@/lib/storage';
import { Ingredient } from '@/lib/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const INGREDIENTS_KEY = 'ingredients';
const DEFAULT_TENANT_ID = 'tenant-1';

// Initialize default data
function initializeDefaults() {
  const existingIngredients = storage.getCollection<Ingredient>(INGREDIENTS_KEY);
  if (existingIngredients.length === 0) {
    const defaultIngredients: Ingredient[] = [
      {
        id_ingredient: 'ing-1',
        name: 'Carne Molida',
        quantity: 50,
        unit: 'kg',
        supplier: 'Carnes Premium',
        cost: 15000,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_ingredient: 'ing-2',
        name: 'Pan de Hamburguesa',
        quantity: 200,
        unit: 'units',
        supplier: 'Panadería Local',
        cost: 1500,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_ingredient: 'ing-3',
        name: 'Queso',
        quantity: 30,
        unit: 'kg',
        supplier: 'Lácteos S.A.',
        cost: 20000,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_ingredient: 'ing-4',
        name: 'Lechuga',
        quantity: 20,
        unit: 'units',
        supplier: 'Verduras Frescas',
        cost: 2000,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_ingredient: 'ing-5',
        name: 'Tomate',
        quantity: 25,
        unit: 'units',
        supplier: 'Verduras Frescas',
        cost: 1500,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_ingredient: 'ing-6',
        name: 'Pollo',
        quantity: 40,
        unit: 'kg',
        supplier: 'Carnes Premium',
        cost: 12000,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_ingredient: 'ing-7',
        name: 'Aceite de Cocina',
        quantity: 20,
        unit: 'liters',
        supplier: 'Distribuidora General',
        cost: 8000,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_ingredient: 'ing-8',
        name: 'Sal y Condimentos',
        quantity: 5,
        unit: 'kg',
        supplier: 'Distribuidora General',
        cost: 5000,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_ingredient: 'ing-9',
        name: 'Papas',
        quantity: 100,
        unit: 'kg',
        supplier: 'Verduras Frescas',
        cost: 1000,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_ingredient: 'ing-10',
        name: 'Cebolla',
        quantity: 30,
        unit: 'kg',
        supplier: 'Verduras Frescas',
        cost: 1200,
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    storage.setCollection(INGREDIENTS_KEY, defaultIngredients);
  }
}

if (typeof window !== 'undefined') {
  initializeDefaults();
}

// Ingredient CRUD
export async function getIngredients(): Promise<Ingredient[]> {
  return storage.getCollection<Ingredient>(INGREDIENTS_KEY);
}

export async function getIngredientById(id: string): Promise<Ingredient | null> {
  return storage.getFromCollection<Ingredient>(INGREDIENTS_KEY, id, 'id_ingredient');
}

export async function createIngredient(ingredient: Omit<Ingredient, 'id_ingredient' | 'created_at' | 'updated_at'>): Promise<Ingredient> {
  const newIngredient: Ingredient = {
    ...ingredient,
    id_ingredient: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  storage.addToCollection(INGREDIENTS_KEY, newIngredient, 'id_ingredient');
  return newIngredient;
}

export async function updateIngredient(id: string, updates: Partial<Ingredient>): Promise<Ingredient | null> {
  const success = storage.updateInCollection(
    INGREDIENTS_KEY,
    id,
    {
      ...updates,
      updated_at: new Date().toISOString(),
    },
    'id_ingredient'
  );
  return success ? storage.getFromCollection<Ingredient>(INGREDIENTS_KEY, id, 'id_ingredient') : null;
}

export async function deleteIngredient(id: string): Promise<boolean> {
  return storage.removeFromCollection(INGREDIENTS_KEY, id, 'id_ingredient');
}
