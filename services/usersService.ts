import { createClient } from "@supabase/supabase-js";
// import { EnvConfig } from "@/config/env.config";
import { storage } from "@/lib/storage";
import { User, Role } from "@/types/user/user";

// console.log("Enviroment Config: ", EnvConfig.supabaseUrl, EnvConfig.supabaseKey);

const supabaseUrl = "https://hvpizqrjxpjhrywkdwjk.supabase.co";
const supabaseAnonKey = "sb_publishable_D1MciFv-dr_3XCNRa2nRDA_VIM57pJO";

// const supabase = createClient(EnvConfig.supabaseUrl, EnvConfig.supabaseKey);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const USERS_KEY = "users";
const ROLES_KEY = "roles";

// Fallback LocalStorage (Se mantiene para inicialización por defecto si es necesario)
function initializeDefaults() {
  const existingUsers = storage.getCollection<User>(USERS_KEY);
  if (existingUsers.length === 0) {
    const defaultUsers: User[] = [
      { id: 0, username: "S/N", password: "S/N", fullName: "S/N", document: "S/N", phone: "S/N", address: "S/N", email: "S/N", branchId: 0, avatarUrl: "", roleId: 1, role: "CHEF", nit: "56213", state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 1, username: "Gonzalo", password: "admin", fullName: "Gonzalo", document: "12345678", phone: "123456789", address: "123 Main St", email: "admin@gmail.com", branchId: 1, avatarUrl: "", roleId: 1, role: "ADMIN", nit: "789456123", state: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    storage.setCollection(USERS_KEY, defaultUsers);
  }
}

if (typeof window !== "undefined") {
  initializeDefaults();
}

// ==========================================
// User CRUD (Conectado a Supabase)
// ==========================================

export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(`
        *
      `)
      .eq("state", true);

    if (error) throw error;
    return data as User[];
  } catch (error) {
    console.error("Supabase error [getUsers], recurriendo a LocalStorage:", error);
    return storage.getCollection<User>(USERS_KEY);
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(`
        *
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error(`Supabase error [getUserById] para ID ${id}:`, error);
    return storage.getFromCollection<User>(USERS_KEY, id, "id");
  }
}

/**
 * 🚀 NUEVO ENDPOINT: Crea un usuario directamente en la base de datos de Supabase
 */
export async function createUser(
  user: Omit<User, "id" | "createdAt" | "updatedAt">,
): Promise<User> {
  try {
    // Manejo de zona horaria de Bolivia (-04:00) para el timestamp manual si deseas mantener consistencia
    const now = new Date();
    const boliviaOffset = -4 * 60 * 60 * 1000;
    const boliviaTime = new Date(now.getTime() + boliviaOffset + (now.getTimezoneOffset() * 60 * 1000));
    const boliviaIsoString = boliviaTime.toISOString().replace("Z", "-04:00");

    // Insertamos en Supabase omitiendo el ID para que la base de datos lo autogenere
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username: user.username,
          password: user.password, // Nota: Se recomienda encriptar antes de enviar
          fullName: user.fullName,
          lastname: user.lastname || null,
          document: user.document,
          nit: user.nit || null,
          phone: user.phone,
          address: user.address,
          email: user.email,
          branchId: user.branchId,
          avatarUrl: user.avatarUrl || null,
          tenantId: user.tenantId || 1,
          roleId: user.roleId,
          role: user.role,
          // groupId: user.groupId, // Columna de relación agregada previamente
          state: user.state ?? true,
          createdAt: boliviaIsoString,
          updatedAt: boliviaIsoString
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error("Supabase error [createUser], guardando en LocalStorage local de contingencia:", error);
    
    // Fallback operativo local en caso de que falle la red o base de datos
    const existingUsers = storage.getCollection<User>(USERS_KEY);
    const lastId = existingUsers.length > 0 ? Math.max(...existingUsers.map((u) => u.id)) : 1;
    const newUser: User = {
      ...user,
      id: lastId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.addToCollection(USERS_KEY, newUser, "id");
    return newUser;
  }
}

export async function updateUser(
  id: number,
  updates: Partial<User>,
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error(`Supabase error [updateUser] para ID ${id}:`, error);
    const success = storage.updateInCollection(USERS_KEY, id, updates, "id");
    return success ? storage.getFromCollection<User>(USERS_KEY, id, "id") : null;
  }
}

export async function deleteUser(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("users")
      .update({ state: false }) // Eliminación lógica estándar
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Supabase error [deleteUser] para ID ${id}:`, error);
    return storage.removeFromCollection(USERS_KEY, id, "id");
  }
}

// ==========================================
// Role CRUD (Conectado a Supabase)
// ==========================================

