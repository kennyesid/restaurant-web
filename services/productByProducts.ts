import { supabase } from '@/lib/dataBase/supabaseClient'; // Cliente directo de Supabase
import { Product } from '@/types/product/product';
import { DatabaseService } from '@/lib/dataBase/databaseService';
import { ProductsByProduct } from '@/types/product/ProductByProducts'; // Ajusta la ruta de tus tipos si es necesario
import { configService } from './configService';

// ========================================================
// INSTANCIA DE DatabaseService
// ========================================================
const groupId = configService.getGroupId(); 
// Pasamos 'products_by_product' como nombre de tabla, tu groupId y true si depende de la sucursal/tenant
const productsByProductService = new DatabaseService<ProductsByProduct>('products_by_product', groupId, true);

// ========================================================
// PRODUCTS BY PRODUCT SERVICES
// ========================================================

/**
 * Obtener todas las relaciones de productos activas
 */
export async function getProductsByProduct(): Promise<ProductsByProduct[]> {
  return productsByProductService.getAll('id', true);
}

/**
 * Obtener una relación específica por su ID
 */
export async function getProductsByProductById(id: number): Promise<ProductsByProduct | null> {
  return productsByProductService.getByField('id', id);
}

/**
 * Obtener todos los productos hijos vinculados a un Producto Principal (Ej. Las sopas de un Almuerzo)
 * Muy útil para tu flujo de comanda e interfaz visual
 */
export async function getChildrenByMainProductId(productMainId: number): Promise<ProductsByProduct[]> {
  // Retorna los productos ordenados por el peso visual configurado
  return productsByProductService.getAll('sortOrder', true)
    .then(list => list.filter(item => item.productMainId === productMainId));
}

/**
 * Crear una nueva relación entre producto principal e hijo
 */
export async function createProductsByProduct(
  relation: Omit<ProductsByProduct, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ProductsByProduct> {
  return productsByProductService.create(relation);
}

/**
 * Actualizar una relación (Nombre, descripción, orden, etc.)
 * 💡 Nota: Aquí usamos el update corregido que recibe el 'id' numérico suelto al inicio
 */
export async function updateProductsByProduct(
  id: number,
  updates: Partial<Omit<ProductsByProduct, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ProductsByProduct | null> {
  console.log('updates-products-by-product-revisando: ' + JSON.stringify(updates));
  return productsByProductService.update('id', id, updates);
}

/**
 * Eliminar lógicamente una relación (cambia state a false)
 */
export async function deleteProductsByProduct(id: number): Promise<boolean> {
  return productsByProductService.update('id', id, { state: false }).then(res => res !== null);
}

/**
 * Obtener todos los productos hijos asociados a un producto principal (productMainId)
 */
export async function getProductsByMainId(productMainId: number): Promise<Product[]> {
  try {
    console.log('productMainId-revisando: ' + JSON.stringify(productMainId));
    // 1. Obtener solo las relaciones que le pertenecen a este producto principal
    const allRelations = await productsByProductService.getAll('sortOrder', true);
    const filteredRelations = allRelations.filter(item => item.productMainId === productMainId);
    
    // 2. Extraer los IDs únicos de los productos hijos
    const childrenIds = filteredRelations
      .map(rel => Number(rel.productId))
      .filter(id => !isNaN(id) && id > 0);

    // Si el plato principal no tiene hijos configurados, cortamos de inmediato sin ir a la BD
    if (childrenIds.length === 0) return [];

    // 3. 🚀 OPTIMIZACIÓN CRÍTICA: Pegarle directamente a Supabase filtrando solo por los IDs que requerimos
    const { data: productList, error } = await supabase
      .from('products') // Tu tabla de productos
      .select('*')
      .in('id', childrenIds) // ✨ SELECT * FROM products WHERE id IN (2, 3, 5...)
      .eq('state', true);    // Garantizamos traer solo los activos

    if (error) throw error;
    if (!productList) return [];

    // 4. Mantener el orden visual ('sortOrder') definido en la tabla intermedia
    return (productList as Product[]).sort((a, b) => {
      const orderA = filteredRelations.find(r => r.productId === a.id)?.sortOrder ?? 0;
      const orderB = filteredRelations.find(r => r.productId === b.id)?.sortOrder ?? 0;
      return orderA - orderB;
    });

  } catch (error) {
    console.error(`Error optimizado en getProductsByMainId para el id principal ${productMainId}:`, error);
    return [];
  }
}