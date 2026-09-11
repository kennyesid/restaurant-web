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
// import {
//   TrendingUp,
//   Calendar as CalendarIcon,
// } from "lucide-react";

// import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";
// import { es } from "date-fns/locale";
// import { User, Product, Category, Inventory, Sale } from "@/types";
// import { getAllSalesWithDetailsDashboard } from "@/services/salesService";
// import { getUsers } from "@/services/usersService";
// import { getProducts } from "@/services/productsSservice";
// import { getCategories } from "@/services/categoriesService";
// import PageHeader from "@/components/page/header/PageHeader";
// import { getInventory } from "@/services/inventoryService";

// // ========== Tipos Adaptados al nuevo JSON ==========
// // export interface ProductDetailProduct {
// //   id: number;
// //   categoryId: number;
// //   productId: number | null;
// //   name: string;
// //   price: number;
// //   imageUrl: string;
// //   isAvailable: boolean;
// //   state: boolean;
// //   createdAt: string;
// //   updatedAt: string;
// //   selected: boolean;
// //   productFittings: any[];
// // }

// // export interface SalesResponse {
// //   codigo: number;
// //   mensaje: string;
// //   contenido: Sale[];
// // }

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

// const PIE_COLORS = [
//   "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"
// ];

// // ========== Función segura para fechas ==========
// const safeFormat = (date: Date | undefined, fmt: string, options?: any) => {
//   if (!date || isNaN(date.getTime())) return "Fecha inválida";
//   return format(date, fmt, options);
// };

