export interface Ingredient {
  id: number;
  ingredientCategoriesId: number;
  supplierId: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  unitType: string;
  currentStock: number;
  quantitypiecesOfChicken?: number;
  createdAt: string;
  updatedAt: string;
  state: boolean;
}