export interface UserGroup {
  id: number;
  code: string;
  name: string;
  description?: string;
  canAccess?: boolean;
  tenantId?: number;
  createdAt: string;
  updatedAt: string;
  state: boolean;
}
