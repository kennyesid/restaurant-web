import { ProductDetailProduct } from "@/types/product/productDetailProduct";
import { ProductFittings } from "../product/productFittings";

export interface CartItem {
  id: number;
  name: string; // Añadido
  price: number;
  categoryId: number; // Añadido
  quantity: number;
  modified?: boolean;
  modifiedSubtotal?: number;
  reasonModification?: string;
  isPromotion?: boolean;
  isCountable?: boolean | false;
  productFitting?: ProductFittings[];
  productDetailProduct?: ProductDetailProduct[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  state?: boolean;
}
