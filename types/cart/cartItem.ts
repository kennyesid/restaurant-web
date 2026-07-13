import { ProductDetailProduct } from "@/types/product/productDetailProduct";
import { ProductFittings } from "../product/productFittings";
import { CartItemDetail } from "./cartItemDetail";
import { CartItemDetailDetails } from "./cartItemDetailDetails";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  productId: number;
  quantity: number;
  modified?: boolean;
  subTotal?: number;
  modifiedSubtotal?: number;
  reasonModification?: string;
  orderTypeSend?: string;
  isPromotion?: boolean;
  isCountable?: boolean | false;
  cartItemDetail?: CartItemDetail[];
  // cartItemDetailDetails?: CartItemDetailDetails[];
  productFittings?: ProductFittings[];
  productDetailProduct?: ProductDetailProduct[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  state?: boolean;
}
