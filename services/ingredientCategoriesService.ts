import { DatabaseService } from '@/lib/dataBase/databaseService';
import { IngredientCategories } from '@/types';

const ingredientCategoryService = new DatabaseService<IngredientCategories>('ingredientCategories');

// ========================================================
// INGREDIENT CATEGORIES SERVICES
// ========================================================

export async function getIngredientCategories(): Promise<IngredientCategories[]> {
  // Obtener todas las categorías, ordenadas por nombre
  return ingredientCategoryService.getAll('name', true);
}

export async function getIngredientCategoryById(id: number): Promise<IngredientCategories | null> {
  return ingredientCategoryService.getByField('id', id);
}

export async function getIngredientCategoriesByGroup(groupId: number): Promise<IngredientCategories[]> {
  // Asumiendo que el campo group_id existe
  const all = await ingredientCategoryService.getAll('name', true);
  return all.filter(cat => cat.groupId === groupId);
}

export async function createIngredientCategory(
  data: Omit<IngredientCategories, 'id' | 'createdAt' | 'updatedAt'>
): Promise<IngredientCategories> {
  return ingredientCategoryService.create(data);
}

export async function updateIngredientCategory(
  id: number,
  updates: Partial<Omit<IngredientCategories, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<IngredientCategories | null> {
  return ingredientCategoryService.update('id', id, updates);
}

export async function deleteIngredientCategory(id: number): Promise<boolean> {
  return ingredientCategoryService.delete('id', id);
}

// Opcional: obtener solo activas
export async function getActiveIngredientCategories(): Promise<IngredientCategories[]> {
  const all = await ingredientCategoryService.getAll('name', true);
  return all.filter(cat => cat.state === true);
}

// Opcional: obtener solo inactivas
export async function getInactiveIngredientCategories(): Promise<IngredientCategories[]> {
  const all = await ingredientCategoryService.getAll('name', true);
  return all.filter(cat => cat.state === false);
}