export async function getRoles(): Promise<Role[]> {
  try {
    const { data, error } = await supabase.from("roles").select("*");
    if (error) throw error;
    return data as Role[];
  } catch (error) {
    console.error("Supabase error [getRoles]:", error);
    return storage.getCollection<Role>(ROLES_KEY);
  }
}

export async function getRoleById(id: number): Promise<Role | null> {
  try {
    const { data, error } = await supabase.from("roles").select("*").eq("id", id).single();
    if (error) throw error;
    return data as Role;
  } catch (error) {
    return storage.getFromCollection<Role>(ROLES_KEY, id, "id");
  }
}

// ==========================================
// Authentication
// ==========================================

export async function authenticateUser(
  email: string,
  password: string,
): Promise<User | null> {
  try {
console.log('🚀 [authenticateUser] Inicio autenticación para:', email);

    // Creamos una promesa que falla automáticamente a los 4 segundos
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: Supabase tardó demasiado en responder")), 4000)
    );

    const { data: todosLosUsuarios, error: errorSelect } = await supabase
      .from("users")
      .select("*");

    if (errorSelect) {
      console.error("❌ Error al hacer SELECT en Supabase:", errorSelect);
      throw errorSelect;
    }

    console.log("📊 Usuarios encontrados en Supabase (Longitud):", todosLosUsuarios?.length);
    console.log("📋 Lista completa de usuarios recuperados:", todosLosUsuarios);

const supabaseCall = supabase
      .from("users")
      .select("*")
      .eq("email", email.trim())
      .eq("password", password.trim())
      .eq("state", true)
      .maybeSingle();

    // Ejecutamos ambas promesas
    const response = (await Promise.race([supabaseCall, timeout])) as any;

    console.log('✅ [authenticateUser] Respuesta exitosa:', response.data);
    
    if (response.error) throw response.error;
    return response.data as User | null;
  } catch (error) {
console.error("❌ [authenticateUser] Entró al bloque CATCH con el error:", error);
    
    // Tu fallback de LocalStorage se activará inmediatamente si Supabase se cuelga o falla
    console.log("⚠️ Buscando usuario en LocalStorage de contingencia...");
    const users = await getUsers();
    const localUser = users.find((u) => u.email === email && u.password === password);
    console.log("👤 Usuario encontrado localmente:", localUser);
    return localUser || null;
  }
}


// import { createClient } from "@supabase/supabase-js";
// import { EnvConfig } from "@/config/env.config";
// import { storage } from "@/lib/storage";
// import { User, Role } from "@/types/user/user";

// const supabase = createClient(EnvConfig.supabaseUrl, EnvConfig.supabaseKey);

// function generateId(): string {
//   return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
// }

// const USERS_KEY = "users";
// const ROLES_KEY = "roles";
// const DEFAULT_TENANT_ID = "tenant-1";

// function initializeDefaults() {
//   const existingUsers = storage.getCollection<User>(USERS_KEY);
//   if (existingUsers.length === 0) {
//     const defaultUsers: User[] = [
//       {
//         id: 0,
//         username: "S/N",
//         password: "S/N",
//         fullName: "S/N",
//         document: "S/N",
//         phone: "S/N",
//         address: "S/N",
//         email: "S/N",
//         branchId: 0,
//         avatarUrl: "",
//         // tenantId: DEFAULT_TENANT_ID,
//         roleId: 1,
//         role: "CHEF",
//         nit: "56213",
//         state: true,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       },
//       {
//         id: 1,
//         username: "Gonzalo",
//         password: "admin", // In production, this would be hashed
//         fullName: "Gonzalo",
//         document: "12345678",
//         phone: "123456789",
//         address: "123 Main St",
//         email: "admin@gmail.com",
//         branchId: 1,
//         avatarUrl: "",
//         // tenantId: DEFAULT_TENANT_ID,
//         roleId: 1,
//         role: "ADMIN",
//         nit: "789456123",
//         state: true,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       },
//       {
//         id: 2,
//         username: "cashier",
//         password: "sales_manager",
//         fullName: "Cajero Principal",
//         document: "12345678",
//         phone: "123456789",
//         address: "123 Main St",
//         email: "sales_manager@gmail.com",
//         branchId: 1,
//         avatarUrl: "",
//         // tenantId: DEFAULT_TENANT_ID,
//         roleId: 2,
//         role: "SALES_MANAGER",
//         nit: "12345",
//         state: true,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       },
//     ];
//     storage.setCollection(USERS_KEY, defaultUsers);
//   }

