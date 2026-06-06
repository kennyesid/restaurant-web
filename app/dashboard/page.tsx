// "use client";

// import { ApiService } from "@/services/apiService"; // Ajusta la ruta a tu api.service
// import { useEffect, useState } from "react";

// // 1. Definimos la interfaz del objeto que devuelve tu API de .NET
// interface WeatherForecastData {
//   date: string;
//   temperatureC: number;
//   temperatureF: number;
//   summary: string;
// }

// export default function DashboardRecap() {
//   // Estados para manejar el contenido de la API, carga y posibles errores
//   const [clima, setClima] = useState<WeatherForecastData[] | null>(null);
//   const [cargando, setCargando] = useState<boolean>(true);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   useEffect(() => {
//     const consultarApi = async () => {
//       setCargando(true);
//       setErrorMsg(null);

//       // 2. Invocamos al servicio genérico especificando el tipo de dato esperado <WeatherForecastData[]>
//       const respuesta = await ApiService.get<WeatherForecastData[]>(
//         "https://localhost:7175/WeatherForecast"
//       );

//       console.log("respuesta: " + JSON.stringify(respuesta));

//       // 3. Evaluamos la respuesta estructurada por nuestra interfaz RespuestaGenericaDto
//       if (respuesta.codigo >= 200 && respuesta.codigo < 300) {
//         setClima(respuesta.contenido); // El contenido está fuertemente tipado automáticamente
//       } else {
//         setErrorMsg(respuesta.mensaje);
//       }

//       setCargando(false);
//     };

//     consultarApi();
//   }, []);

//   // Renderizado condicional según el estado de la petición HTTP
//   if (cargando) return <div>Cargando datos del clima desde .NET...</div>;
//   if (errorMsg) return <div style={{ color: "red" }}>Error: {errorMsg}</div>;

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Dashboard - Pronóstico del Tiempo</h2>

//       <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", marginTop: "10px" }}>
//         <thead>
//           <tr>
//             <th>Fecha</th>
//             <th>Temp (°C)</th>
//             <th>Temp (°F)</th>
//             <th>Resumen</th>
//           </tr>
//         </thead>
//         <tbody>
//           {clima?.map((item, index) => (
//             <tr key={index}>
//               <td>{new Date(item.date).toLocaleDateString()}</td>
//               <td>{item.temperatureC}°C</td>
//               <td>{item.temperatureF}°F</td>
//               <td>{item.summary}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

export default function DashboardRecap() {
  return (
    <div>hola</div>
  )
}


// app/dashboard/page.tsx
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
// import { getCategories, getProducts } from "@/services/productsSservice";

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
//           const product = products.find((p) => p.productId === item.productId);
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

//       return {
//         date: dayStr,
//         revenue: daySales.reduce((sum, sale) => sum + (sale.total || 0), 0),
//         formattedDate: format(day, "dd MMM", { locale: es }),
//       };
//     });
//   }, [filteredSales, dateRange]);

//   const pieData: PieData[] = useMemo(() => {
//     if (!selectedDate) return [];

//     const daySales = filteredSales.filter(
//       (sale) => format(new Date(sale.createdAt), "yyyy-MM-dd") === selectedDate,
//     );

//     const categoryMap = new Map<string, number>();

//     daySales.forEach((sale) => {
//       sale.detail?.forEach((item) => {
//         const product = products.find((p) => p.productId === item.productId);
//         if (product) {
//           const category = categories.find((c) => c.id === product.categoryId);
//           const catName = category?.name || "Sin categoría";

//           categoryMap.set(
//             catName,
//             (categoryMap.get(catName) || 0) + item.price * item.quantity,
//           );
//         }
//       });
//     });

//     return Array.from(categoryMap.entries())
//       .map(([name, value], index) => ({
//         name,
//         value,
//         fill: COLORS[index % COLORS.length],
//       }))
//       .sort((a, b) => b.value - a.value);
//   }, [filteredSales, selectedDate, products, categories]);

//   // KPIs
//   const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
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

