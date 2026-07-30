import { ProductDetailProduct } from "@/types/product/productDetailProduct";
import { ProductFittings } from "../product/productFittings";
import { CartItemDetail } from "./cartItemDetail";

export interface CartItemDataBase {
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
  productFittings?: ProductFittings[];
  productDetailProduct?: ProductDetailProduct[];
  imageUrl?: string;

  sales_detail_group_id: number;
  combosecuencia: number;
  selected: boolean;

  createdAt?: string;
  updatedAt?: string;
  state?: boolean;
}
