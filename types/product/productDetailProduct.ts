// types/ProductIngredientDetail.ts

import { ProductFittings } from "./productFittings";

export interface ProductDetailProduct {
  id: number;
  // ProductFittings?: ProductFittings[];
  productFittings?: string[];
  productId?: number;
  categoryId: number;
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
