import { CartItem } from "./cartItem";


export interface CartState {
  items: CartItem[];
  paymentType: 'cash' | 'qr' | 'mixed';
  mixedPayment?: {
    cash: number;
    qr: number;
  };
}