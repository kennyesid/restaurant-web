export interface Ingredient {
  id: number;
  ingredientCategoriesId: number;
  categoryName?: string;
  supplierId: number;
  groupId: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  unitType: string;
  currentStock: number;
  quantitypiecesOfChicken?: number;
  createdAt?: string;
  updatedAt?: string;
  state: boolean;
}