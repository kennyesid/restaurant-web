import { DatabaseService } from '@/lib/dataBase/databaseService';
import { Inventory } from '@/types';

// Initializing DatabaseService for 'inventory' table.
// hasGroupId is false because the table columns are all lowercase, 
// so we manually handle 'groupid' to avoid column name camelCase mismatch.
const inventoryService = new DatabaseService<Inventory>('inventory', 1, false);

/**
 * Obtener todos los registros del inventario (filtrado por groupid = 1)
 */
export async function getInventory(): Promise<Inventory[]> {
  try {
    const allInventory = await inventoryService.getAll('id', true);
    // Filtrar por el ID de grupo por defecto
    return allInventory.filter(item => item.groupid === 1);
  } catch (error) {
    console.error('Error al obtener el inventario:', error);
    throw new Error('No se pudo cargar el inventario');
  }
}

/**
 * Obtener un item específico de inventario por su ID
 */
export async function getInventoryById(id: number): Promise<Inventory | null> {
  try {
    return await inventoryService.getByField('id', id);
  } catch (error) {
    console.error(`Error al obtener item de inventario con ID ${id}:`, error);
    throw new Error('No se pudo encontrar el item de inventario');
  }
}

/**
 * Crear un nuevo item en el inventario
 */
export async function createInventory(
  item: Omit<Inventory, 'id' | 'createdat' | 'updatedat'>
): Promise<Inventory> {
  try {
    const newItem = {
      ...item,
      groupid: item.groupid || 1,
      state: item.state !== undefined ? item.state : true
    };
    return await inventoryService.create(newItem as any);
  } catch (error) {
    console.error('Error al crear item de inventario:', error);
    throw new Error('No se pudo crear el item de inventario en la base de datos');
  }
}

/**
 * Actualizar un item del inventario
 */
export async function updateInventory(
  id: number,
  updates: Partial<Omit<Inventory, 'id' | 'createdat' | 'updatedat'>>
): Promise<Inventory | null> {
  try {
    return await inventoryService.update('id', id, updates);
  } catch (error) {
    console.error(`Error al actualizar item de inventario con ID ${id}:`, error);
    throw new Error('No se pudo aplicar la actualización al inventario');
  }
}

/**
 * Eliminar un item del inventario (físico o lógico)
 */
export async function deleteInventory(id: number): Promise<boolean> {
  try {
    // Si prefieres borrado lógico, se puede actualizar el state a false:
    // return (await inventoryService.update('id', id, { state: false })) !== null;
    // O borrado físico:
    return await inventoryService.delete('id', id);
  } catch (error) {
    console.error(`Error al eliminar item de inventario con ID ${id}:`, error);
    return false;
  }
}
