// Guarniciones
export interface ProductFittings {
  id: number;
  groupId: number;
  productDetailProductId?: number;
  name?: string;
  description?: string | null;
  quantity?: number | 0;
  price?: number | 0;
  isCountable?: boolean | false;
  imageUrl?: string | null;
  createdAt?: string | null;
  createdBy?: string | null;
  state?: boolean | null;
}
