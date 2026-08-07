import { Sale } from "../sale/sale";

export interface ShoppingCartProps {
    editSale?: Sale | null;
    open?: boolean;
    onClose?: () => void;
}