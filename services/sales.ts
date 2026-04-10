export interface Sale {
  id: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  paymentType: 'cash' | 'qr' | 'mixed';
  timestamp: Date;
  shift: 'morning' | 'afternoon' | 'night';
}

const mockSales: Sale[] = [
  {
    id: '1',
    items: [
      { productId: '1', name: 'Hamburguesa', quantity: 2, price: 25000 },
      { productId: '10', name: 'Coca-Cola', quantity: 2, price: 5000 },
    ],
    total: 60000,
    paymentType: 'cash',
    timestamp: new Date(Date.now() - 3600000 * 4),
    shift: 'morning',
  },
  {
    id: '2',
    items: [
      { productId: '4', name: 'Pollo Frito', quantity: 1, price: 22000 },
      { productId: '7', name: 'Papas Fritas', quantity: 1, price: 8000 },
    ],
    total: 30000,
    paymentType: 'qr',
    timestamp: new Date(Date.now() - 3600000 * 2),
    shift: 'afternoon',
  },
  {
    id: '3',
    items: [
      { productId: '2', name: 'Cheeseburger', quantity: 3, price: 28000 },
    ],
    total: 84000,
    paymentType: 'cash',
    timestamp: new Date(Date.now() - 3600000),
    shift: 'afternoon',
  },
];

export async function getSales(): Promise<Sale[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockSales;
}

export async function getSalesByShift(shift: 'morning' | 'afternoon' | 'night'): Promise<Sale[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockSales.filter(s => s.shift === shift);
}

export async function createSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newSale = { ...sale, id: Date.now().toString() };
  mockSales.push(newSale);
  return newSale;
}

export function getTotalSalesByShift(): Record<string, number> {
  const shifts = { morning: 0, afternoon: 0, night: 0 };
  mockSales.forEach(sale => {
    shifts[sale.shift] += sale.total;
  });
  return shifts;
}

export function getTopProducts(limit: number = 5) {
  const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();

  mockSales.forEach(sale => {
    sale.items.forEach(item => {
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
  return mockSales.reduce((sum, sale) => sum + sale.total, 0);
}
