import { ProductDetailProduct } from "./productDetailProduct";
import { ProductIngredientDetail } from "./productIngredientDetail";

export interface Product {
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
  createdAt: string;
  updatedAt: string;
  state: boolean;
}

// promotionId: int;
// id_ingredient_group: string;
// is_available: boolean;
// id_tenant: string;
