export interface CartItem {
  productId: number;
  name: string; // Añadido
  price: number;
  categoryId: number; // Añadido
  quantity: number;
  modified?: boolean;
  modifiedSubtotal?: number;
  reasonModification?: string;
  isPromotion?: boolean;
  imageUrl?: string;
}
