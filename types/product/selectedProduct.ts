import { Product } from "./product";

export interface SelectedProduct extends Product {
  selected: boolean;
}