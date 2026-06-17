"use client";

// import { Button } from "@/components/ui/button";
// import { createIngredient } from "@/services/ingredientsService";

// export default function DashboardRecap() {
//   return (
//     <div className="container mx-auto p-4">
//       <h1>Dashboard</h1>
//     </div>
//   )
// }

// NO ELIMINAR LO DE ARRIVA

// "use client";

// import { useState, useEffect, useMemo, useCallback } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import {
//   DollarSign,
//   TrendingUp,
//   TrendingDown,
//   Calendar as CalendarIcon,
//   RefreshCw,
// } from "lucide-react";

// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Line,
// } from "recharts";

// import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";
// import { es } from "date-fns/locale";
// import { Sale, User, Product, Category } from "@/types";
// import { getSales } from "@/services/salesService";
// import { getUsers } from "@/services/usersService";
// import { getProducts } from "@/services/productsSservice";
// import { getCategories } from "@/services/categoriesService";

// interface DailyRevenue {
//   date: string;
//   revenue: number;
//   formattedDate: string;
// }

// interface PieData {
//   name: string;
//   value: number;
//   fill: string;
// }

// const COLORS = [
//   "#3b82f6",
//   "#10b981",
//   "#8b5cf6",
//   "#f59e0b",
//   "#ef4444",
//   "#06b6d4",
// ];

// export default function DashboardRecap() {
//   const [dateRange, setDateRange] = useState<{
//     from: Date;
//     to: Date;
//   }>({
//     from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primer día del mes actual
//     to: new Date(),
//   });

//   const [selectedDate, setSelectedDate] = useState<string>("");
//   const [selectedUserId, setSelectedUserId] = useState<string>("all");
//   const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

//   const [sales, setSales] = useState<Sale[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);

//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const loadAllData = useCallback(async () => {
//     setIsRefreshing(true);
//     try {
//       const [salesRes, usersRes, categoriesRes, productsRes] =
//         await Promise.all([
//           getSales(),
//           getUsers(),
//           getCategories(),
//           getProducts(),
//         ]);

//       console.log("salesRes", JSON.stringify(salesRes));

//       setSales(salesRes.contenido || []);
//       setUsers(usersRes || []);
//       setCategories(categoriesRes || []);
//       setProducts(productsRes || []);

//       if (salesRes.contenido && salesRes.contenido.length > 0) {
//         const latestSale = [...salesRes.contenido].sort(
//           (a, b) =>
//             new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
//         )[0];
//         setSelectedDate(format(new Date(latestSale.createdAt), "yyyy-MM-dd"));
//       }
//     } catch (error) {
//       console.error("Error cargando datos:", error);
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadAllData();
//   }, [loadAllData]);

//   const filteredSales = useMemo(() => {
//     return sales.filter((sale) => {
//       const saleDate = startOfDay(new Date(sale.createdAt));
//       const from = dateRange?.from ? startOfDay(dateRange.from) : null;
//       const to = dateRange?.to ? startOfDay(dateRange.to) : null;

//       const inDateRange =
//         (!from || saleDate >= from) && (!to || saleDate <= to);
//       const matchesUser =
//         selectedUserId === "all" || sale.userId?.toString() === selectedUserId;
//       const matchesCategory =
//         selectedCategoryId === "all" ||
//         sale.detail?.some((item) => {
//           const product = products.find((p) => p.id === item.productId);
//           return product?.categoryId.toString() === selectedCategoryId;
//         });

//       return inDateRange && matchesUser && matchesCategory;
//     });
//   }, [sales, dateRange, selectedUserId, selectedCategoryId, products]);

//   const dailyRevenueData: DailyRevenue[] = useMemo(() => {
//     const days = eachDayOfInterval({
//       start: dateRange.from,
//       end: dateRange.to,
//     });

//     return days.map((day) => {
//       const dayStr = format(day, "yyyy-MM-dd");
//       const daySales = filteredSales.filter(
//         (sale) => format(new Date(sale.createdAt), "yyyy-MM-dd") === dayStr,
//       );

//       const dailyRevenue = daySales.reduce((sum, sale) => {
//         if (selectedCategoryId === "all") {
//           return sum + (sale.total || 0);
//         }

//         const categoryRevenue = (sale.detail || []).reduce((subSum, item) => {
//           const product = products.find((p) => p.id === item.productId);

//           if (product && product.categoryId.toString() === selectedCategoryId) {
//             return subSum + (item.price * item.quantity);
//           }
//           return subSum;
//         }, 0);

//         return sum + categoryRevenue;
//       }, 0);

//       return {
//         date: dayStr,
//         revenue: dailyRevenue, // 💡 Ahora es un revenue real y filtrado
//         formattedDate: format(day, "dd MMM", { locale: es }),
//       };
//     });

//   }, [filteredSales, dateRange, products, selectedCategoryId]);

//   const pieData: PieData[] = useMemo(() => {
//     if (!selectedDate) return [];

//     const daySales = filteredSales.filter(
//       (sale) => format(new Date(sale.createdAt), "yyyy-MM-dd") === selectedDate,
//     );

//     // Cambiamos el mapa para acumular por el nombre del Producto o de la Categoría según el filtro
//     const itemMap = new Map<string, number>();

//     daySales.forEach((sale) => {
//       sale.detail?.forEach((item) => {
//         const product = products.find((p) => p.id === item.productId);

//         if (product) {
//           const category = categories.find((c) => c.id === product.categoryId);
//           const catIdStr = product.categoryId.toString();

//           // Si el filtro está en "all", agrupamos por Categoría.
//           // Si hay una categoría seleccionada, agrupamos SOLO los productos que pertenecen a ella.
//           if (selectedCategoryId === "all") {
//             const catName = category?.name || "Sin categoría";
//             itemMap.set(
//               catName,
//               (itemMap.get(catName) || 0) + item.price * item.quantity,
//             );
//           } else if (catIdStr === selectedCategoryId) {
//             // 💡 Aquí está la magia: si se filtró una categoría, mostramos el desglose por Producto
//             const productName = item.name || "Producto desconocido";
//             itemMap.set(
//               productName,
//               (itemMap.get(productName) || 0) + item.price * item.quantity,
//             );
//           }
//         }
//       });
//     });

