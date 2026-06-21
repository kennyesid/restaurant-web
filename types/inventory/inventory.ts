export interface Inventory {
  id: number;
  groupid: number | null;
  ingredientid: number;
  ingredientname: string;
  unitmeasurementid: number;
  unitmeasurementname: string;
  currentstock: number;
  cost: number;
  quantity: number;
  minstock: number | null;
  maxstock: number | null;
  lastpurchaseprice: number | null;
  updatedat: string;
  createdat: string;
  state: boolean;
}
