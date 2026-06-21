// services/usersService.ts
import { DatabaseService } from '@/lib/dataBase/databaseService';
import { User, Role } from '@/types/user/user';
import { supabase } from '@/lib/dataBase/supabaseClient'; // importamos el cliente para autenticación directa
import { configService } from './configService';

// ========================================================
// INSTANCIAS DE DatabaseService
// ========================================================
const groupId = configService.getGroupId(); 
const userService = new DatabaseService<User>('users', groupId);
const roleService = new DatabaseService<Role>('roles');

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


// import { createClient } from "@supabase/supabase-js";
// // import { EnvConfig } from "@/config/env.config";
// import { storage } from "@/lib/storage";
// import { User, Role } from "@/types/user/user";
// import { configService } from "./configService";

// // console.log("Enviroment Config: ", EnvConfig.supabaseUrl, EnvConfig.supabaseKey);

// const supabaseUrl = "https://hvpizqrjxpjhrywkdwjk.supabase.co";
// const supabaseAnonKey = "sb_publishable_D1MciFv-dr_3XCNRa2nRDA_VIM57pJO";

// // const supabase = createClient(EnvConfig.supabaseUrl, EnvConfig.supabaseKey);
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// const USERS_KEY = "users";
// const ROLES_KEY = "roles";

// // function initializeDefaults() {
// //   const existingUsers = storage.getCollection<User>(USERS_KEY);
// //   if (existingUsers.length === 0) {
// //     const defaultUsers: User[] = [
// //     ];
// //     storage.setCollection(USERS_KEY, defaultUsers);
// //   }
// // }

// // if (typeof window !== "undefined") {
// //   initializeDefaults();
// // }

// // ==========================================
// // User CRUD (Conectado a Supabase)
// // ==========================================

// export async function getUsers(): Promise<User[]> {
//   try {
//     const { data, error } = await supabase
//       .from("users")
//       .select(`
//         *
//       `)
//       .eq("state", true);

//     if (error) throw error;
//     return data as User[];
//   } catch (error) {
//     return storage.getCollection<User>(USERS_KEY);
//   }
// }

// export async function getUserById(id: number): Promise<User | null> {
//   try {
//     const { data, error } = await supabase
//       .from("users")
//       .select(`
//         *
//       `)
//       .eq("id", id)
//       .single();

//     if (error) throw error;
//     return data as User;
//   } catch (error) {
//     console.error(`Supabase error [getUserById] para ID ${id}:`, error);
//     return storage.getFromCollection<User>(USERS_KEY, id, "id");
//   }
// }

// /**
//  * 🚀 NUEVO ENDPOINT: Crea un usuario directamente en la base de datos de Supabase
//  */
// export async function createUser(
//   user: Omit<User, "id" | "createdAt" | "updatedAt">,
// ): Promise<User> {
//   try {
//     // Manejo de zona horaria de Bolivia (-04:00) para el timestamp manual si deseas mantener consistencia
//     const now = new Date();
//     const boliviaOffset = -4 * 60 * 60 * 1000;
//     const boliviaTime = new Date(now.getTime() + boliviaOffset + (now.getTimezoneOffset() * 60 * 1000));
//     const boliviaIsoString = boliviaTime.toISOString().replace("Z", "-04:00");

//     // Insertamos en Supabase omitiendo el ID para que la base de datos lo autogenere
//     const { data, error } = await supabase
//       .from("users")
//       .insert([
//         {
//           username: user.username,
//           password: user.password, // Nota: Se recomienda encriptar antes de enviar
//           fullName: user.fullName,
//           lastname: user.lastname || null,
//           document: user.document,
//           nit: user.nit || null,
//           phone: user.phone,
//           address: user.address,
//           email: user.email,
//           branchId: user.branchId,
//           avatarUrl: user.avatarUrl || null,
//           tenantId: user.tenantId || 1,
//           roleId: user.roleId,
//           role: user.role,
//           // groupId: user.groupId, // Columna de relación agregada previamente
//           state: user.state ?? true,
//           createdAt: boliviaIsoString,
//           updatedAt: boliviaIsoString
//         }
//       ])
//       .select()
//       .single();

