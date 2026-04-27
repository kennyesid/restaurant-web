export interface User {
  id: number;
  username: string;
  password: string;
  fullName: string;
  document: string;
  nit?: string;
  phone: string;
  address: string;
  email: string;
  branchId?: number;
  avatarUrl?: string;
  tenantId: string;
  roleId: number;
  createdAt: string;
  updatedAt: string;
  state: boolean;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  tenantId: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface RolePermission {
  roleId: number;
  permissionId: number;
}
