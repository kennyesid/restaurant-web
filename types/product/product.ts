import { ProductIngredientDetail } from "./ProductIngredientDetail";

export interface Product {
  productId: number;
  productIngredientDetail?: ProductIngredientDetail[];
  categoryId: number;
  name: string;
  description: string;
  legend: string;
  price: number;
  isPromotion: boolean;
  imageUrl: string; // base64 or image URL
  isFeatured: boolean;
  displayOrder: number;
  isAvailable: boolean;
  piecesOfChicken?: number;
  created_at: string;
  updated_at: string;
  state: boolean;
}

  // promotionId: int;
  // id_ingredient_group: string;
  // is_available: boolean;
  // id_tenant: string;