export interface KitchenPreparationItem {
    id: number;
    saleId: number;
    orderNumber: number;
    userName: string;
    userCustomerName?: string;
    name: string;
    quantity: number;
    price: number;
    categoryId: number;
    productId: number;
    productFittings?: any[];
    productDetailProduct?: any[];
    reasonModification?: string | null;
    modifiedSubtotal?: number | null;
    imageUrl?: string;
    selected?: boolean;
    createdAt?: string;
    updatedAt?: string;
    state?: boolean;
}

export interface KitchenReasonGroup {
    reasonModification: string | null;
    items: KitchenPreparationItem[];
}

export interface KitchenPreparationGroup {
    orderTypeSend: string;
    orderTypeGlobal: string;
    reasons: KitchenReasonGroup[];
}