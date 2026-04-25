import { ToastType } from "@/types/enum/toasType";

export interface ToastBody {
  type: ToastType;
  message: string;
  description: string;
  image?: string | null;
}