//     return Array.from(itemMap.entries())
//       .map(([name, value], index) => ({
//         name,
//         value,
//         fill: COLORS[index % COLORS.length],
//       }))
//       .sort((a, b) => b.value - a.value);
//     // 💡 Agregamos selectedCategoryId a las dependencias
//   }, [filteredSales, selectedDate, products, categories, selectedCategoryId]);

//   // KPIs

//   // const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
//   const totalRevenue = useMemo(() => {
//     return dailyRevenueData.reduce((sum, day) => sum + day.revenue, 0);
//   }, [dailyRevenueData]);

//   const totalOrders = filteredSales.length;
//   const avgTicket =
//     totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

//   // Simulación de Costo y Profit (puedes mejorar después)
//   const totalCost = Math.round(totalRevenue * 0.65);
//   const totalProfit = totalRevenue - totalCost;
//   const profitMargin =
//     totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

//   const handleBarClick = (data: any) => {
//     alert("sadasd");
//     if (data && data.date) {
//       setSelectedDate(data.date);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-[70vh]">
//         Cargando dashboard...
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Header + Filtros */}
//       <div className="flex flex-col lg:flex-row justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold">Monthly Recap Report</h1>
//           <p className="text-muted-foreground">
//             {format(dateRange?.from || new Date(), "dd MMM yyyy", {
//               locale: es,
//             })}{" "}
//             -{" "}
//             {format(dateRange?.to || new Date(), "dd MMM yyyy", { locale: es })}
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-3">
//           <div className="flex flex-wrap gap-3">
//             {/* Fecha Inicio */}
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className="gap-2 min-w-[200px] justify-start text-left font-normal"
//                 >
//                   <CalendarIcon className="h-4 w-4" />
//                   Inicio:{" "}
//                   {format(dateRange.from!, "dd/MM/yyyy", { locale: es })}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0" align="start">
//                 <Calendar
//                   mode="single"
//                   selected={dateRange.from}
//                   onSelect={(date) =>
//                     setDateRange((prev) => ({ ...prev, from: date! }))
//                   }
//                   numberOfMonths={1}
//                   defaultMonth={dateRange.from}
//                   disabled={(date) => date > (dateRange.to || new Date())}
//                 />
//               </PopoverContent>
//             </Popover>

//             {/* Fecha Final */}
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className="gap-2 min-w-[200px] justify-start text-left font-normal"
//                 >
//                   <CalendarIcon className="h-4 w-4" />
//                   Fin: {format(dateRange.to!, "dd/MM/yyyy", { locale: es })}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0" align="start">
//                 <Calendar
//                   mode="single"
//                   selected={dateRange.to}
//                   onSelect={(date) =>
//                     setDateRange((prev) => ({ ...prev, to: date! }))
//                   }
//                   numberOfMonths={1}
//                   defaultMonth={dateRange.to}
//                   disabled={(date) =>
//                     date < (dateRange.from || subDays(new Date(), 30))
//                   }
//                 />
//               </PopoverContent>
//             </Popover>

//             {/* Selects existentes */}
//             <Select value={selectedUserId} onValueChange={setSelectedUserId}>
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Todos los usuarios" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">Todos los usuarios</SelectItem>
//                 {users.map((user) => (
//                   <SelectItem key={user.id} value={user.id.toString()}>
//                     {user.fullName}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Select
//               value={selectedCategoryId}
//               onValueChange={setSelectedCategoryId}
//             >
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Todas las categorías" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">Todas las categorías</SelectItem>
//                 {categories.map((cat, index) => (
//                   <SelectItem key={index} value={String(cat.id)}>
//                     {cat.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Button
//               onClick={loadAllData}
//               disabled={isRefreshing}
//               variant="outline"
//             >
//               <RefreshCw
//                 className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
//               />
//               Actualizar
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 xl:grid-cols-7 gap-6">
//         {/* Gráfico de Evolución (Área) */}
//         <Card className="xl:col-span-5 p-6">
//           <h3 className="text-xl font-semibold mb-6">Sales Evolution</h3>
//           <ResponsiveContainer width="100%" height={380}>
//             <AreaChart data={dailyRevenueData} onClick={handleBarClick}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//               <XAxis dataKey="formattedDate" stroke="#6b7280" fontSize={12} />
//               <YAxis
//                 stroke="#6b7280"
//                 fontSize={12}
//                 tickFormatter={(v) => `$${v.toLocaleString("es-CO")}`}
//               />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "#fff",
//                   border: "1px solid #e5e7eb",
//                   borderRadius: "8px",
//                 }}
//                 formatter={(value: number) => [
//                   `$${value.toLocaleString("es-CO")}`,
//                   "Revenue",
//                 ]}
//                 labelFormatter={(label) => `Fecha: ${label}`}
//               />
//               <Area
//                 type="natural"
//                 dataKey="revenue"
//                 stroke="#3b82f6"
//                 fill="#3b82f6"
//                 fillOpacity={0.25}
//                 strokeWidth={3}
//               />
//               <Line
//                 type="natural"
//                 dataKey="revenue"
//                 stroke="#1e40af"
//                 strokeWidth={2}
//                 dot={{ fill: "#1e40af", r: 4 }}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//           <p className="text-xs text-center text-muted-foreground mt-2">
//             Haz clic en un punto para ver el detalle del día
//           </p>
//         </Card>

//         {/* Pie Chart - Detalle por Día */}
//         <Card className="xl:col-span-2 p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-xl font-semibold">
//               {selectedDate
//                 ? `${selectedCategoryId === "all" ? "Detalle por Categorías" : "Top Productos"} - ${format(new Date(selectedDate), "dd MMM yyyy", { locale: es })}`
//                 : "Selecciona un día"}
//             </h3>
//             {/* <h3 className="text-xl font-semibold">
//               {selectedDate
//                 ? `Detalle ${format(new Date(selectedDate), "dd MMM yyyy", { locale: es })}`
//                 : "Selecciona un día"}
//             </h3> */}
//             {selectedDate && (
//               <Badge variant="secondary">
//                 {pieData
//                   .reduce((sum, item) => sum + item.value, 0)
//                   .toLocaleString("es-CO")}
//               </Badge>
//             )}
//           </div>