//           <Select value={selectedUserId} onValueChange={setSelectedUserId}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Todos los usuarios" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">Todos los usuarios</SelectItem>
//               {users.map((user, index) => (
//                 <SelectItem key={index} value={user.id.toString()}>
//                   {user.fullName}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select
//             value={selectedCategoryId}
//             onValueChange={setSelectedCategoryId}
//           >
//             <SelectTrigger className="w-[180px]">
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
//                 ? `Detalle ${format(new Date(selectedDate), "dd MMM yyyy", { locale: es })}`
//                 : "Selecciona un día"}
//             </h3>
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

















// DIVISION ROJO

// "use client";

// import { useEffect, useState } from "react";
// import { Card } from "@/components/ui/card";
// import {
//   getTotalSalesByShift,
//   getTopProducts,
//   getTotalRevenue,
// } from "@/services/salesService";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
// import { handleResponse } from "@/utils/api-helpers";
// import { ToastType } from "@/types";
// import { toast } from "sonner";
// import { CustomNotification } from "@/components/common/toast/CustomNotification";

// export default function DashboardPage() {
//   const [salesByShift, setSalesByShift] = useState<Record<string, number>>({});
//   const [topProducts, setTopProducts] = useState<any[]>([]);
//   const [totalRevenue, setTotalRevenue] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         // const shiftData = getTotalSalesByShift();
//         // const products = getTopProducts();
//         // const revenue = getTotalRevenue();
//         // setSalesByShift(shiftData);
//         // setTopProducts(products);
//         // setTotalRevenue(revenue);

//         const [resShift, resProducts, resRevenue] = await Promise.all([
//           getTotalSalesByShift(),
//           getTopProducts(),
//           getTotalRevenue(),
//         ]);

//         handleResponse(resShift, setSalesByShift);
//         handleResponse(resProducts, setTopProducts);
//         handleResponse(resRevenue, setTotalRevenue);

//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   const chartData = [
//     { name: "Mañana", ventas: salesByShift.morning },
//     { name: "Tarde", ventas: salesByShift.afternoon },
//     { name: "Noche", ventas: salesByShift.night },
//   ];

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   const handleTestToas = () => {
//     const currentToastBody = {
//       type: ToastType.Successfully,
//       message: "Venta Completada",
//       description: "Venta realizada satisfactoriamente.",
//       image: null,
//     };

//     toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
//   };

//   return (
//     <div className="space-y-8">
//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-muted-foreground">Ingresos Totales</p>
//               <h3 className="text-2xl font-bold mt-2">
//                 ${totalRevenue.toLocaleString("es-CO")}
//               </h3>
//             </div>
//             <div className="p-3 bg-primary/10 rounded-lg">
//               <DollarSign className="text-primary" size={24} />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-muted-foreground">
//                 Órdenes Procesadas
//               </p>
//               <h3 className="text-2xl font-bold mt-2">3</h3>
//             </div>
//             <div className="p-3 bg-secondary/10 rounded-lg">
//               <ShoppingCart className="text-secondary" size={24} />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-muted-foreground">Ticket Promedio</p>
//               <h3 className="text-2xl font-bold mt-2">
//                 ${Math.round(totalRevenue / 3).toLocaleString("es-CO")}
//               </h3>
//             </div>
//             <div className="p-3 bg-accent/10 rounded-lg">
//               <TrendingUp className="text-accent" size={24} />
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <Card className="p-6">
//           <h3 className="text-lg font-semibold mb-4">Ventas por Turno</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={chartData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
//               <XAxis dataKey="name" stroke="var(--muted-foreground)" />
//               <YAxis stroke="var(--muted-foreground)" />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "var(--card)",
//                   border: "1px solid var(--border)",
//                   borderRadius: "8px",
//                 }}
//               />
//               <Bar
//                 dataKey="ventas"
//                 fill="var(--chart-1)"
//                 radius={[8, 8, 0, 0]}
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </Card>

//         {/* Top Products */}
//         <Card className="p-6">
//           <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
//           <div className="space-y-4">
//             {topProducts.map((product, index) => (
//               <div key={index} className="flex items-center justify-between">
//                 <div className="flex-1">
//                   <p className="font-medium">{product.name}</p>
//                   <p className="text-sm text-muted-foreground">
//                     {product.quantity} unidades vendidas
//                   </p>
//                 </div>
//                 <p className="font-semibold">
//                   ${product.revenue.toLocaleString("es-CO")}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }
