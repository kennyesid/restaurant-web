export interface ProductsByProduct {
  id: number;
  productMainId?: number | null;
  productId?: number | null;
  groupId?: number | null;
  name: string;
  description?: string | null;
  sortOrder?: number | null;
  createdAt: string; 
  updatedAt: string; 
  state: boolean;
}