'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getTotalSalesByShift, getTopProducts, getTotalRevenue } from '@/services/salesService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const [salesByShift, setSalesByShift] = useState({ morning: 0, afternoon: 0, night: 0 });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const shiftData = getTotalSalesByShift();
        const products = getTopProducts();
        const revenue = getTotalRevenue();

        setSalesByShift(shiftData);
        setTopProducts(products);
        setTotalRevenue(revenue);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const chartData = [
    { name: 'Mañana', ventas: salesByShift.morning },
    { name: 'Tarde', ventas: salesByShift.afternoon },
    { name: 'Noche', ventas: salesByShift.night },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ingresos Totales</p>
              <h3 className="text-2xl font-bold mt-2">${totalRevenue.toLocaleString('es-CO')}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="text-primary" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Órdenes Procesadas</p>
              <h3 className="text-2xl font-bold mt-2">3</h3>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <ShoppingCart className="text-secondary" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ticket Promedio</p>
              <h3 className="text-2xl font-bold mt-2">${Math.round(totalRevenue / 3).toLocaleString('es-CO')}</h3>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <TrendingUp className="text-accent" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales by Shift */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ventas por Turno</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="ventas" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.quantity} unidades vendidas</p>
                </div>
                <p className="font-semibold">${product.revenue.toLocaleString('es-CO')}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
