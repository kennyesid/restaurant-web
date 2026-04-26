// types/ProductIngredientDetail.ts

export interface ProductIngredientDetail {
    id: number;
    productId: number;
    name: string;
    description: string | null;
    createdAt: string | null;
    createdBy: string | null;
    state: boolean | null;
}

// // Para formularios (sin campos auto-generados)
// export interface ProductIngredientDetailFormData {
//     productId: number;
//     name: string;
//     description: string;
//     state: boolean;
// }

// // Para el estado inicial del formulario
// export const initialProductIngredientDetailForm: ProductIngredientDetailFormData = {
//     productId: 0,
//     name: '',
//     description: '',
//     state: true
// };