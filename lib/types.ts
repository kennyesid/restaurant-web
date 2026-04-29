// User Management
// export interface User {
//   id_user: string;
//   username: string;
//   password: string;
//   email: string;
//   full_name: string;
//   id_tenant: string;
//   id_role: string;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// }

// export interface Role {
//   id_role: string;
//   name: string;
//   description: string;
//   id_tenant: string;
// }

// export interface Permission {
//   id_permission: string;
//   name: string;
//   description: string;
// }

// export interface RolePermission {
//   id_role: string;
//   id_permission: string;
// }

// Product Management
// export interface Category {
//   categoryId: number;
//   name: string;
//   description: string;
//     created_at: string;
//   updated_at: string;
//   state: boolean;
// }

// export interface Product {
//   productId: number;
//   categoryId: number;
//   name: string;
//   description: string;
//   legend: string;
//   price: number;
//   isPromotion: boolean;
//   imageUrl: string; // base64 or image URL
//   isFeatured: boolean;
//   displayOrder: number;
//   // promotionId: int;
//   // id_ingredient_group: string;
//   // is_available: boolean;
//   // id_tenant: string;
//   created_at: string;
//   updated_at: string;
//   state: boolean;
// }

export interface Ingredient {
  id_ingredient: string;
  name: string;
  quantity: number;
  unit: string;
  supplier: string;
  cost: number;
  id_tenant: string;
  created_at: string;
  updated_at: string;
}

export interface IngredientGroup {
  id_ingredient_group: string;
  name: string;
  description: string;
  id_tenant: string;
}

export interface ProductIngredient {
  id_product: string;
  id_ingredient: string;
  quantity_required: number;
}

// Sales & Transactions
export interface Sale {
  id_sale: string;
  sale_date: string;
  id_shift: string;
  total_amount: number;
  payment_method: string;
  id_user: string;
  id_tenant: string;
}

export interface SaleDetail {
  id_sale_detail: string;
  id_sale: string;
  id_product: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Shift {
  id_shift: string;
  name: string;
  start_time: string;
  end_time: string;
  id_tenant: string;
}

export interface PaymentType {
  id_payment_type: string;
  name: string;
  description: string;
  id_tenant: string;
}

// Promotions
export interface Promotion {
  id_promotion: string;
  name: string;
  description: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  id_tenant: string;
  is_active: boolean;
}

export interface ProductPromotion {
  id_product: string;
  id_promotion: string;
}

// Period Management
export interface Period {
  id_period: string;
  name: string;
  start_date: string;
  end_date: string;
  id_tenant: string;
}

// Tenant
export interface Tenant {
  id_tenant: string;
  name: string;
  description: string;
  is_active: boolean;
}

// Cart Item (for POS)
// export interface CartItem {
//   productId: number;
//   quantity: number;
//   unit_price: number;
// }

// export interface CartItem {
//   productId: number;
//   name: string;      // Añadido
//   price: number;
//   categoryId: number; // Añadido
//   quantity: number;
// }