//     if (error) throw error;
//     return data as User;
//   } catch (error) {
//     // Fallback operativo local en caso de que falle la red o base de datos
//     const existingUsers = storage.getCollection<User>(USERS_KEY);
//     const lastId = existingUsers.length > 0 ? Math.max(...existingUsers.map((u) => u.id)) : 1;
//     const newUser: User = {
//       ...user,
//       id: lastId + 1,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };
//     storage.addToCollection(USERS_KEY, newUser, "id");
//     return newUser;
//   }
// }

// export async function updateUser(
//   id: number,
//   updates: Partial<User>,
// ): Promise<User | null> {
//   try {
//     const { data, error } = await supabase
//       .from("users")
//       .update({
//         ...updates,
//         updatedAt: new Date().toISOString()
//       })
//       .eq("id", id)
//       .select()
//       .single();

//     if (error) throw error;
//     return data as User;
//   } catch (error) {
//     console.error(`Supabase error [updateUser] para ID ${id}:`, error);
//     const success = storage.updateInCollection(USERS_KEY, id, updates, "id");
//     return success ? storage.getFromCollection<User>(USERS_KEY, id, "id") : null;
//   }
// }

// export async function deleteUser(id: number): Promise<boolean> {
//   try {
//     const { error } = await supabase
//       .from("users")
//       .update({ state: false }) // Eliminación lógica estándar
//       .eq("id", id);

//     if (error) throw error;
//     return true;
//   } catch (error) {
//     console.error(`Supabase error [deleteUser] para ID ${id}:`, error);
//     return storage.removeFromCollection(USERS_KEY, id, "id");
//   }
// }

// // ==========================================
// // Role CRUD (Conectado a Supabase)
// // ==========================================

// export async function getRoles(): Promise<Role[]> {
//   try {
//     const { data, error } = await supabase.from("roles").select("*");
//     if (error) throw error;
//     return data as Role[];
//   } catch (error) {
//     console.error("Supabase error [getRoles]:", error);
//     return storage.getCollection<Role>(ROLES_KEY);
//   }
// }

// export async function getRoleById(id: number): Promise<Role | null> {
//   try {
//     const { data, error } = await supabase.from("roles").select("*").eq("id", id).single();
//     if (error) throw error;
//     return data as Role;
//   } catch (error) {
//     return storage.getFromCollection<Role>(ROLES_KEY, id, "id");
//   }
// }

// // ==========================================
// // Authentication
// // ==========================================

// export async function authenticateUser(
//   email: string,
//   password: string,
// ): Promise<User | null> {
//   try {

//     const timeout = new Promise((_, reject) =>
//       setTimeout(() => reject(new Error("Timeout: Supabase tardó demasiado en responder")), 4000)
//     );

//     const { data: todosLosUsuarios, error: errorSelect } = await supabase
//       .from("users")
//       .select("*");

//     if (errorSelect) {
//       console.error("❌ Error al hacer SELECT en Supabase:", errorSelect);
//       throw errorSelect;
//     }

//     console.log("📊 Usuarios encontrados en Supabase (Longitud):", todosLosUsuarios?.length);
//     console.log("📋 Lista completa de usuarios recuperados:", todosLosUsuarios);

// const supabaseCall = supabase
//       .from("users")
//       .select("*")
//       .eq("email", email.trim())
//       .eq("password", password.trim())
//       .eq("state", true)
//       .maybeSingle();

//     // Ejecutamos ambas promesas
//     const response = (await Promise.race([supabaseCall, timeout])) as any;

//     console.log('✅ [authenticateUser] Respuesta exitosa:', response.data);
    
//     if (response.error) throw response.error;
//     return response.data as User | null;
//   } catch (error) {
// console.error("❌ [authenticateUser] Entró al bloque CATCH con el error:", error);
    
//     const users = await getUsers();
//     const localUser = users.find((u) => u.email === email && u.password === password);
//     console.log("👤 Usuario encontrado localmente:", localUser);
//     return localUser || null;
//   }
// }
