import { CartItem } from "@/types/cart/cartItem";
import { OrderStatusEnum } from "@/types/enum/orderStatusEnum";
import { PaymentTypeEnum } from "@/types/enum/paymentTypeEnum";
import { User } from "../user/user";

export interface Sale {
  saleId: number;
  detail: CartItem[]; 
  userId?: number;
  user?: User;
  userCustomerId?: number;
  userCustomer?: User;
  orderNumber: number; 
  orderStatus: OrderStatusEnum; 
  payInvoice?: boolean;
  tenantId: number;
  total: number;
  paymentType: PaymentTypeEnum;
  shift: string;
  createdAt: Date;
  updatedAt: Date;
  state: boolean;
}