import { ProductDetailProduct } from "@/types/product/productDetailProduct";
import { ProductFittings } from "../product/productFittings";

export interface SalesDetailsDetails {
  id: number;
  productMainId: number;
  name: string;
  price: number;
  categoryId: number;
  productId: number;
  quantity: number;
  modified?: boolean;
  subTotal?: number;
  modifiedSubtotal?: number;
  reasonModification?: string;
  isPromotion?: boolean;
  isCountable?: boolean | false;
  productFittings?: ProductFittings[];
  productDetailProduct?: ProductDetailProduct[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  state?: boolean;
}
