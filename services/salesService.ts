import { storage } from "@/lib/storage";
import { CartItem, Product, Sale } from "@/types";

export interface SaleDetail extends Product {
  quantity: number;
}

// export interface Sale {
//   saleId: number;
//   // detail: SaleDetail[];
//   detail: CartItem[]; // Cambiado de 'items' a 'detail'
//   userId: number;
//   tenantId: number;
//   total: number;
//   payment_type: "cash" | "qr" | "mixed";
//   shift: string;
//   created_at: Date;
//   updated_at: Date;
//   state: boolean;
// }

// export interface Sale {
//   id_sale: string;
//   items: { productId: string; name: string; quantity: number; price: number }[];
//   total: number;
//   payment_type: 'cash' | 'qr' | 'mixed';
//   timestamp: string;
//   shift: string;
//   id_tenant: string;
//   created_at: string;
//   updated_at: string;
// }
const SALES_KEY = "sales";
const DEFAULT_TENANT_ID = 1;
const DEFAULT_USER_ID = 1;

// Función para generar ID numérico basado en la colección existente
function generateNumericId(collection: Sale[]): number {
  if (collection.length === 0 || collection === null) return 1;
  const maxId = Math.max(...collection.map((s) => s.saleId));
  return maxId + 1;
}

// Inicialización de datos con la nueva estructura
function initializeDefaults() {
  const existingSales = storage.getCollection<Sale>(SALES_KEY);
  if (existingSales.length === 0) {
    const defaultSales: Sale[] = [
      {
        saleId: 1,
        userId: DEFAULT_USER_ID,
        tenantId: DEFAULT_TENANT_ID,
        detail: [], // Aquí irían los objetos SaleDetail completos
        total: 60,
        paymentType: "cash",
        shift: "Mañana",
        state: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    storage.setCollection(SALES_KEY, defaultSales);
  }
}

if (typeof window !== "undefined") {
  initializeDefaults();
}

// Sale CRUD
export async function getSales(): Promise<Sale[]> {
  return storage.getCollection<Sale>(SALES_KEY);
}

export async function getSaleById(id: number): Promise<Sale | null> {
  // Cambiado a 'saleId' para coincidir con la interfaz
  return storage.getFromCollection<Sale>(SALES_KEY, id, "saleId");
}

export async function getSalesByShift(shift: string): Promise<Sale[]> {
  const sales = await getSales();
  return sales.filter((s) => s.shift === shift);
}

export async function createSale(
  sale: Omit<Sale, "saleId" | "created_at" | "updated_at">,
): Promise<Sale> {
  const currentSales = storage.getCollection<Sale>(SALES_KEY);
  const newSale: Sale = {
    ...sale,
    saleId: generateNumericId(currentSales),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  storage.addToCollection(SALES_KEY, newSale, "saleId");
  return newSale;
}

export async function deleteSale(id: number): Promise<boolean> {
  return storage.removeFromCollection(SALES_KEY, id, "saleId");
}

// Analytics Corregidos
export function getTotalSalesByShift(): Record<string, number> {
  const sales = storage.getCollection<Sale>(SALES_KEY);
  const shifts: Record<string, number> = {};

  sales.forEach((sale) => {
    if (!shifts[sale.shift]) {
      shifts[sale.shift] = 0;
    }
    shifts[sale.shift] += sale.total;
  });

  return shifts;
}

export function getTopProducts(limit: number = 5) {
  const sales = storage.getCollection<Sale>(SALES_KEY);
  const productMap = new Map<
    number,
    { name: string; quantity: number; revenue: number }
  >();

  sales.forEach((sale) => {
    // Cambiado de 'items' a 'detail'
    sale.detail?.forEach((item) => {
      if (productMap.has(item.productId)) {
        const existing = productMap.get(item.productId)!;
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        productMap.set(item.productId, {
          name: item.name,
          quantity: item.quantity,
          revenue: item.price * item.quantity,
        });
      }
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function getTotalRevenue(): number {
  const sales = storage.getCollection<Sale>(SALES_KEY);
  return sales.reduce((sum, sale) => sum + sale.total, 0);
}