//   const existingRoles = storage.getCollection<Role>(ROLES_KEY);
//   if (existingRoles.length === 0) {
//     const defaultRoles: Role[] = [
//       {
//         id: 1,
//         name: "Administrador",
//         description: "Acceso total al sistema",
//         tenantId: DEFAULT_TENANT_ID,
//       },
//       {
//         id: 2,
//         name: "Cajero",
//         description: "Acceso a POS y reportes básicos",
//         tenantId: DEFAULT_TENANT_ID,
//       },
//       {
//         id: 3,
//         name: "Gerente",
//         description: "Acceso a reportes y análisis",
//         tenantId: DEFAULT_TENANT_ID,
//       },
//     ];
//     storage.setCollection(ROLES_KEY, defaultRoles);
//   }
// }

// if (typeof window !== "undefined") {
//   initializeDefaults();
// }

// export async function getUsers(): Promise<User[]> {
//   return storage.getCollection<User>(USERS_KEY);
// }

// export async function getUserById(id: number): Promise<User | null> {
//   return storage.getFromCollection<User>(USERS_KEY, id, "id");
// }

// export async function createUserNew(
//   user: Omit<User, "id" | "createdAt" | "updatedAt">,
// ): Promise<User> {
//   try {
//     // Manejo de zona horaria de Bolivia (-04:00) para el timestamp manual si deseas mantener consistencia
//     const now = new Date();
//     const boliviaOffset = -4 * 60 * 60 * 1000;
//     const boliviaTime = new Date(
//       now.getTime() + boliviaOffset + now.getTimezoneOffset() * 60 * 1000,
//     );
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
//           groupId: user.groupId, // Columna de relación agregada previamente
//           state: user.state ?? true,
//           createdAt: boliviaIsoString,
//           updatedAt: boliviaIsoString,
//         },
//       ])
//       .select()
//       .single();

//     if (error) throw error;
//     return data as User;
//   } catch (error) {
//     console.error(
//       "Supabase error [createUser], guardando en LocalStorage local de contingencia:",
//       error,
//     );

//     // Fallback operativo local en caso de que falle la red o base de datos
//     const existingUsers = storage.getCollection<User>(USERS_KEY);
//     const lastId =
//       existingUsers.length > 0
//         ? Math.max(...existingUsers.map((u) => u.id))
//         : 1;
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

// export async function createUser(
//   user: Omit<User, "id" | "createdAt" | "updatedAt">,
// ): Promise<User> {
//   const existingUsers = storage.getCollection<User>(USERS_KEY);
//   const lastId =
//     existingUsers.length > 0 ? Math.max(...existingUsers.map((u) => u.id)) : 1;

//   const now = new Date();
//   const boliviaOffset = -4 * 60 * 60 * 1000; // -4 horas en milisegundos
//   const boliviaTime = new Date(
//     now.getTime() + boliviaOffset + now.getTimezoneOffset() * 60 * 1000,
//   );
//   const boliviaIsoString = boliviaTime.toISOString().replace("Z", "-04:00");

//   const newUser: User = {
//     ...user,
//     id: lastId + 1,
//     createdAt: boliviaIsoString,
//     updatedAt: boliviaIsoString,
//   };
//   storage.addToCollection(USERS_KEY, newUser, "id");
//   return newUser;
// }

// export async function updateUser(
//   id: number,
//   updates: Partial<User>,
// ): Promise<User | null> {
//   const success = storage.updateInCollection(
//     USERS_KEY,
//     id,
//     {
//       ...updates,
//       updatedAt: new Date().toISOString(),
//     },
//     "id",
//   );
//   return success ? storage.getFromCollection<User>(USERS_KEY, id, "id") : null;
// }

// export async function deleteUser(id: number): Promise<boolean> {
//   return storage.removeFromCollection(USERS_KEY, id, "id");
// }

// export async function getRoles(): Promise<Role[]> {
//   return storage.getCollection<Role>(ROLES_KEY);
// }

// export async function getRoleById(id: number): Promise<Role | null> {
//   return storage.getFromCollection<Role>(ROLES_KEY, id, "id");
// }

// export async function createRole(role: Omit<Role, "id">): Promise<Role> {
//   const newRole: Role = {
//     ...role,
//     id: 0,
//   };
//   storage.addToCollection(ROLES_KEY, newRole, "id");
//   return newRole;
// }

// export async function updateRole(
//   id: number,
//   updates: Partial<Role>,
// ): Promise<Role | null> {
//   const success = storage.updateInCollection(ROLES_KEY, id, updates, "id");
//   return success ? storage.getFromCollection<Role>(ROLES_KEY, id, "id") : null;
// }

// export async function deleteRole(id: number): Promise<boolean> {
//   return storage.removeFromCollection(ROLES_KEY, id, "id");
// }

// // Authentication
// export async function authenticateUser(
//   email: string,
//   password: string,
// ): Promise<User | null> {
//   const users = await getUsers();
//   const user = users.find((u) => u.email === email && u.password === password);
//   return user || null;
// }
