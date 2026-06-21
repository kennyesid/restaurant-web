import { DatabaseService } from '@/lib/dataBase/databaseService';
import { Ingredient } from '@/types'; // Asegúrate de exportar la interfaz desde tu archivo de tipos
import { getIngredientCategories } from './ingredientCategoriesService';

// 1. Inicializamos el servicio único apuntando a la tabla 'ingredients'
const ingredientService = new DatabaseService<Ingredient>('ingredients');

// ========================================================
// INGREDIENT SERVICES
// ========================================================

/**
 * Obtener todos los ingredientes activos de la base de datos
 */
export async function getIngredients(): Promise<Ingredient[]> {
  try {
    const [ingredients, categories] = await Promise.all([
      ingredientService.getAll('id', true),
      getIngredientCategories()
    ]);

    // 👇 LOGS PARA DEPURAR
    console.log('📋 Cantidad de categorías:', categories.length);
    console.log('📋 Primera categoría:', categories[0]);
    console.log('📋 Todas las categorías:', JSON.stringify(categories, null, 2));

    const categoryMap = new Map<number, string>();
    categories.forEach(cat => {
      categoryMap.set(cat.id, cat.name);
    });

    console.log('🗺️ Mapa de categorías:', Array.from(categoryMap.entries()));

    const enrichedIngredients = ingredients.map(ing => {
      const catId = ing.ingredientCategoriesId;
      const catName = categoryMap.get(catId) || 'Sin categoría';
      
      // 👇 LOG PARA CADA INGREDIENTE
      console.log(`🆔 Ing ${ing.id} - catId: ${catId} -> ${catName}`);
      
      return {
        ...ing,
        categoryName: catName
      };
    });

    return enrichedIngredients;
  } catch (error) {
    console.error('Error al obtener los ingredientes:', error);
    throw new Error('No se pudieron cargar los ingredientes');
  }
}


// export async function getIngredients(): Promise<Ingredient[]> {
//   try {
//     // Obtener ingredientes y categorías en paralelo
//     const [ingredients, categories] = await Promise.all([
//       ingredientService.getAll('id', true),
//       getIngredientCategories() // esta función debe existir en tu servicio de categorías
//     ]);

//     // Crear un mapa de categorías por ID para búsqueda rápida
//     const categoryMap = new Map<number, string>();
//     categories.forEach(cat => {
//       categoryMap.set(cat.id, cat.name);
//     });

//     // Enriquecer cada ingrediente con el nombre de la categoría
//     const enrichedIngredients = ingredients.map(ing => ({
//       ...ing,
//       // Agregar un campo virtual 'categoryName' (no existe en la BD)
//       categoryName: categoryMap.get(ing.ingredientCategoriesId) || 'Sin categoría'
//     }));

// console.log(JSON.stringify(enrichedIngredients) );

//     return enrichedIngredients;
//   } catch (error) {
//     console.error('Error al obtener los ingredientes:', error);
//     throw new Error('No se pudieron cargar los ingredientes');
//   }
// }




// export async function getIngredients(): Promise<Ingredient[]> {
//   try {
//     // Retorna la lista filtrada por state: true gracias al método getAll genérico
//     return await ingredientService.getAll('id', true);
//   } catch (error) {
//     console.error('Error al obtener los ingredientes:', error);
//     throw new Error('No se pudieron cargar los ingredientes');
//   }
// }

/**
 * Obtener un ingrediente específico por su ID único
 */
export async function getIngredientById(id: number): Promise<Ingredient | null> {
  try {
    return await ingredientService.getByField('id', id);
  } catch (error) {
    console.error(`Error al obtener ingrediente con ID ${id}:`, error);
    throw new Error('No se pudo encontrar el ingrediente solicitado');
  }
}

/**
 * Obtener ingredientes filtrados por su categoría
 */
export async function getIngredientsByCategory(ingredientCategoriesId: number): Promise<Ingredient[]> {
  try {
    const allIngredients = await ingredientService.getAll('id', true);
    return allIngredients.filter(ing => ing.ingredientCategoriesId === ingredientCategoriesId);
  } catch (error) {
    console.error(`Error al filtrar ingredientes por categoría ${ingredientCategoriesId}:`, error);
    throw new Error('No se pudieron filtrar los ingredientes');
  }
}

/**
 * Crear un nuevo ingrediente en el inventario
 */
export async function createIngredient(
  ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Ingredient> {
  try {
    // El método create genérico ya asume el tipado correcto omitiendo campos automáticos
    return await ingredientService.create(ingredient);
  } catch (error) {
    console.error('Error al crear el ingrediente:', error);
    throw new Error('No se pudo guardar el nuevo ingrediente en la base de datos');
  }
}

/**
 * Actualizar campos específicos de un ingrediente (ej: actualizar stock o precio)
 */
export async function updateIngredient(
  id: number,
  updates: Partial<Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Ingredient | null> {
  try {
    return await ingredientService.update('id', id, updates);
  } catch (error) {
    console.error(`Error al actualizar el ingrediente con ID ${id}:`, error);
    throw new Error('No se pudo aplicar la actualización del ingrediente');
  }
}

/**
 * Eliminación lógica o física de un ingrediente
 */
export async function deleteIngredient(id: number): Promise<boolean> {
  try {
    return await ingredientService.delete('id', id);
  } catch (error) {
    console.error(`Error al eliminar el ingrediente con ID ${id}:`, error);
    return false;
  }
}

// ========================================================
// INVENTORY CONTROL EXTRA SERVICES
// ========================================================

/**
 * Actualizar rápidamente el stock físico actual de un ingrediente
 */
export async function updateIngredientStock(id: number, newStock: number): Promise<Ingredient | null> {
  try {
    return await ingredientService.update('id', id, { currentStock: newStock });
  } catch (error) {
    console.error(`Error al actualizar stock del ingrediente ${id}:`, error);
    throw new Error('No se pudo actualizar el stock del ingrediente');
  }
}
