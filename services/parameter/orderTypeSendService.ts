// services/orderTypeSendService.ts
import { DatabaseService } from '@/lib/dataBase/databaseService';
import { OrderTypeSend } from '@/types/parameter/orderTypeSend';
import { configService } from '@/services/configService';

// ========================================================
// INSTANCIA DE DatabaseService
// ========================================================
const groupId = configService.getGroupId();
const orderTypeSendService = new DatabaseService<OrderTypeSend>(
  'order_type_send',
  groupId,
  true // usa groupId en las consultas
);

// ========================================================
// ORDER TYPE SEND SERVICES
// ========================================================

/**
 * Obtener todos los tipos de envío activos
 */
export async function getOrderTypes(): Promise<OrderTypeSend[]> {
  return orderTypeSendService.getAll('sortOrder', true);
}

/**
 * Obtener un tipo de envío por ID
 */
export async function getOrderTypeById(id: number): Promise<OrderTypeSend | null> {
  return orderTypeSendService.getByField('id', id);
}

/**
 * Crear un nuevo tipo de envío
 */
export async function createOrderType(
  data: Omit<OrderTypeSend, 'id' | 'createdAt' | 'updatedAt'>
): Promise<OrderTypeSend> {
  return orderTypeSendService.create(data);
}

/**
 * Actualizar un tipo de envío
 */
export async function updateOrderType(
  id: number,
  updates: Partial<Omit<OrderTypeSend, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<OrderTypeSend | null> {
  return orderTypeSendService.update('id', id, updates);
}

/**
 * Eliminar lógicamente un tipo de envío (cambia state a false)
 */
export async function deleteOrderType(id: number): Promise<boolean> {
  return orderTypeSendService
    .update('id', id, { state: false })
    .then(res => res !== null);
}