// // ========== Componente principal ==========
// export default function DashboardRecap() {
//   // Estados
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
//   const [selectedProduct, setSelectedProduct] = useState<number>(0);
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [inventory, setInventory] = useState<Inventory[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const loadAllData = useCallback(async () => {
//     setIsRefreshing(true);
//     try {
//       const [salesRes, usersRes, categoriesRes, productsRes, inventoryRes] =
//         await Promise.all([
//           getAllSalesWithDetailsDashboard(),
//           getUsers(),
//           getCategories(),
//           getProducts(),
//           getInventory(),
//         ]);

//       // Extraemos ventas del wrapper JSON de la respuesta
//       // const salesData: Sale[] = salesRes?.contenido || salesRes || [];
//       // setSales(salesData);
//       const salesData: Sale[] = (
//         Array.isArray(salesRes)
//           ? salesRes
//           : salesRes?.contenido || []
//       ) as Sale[];

//       setSales(salesData);

//       setUsers(usersRes || []);
//       setCategories(categoriesRes || []);
//       setProducts(productsRes || []);
//       setInventory(inventoryRes || []);

//       if (salesData.length > 0) {
//         const latestSale = [...salesData].sort(
//           (a, b) =>
//             new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
//         )[0];
//         if (latestSale?.createdAt) {
//           setSelectedDate(format(new Date(latestSale.createdAt), "yyyy-MM-dd"));
//         }
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

//   // Ventas filtradas
//   const filteredSales = useMemo(() => {
//     return sales.filter((sale) => {
//       const saleDate = startOfDay(new Date(sale.createdAt));
//       const from = dateRange?.from && !isNaN(dateRange.from.getTime()) ? startOfDay(dateRange.from) : null;
//       const to = dateRange?.to && !isNaN(dateRange.to.getTime()) ? startOfDay(dateRange.to) : null;

//       const inDateRange =
//         (!from || saleDate >= from) && (!to || saleDate <= to);
//       const matchesUser =
//         selectedUserId === "all" || sale.userId?.toString() === selectedUserId;

//       const matchesCategory =
//         selectedCategoryId === "all" ||
//         sale.detail?.some((item) => {
//           // Busca coincidencia en el ID de categoría del ítem o en sus productos/detalles
//           if (item.categoryId?.toString() === selectedCategoryId) return true;
//           const product = products.find((p) => p.id === item.productId);
//           return product?.categoryId?.toString() === selectedCategoryId;
//         });

//       return inDateRange && matchesUser && matchesCategory;
//     });
//   }, [sales, dateRange, selectedUserId, selectedCategoryId, products]);

//   const totalInventoryCost = useMemo(() => {
//     return inventory.reduce((sum, item) => {
//       return sum + (Number(item.cost) || 0);
//     }, 0);
//   }, [inventory]);

//   const dailyRevenueData: DailyRevenue[] = useMemo(() => {
//     if (!dateRange.from || !dateRange.to || isNaN(dateRange.from.getTime()) || isNaN(dateRange.to.getTime())) {
//       return [];
//     }
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
//           const catIdStr = item.categoryId?.toString();
//           const product = products.find((p) => p.id === item.productId);
//           if (catIdStr === selectedCategoryId || product?.categoryId?.toString() === selectedCategoryId) {
//             return subSum + (item.subTotal || item.price * item.quantity);
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

//   const hourlyStackedData = useMemo(() => {
//     const HORA_INICIO = 8;
//     const HORA_FIN = 23;

//     const hourMap = new Map<number, Map<string, number>>();
//     for (let hour = HORA_INICIO; hour <= HORA_FIN; hour++) {
//       hourMap.set(hour, new Map());
//     }

//     filteredSales.forEach((sale) => {
//       const saleDate = new Date(sale.createdAt);
//       if (isNaN(saleDate.getTime())) return;
//       const hour = saleDate.getHours();
//       if (hour < HORA_INICIO || hour > HORA_FIN) return;

//       sale.detail?.forEach((item) => {
//         const category = categories.find((c) => c.id === item.categoryId) ||
//           categories.find((c) => c.id === products.find((p) => p.id === item.productId)?.categoryId);
//         const categoryName = category?.name || "Sin categoría";
//         const itemRevenue = item.subTotal || (item.price * item.quantity);

//         const catMap = hourMap.get(hour)!;
//         catMap.set(categoryName, (catMap.get(categoryName) || 0) + itemRevenue);
//       });
//     });

//     const result: any[] = [];
//     for (let hour = HORA_INICIO; hour <= HORA_FIN; hour++) {
//       const catMap = hourMap.get(hour)!;
//       const dataPoint: any = {
//         hour,
//         formattedHour: `${hour.toString().padStart(2, "0")}:00`,
//       };
//       for (const cat of categories) {
//         const catName = cat.name;
//         dataPoint[catName] = catMap.get(catName) || 0;
//       }
//       result.push(dataPoint);
//     }
//     return result;
//   }, [filteredSales, products, categories]);

//   const pieData: PieData[] = useMemo(() => {
//     if (!selectedDate) return [];

//     const daySales = filteredSales.filter(
//       (sale) => format(new Date(sale.createdAt), "yyyy-MM-dd") === selectedDate,
//     );

//     const itemMap = new Map<string, number>();

//     daySales.forEach((sale) => {
//       sale.detail?.forEach((item) => {
//         const catIdStr = item.categoryId?.toString();
//         const category = categories.find((c) => c.id === item.categoryId) ||
//           categories.find((c) => c.id === products.find((p) => p.id === item.productId)?.categoryId);

//         if (selectedCategoryId === "all") {
//           const catName = category?.name || "Sin categoría";
//           itemMap.set(
//             catName,
//             (itemMap.get(catName) || 0) + (item.subTotal || item.price * item.quantity),
//           );
//         } else if (catIdStr === selectedCategoryId) {
//           const productName = item.name || "Producto desconocido";
//           itemMap.set(
//             productName,
//             (itemMap.get(productName) || 0) + (item.subTotal || item.price * item.quantity),
//           );
//         }
//       });
//     });

//     return Array.from(itemMap.entries())
//       .map(([name, value], index) => ({
//         name,
//         value,
//         fill: PIE_COLORS[index % PIE_COLORS.length],
//       }))
//       .sort((a, b) => b.value - a.value);
//   }, [filteredSales, selectedDate, products, categories, selectedCategoryId]);

//   const totalRevenue = useMemo(() => {
//     return dailyRevenueData.reduce((sum, day) => sum + day.revenue, 0);
//   }, [dailyRevenueData]);

//   const handleFromSelect = (date: Date | undefined) => {
//     if (date) setDateRange((prev) => ({ ...prev, from: date }));
//   };

//   const handleToSelect = (date: Date | undefined) => {
//     if (date) setDateRange((prev) => ({ ...prev, to: date }));
//   };

//   const qrSales = useMemo(() => {
//     return filteredSales.filter(sale => sale.paymentType?.toLowerCase() === "qr");
//   }, [filteredSales]);

//   if (isLoading) {
//     return (
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
//     <div className="space-y-4 md:pt-0">
//       <PageHeader
//         title="REPORTE"
//         subtitle="Gestión de Reporte"
//       />

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
//         <Popover>
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               className="w-full justify-start text-left font-normal shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D] text-white hover:from-[#0b3f5c] hover:to-[#052A3D] border-0 relative overflow-hidden"
//             >
//               <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
//               <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl"></div>
//               <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-[#facc15]" />
//               <span className="truncate">Inicio: {safeFormat(dateRange.from, "dd/MM/yyyy", { locale: es })}</span>
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-auto p-0" align="start">
//             <Calendar mode="single" selected={dateRange.from} onSelect={handleFromSelect} numberOfMonths={1} defaultMonth={dateRange.from} disabled={(date) => date > (dateRange.to || new Date())} />
//           </PopoverContent>
//         </Popover>
//         <Popover>
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               className="w-full justify-start text-left font-normal shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D] text-white hover:from-[#0b3f5c] hover:to-[#052A3D] border-0 relative overflow-hidden"
//             >
//               <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
//               <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl"></div>
//               <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-[#facc15]" />
//               <span className="truncate">Fin: {safeFormat(dateRange.to, "dd/MM/yyyy", { locale: es })}</span>
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-auto p-0" align="start">
//             <Calendar mode="single" selected={dateRange.to} onSelect={handleToSelect} numberOfMonths={1} defaultMonth={dateRange.to} disabled={(date) => date < (dateRange.from || subDays(new Date(), 30))} />
//           </PopoverContent>
//         </Popover>
//         <Select value={selectedUserId} onValueChange={setSelectedUserId}>
//           <SelectTrigger className="w-full shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D] text-white hover:from-[#0b3f5c] hover:to-[#052A3D] border-0 relative overflow-hidden">
//             <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
//             <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl"></div>
//             <SelectValue placeholder="Todos los usuarios" className="text-white" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">Todos los usuarios</SelectItem>
//             {users.map((user) => (
//               <SelectItem key={user.id} value={user.id.toString()}>{user.fullName}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
//           <SelectTrigger className="w-full shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D] text-white hover:from-[#0b3f5c] hover:to-[#052A3D] border-0 relative overflow-hidden">
//             <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
//             <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl"></div>
//             <SelectValue placeholder="Todas las categorías" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">Todas las categorías</SelectItem>
//             {categories.map((cat) => (
//               <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Select value={String(selectedProduct)} onValueChange={(val) => setSelectedProduct(Number(val))}>
//           <SelectTrigger className="w-full shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D] text-white hover:from-[#0b3f5c] hover:to-[#052A3D] border-0 relative overflow-hidden">
//             <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
//             <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl"></div>
//             <SelectValue placeholder="Todos los productos" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="0">Todos los productos</SelectItem>
//             {products.map((product) => (
//               <SelectItem key={product.id} value={String(product.id)}>
//                 {product.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         <div className="lg:col-span-1">
//           <Card className=" h-full border-0 shadow-none bg-transparent">
//             <h3 className="text-sm font-bold text-[#052A3D] uppercase tracking-widest mb-4 text-center">
//               Resumen de Ventas
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="col-span-2">
//                 <div className="relative overflow-hidden rounded-xl p-3 md:p-4 text-[#052A3D] shadow-lg bg-gradient-to-br from-yellow-400 via-yellow-300 to-amber-400">
//                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
//                   <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#052A3D]/10 rounded-full blur-2xl"></div>

//                   <div className="relative z-10 flex flex-col items-center">
//                     <h2 className="text-sm md:text-lg font-black text-[#052A3D] text-center leading-tight">
//                       {safeFormat(dateRange.from, "dd 'de' MMMM", { locale: es })} -{" "}
//                       {safeFormat(dateRange.to, "dd 'de' MMMM", { locale: es })}
//                     </h2>
//                   </div>
//                 </div>
//               </div>

//               <div className="relative overflow-hidden rounded-xl p-5 text-white shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D]">
//                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
//                 <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>
//                 <div className="relative z-10 flex flex-col items-center">
//                   <p className="text-xs uppercase tracking-wider opacity-80 text-white">
//                     Saldo Total
//                   </p>
//                   <h2 className="text-3xl font-black text-[#facc15] drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
//                     {totalRevenue.toLocaleString()}
//                   </h2>
//                   <div className="flex items-center gap-1 text-xs text-blue-200/80">
//                     <TrendingUp className="h-3 w-3" />
//                     <span>Libre de Impuestos</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="relative overflow-hidden rounded-xl p-5 text-[#052A3D] shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-gradient-to-br from-[#FDFDFD] via-[#f0f0f0] to-[#e3e3e3]">
//                 <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
//                 <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent pointer-events-none rounded-t-xl"></div>
//                 <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
//                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/40 rounded-full blur-2xl"></div>
//                 <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#052A3D]/5 rounded-full blur-2xl"></div>
//                 <div className="relative z-10 flex flex-col items-center">
//                   <p className="text-xs uppercase tracking-wider opacity-70 text-[#052A3D]">
//                     Ventas
//                   </p>
//                   <h2 className="text-3xl font-black text-[#052A3D] drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]">
//                     {filteredSales.length}
//                   </h2>
//                   <div className="flex items-center gap-1 text-xs text-[#052A3D]/60">
//                     <TrendingUp className="h-3 w-3" />
//                     <span>Total</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="relative overflow-hidden rounded-xl p-5 text-[#052A3D] shadow-lg bg-gradient-to-br from-[#FFEF4D] via-[#fde047] to-[#facc15]">
//                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
//                 <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#052A3D]/10 rounded-full blur-2xl"></div>
//                 <div className="relative z-10 flex flex-col items-center">
//                   <p className="text-xs uppercase tracking-wider opacity-80 text-[#052A3D]">
//                     QR
//                   </p>
//                   <h2 className="text-3xl font-black text-[#052A3D]">
//                     {qrSales.length}
//                   </h2>
//                   <div className="flex items-center gap-1 text-xs text-[#052A3D]/70">
//                     <TrendingUp className="h-3 w-3" />
//                     <span>+Pago</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="relative overflow-hidden rounded-xl p-5 text-[#052A3D] shadow-[0_8px_30px_rgba(219,230,76,0.5)] bg-gradient-to-br from-[#DBE64C] via-[#d0d93e] to-[#c5cc30] transform transition-all duration-300">
//                 <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
//                 <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-xl"></div>
//                 <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
//                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
//                 <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#052A3D]/10 rounded-full blur-2xl"></div>
//                 <div className="relative z-10 flex flex-col items-center">
//                   <p className="text-xs uppercase tracking-wider opacity-80 text-[#052A3D]">
//                     Gastos
//                   </p>
//                   <h2 className="text-3xl font-black text-[#052A3D] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
//                     {totalInventoryCost.toLocaleString()}
//                   </h2>
//                   <div className="flex items-center gap-1 text-xs text-[#052A3D]/70">
//                     <TrendingUp className="h-3 w-3" />
//                     <span>Valor Total</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </Card>
//         </div>
//         <div className="lg:col-span-3">
//           <Card className="p-6 rounded-2xl border-1 bg-white/90 backdrop-blur-sm transition-all ">
//             <h3 className="text-sm font-bold text-[#052A3D] uppercase tracking-widest mb-4">
//               Vista previa del Dashboard
//             </h3>
//             {/* Aquí van los gráficos de Recharts según el uso actual */}
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

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
import {
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
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
import { Sale, User, Product, Category, Inventory } from "@/types";
import { getAllSalesWithDetailsDashboard, getSales } from "@/services/salesService";
import { getUsers } from "@/services/usersService";
import { getProducts } from "@/services/productsSservice";
import { getCategories } from "@/services/categoriesService";
import PageHeader from "@/components/page/header/PageHeader";
import { getInventory } from "@/services/inventoryService";

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
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesByUserDocument, setSalesByUserDocument] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [salesRes, usersRes, categoriesRes, productsRes, inventoryRes] =
        await Promise.all([
          getSales(),
          getUsers(),
          getCategories(),
          getProducts(),
          getInventory(),
        ]);
      setSales(salesRes.contenido || []);
      // console.log('Datos', JSON.stringify(salesRes));
      setUsers(usersRes || []);
      setCategories(categoriesRes || []);
      setProducts(productsRes || []);
      setInventory(inventoryRes || []);

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

  const totalInventoryCost = useMemo(() => {
    return inventory.reduce((sum, item) => {
      return sum + (Number(item.cost) || 0);
    }, 0);
  }, [inventory]);

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

  // const combinedChartData = useMemo(() => {
  //   return dailyRevenueData.map((day) => ({
  //     ...day,
  //     expenses: day.revenue * 0.65,
  //     profit: day.revenue * 0.35,
  //   }));
  // }, [dailyRevenueData]);

  // const hourlyStackedData = useMemo(() => {
  //   const HORA_INICIO = 8;
  //   const HORA_FIN = 23;

  //   // Inicializar mapa para cada hora del rango
  //   const hourMap = new Map<number, Map<string, number>>();
  //   for (let hour = HORA_INICIO; hour <= HORA_FIN; hour++) {
  //     hourMap.set(hour, new Map());
  //   }

  //   // Acumular ventas por hora y categoría
  //   filteredSales.forEach((sale) => {
  //     const saleDate = new Date(sale.createdAt);
  //     if (isNaN(saleDate.getTime())) return;
  //     const hour = saleDate.getHours();
  //     if (hour < HORA_INICIO || hour > HORA_FIN) return;

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

  //   // Convertir a array en orden ascendente (8:00 a 23:00)
  //   const result: any[] = [];
  //   for (let hour = HORA_INICIO; hour <= HORA_FIN; hour++) {
  //     const catMap = hourMap.get(hour)!;
  //     const dataPoint: any = {
  //       hour,
  //       formattedHour: `${hour.toString().padStart(2, "0")}:00`,
  //     };
  //     // Añadir cada categoría con su valor (0 si no tiene)
  //     for (const cat of categories) {
  //       const catName = cat.name;
  //       dataPoint[catName] = catMap.get(catName) || 0;
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

  // const stackedCategoryData = useMemo(() => {
  //   const catMap = new Map<string, { morning: number; afternoon: number; night: number }>();

  //   categories.forEach(cat => {
  //     catMap.set(cat.name, { morning: 0, afternoon: 0, night: 0 });
  //   });

  //   filteredSales.forEach((sale) => {
  //     const saleDate = new Date(sale.createdAt);
  //     if (isNaN(saleDate.getTime())) return;
  //     const hour = saleDate.getHours();

  //     sale.detail?.forEach((item) => {
  //       const product = products.find((p) => p.id === item.productId);
  //       if (!product) return;
  //       const category = categories.find((c) => c.id === product.categoryId);
  //       if (!category) return;
  //       const catName = category.name;
  //       const itemRevenue = item.price * item.quantity;

  //       const data = catMap.get(catName)!;

  //       if (hour >= 6 && hour < 12) data.morning += itemRevenue;
  //       else if (hour >= 12 && hour < 18) data.afternoon += itemRevenue;
  //       else if (hour >= 18 && hour < 23) data.night += itemRevenue;
  //     });
  //   });

  //   // Convertir a array para Recharts
  //   return Array.from(catMap.entries()).map(([category, values]) => ({
  //     category,
  //     morning: values.morning,
  //     afternoon: values.afternoon,
  //     night: values.night,
  //   }));
  // }, [filteredSales, products, categories]);

  const salesByProductHour = useMemo(() => {
    const productCount = new Map<string, number>();

    const EXCLUDED_WORDS = ['Almuerzo'];

    filteredSales.forEach((sale) => {
      sale.detail?.forEach((item) => {
        if (selectedProduct !== 0 && item.productId !== selectedProduct) return;
        const productName = item.name.trim();
        if (EXCLUDED_WORDS.some(word => productName.toLowerCase().includes(word.toLowerCase()))) return;
        productCount.set(productName, (productCount.get(productName) || 0) + 1);
      });
    });

    return Array.from(productCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ product: name, hour: count })); // Usamos 'hour' como alias para 'count'

  }, [filteredSales, selectedProduct]);

  // const salesByHour = useMemo(() => {

  //   const hourMap = new Map<string, number>();

  //   filteredSales.forEach((sale) => {

  //     const saleDate = new Date(sale.createdAt);

  //     if (isNaN(saleDate.getTime())) return;

  //     const hour = saleDate.toLocaleTimeString("es-CO", {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //       hour12: true,
  //     });

  //     const currentTotal = hourMap.get(hour) || 0;

  //     hourMap.set(hour, currentTotal + sale.total);

  //   });

  //   return Array.from(hourMap.entries()).map(([hour, total]) => ({
  //     hour,
  //     total,
  //   }));

  // }, [filteredSales]);

  const qrSales = useMemo(() => {
    return filteredSales.filter(sale => sale.paymentType === "qr");
  }, [filteredSales]);

  // const cashSales = useMemo(() => {
  //   return filteredSales.filter(sale => sale.paymentType === "cash");
  // }, [filteredSales]);

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

      <PageHeader
        title="REPORTE"
        subtitle="Gestion de Reporte"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D] text-white hover:from-[#0b3f5c] hover:to-[#052A3D] border-0 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl"></div>
              <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-[#facc15]" />
              <span className="truncate">Inicio: {safeFormat(dateRange.from, "dd/MM/yyyy", { locale: es })}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateRange.from} onSelect={handleFromSelect} numberOfMonths={1} defaultMonth={dateRange.from} disabled={(date) => date > (dateRange.to || new Date())} />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D] text-white hover:from-[#0b3f5c] hover:to-[#052A3D] border-0 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl"></div>
              <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-[#facc15]" />
              <span className="truncate">Fin: {safeFormat(dateRange.to, "dd/MM/yyyy", { locale: es })}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateRange.to} onSelect={handleToSelect} numberOfMonths={1} defaultMonth={dateRange.to} disabled={(date) => date < (dateRange.from || subDays(new Date(), 30))} />
          </PopoverContent>
        </Popover>
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger className="w-full shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D] text-white hover:from-[#0b3f5c] hover:to-[#052A3D] border-0 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl"></div>
            <SelectValue placeholder="Todos los usuarios" className="text-white" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los usuarios</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>{user.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger className="w-full shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D] text-white hover:from-[#0b3f5c] hover:to-[#052A3D] border-0 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl"></div>
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(selectedProduct)} onValueChange={(val) => setSelectedProduct(Number(val))}>
          <SelectTrigger className="w-full shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D] text-white hover:from-[#0b3f5c] hover:to-[#052A3D] border-0 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl"></div>
            <SelectValue placeholder="Todos los productos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Todos los productos</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={String(product.id)}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className=" h-full border-0 shadow-none bg-transparent">
            <h3 className="text-sm font-bold text-[#052A3D] uppercase tracking-widest mb-4 text-center">
              Resumen de Ventas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="relative overflow-hidden rounded-xl p-3 md:p-4 text-[#052A3D] shadow-lg bg-gradient-to-br from-yellow-400 via-yellow-300 to-amber-400">

                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#052A3D]/10 rounded-full blur-2xl"></div>

                  <div className="relative z-10 flex flex-col items-center">

                    <h2 className="text-sm md:text-lg font-black text-[#052A3D] text-center leading-tight">
                      {safeFormat(dateRange.from, "dd 'de' MMMM", { locale: es })} -{" "}
                      {safeFormat(dateRange.to, "dd 'de' MMMM", { locale: es })}
                    </h2>

                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl p-5 text-white shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D]">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <p className="text-xs uppercase tracking-wider opacity-80 text-white">
                    Saldo Total
                  </p>
                  <h2 className="text-3xl font-black text-[#facc15] drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
                    {totalRevenue.toLocaleString()}
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-blue-200/80">
                    <TrendingUp className="h-3 w-3" />
                    <span>Libre de Impuestos</span>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl p-5 text-[#052A3D] shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-gradient-to-br from-[#FDFDFD] via-[#f0f0f0] to-[#e3e3e3]">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent pointer-events-none rounded-t-xl"></div>
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/40 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#052A3D]/5 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <p className="text-xs uppercase tracking-wider opacity-70 text-[#052A3D]">
                    Ventas
                  </p>
                  <h2 className="text-3xl font-black text-[#052A3D] drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]">
                    {filteredSales.length}
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-[#052A3D]/60">
                    <TrendingUp className="h-3 w-3" />
                    <span>Total</span>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl p-5 text-[#052A3D] shadow-lg bg-gradient-to-br from-[#FFEF4D] via-[#fde047] to-[#facc15]">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#052A3D]/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <p className="text-xs uppercase tracking-wider opacity-80 text-[#052A3D]">
                    QR
                  </p>
                  <h2 className="text-3xl font-black text-[#052A3D]">
                    {qrSales.length}
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-[#052A3D]/70">
                    <TrendingUp className="h-3 w-3" />
                    <span>+Pago</span>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl p-5 text-[#052A3D] shadow-[0_8px_30px_rgba(219,230,76,0.5)] bg-gradient-to-br from-[#DBE64C] via-[#d0d93e] to-[#c5cc30] transform transition-all duration-300 ">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-xl"></div>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#052A3D]/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <p className="text-xs uppercase tracking-wider opacity-80 text-[#052A3D]">
                    Gastos
                  </p>
                  <h2 className="text-3xl font-black text-[#052A3D] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                    {totalInventoryCost.toLocaleString()}
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-[#052A3D]/70">
                    <TrendingUp className="h-3 w-3" />
                    <span>Valor Total</span>
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="p-6 rounded-2xl border-1 bg-white/90 backdrop-blur-sm transition-all ">
            <h3 className="text-sm font-bold text-[#052A3D] uppercase tracking-widest mb-4 text-center">
              Evolución de Ingresos (Diario)
            </h3>
            <ResponsiveContainer width="100%" height={260}>
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
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4 md:p-6 rounded-2xl border-0 bg-white/90 backdrop-blur-sm h-full">

            <h3 className="text-xs md:text-sm font-bold text-[#052A3D] uppercase tracking-widest mb-3 md:mb-4 text-center">
              {selectedDate
                ? `${selectedCategoryId === "all" ? "Detalle por Categorías" : "Top Productos"}`
                : "Selecciona un día"}
            </h3>

            {pieData.length > 0 ? (
              <div className="relative">
                <ResponsiveContainer width="100%" height={260}>

                  <PieChart>
                    <defs>
                      {pieData.map((_, idx) => (
                        <filter
                          key={`shadow-${idx}`}
                          id={`pie-shadow-${idx}`}
                          x="-20%"
                          y="-20%"
                          width="140%"
                          height="140%"
                        >
                          <feDropShadow
                            dx="0"
                            dy="2"
                            stdDeviation="3"
                            floodColor={PIE_COLORS[idx % PIE_COLORS.length]}
                            floodOpacity="0.4"
                          />
                        </filter>
                      ))}
                    </defs>

                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={entry.fill}
                          filter={`url(#pie-shadow-${idx})`}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString("es-CO")}`, ""]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
                      }}
                    />
                  </PieChart>

                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-xs md:text-sm">
                No hay ventas para el día seleccionado
              </div>
            )}

            <div className="mt-3 md:mt-4 space-y-2 max-h-[120px] md:max-h-[150px] overflow-y-auto pr-1 md:pr-2">
              {pieData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-[11px] md:text-xs p-1 rounded-md hover:bg-slate-50 transition-colors cursor-default"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="truncate max-w-[90px] md:max-w-[120px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-medium">
                    ${item.value.toLocaleString("es-CO")}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="p-4 md:p-6 rounded-2xl border-0 bg-white/90 backdrop-blur-sm">
            <h3 className="text-xs md:text-sm font-bold text-[#052A3D] uppercase tracking-widest mb-4 text-center">
              Ventas por Producto y Rango Horario
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={salesByProductHour}
                margin={{ top: 10, right: 10, left: 0, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="product"
                  stroke="#64748b"
                  fontSize={10}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  domain={[0, 23]}
                  ticks={[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]}
                  tickFormatter={(h) => `${h}:00`}
                  fontSize={10}
                />
                <Bar
                  dataKey="hour"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div >
  );
}

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
