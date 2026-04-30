import { storage } from "@/lib/storage";
import { User, Role } from "@/types/user/user";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const USERS_KEY = "users";
const ROLES_KEY = "roles";
const DEFAULT_TENANT_ID = "tenant-1";

function initializeDefaults() {
  const existingUsers = storage.getCollection<User>(USERS_KEY);
  if (existingUsers.length === 0) {
    const defaultUsers: User[] = [
      {
        id: 0,
        username: "S/N",
        password: "S/N",
        fullName: "S/N",
        document: "S/N",
        phone: "S/N",
        address: "S/N",
        email: "S/N",
        branchId: 0,
        avatarUrl: "",
        // tenantId: DEFAULT_TENANT_ID,
        roleId: 1,
        role: "CHEF",
        nit: "56213",
        state: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 1,
        username: "admin",
        password: "admin", // In production, this would be hashed
        fullName: "Administrator",
        document: "12345678",
        phone: "123456789",
        address: "123 Main St",
        email: "admin@gmail.com",
        branchId: 1,
        avatarUrl: "",
        // tenantId: DEFAULT_TENANT_ID,
        roleId: 1,
        role: "ADMIN",
        nit: "789456123",
        state: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        username: "cashier",
        password: "sales_manager",
        fullName: "Cajero Principal",
        document: "12345678",
        phone: "123456789",
        address: "123 Main St",
        email: "sales_manager@gmail.com",
        branchId: 1,
        avatarUrl: "",
        // tenantId: DEFAULT_TENANT_ID,
        roleId: 2,
        role: "SALES_MANAGER",
        nit: "12345",
        state: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    storage.setCollection(USERS_KEY, defaultUsers);
  }

  const existingRoles = storage.getCollection<Role>(ROLES_KEY);
  if (existingRoles.length === 0) {
    const defaultRoles: Role[] = [
      {
        id: 1,
        name: "Administrador",
        description: "Acceso total al sistema",
        tenantId: DEFAULT_TENANT_ID,
      },
      {
        id: 2,
        name: "Cajero",
        description: "Acceso a POS y reportes básicos",
        tenantId: DEFAULT_TENANT_ID,
      },
      {
        id: 3,
        name: "Gerente",
        description: "Acceso a reportes y análisis",
        tenantId: DEFAULT_TENANT_ID,
      },
    ];
    storage.setCollection(ROLES_KEY, defaultRoles);
  }
}

if (typeof window !== "undefined") {
  initializeDefaults();
}

export async function getUsers(): Promise<User[]> {
  return storage.getCollection<User>(USERS_KEY);
}

export async function getUserById(id: number): Promise<User | null> {
  return storage.getFromCollection<User>(USERS_KEY, id, "id");
}

export async function createUser(
  user: Omit<User, "id" | "createdAt" | "updatedAt">,
): Promise<User> {
  const existingUsers = storage.getCollection<User>(USERS_KEY);
  const lastId =
    existingUsers.length > 0 ? Math.max(...existingUsers.map((u) => u.id)) : 1;

  const newUser: User = {
    ...user,
    id: lastId + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  storage.addToCollection(USERS_KEY, newUser, "id");
  return newUser;
}

export async function updateUser(
  id: number,
  updates: Partial<User>,
): Promise<User | null> {
  const success = storage.updateInCollection(
    USERS_KEY,
    id,
    {
      ...updates,
      updatedAt: new Date().toISOString(),
    },
    "id",
  );
  return success ? storage.getFromCollection<User>(USERS_KEY, id, "id") : null;
}

export async function deleteUser(id: number): Promise<boolean> {
  return storage.removeFromCollection(USERS_KEY, id, "id");
}

export async function getRoles(): Promise<Role[]> {
  return storage.getCollection<Role>(ROLES_KEY);
}

export async function getRoleById(id: number): Promise<Role | null> {
  return storage.getFromCollection<Role>(ROLES_KEY, id, "id");
}

export async function createRole(role: Omit<Role, "id">): Promise<Role> {
  const newRole: Role = {
    ...role,
    id: 0,
  };
  storage.addToCollection(ROLES_KEY, newRole, "id");
  return newRole;
}

export async function updateRole(
  id: number,
  updates: Partial<Role>,
): Promise<Role | null> {
  const success = storage.updateInCollection(ROLES_KEY, id, updates, "id");
  return success
    ? storage.getFromCollection<Role>(ROLES_KEY, id, "id")
    : null;
}

export async function deleteRole(id: number): Promise<boolean> {
  return storage.removeFromCollection(ROLES_KEY, id, "id");
}

// Authentication
export async function authenticateUser(
  email: string,
  password: string,
): Promise<User | null> {
  const users = await getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  return user || null;
}