//           {pieData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={320}>
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={70}
//                   outerRadius={110}
//                   dataKey="value"
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.fill} />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   formatter={(value: number) => [
//                     `$${value.toLocaleString("es-CO")}`,
//                   ]}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : (
//             <div className="h-[320px] flex items-center justify-center text-muted-foreground">
//               No hay ventas para el día seleccionado
//             </div>
//           )}

//           {/* Leyenda */}
//           <div className="mt-6 space-y-2">
//             {pieData.map((item, index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between text-sm"
//               >
//                 <div className="flex items-center gap-2">
//                   <div
//                     className="w-3 h-3 rounded-full"
//                     style={{ backgroundColor: item.fill }}
//                   />
//                   <span>{item.name}</span>
//                 </div>
//                 <span className="font-medium">
//                   ${item.value.toLocaleString("es-CO")}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </Card>
//       </div>

//       {/* KPIs */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <KpiCard
//           title="TOTAL REVENUE"
//           value={`$${totalRevenue.toLocaleString("es-CO")}`}
//           change="+17%"
//           isPositive={true}
//           icon={<DollarSign className="h-8 w-8" />}
//         />
//         <KpiCard
//           title="TOTAL COST"
//           value={`$${totalCost.toLocaleString("es-CO")}`}
//           change="+10%"
//           isPositive={false}
//           icon={<TrendingDown className="h-8 w-8" />}
//         />
//         <KpiCard
//           title="TOTAL PROFIT"
//           value={`$${totalProfit.toLocaleString("es-CO")}`}
//           change={`+${profitMargin}%`}
//           isPositive={true}
//           icon={<TrendingUp className="h-8 w-8" />}
//         />
//       </div>
//     </div>
//   );
// }

// // Componente KPI reutilizable
// function KpiCard({
//   title,
//   value,
//   change,
//   isPositive,
//   icon,
// }: {
//   title: string;
//   value: string;
//   change: string;
//   isPositive: boolean;
//   icon: React.ReactNode;
// }) {
//   return (
//     <Card className="p-6">
//       <div className="flex justify-between">
//         <div>
//           <p className="text-sm text-muted-foreground uppercase tracking-widest">
//             {title}
//           </p>
//           <p className="text-3xl font-bold mt-3">{value}</p>
//         </div>
//         <div className="text-4xl opacity-80">{icon}</div>
//       </div>
//       <div
//         className={`flex items-center gap-1 mt-4 text-sm ${isPositive ? "text-emerald-600" : "text-red-600"}`}
//       >
//         {isPositive ? (
//           <TrendingUp className="h-4 w-4" />
//         ) : (
//           <TrendingDown className="h-4 w-4" />
//         )}
//         <span>{change}</span>
//         <span className="text-muted-foreground">desde el mes anterior</span>
//       </div>
//     </Card>
//   );
// }




import { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  RefreshCw,
} from "lucide-react";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Legend,
} from "recharts";

import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Sale, User, Product, Category } from "@/types";
import { getSales } from "@/services/salesService";
import { getUsers } from "@/services/usersService";
import { getProducts } from "@/services/productsSservice";
import { getCategories } from "@/services/categoriesService";
import PageHeader from "@/components/page/header/PageHeader";

// ========== Tipos ==========
interface DailyRevenue {
  date: string;
  revenue: number;
  formattedDate: string;
}

interface PieData {
  name: string;
  value: number;
  fill: string;
}

// Colores para las categorías (amplía según necesites)
const CATEGORY_COLORS = [
  "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#a855f7", "#22c55e"
];

const PIE_COLORS = [
  "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"
];

// ========== Función segura para fechas ==========
const safeFormat = (date: Date | undefined, fmt: string, options?: any) => {
  if (!date || isNaN(date.getTime())) return "Fecha inválida";
  return format(date, fmt, options);
};

