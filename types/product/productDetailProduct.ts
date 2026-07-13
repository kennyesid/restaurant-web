// types/ProductIngredientDetail.ts

import { ProductFittings } from "./productFittings";
import { ProductIngredientDetail } from "./productIngredientDetail";

export interface ProductDetailProduct {
  id: number;
  productIngredientDetail?: ProductIngredientDetail[];
  productDetailProduct?: ProductDetailProduct[];
  groupId?: string;
  categoryId: number;
  name: string;
  description: string;
  code?: string;
  legend: string;
  price: number;
  isPromotion: boolean;
  imageUrl: string; // base64 or image URL
  isFeatured: boolean;
  displayOrder?: number;
  isAvailable: boolean;
  piecesOfChicken?: number;
  selected?: boolean;
  createdAt?: string | null;
  createdBy?: string | null;
  state?: boolean | null;
}





// export interface ProductDetailProduct {
//   id: number;
//   // ProductFittings?: ProductFittings[];
//   productFittings?: string[];
//   productId?: number;
//   categoryId: number;
//   name?: string;
//   description?: string | null;
//   quantity?: number | 0;
//   price?: number | 0;
//   isCountable?: boolean | false;
//   imageUrl?: string | null;
//   selected?: boolean;
//   createdAt?: string | null;
//   createdBy?: string | null;
//   state?: boolean | null;
//   reasonModification?: string | null;
// }