import { ProductDetailProduct } from "@/types/product/productDetailProduct";
import { ProductFittings } from "../product/productFittings";
import { SelectedProduct } from "../product/selectedproduct";

export interface CartItemDetailDetails {
  id: number;
  cartItemId: number;
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
  // isPromotion?: boolean;
  // isCountable?: boolean | false;
  productFittings?: ProductFittings[];
  productDetailProduct?: SelectedProduct[];
  // productDetailProduct?: ProductDetailProduct[];
  imageUrl?: string;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
  state?: boolean;
}
