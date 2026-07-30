import { ProductDetailProduct } from "@/types/product/productDetailProduct";
import { ProductFittings } from "../product/productFittings";
import { CartItemDetail } from "./cartItemDetail";

export interface SalesDetailGroup {
  id: number;
  saleId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  state: boolean;
}
