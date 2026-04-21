import { storage } from '@/lib/storage';

export interface Sale {
  id_sale: string;
  items: { id_product: string; name: string; quantity: number; price: number }[];
  total: number;
  payment_type: 'cash' | 'qr' | 'mixed';
  timestamp: string;
  shift: string;
  id_tenant: string;
  created_at: string;
  updated_at: string;
}

const SALES_KEY = 'sales';
const DEFAULT_TENANT_ID = 'tenant-1';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize default data
function initializeDefaults() {
  const existingSales = storage.getCollection<Sale>(SALES_KEY);
  if (existingSales.length === 0) {
    const defaultSales: Sale[] = [
      {
        id_sale: generateId(),
        items: [
          { id_product: 'prod-1', name: 'Hamburguesa', quantity: 2, price: 25000 },
          { id_product: 'prod-8', name: 'Coca-Cola', quantity: 2, price: 5000 },
        ],
        total: 60000,
        payment_type: 'cash',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        shift: 'Mañana',
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id_sale: generateId(),
        items: [
          { id_product: 'prod-4', name: 'Pollo Frito', quantity: 1, price: 22000 },
          { id_product: 'prod-6', name: 'Papas Fritas', quantity: 1, price: 8000 },
        ],
        total: 30000,
        payment_type: 'qr',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        shift: 'Tarde',
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id_sale: generateId(),
        items: [
          { id_product: 'prod-2', name: 'Cheeseburger', quantity: 3, price: 28000 },
        ],
        total: 84000,
        payment_type: 'cash',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        shift: 'Tarde',
        id_tenant: DEFAULT_TENANT_ID,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
    storage.setCollection(SALES_KEY, defaultSales);
  }
}

if (typeof window !== 'undefined') {
  initializeDefaults();
}

// Sale CRUD
export async function getSales(): Promise<Sale[]> {
  return storage.getCollection<Sale>(SALES_KEY);
}

export async function getSaleById(id: string): Promise<Sale | null> {
  return storage.getFromCollection<Sale>(SALES_KEY, id, 'id_sale');
}

export async function getSalesByShift(shift: string): Promise<Sale[]> {
  const sales = storage.getCollection<Sale>(SALES_KEY);
  return sales.filter(s => s.shift === shift);
}

export async function createSale(sale: Omit<Sale, 'id_sale' | 'created_at' | 'updated_at'>): Promise<Sale> {
  const newSale: Sale = {
    ...sale,
    id_sale: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  storage.addToCollection(SALES_KEY, newSale, 'id_sale');
  return newSale;
}

export async function deleteSale(id: string): Promise<boolean> {
  return storage.removeFromCollection(SALES_KEY, id, 'id_sale');
}

// Analytics
export function getTotalSalesByShift(): Record<string, number> {
  const sales = storage.getCollection<Sale>(SALES_KEY);
  const shifts: Record<string, number> = {};
  
  sales.forEach(sale => {
    if (!shifts[sale.shift]) {
      shifts[sale.shift] = 0;
    }
    shifts[sale.shift] += sale.total;
  });
  
  return shifts;
}

export function getTopProducts(limit: number = 5) {
  const sales = storage.getCollection<Sale>(SALES_KEY);
  const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();

  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (productMap.has(item.id_product)) {
        const existing = productMap.get(item.id_product)!;
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        productMap.set(item.id_product, {
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
