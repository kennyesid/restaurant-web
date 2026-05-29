import { CartItem } from "@/types/cart/cartItem";
import { OrderStatusEnum } from "@/types/enum/orderStatusEnum";
import { PaymentTypeEnum } from "@/types/enum/paymentTypeEnum";
import { User } from "../user/user";
import { OrderTypeEnum } from "../enum/orderTypeEnum";

export interface Sale {
  id: number;
  detail: CartItem[]; 
  userId?: number;
  userName?: string;
  userDocument?: string;
  user?: User;
  userCustomerId?: number;
  userCustomer?: User;
  orderNumber: number; 
  orderStatus: OrderStatusEnum; 
  orderType: OrderTypeEnum;
  payInvoice?: boolean;
  tenantId: number;
  total: number;
  paymentType: PaymentTypeEnum;
  shift: string;
  createdAt: Date;
  updatedAt: Date;
  state: boolean;
}