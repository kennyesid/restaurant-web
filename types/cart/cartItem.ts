export interface CartItem {
  productId: number;
  name: string; // Añadido
  price: number;
  categoryId: number; // Añadido
  quantity: number;
  imageUrl?: string;
}
