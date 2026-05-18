// types/ProductIngredientDetail.ts

export interface ProductDetailProduct {
  id: number;
  productId: number;
  name: string;
  description?: string | null;
  quantity: number | 0;
  price: number | 0;
  imageUrl: string | null;
  createdAt: string | null;
  createdBy: string | null;
  state: boolean | null;
}
