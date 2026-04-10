import { storage } from '@/lib/storage';
import { Category } from '@/lib/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const CATEGORIES_KEY = 'categories';
const DEFAULT_TENANT_ID = 'tenant-1';

// Get all categories
export async function getCategories(): Promise<Category[]> {
  return storage.getCollection<Category>(CATEGORIES_KEY);
}

// Get category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
  return storage.getFromCollection<Category>(CATEGORIES_KEY, id, 'id_category');
}

// Create a new category
export async function createCategory(category: Omit<Category, 'id_category'>): Promise<Category> {
  const newCategory: Category = {
    ...category,
    id_category: generateId(),
  };
  storage.addToCollection(CATEGORIES_KEY, newCategory, 'id_category');
  return newCategory;
}

// Update a category
export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const success = storage.updateInCollection(CATEGORIES_KEY, id, updates, 'id_category');
  return success ? storage.getFromCollection<Category>(CATEGORIES_KEY, id, 'id_category') : null;
}

// Delete a category
export async function deleteCategory(id: string): Promise<boolean> {
  return storage.removeFromCollection(CATEGORIES_KEY, id, 'id_category');
}
