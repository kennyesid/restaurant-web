export interface UserGroup {
 id: number;
 code: string;
  name: string;
  description?: string;
  canAccess?: boolean; // Indica si el grupo tiene permitido acceder o no 🚫/✅
  tenantId?: number;
  createdAt: string;
  updatedAt: string;
  state: boolean;
}
