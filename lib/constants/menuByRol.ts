import { RoleType } from "@/types";
import {
  BarChart3,
  Beef,
  Clock,
  Gift,
  Package,
  Settings,
  Tag,
  Users,
  ShoppingCart,
} from "lucide-react";

export type MenuItem = {
  label: string;
  icon: any; 
  href: string;
};

export type MenuConfig = {
  first: MenuItem[];
  second: MenuItem[];
};

export const MENU_BY_ROL: Record<RoleType, MenuConfig> = {
  ADMIN: {
    first: [
      { label: "Dashboard", icon: BarChart3, href: "/dashboard" },
      { label: "Carrito de Compras", icon: ShoppingCart, href: "/cart" },
      { label: "Ventas", icon: Beef, href: "/sales" },
      { label: "Productos", icon: Package, href: "/product" },
    ],
    second: [
      { label: "Ingredientes", icon: Package, href: "/ingredient" },
      { label: "Gastos", icon: Package, href: "/inventory" },
      { label: "Usuarios", icon: Users, href: "/admin/users" },
      // { label: "Roles", icon: Settings, href: "/dashboard/admin/roles" },
      // { label: "Categorías", icon: Tag, href: "/dashboard/admin/categories" },
      // { label: "Promociones", icon: Gift, href: "/dashboard/admin/promotions" },
      // { label: "Turnos", icon: Clock, href: "/dashboard/admin/shifts" },
    ],
  },
  SALES_MANAGER: {
    first: [
      { label: "Dashboard", icon: BarChart3, href: "/dashboard" },
      { label: "Carrito de Compras", icon: ShoppingCart, href: "/cart" },
      { label: "Ventas", icon: Beef, href: "/sales" },
    ],
    second: [],
  },
  CHEFT: {
    first: [{ label: "Ventas", icon: Beef, href: "/sales" }],
    second: [],
  },
  VISITOR: {
    first: [{ label: "Dashboard", icon: BarChart3, href: "/dashboard" }],
    second: [],
  },
};
