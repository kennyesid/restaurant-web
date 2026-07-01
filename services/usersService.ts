// services/usersService.ts
import { DatabaseService } from '@/lib/dataBase/databaseService';
import { User, Role } from '@/types/user/user';
import { supabase } from '@/lib/dataBase/supabaseClient'; // importamos el cliente para autenticación directa
import { configService } from './configService';

// ========================================================
// INSTANCIAS DE DatabaseService
// ========================================================
const groupId = configService.getGroupId(); 
const userService = new DatabaseService<User>('users', groupId, true);
const roleService = new DatabaseService<Role>('roles', groupId, false);

// ========================================================
// USER SERVICES
// ========================================================

/**
 * Obtener todos los usuarios activos
 */
export async function getUsers(): Promise<User[]> {
  return userService.getAll('id', true);
}

/**
 * Obtener un usuario por ID
 */
export async function getUserById(id: number): Promise<User | null> {
  return userService.getByField('id', id);
}

/**
 * Crear un nuevo usuario
 */
export async function createUser(
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
): Promise<User> {
  return userService.create(user);
}

/**
 * Actualizar un usuario
 */
export async function updateUser(
  id: number,
  updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<User | null> {
  console.log('updates-revisando: ' + JSON.stringify(updates));
  return userService.update('id', id, updates);
}

/**
 * Eliminar lógicamente un usuario (cambia state a false)
 */
export async function deleteUser(id: number): Promise<boolean> {
  return userService.update('id', id, { state: false }).then(res => res !== null);
}

// ========================================================
// ROLE SERVICES (opcional, mantén la misma estructura)
// ========================================================

export async function getRoles(): Promise<Role[]> {
  return roleService.getAll('id', true);
}

export async function getRoleById(id: number): Promise<Role | null> {
  return roleService.getByField('id', id);
}

// ========================================================
// AUTHENTICATION (usamos supabase directamente para consultas complejas)
// ========================================================

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim())
      .eq('password', password.trim())
      .eq('state', true)
      .maybeSingle();

    if (error) throw error;
    return data as User | null;
  } catch (error) {
    console.error('Error en authenticateUser:', error);
    return null;
  }
}