// ========== Componente principal ==========
export default function DashboardRecap() {
  // Estados
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const RANGOS_HORARIOS = [
    { label: "Mañana (6-12)", min: 6, max: 12 },
    { label: "Tarde (12-18)", min: 12, max: 18 },
    { label: "Noche (18-23)", min: 18, max: 23 },
  ];

  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [salesRes, usersRes, categoriesRes, productsRes] =
        await Promise.all([
          getSales(),
          getUsers(),
          getCategories(),
          getProducts(),
        ]);

      setSales(salesRes.contenido || []);
      setUsers(usersRes || []);
      setCategories(categoriesRes || []);
      setProducts(productsRes || []);

      if (salesRes.contenido && salesRes.contenido.length > 0) {
        const latestSale = [...salesRes.contenido].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];
        setSelectedDate(format(new Date(latestSale.createdAt), "yyyy-MM-dd"));
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Ventas filtradas
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = startOfDay(new Date(sale.createdAt));
      const from = dateRange?.from && !isNaN(dateRange.from.getTime()) ? startOfDay(dateRange.from) : null;
      const to = dateRange?.to && !isNaN(dateRange.to.getTime()) ? startOfDay(dateRange.to) : null;

      const inDateRange =
        (!from || saleDate >= from) && (!to || saleDate <= to);
      const matchesUser =
        selectedUserId === "all" || sale.userId?.toString() === selectedUserId;
      const matchesCategory =
        selectedCategoryId === "all" ||
        sale.detail?.some((item) => {
          const product = products.find((p) => p.id === item.productId);
          return product?.categoryId.toString() === selectedCategoryId;
        });

      return inDateRange && matchesUser && matchesCategory;
    });
  }, [sales, dateRange, selectedUserId, selectedCategoryId, products]);

  // 1. Datos diarios (evolución)
  const dailyRevenueData: DailyRevenue[] = useMemo(() => {
    if (!dateRange.from || !dateRange.to || isNaN(dateRange.from.getTime()) || isNaN(dateRange.to.getTime())) {
      return [];
    }
    const days = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    });

    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const daySales = filteredSales.filter(
        (sale) => format(new Date(sale.createdAt), "yyyy-MM-dd") === dayStr,
      );

      const dailyRevenue = daySales.reduce((sum, sale) => {
        if (selectedCategoryId === "all") {
          return sum + (sale.total || 0);
        }
        const categoryRevenue = (sale.detail || []).reduce((subSum, item) => {
          const product = products.find((p) => p.id === item.productId);
          if (product && product.categoryId.toString() === selectedCategoryId) {
            return subSum + item.price * item.quantity;
          }
          return subSum;
        }, 0);
        return sum + categoryRevenue;
      }, 0);

      return {
        date: dayStr,
        revenue: dailyRevenue,
        formattedDate: format(day, "dd MMM", { locale: es }),
      };
    });
  }, [filteredSales, dateRange, products, selectedCategoryId]);

  // En la sección de hourlyStackedData, reemplaza con esto:

  const hourlyStackedData = useMemo(() => {
    const HORA_INICIO = 8;
    const HORA_FIN = 23;

    // Inicializar mapa para cada hora del rango
    const hourMap = new Map<number, Map<string, number>>();
    for (let hour = HORA_INICIO; hour <= HORA_FIN; hour++) {
      hourMap.set(hour, new Map());
    }

    // Acumular ventas por hora y categoría
    filteredSales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      if (isNaN(saleDate.getTime())) return;
      const hour = saleDate.getHours();
      if (hour < HORA_INICIO || hour > HORA_FIN) return;

      sale.detail?.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return;
        const category = categories.find((c) => c.id === product.categoryId);
        const categoryName = category?.name || "Sin categoría";
        const itemRevenue = item.price * item.quantity;

        const catMap = hourMap.get(hour)!;
        catMap.set(categoryName, (catMap.get(categoryName) || 0) + itemRevenue);
      });
    });

    // Convertir a array en orden ascendente (8:00 a 23:00)
    const result: any[] = [];
    for (let hour = HORA_INICIO; hour <= HORA_FIN; hour++) {
      const catMap = hourMap.get(hour)!;
      const dataPoint: any = {
        hour,
        formattedHour: `${hour.toString().padStart(2, "0")}:00`,
      };
      // Añadir cada categoría con su valor (0 si no tiene)
      for (const cat of categories) {
        const catName = cat.name;
        dataPoint[catName] = catMap.get(catName) || 0;
      }
      result.push(dataPoint);
    }
    return result;
  }, [filteredSales, products, categories]);

  // 2. Datos apilados por hora y categoría (GRÁFICO PRINCIPAL)
  // const hourlyStackedData = useMemo(() => {
  //   // Inicializar estructura: para cada hora (0-23), un objeto con totales por categoría
  //   const hourMap = new Map<number, Map<string, number>>();
  //   for (let i = 0; i < 24; i++) {
  //     hourMap.set(i, new Map());
  //   }

  //   filteredSales.forEach((sale) => {
  //     const saleDate = new Date(sale.createdAt);
  //     if (isNaN(saleDate.getTime())) return;
  //     const hour = saleDate.getHours();

  //     sale.detail?.forEach((item) => {
  //       const product = products.find((p) => p.id === item.productId);
  //       if (!product) return;
  //       const category = categories.find((c) => c.id === product.categoryId);
  //       const categoryName = category?.name || "Sin categoría";
  //       const itemRevenue = item.price * item.quantity;

  //       const catMap = hourMap.get(hour)!;
  //       catMap.set(categoryName, (catMap.get(categoryName) || 0) + itemRevenue);
  //     });
  //   });

  //   // Transformar a array de objetos para Recharts
  //   const result: any[] = [];
  //   for (let hour = 0; hour < 24; hour++) {
  //     const catMap = hourMap.get(hour)!;
  //     const dataPoint: any = {
  //       hour,
  //       formattedHour: `${hour.toString().padStart(2, "0")}:00`,
  //     };
  //     for (const [catName, revenue] of catMap.entries()) {
  //       dataPoint[catName] = revenue;
  //     }
  //     result.push(dataPoint);
  //   }
  //   return result;
  // }, [filteredSales, products, categories]);

  // 3. Datos para PieChart (día seleccionado)
  const pieData: PieData[] = useMemo(() => {
    if (!selectedDate) return [];

    const daySales = filteredSales.filter(
      (sale) => format(new Date(sale.createdAt), "yyyy-MM-dd") === selectedDate,
    );

    const itemMap = new Map<string, number>();

    daySales.forEach((sale) => {
      sale.detail?.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          const category = categories.find((c) => c.id === product.categoryId);
          const catIdStr = product.categoryId.toString();

          if (selectedCategoryId === "all") {
            const catName = category?.name || "Sin categoría";
            itemMap.set(
              catName,
              (itemMap.get(catName) || 0) + item.price * item.quantity,
            );
          } else if (catIdStr === selectedCategoryId) {
            const productName = item.name || "Producto desconocido";
            itemMap.set(
              productName,
              (itemMap.get(productName) || 0) + item.price * item.quantity,
            );
          }
        }
      });
    });

    return Array.from(itemMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        fill: PIE_COLORS[index % PIE_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSales, selectedDate, products, categories, selectedCategoryId]);

  // KPIs
  const totalRevenue = useMemo(() => {
    return dailyRevenueData.reduce((sum, day) => sum + day.revenue, 0);
  }, [dailyRevenueData]);

  const totalOrders = filteredSales.length;
  const totalCost = Math.round(totalRevenue * 0.65);
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  const handleBarClick = (data: any) => {
    if (data && data.date) {
      setSelectedDate(data.date);
    }
  };

  const handleFromSelect = (date: Date | undefined) => {
    if (date) setDateRange((prev) => ({ ...prev, from: date }));
  };

  const handleToSelect = (date: Date | undefined) => {
    if (date) setDateRange((prev) => ({ ...prev, to: date }));
  };

  const categoryTotalData = useMemo(() => {
    const totals = new Map<string, number>();

    filteredSales.forEach((sale) => {
      sale.detail?.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return;
        const category = categories.find((c) => c.id === product.categoryId);
        const categoryName = category?.name || "Sin categoría";
        const itemRevenue = item.price * item.quantity;
        totals.set(categoryName, (totals.get(categoryName) || 0) + itemRevenue);
      });
    });

    return Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSales, products, categories]);



  const stackedCategoryData = useMemo(() => {
    // Inicializar mapa: categoría -> { mañana, tarde, noche }
    const catMap = new Map<string, { morning: number; afternoon: number; night: number }>();

    // Inicializar para todas las categorías
    categories.forEach(cat => {
      catMap.set(cat.name, { morning: 0, afternoon: 0, night: 0 });
    });

    // Procesar ventas filtradas
    filteredSales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      if (isNaN(saleDate.getTime())) return;
      const hour = saleDate.getHours();

      sale.detail?.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return;
        const category = categories.find((c) => c.id === product.categoryId);
        if (!category) return;
        const catName = category.name;
        const itemRevenue = item.price * item.quantity;

        const data = catMap.get(catName)!;
        // Asignar al rango correspondiente
        if (hour >= 6 && hour < 12) data.morning += itemRevenue;
        else if (hour >= 12 && hour < 18) data.afternoon += itemRevenue;
        else if (hour >= 18 && hour < 23) data.night += itemRevenue;
        // Si la hora está fuera de los rangos (ej. 0-5), ignorar o asignar a otro
      });
    });

    // Convertir a array para Recharts
    return Array.from(catMap.entries()).map(([category, values]) => ({
      category,
      morning: values.morning,
      afternoon: values.afternoon,
      night: values.night,
    }));
  }, [filteredSales, products, categories]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-200 border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-t-blue-300 border-r-transparent border-b-blue-100 border-l-transparent animate-spin animation-delay-150"></div>
        </div>
        <p className="text-muted-foreground animate-pulse">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:pt-0">
      {/* Header y filtros */}
      <div className="flex flex-row lg:flex-col gap-4">

        <PageHeader
          title="REPORTE"
          subtitle="Gestion de Reporte"
          action={
            <Button onClick={loadAllData} disabled={isRefreshing} variant="outline" className="shadow-sm hover:shadow-md">
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          }
        />

        {/* <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Monthly Recap Report
          </h1>
          <p className="text-muted-foreground">
            {safeFormat(dateRange?.from, "dd MMM yyyy", { locale: es })} -{" "}
            {safeFormat(dateRange?.to, "dd MMM yyyy", { locale: es })}
          </p>
        </div> */}

        <div className="flex flex-wrap gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[200px] justify-start text-left font-normal shadow-sm hover:shadow-md">
                <CalendarIcon className="h-4 w-4" />
                Inicio: {safeFormat(dateRange.from, "dd/MM/yyyy", { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateRange.from} onSelect={handleFromSelect} numberOfMonths={1} defaultMonth={dateRange.from} disabled={(date) => date > (dateRange.to || new Date())} />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[200px] justify-start text-left font-normal shadow-sm hover:shadow-md">
                <CalendarIcon className="h-4 w-4" />
                Fin: {safeFormat(dateRange.to, "dd/MM/yyyy", { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateRange.to} onSelect={handleToSelect} numberOfMonths={1} defaultMonth={dateRange.to} disabled={(date) => date < (dateRange.from || subDays(new Date(), 30))} />
            </PopoverContent>
          </Popover>

          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-[180px] shadow-sm hover:shadow-md">
              <SelectValue placeholder="Todos los usuarios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los usuarios</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>{user.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger className="w-[180px] shadow-sm hover:shadow-md">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* PRIMERA FILA: Área (evolución diaria) + Barras horizontales apiladas (ingresos por hora y categoría) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Área - Evolución diaria */}
        <Card className="p-6 shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            Evolución de Ingresos (Diario)
          </h3>
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={dailyRevenueData} onClick={handleBarClick}>
              <defs>
                <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="formattedDate" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v.toLocaleString("es-CO")}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                formatter={(value: number) => [`$${value.toLocaleString("es-CO")}`, "Ingresos"]}
                labelFormatter={(label) => `📅 ${label}`}
              />
              <Area type="natural" dataKey="revenue" stroke="#3b82f6" fill="url(#dailyGradient)" strokeWidth={3} activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
              <Line type="natural" dataKey="revenue" stroke="#1e40af" strokeWidth={2} dot={{ fill: "#1e40af", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-muted-foreground mt-2">💡 Haz clic en un punto para ver el detalle del día</p>
        </Card>

        {/* Gráfico 2: Barras horizontales apiladas - Ingresos por hora, desglosados por categoría */}
        <Card className="p-6 shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
            Ventas por Categoría y Rango Horario
          </h3>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={stackedCategoryData}
              layout="horizontal" // Valor por defecto, barras verticales
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="category"
                stroke="#64748b"
                fontSize={12}
                // tick={{ angle: -45, textAnchor: 'end' }}
                height={80}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(v) => `$${v.toLocaleString("es-CO")}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                formatter={(value: number, name: string) => [`$${value.toLocaleString("es-CO")}`, name]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="morning" stackId="a" fill="#3b82f6" name="Mañana (6-12)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="afternoon" stackId="a" fill="#10b981" name="Tarde (12-18)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="night" stackId="a" fill="#8b5cf6" name="Noche (18-23)" radius={[0, 0, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-muted-foreground mt-2">
            📊 Cada barra vertical representa una categoría. Los colores muestran el aporte por rango horario.
          </p>
        </Card>
      </div>

      {/* SEGUNDA FILA: PieChart del día seleccionado */}
      <div className="flex justify-center">
        <Card className="w-full max-w-3xl p-6 shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              {selectedDate
                ? `${selectedCategoryId === "all" ? "Detalle por Categorías" : "Top Productos"} - ${format(new Date(selectedDate), "dd MMM yyyy", { locale: es })}`
                : "Selecciona un día en el gráfico de evolución"}
            </h3>
            {selectedDate && (
              <Badge variant="secondary" className="text-sm font-mono">
                ${pieData.reduce((sum, item) => sum + item.value, 0).toLocaleString("es-CO")}
              </Badge>
            )}
          </div>

          {pieData.length > 0 ? (
            <div className="relative">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <defs>
                    {pieData.map((_, idx) => (
                      <filter key={`shadow-${idx}`} id={`pie-shadow-${idx}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={PIE_COLORS[idx % PIE_COLORS.length]} floodOpacity="0.4" />
                      </filter>
                    ))}
                  </defs>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} filter={`url(#pie-shadow-${idx})`} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString("es-CO")}`, ""]} contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-muted-foreground">No hay ventas para el día seleccionado</div>
          )}

          <div className="mt-6 space-y-2 max-h-[180px] overflow-y-auto pr-2">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm p-1 rounded-md hover:bg-slate-50 transition-colors cursor-default">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="truncate max-w-[200px]">{item.name}</span>
                </div>
                <span className="font-medium">${item.value.toLocaleString("es-CO")}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="INGRESOS TOTALES" value={`$${totalRevenue.toLocaleString("es-CO")}`} change="+17%" isPositive={true} icon={<DollarSign className="h-8 w-8" />} />
        <KpiCard title="COSTO TOTAL" value={`$${totalCost.toLocaleString("es-CO")}`} change="+10%" isPositive={false} icon={<TrendingDown className="h-8 w-8" />} />
        <KpiCard title="GANANCIA NETA" value={`$${totalProfit.toLocaleString("es-CO")}`} change={`+${profitMargin}%`} isPositive={true} icon={<TrendingUp className="h-8 w-8" />} />
      </div>
    </div>
  );
}

// Componente KPI
function KpiCard({ title, value, change, isPositive, icon }: { title: string; value: string; change: string; isPositive: boolean; icon: React.ReactNode }) {
  return (
    <Card className="group p-6 shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50 pointer-events-none"></div>
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
      <div className="relative z-10 flex justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{title}</p>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{value}</p>
        </div>
        <div className="text-4xl opacity-80 p-2 rounded-full bg-slate-100/80 group-hover:bg-slate-200/80 transition-colors">{icon}</div>
      </div>
      <div className="relative z-10 flex items-center gap-1 mt-4 text-sm">
        {isPositive ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
        <span className={isPositive ? "text-emerald-600" : "text-red-600"}>{change}</span>
        <span className="text-muted-foreground">desde el mes anterior</span>
      </div>
    </Card>
  );
}





// import { useState, useEffect, useMemo, useCallback } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import {
//   DollarSign,
//   TrendingUp,
//   TrendingDown,
//   Calendar as CalendarIcon,
//   RefreshCw,
// } from "lucide-react";

// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Line,
// } from "recharts";

// import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";
// import { es } from "date-fns/locale";
// import { Sale, User, Product, Category } from "@/types";
// import { getSales } from "@/services/salesService";
// import { getUsers } from "@/services/usersService";
// import { getProducts } from "@/services/productsSservice";
// import { getCategories } from "@/services/categoriesService";

// interface DailyRevenue {
//   date: string;
//   revenue: number;
//   formattedDate: string;
// }

// interface PieData {
//   name: string;
//   value: number;
//   fill: string;
// }

// const COLORS = [
//   "#3b82f6",
//   "#10b981",
//   "#8b5cf6",
//   "#f59e0b",
//   "#ef4444",
//   "#06b6d4",
// ];

// export default function DashboardRecap() {
//   const [dateRange, setDateRange] = useState<{
//     from: Date;
//     to: Date;
//   }>({
//     from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//     to: new Date(),
//   });

//   const [selectedDate, setSelectedDate] = useState<string>("");
//   const [selectedUserId, setSelectedUserId] = useState<string>("all");
//   const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

//   const [sales, setSales] = useState<Sale[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);

//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const loadAllData = useCallback(async () => {
//     setIsRefreshing(true);
//     try {
//       const [salesRes, usersRes, categoriesRes, productsRes] =
//         await Promise.all([
//           getSales(),
//           getUsers(),
//           getCategories(),
//           getProducts(),
//         ]);

//       console.log("salesRes", JSON.stringify(salesRes));

//       setSales(salesRes.contenido || []);
//       setUsers(usersRes || []);
//       setCategories(categoriesRes || []);
//       setProducts(productsRes || []);

//       if (salesRes.contenido && salesRes.contenido.length > 0) {
//         const latestSale = [...salesRes.contenido].sort(
//           (a, b) =>
//             new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
//         )[0];
//         setSelectedDate(format(new Date(latestSale.createdAt), "yyyy-MM-dd"));
//       }
//     } catch (error) {
//       console.error("Error cargando datos:", error);
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadAllData();
//   }, [loadAllData]);

//   const filteredSales = useMemo(() => {
//     return sales.filter((sale) => {
//       const saleDate = startOfDay(new Date(sale.createdAt));
//       const from = dateRange?.from ? startOfDay(dateRange.from) : null;
//       const to = dateRange?.to ? startOfDay(dateRange.to) : null;

//       const inDateRange =
//         (!from || saleDate >= from) && (!to || saleDate <= to);
//       const matchesUser =
//         selectedUserId === "all" || sale.userId?.toString() === selectedUserId;
//       const matchesCategory =
//         selectedCategoryId === "all" ||
//         sale.detail?.some((item) => {
//           const product = products.find((p) => p.id === item.productId);
//           return product?.categoryId.toString() === selectedCategoryId;
//         });

//       return inDateRange && matchesUser && matchesCategory;
//     });
//   }, [sales, dateRange, selectedUserId, selectedCategoryId, products]);

//   const dailyRevenueData: DailyRevenue[] = useMemo(() => {
//     const days = eachDayOfInterval({
//       start: dateRange.from,
//       end: dateRange.to,
//     });

//     return days.map((day) => {
//       const dayStr = format(day, "yyyy-MM-dd");
//       const daySales = filteredSales.filter(
//         (sale) => format(new Date(sale.createdAt), "yyyy-MM-dd") === dayStr,
//       );

//       const dailyRevenue = daySales.reduce((sum, sale) => {
//         if (selectedCategoryId === "all") {
//           return sum + (sale.total || 0);
//         }

//         const categoryRevenue = (sale.detail || []).reduce((subSum, item) => {
//           const product = products.find((p) => p.id === item.productId);

//           if (product && product.categoryId.toString() === selectedCategoryId) {
//             return subSum + item.price * item.quantity;
//           }
//           return subSum;
//         }, 0);

//         return sum + categoryRevenue;
//       }, 0);

//       return {
//         date: dayStr,
//         revenue: dailyRevenue,
//         formattedDate: format(day, "dd MMM", { locale: es }),
//       };
//     });
//   }, [filteredSales, dateRange, products, selectedCategoryId]);

//   const pieData: PieData[] = useMemo(() => {
//     if (!selectedDate) return [];

//     const daySales = filteredSales.filter(
//       (sale) => format(new Date(sale.createdAt), "yyyy-MM-dd") === selectedDate,
//     );

//     const itemMap = new Map<string, number>();

//     daySales.forEach((sale) => {
//       sale.detail?.forEach((item) => {
//         const product = products.find((p) => p.id === item.productId);

//         if (product) {
//           const category = categories.find((c) => c.id === product.categoryId);
//           const catIdStr = product.categoryId.toString();

//           if (selectedCategoryId === "all") {
//             const catName = category?.name || "Sin categoría";
//             itemMap.set(
//               catName,
//               (itemMap.get(catName) || 0) + item.price * item.quantity,
//             );
//           } else if (catIdStr === selectedCategoryId) {
//             const productName = item.name || "Producto desconocido";
//             itemMap.set(
//               productName,
//               (itemMap.get(productName) || 0) + item.price * item.quantity,
//             );
//           }
//         }
//       });
//     });

//     return Array.from(itemMap.entries())
//       .map(([name, value], index) => ({
//         name,
//         value,
//         fill: COLORS[index % COLORS.length],
//       }))
//       .sort((a, b) => b.value - a.value);
//   }, [filteredSales, selectedDate, products, categories, selectedCategoryId]);

//   const totalRevenue = useMemo(() => {
//     return dailyRevenueData.reduce((sum, day) => sum + day.revenue, 0);
//   }, [dailyRevenueData]);

//   const totalOrders = filteredSales.length;
//   const avgTicket =
//     totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

//   const totalCost = Math.round(totalRevenue * 0.65);
//   const totalProfit = totalRevenue - totalCost;
//   const profitMargin =
//     totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

//   const handleBarClick = (data: any) => {
//     if (data && data.date) {
//       setSelectedDate(data.date);
//     }
//   };

//   if (isLoading) {
//     return (
//       // MEJORA: Spinner más elegante y centrado con animación
//       <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4">
//         <div className="relative w-16 h-16">
//           <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-200 border-l-transparent animate-spin"></div>
//           <div className="absolute inset-2 rounded-full border-4 border-t-blue-300 border-r-transparent border-b-blue-100 border-l-transparent animate-spin animation-delay-150"></div>
//         </div>
//         <p className="text-muted-foreground animate-pulse">Cargando datos...</p>
//       </div>
//     );
//   }

//   return (
//     // MEJORA: Fondo degradado suave
//     <div className="space-y-8 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen">
//       {/* Header + Filtros */}
//       <div className="flex flex-col lg:flex-row justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
//             Monthly Recap Report
//           </h1>
//           <p className="text-muted-foreground">
//             {format(dateRange?.from || new Date(), "dd MMM yyyy", {
//               locale: es,
//             })}{" "}
//             -{" "}
//             {format(dateRange?.to || new Date(), "dd MMM yyyy", { locale: es })}
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-3">
//           {/* MEJORA: Estilos en botones y popovers con sombras suaves */}
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button
//                 variant="outline"
//                 className="gap-2 min-w-[200px] justify-start text-left font-normal shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <CalendarIcon className="h-4 w-4" />
//                 Inicio:{" "}
//                 {format(dateRange.from!, "dd/MM/yyyy", { locale: es })}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" align="start">
//               <Calendar
//                 mode="single"
//                 selected={dateRange.from}
//                 onSelect={(date) =>
//                   setDateRange((prev) => ({ ...prev, from: date! }))
//                 }
//                 numberOfMonths={1}
//                 defaultMonth={dateRange.from}
//                 disabled={(date) => date > (dateRange.to || new Date())}
//               />
//             </PopoverContent>
//           </Popover>

//           <Popover>
//             <PopoverTrigger asChild>
//               <Button
//                 variant="outline"
//                 className="gap-2 min-w-[200px] justify-start text-left font-normal shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <CalendarIcon className="h-4 w-4" />
//                 Fin: {format(dateRange.to!, "dd/MM/yyyy", { locale: es })}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" align="start">
//               <Calendar
//                 mode="single"
//                 selected={dateRange.to}
//                 onSelect={(date) =>
//                   setDateRange((prev) => ({ ...prev, to: date! }))
//                 }
//                 numberOfMonths={1}
//                 defaultMonth={dateRange.to}
//                 disabled={(date) =>
//                   date < (dateRange.from || subDays(new Date(), 30))
//                 }
//               />
//             </PopoverContent>
//           </Popover>

//           <Select value={selectedUserId} onValueChange={setSelectedUserId}>
//             <SelectTrigger className="w-[180px] shadow-sm hover:shadow-md transition-shadow">
//               <SelectValue placeholder="Todos los usuarios" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">Todos los usuarios</SelectItem>
//               {users.map((user) => (
//                 <SelectItem key={user.id} value={user.id.toString()}>
//                   {user.fullName}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select
//             value={selectedCategoryId}
//             onValueChange={setSelectedCategoryId}
//           >
//             <SelectTrigger className="w-[180px] shadow-sm hover:shadow-md transition-shadow">
//               <SelectValue placeholder="Todas las categorías" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">Todas las categorías</SelectItem>
//               {categories.map((cat, index) => (
//                 <SelectItem key={index} value={String(cat.id)}>
//                   {cat.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Button
//             onClick={loadAllData}
//             disabled={isRefreshing}
//             variant="outline"
//             className="shadow-sm hover:shadow-md transition-shadow"
//           >
//             <RefreshCw
//               className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
//             />
//             Actualizar
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 xl:grid-cols-7 gap-6">
//         {/* Gráfico de Evolución (Área) */}
//         <Card className="xl:col-span-5 p-6 shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
//           <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
//             <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
//             Sales Evolution
//           </h3>
//           <ResponsiveContainer width="100%" height={380}>
//             <AreaChart data={dailyRevenueData} onClick={handleBarClick}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//               <XAxis dataKey="formattedDate" stroke="#64748b" fontSize={12} />
//               <YAxis
//                 stroke="#64748b"
//                 fontSize={12}
//                 tickFormatter={(v) => `$${v.toLocaleString("es-CO")}`}
//               />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "#fff",
//                   border: "none",
//                   borderRadius: "12px",
//                   boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
//                   padding: "10px 14px",
//                 }}
//                 formatter={(value: number) => [
//                   `$${value.toLocaleString("es-CO")}`,
//                   "Revenue",
//                 ]}
//                 labelFormatter={(label) => `📅 ${label}`}
//               />
//               {/* MEJORA: Sombra debajo del área usando un filtro */}
//               <defs>
//                 <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
//                   <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#3b82f6" floodOpacity="0.3" />
//                 </filter>
//               </defs>
//               <Area
//                 type="natural"
//                 dataKey="revenue"
//                 stroke="#3b82f6"
//                 fill="#3b82f6"
//                 fillOpacity={0.2}
//                 strokeWidth={3}
//                 filter="url(#shadow)"
//               />
//               <Line
//                 type="natural"
//                 dataKey="revenue"
//                 stroke="#1e40af"
//                 strokeWidth={2}
//                 dot={{ fill: "#1e40af", r: 4, strokeWidth: 0 }}
//                 activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//           <p className="text-xs text-center text-muted-foreground mt-2">
//             💡 Haz clic en un punto para ver el detalle del día
//           </p>
//         </Card>

//         {/* Pie Chart - Detalle por Día */}
//         <Card className="xl:col-span-2 p-6 shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl flex flex-col">
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-xl font-semibold flex items-center gap-2">
//               <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
//               {selectedDate
//                 ? `${selectedCategoryId === "all" ? "Por Categorías" : "Top Productos"}`
//                 : "Selecciona un día"}
//             </h3>
//             {selectedDate && (
//               <Badge variant="secondary" className="text-sm font-mono">
//                 ${pieData.reduce((sum, item) => sum + item.value, 0).toLocaleString("es-CO")}
//               </Badge>
//             )}
//           </div>

//           {pieData.length > 0 ? (
//             <div className="relative">
//               {/* MEJORA: Sombra en el gráfico circular */}
//               <ResponsiveContainer width="100%" height={320}>
//                 <PieChart>
//                   <defs>
//                     {pieData.map((entry, index) => (
//                       <filter key={`shadow-${index}`} id={`drop-shadow-${index}`} x="-20%" y="-20%" width="140%" height="140%">
//                         <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={entry.fill} floodOpacity="0.5" />
//                       </filter>
//                     ))}
//                   </defs>
//                   <Pie
//                     data={pieData}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={70}
//                     outerRadius={110}
//                     dataKey="value"
//                     paddingAngle={2}
//                   >
//                     {pieData.map((entry, index) => (
//                       <Cell
//                         key={`cell-${index}`}
//                         fill={entry.fill}
//                         filter={`url(#drop-shadow-${index})`}
//                         stroke="#fff"
//                         strokeWidth={2}
//                       />
//                     ))}
//                   </Pie>
//                   <Tooltip
//                     formatter={(value: number) => [
//                       `$${value.toLocaleString("es-CO")}`,
//                     ]}
//                     contentStyle={{
//                       backgroundColor: "#fff",
//                       borderRadius: "12px",
//                       border: "none",
//                       boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
//                     }}
//                   />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <div className="h-[320px] flex items-center justify-center text-muted-foreground">
//               No hay ventas para el día seleccionado
//             </div>
//           )}

//           {/* Leyenda con hover mejorado */}
//           <div className="mt-6 space-y-2 max-h-[180px] overflow-y-auto pr-2">
//             {pieData.map((item, index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between text-sm p-1 rounded-md hover:bg-slate-50 transition-colors cursor-default"
//               >
//                 <div className="flex items-center gap-2">
//                   <div
//                     className="w-3 h-3 rounded-full transition-transform group-hover:scale-110"
//                     style={{ backgroundColor: item.fill }}
//                   />
//                   <span className="truncate max-w-[120px]">{item.name}</span>
//                 </div>
//                 <span className="font-medium">
//                   ${item.value.toLocaleString("es-CO")}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </Card>
//       </div>

//       {/* KPIs con diseño mejorado */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <KpiCard
//           title="TOTAL REVENUE"
//           value={`$${totalRevenue.toLocaleString("es-CO")}`}
//           change="+17%"
//           isPositive={true}
//           icon={<DollarSign className="h-8 w-8" />}
//         />
//         <KpiCard
//           title="TOTAL COST"
//           value={`$${totalCost.toLocaleString("es-CO")}`}
//           change="+10%"
//           isPositive={false}
//           icon={<TrendingDown className="h-8 w-8" />}
//         />
//         <KpiCard
//           title="TOTAL PROFIT"
//           value={`$${totalProfit.toLocaleString("es-CO")}`}
//           change={`+${profitMargin}%`}
//           isPositive={true}
//           icon={<TrendingUp className="h-8 w-8" />}
//         />
//       </div>
//     </div>
//   );
// }

// // MEJORA: Componente KPI con diseño atractivo
// function KpiCard({
//   title,
//   value,
//   change,
//   isPositive,
//   icon,
// }: {
//   title: string;
//   value: string;
//   change: string;
//   isPositive: boolean;
//   icon: React.ReactNode;
// }) {
//   return (
//     <Card className="group p-6 shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden relative">
//       {/* Fondo decorativo sutil */}
//       <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50 pointer-events-none"></div>
//       <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

//       <div className="relative z-10 flex justify-between">
//         <div>
//           <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
//             {title}
//           </p>
//           <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
//             {value}
//           </p>
//         </div>
//         <div className="text-4xl opacity-80 p-2 rounded-full bg-slate-100/80 group-hover:bg-slate-200/80 transition-colors">
//           {icon}
//         </div>
//       </div>
//       <div className="relative z-10 flex items-center gap-1 mt-4 text-sm">
//         {isPositive ? (
//           <TrendingUp className="h-4 w-4 text-emerald-600" />
//         ) : (
//           <TrendingDown className="h-4 w-4 text-red-600" />
//         )}
//         <span className={isPositive ? "text-emerald-600" : "text-red-600"}>
//           {change}
//         </span>
//         <span className="text-muted-foreground">desde el mes anterior</span>
//       </div>
//     </Card>
//   );
// }