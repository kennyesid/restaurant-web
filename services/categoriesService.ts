import { DatabaseService } from '@/lib/dataBase/databaseService';
import { Category } from '@/types';
import { configService } from './configService';

const groupId = configService.getGroupId(); 
const categoryService = new DatabaseService<Category>('categories', groupId);

export async function getCategories(): Promise<Category[]> {
  console.log("hola: " + (await categoryService.getAll('id', true)));
  return categoryService.getAll('id', true);
}

// Get category by ID
export async function getCategoryById(id: number): Promise<Category | null> {
  return categoryService.getByField('id', id);
}

// Create a new category
export async function createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
  return categoryService.create(category);
}

// Update a category
export async function updateCategory(id: number, updates: Partial<Omit<Category, 'id'>>): Promise<Category | null> {
  return categoryService.update('id', id, updates);
}

// Delete a category
export async function deleteCategory(id: number): Promise<boolean> {
  return categoryService.delete('id', id);
}




// import { storage } from '@/lib/storage';
// import { Category } from '@/types';

// function generateNumericId(collection: Category[]): number {
//   if (collection.length === 0) return 1;
//   const maxId = Math.max(...collection.map(p => p.id));
//   return maxId + 1;
// }

// const CATEGORIES_KEY = 'categories';
// // const DEFAULT_TENANT_ID = 'tenant-1';

// // Get all categories
// export async function getCategories(): Promise<Category[]> {
//   return storage.getCollection<Category>(CATEGORIES_KEY);
// }

// // Get category by ID
// export async function getCategoryById(id: string): Promise<Category | null> {
//   return storage.getFromCollection<Category>(CATEGORIES_KEY, id, 'id');
// }

// // Create a new category
// export async function createCategory(category: Omit<Category, 'id'>): Promise<Category> {
//   const current = storage.getCollection<Category>(CATEGORIES_KEY);
//   const newCategory: Category = {
//     ...category,
//     id: generateNumericId(current),
//   };
//   storage.addToCollection(CATEGORIES_KEY, newCategory, 'id');
//   return newCategory;
// }

// // Update a category
// export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
//   const success = storage.updateInCollection(CATEGORIES_KEY, id, updates, 'id');
//   return success ? storage.getFromCollection<Category>(CATEGORIES_KEY, id, 'id') : null;
// }

// // Delete a category
// export async function deleteCategory(id: string): Promise<boolean> {
//   return storage.removeFromCollection(CATEGORIES_KEY, id, 'id');
// }
