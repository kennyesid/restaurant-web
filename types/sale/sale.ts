import { CartItem } from "@/types/cart/cartItem";

export interface Sale {
  saleId: number;
  detail: CartItem[]; 
  userId: number;
  userCustomerId?: number;
  orderNumber: number; 
  orderStatus: string; 
  tenantId: number;
  total: number;
  paymentType: "cash" | "qr" | "mixed";
  shift: string;
  createdAt: Date;
  updatedAt: Date;
  state: boolean;
}