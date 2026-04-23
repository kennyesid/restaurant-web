import { CartItem } from "@/types/cart/cartItem";

export interface Sale {
  saleId: number;
  detail: CartItem[]; 
  userId: number;
  tenantId: number;
  total: number;
  paymentType: "cash" | "qr" | "mixed";
  shift: string;
  createdAt: Date;
  updatedAt: Date;
  state: boolean;
}