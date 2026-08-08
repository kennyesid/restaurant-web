import { CartItem } from "./cartItem";

export interface CartState {
  items: CartItem[];
  paymentType: "cash" | "qr" | "mixed";
  mixedPayment?: {
    cash: number;
    qr: number;
  };
  isCartOpen: boolean;
  editingSaleId?: number | null;
  table?: number;
  orderType?: string;
  userCustomerName?: string;
  userDocument?: string;
  orderNumber?: number;
  amountPaid?: number;
}
