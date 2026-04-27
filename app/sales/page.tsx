'use client';

import { useEffect, useState } from 'react';
import { getSales, deleteSale } from '@/services/salesService';
import { Button } from '@/components/ui/button';
import { Sale } from '@/types';
import { Card } from '@/components/ui/card';
import { Trash2, Eye, Edit } from 'lucide-react';
import { handleResponse } from '@/utils/api-helpers';

// const today = new Date().toISOString().split('T')[0];

export default function SalesPage() {
  const today = new Date().toISOString().split('T')[0];

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Estados de Filtros
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [filterUser, setFilterUser] = useState('all');
  const [filterPaymentType, setFilterPaymentType] = useState('all');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getSales();
      handleResponse(data, setSales);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales
    .filter((sale) => {
      if (!sale.createdAt) return false;

      const dateObject = new Date(sale.createdAt);
      const saleDate = dateObject.toISOString().split("T")[0];

      const dateMatch =
        (!startDate || saleDate >= startDate) &&
        (!endDate || saleDate <= endDate);

      const userMatch =
        filterUser === "all" ||
        sale.userId?.toString() === filterUser;

      const paymentMatch =
        filterPaymentType === "all" ||
        sale.paymentType === filterPaymentType;

      return dateMatch && userMatch && paymentMatch;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

  // const filteredSales = sales.filter(sale => {
  //   if (!sale.createdAt) return false;

  //   const dateObject = new Date(sale.createdAt);

  //   if (isNaN(dateObject.getTime())) {
  //     console.error(`Fecha inválida encontrada en la venta: ${sale.saleId}`, sale.createdAt);
  //     return false;
  //   }

  //   const saleDate = dateObject.toISOString().split('T')[0];
  //   const dateMatch = (!startDate || saleDate >= startDate) && (!endDate || saleDate <= endDate);
  //   const userMatch = filterUser === 'all' || sale.userId.toString() === filterUser;
  //   const paymentMatch = filterPaymentType === 'all' || sale.paymentType === filterPaymentType;
  //   return dateMatch && userMatch && paymentMatch;
  // });

  const uniqueUsers = Array.from(new Set(sales.map(s => s.userId)));
  const uniquePaymentTypes = ["cash", "qr", "mixed"];


  const qrSales = sales.filter(s => s.paymentType === "qr");
  const cashSales = sales.filter(s => s.paymentType === "cash");
  const mixedSales = sales.filter(s => s.paymentType === "mixed");

  const totalSales = filteredSales.reduce(
    (acc, sale) => acc + sale.total,
    0
  );

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = { cash: 'Efectivo', qr: 'QR', mixed: 'Mixto' };
    return labels[type] || type;
  };

  if (loading) return <div className="p-6 text-center font-medium text-[#052A3D]">Cargando historial...</div>;

  const getOrderStatusBadge = (status: number) => {
    const styles: Record<number, string> = {
      1: "bg-emerald-100 text-emerald-700",
      2: "bg-orange-100 text-orange-700",
      3: "bg-blue-100 text-blue-700",
      4: "bg-gray-200 text-gray-800",
      5: "bg-red-100 text-red-700",
    };

    const labels: Record<number, string> = {
      1: "Pagado",
      2: "En cocina",
      3: "Listo",
      4: "Entregado",
      5: "Cancelado",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className='space-y-4'>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#052A3D] tracking-tight">CONTROL DE VENTAS</h1>
          <p className="text-sm text-muted-foreground">Gestiona y audita las transacciones del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSales} variant="outline" size="sm">Actualizar Datos</Button>
        </div>
      </div>

      {/* TOOLBAR DE FILTROS */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 bg-muted/40 backdrop-blur-sm p-4 rounded-xl border'>

        {/* segunda parte */}
        <div className="lg:col-span-1">

          <div className="
    relative overflow-hidden
    rounded-2xl
    p-5
    text-white
    shadow-lg
    bg-gradient-to-br
    from-[#052A3D]
    via-[#0b3f5c]
    to-[#052A3D]
  ">

            {/* decoración fondo */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>

            {/* HEADER */}
            <div className="relative z-10 mb-2 flex flex-col items-center">
              <p className="text-xs uppercase tracking-wider opacity-80">
                Resumen de Ventas
              </p>

              <h2 className="text-3xl font-black text-[#facc15]">
                Bs {totalSales.toLocaleString()}
              </h2>
              {/* 
              <p className="text-xs opacity-70">
                Total acumulado del día
              </p> */}
            </div>

            {/* DIVIDER */}
            {/* <div className="border-t border-white/20 my-4"></div> */}

            {/* STATS */}
            <div className="relative z-10 grid grid-cols-3 gap-2 text-center">

              {/* EFECTIVO */}
              <div>
                <p className="text-[10px] uppercase opacity-70">
                  Efectivo
                </p>

                <p className="text-lg font-bold text-[#facc15]">
                  {cashSales.length}
                </p>
              </div>

              {/* QR */}
              <div>
                <p className="text-[10px] uppercase opacity-70">
                  QR
                </p>

                <p className="text-lg font-bold">
                  {qrSales.length}
                </p>
              </div>

              {/* MIXTO */}
              <div>
                <p className="text-[10px] uppercase opacity-70">
                  Mixto
                </p>

                <p className="text-lg font-bold">
                  {mixedSales.length}
                </p>
              </div>
            </div>
          </div>
        </div>


        <div className="lg:col-span-3 space-y-4">
          {/* FILTROS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Usuario */}
            <div>
              <label className="text-sm font-medium">Usuario</label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="all">Todos</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>
                    Usuario {user}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo Pago */}
            <div>
              <label className="text-sm font-medium">Tipo de pago</label>
              <select
                value={filterPaymentType}
                onChange={(e) => setFilterPaymentType(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="all">Todos</option>
                {uniquePaymentTypes.map(type => (
                  <option key={type} value={type}>
                    {getPaymentTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Segunda fila */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Fecha inicio */}
            <div>
              <label className="text-sm font-medium">Fecha inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded-md p-2"
              />
            </div>
            {/* Fecha fin */}
            <div>
              <label className="text-sm font-medium">Fecha fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded-md p-2"
              />
            </div>
            {/* Botón buscar */}
            <button
              onClick={() => setSales([...sales])}
              className="h-10 bg-primary text-white rounded-md hover:opacity-90"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>
      {/* DATA TABLE */}
      <Card className="overflow-hidden border-none shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#052A3D] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4"></th>
                <th className="px-6 py-4 font-semibold">Pedido</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Pago</th>
                <th className="px-6 py-4 font-semibold text-right">Total</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredSales.map((sale) => (
                <>
                  <tr key={sale.saleId} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-4">
                      <button
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === sale.saleId ? null : sale.saleId
                          )
                        }
                        className="p-1 rounded hover:bg-muted transition"
                      >
                        {expandedRow === sale.saleId ? "▾" : "▸"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#052A3D]">
                          #{sale.orderNumber}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Venta #{sale.saleId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getOrderStatusBadge(sale.orderStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(sale.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">
                          Usuario #{sale.userId}
                        </span>

                        {sale.userCustomerId && (
                          <span className="text-[10px] text-muted-foreground">
                            Cliente #{sale.userCustomerId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${sale.paymentType === "cash"
                        ? "bg-green-100 text-green-700"
                        : sale.paymentType === "qr"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                        }`}>
                        {getPaymentTypeLabel(sale.paymentType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-lg text-[#052A3D]">
                        Bs {sale.total.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {/* <button
                          onClick={() => { setSelectedSale(sale); setIsDialogOpen(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button> */}
                        <button
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                          title="Editar venta"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteSale(sale.saleId).then(loadSales)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === sale.saleId && (
                    <tr className="bg-muted/30">
                      <td colSpan={8} className="px-6 py-6">

                        <div className="rounded-lg border bg-white p-4 shadow-sm">

                          {/* Header detalle */}
                          <div className="flex justify-between mb-4">
                            <div>
                              <p className="font-semibold text-[#052A3D]">
                                Detalle del Pedido #{sale.orderNumber}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {sale.detail.length} productos
                              </p>
                            </div>

                            <span className="font-bold text-lg">
                              Bs {sale.total.toLocaleString()}
                            </span>
                          </div>

                          {/* Items */}
                          <div className="divide-y">

                            {sale.detail.map(item => (
                              <div
                                key={item.productId}
                                className="flex justify-between items-center py-2"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {item.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Bs {item.price} x {item.quantity}
                                  </span>
                                </div>

                                <span className="font-semibold">
                                  Bs {(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}

                          </div>

                        </div>

                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <div className="p-10 text-center text-gray-400">
              No se encontraron registros con los filtros aplicados.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}


// 'use client';

// import { useEffect, useState } from 'react';
// import { getSales, deleteSale } from '@/services/salesService';
// import { Button } from '@/components/ui/button';
// import { CartItem, Sale } from '@/types';
// import { Card } from '@/components/ui/card';
// import { Trash2 } from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from '@/components/ui/dialog';


// export default function SalesPage() {
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [filterShift, setFilterShift] = useState<string>('all');
//   const [filterPaymentType, setFilterPaymentType] = useState<string>('all');

//   useEffect(() => {
//     loadSales();
//   }, []);

//   const loadSales = async () => {
//     try {
//       setLoading(true);
//       const data = await getSales();
//       // Corregido: createdAt en lugar de timestamp
//       setSales(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
//     } catch (error) {
//       console.error('Error loading sales:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id: number) => {
//     if (confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
//       try {
//         await deleteSale(id);
//         await loadSales();
//       } catch (error) {
//         console.error('Error deleting sale:', error);
//       }
//     }
//   };

//   const handleViewDetails = (sale: Sale) => {
//     setSelectedSale(sale);
//     setIsDialogOpen(true);
//   };

//   const filteredSales = sales.filter(sale => {
//     const shiftMatch = filterShift === 'all' || sale.shift === filterShift;
//     // Corregido: paymentType en lugar de payment_type
//     const paymentMatch = filterPaymentType === 'all' || sale.paymentType === filterPaymentType;
//     return shiftMatch && paymentMatch;
//   });

//   const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
//   const totalTransactions = filteredSales.length;
//   const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

//   // Corregido: Referencias a paymentType
//   const uniqueShifts = Array.from(new Set(sales.map(s => s.shift)));
//   const uniquePaymentTypes = Array.from(new Set(sales.map(s => s.paymentType)));

//   const getPaymentTypeLabel = (type: string) => {
//     const labels: Record<string, string> = {
//       cash: 'Efectivo',
//       qr: 'QR/Transferencia',
//       mixed: 'Mixto',
//     };
//     return labels[type] || type;
//   };

//   if (loading) {
//     return <div className="p-6">Cargando...</div>;
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-[#052A3D]">Historial de Ventas</h1>
//           <p className="text-muted-foreground">Visualiza todas las transacciones realizadas</p>
//         </div>
//       </div>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card className="p-6">
//           <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
//           <p className="text-3xl font-bold mt-2">Bs {totalRevenue.toLocaleString()}</p>
//           <p className="text-xs text-muted-foreground mt-2">{filteredSales.length} transacciones</p>
//         </Card>
//         <Card className="p-6">
//           <p className="text-sm font-medium text-muted-foreground">Transacciones</p>
//           <p className="text-3xl font-bold mt-2">{totalTransactions}</p>
//           <p className="text-xs text-muted-foreground mt-2">Promedio: Bs {averageTransaction.toLocaleString()}</p>
//         </Card>
//         <Card className="p-6">
//           <p className="text-sm font-medium text-muted-foreground">Tipos de Pago</p>
//           <div className="mt-2 space-y-1">
//             {uniquePaymentTypes.map((type, index) => {
//               // Corregido: paymentType
//               const count = filteredSales.filter(s => s.paymentType === type).length;
//               return (
//                 <div key={index} className="flex justify-between text-sm">
//                   <span>{getPaymentTypeLabel(type)}</span>
//                   <span className="font-semibold">{count}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>
//       </div>

//       {/* Filters */}
//       <Card className="p-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="text-sm font-medium text-[#052A3D]">Filtrar por Turno</label>
//             <select
//               value={filterShift}
//               onChange={(e) => setFilterShift(e.target.value)}
//               className="w-full mt-2 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#052A3D]"
//             >
//               <option value="all">Todos los Turnos</option>
//               {uniqueShifts.map(shift => (
//                 <option key={shift} value={shift}>{shift}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-[#052A3D]">Filtrar por Tipo de Pago</label>
//             <select
//               value={filterPaymentType}
//               onChange={(e) => setFilterPaymentType(e.target.value)}
//               className="w-full mt-2 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#052A3D]"
//             >
//               <option value="all">Todos los Tipos</option>
//               {uniquePaymentTypes.map((type, index) => (
//                 <option key={index} value={type}>{getPaymentTypeLabel(type)}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </Card>

//       {/* Sales List */}
//       <div className="space-y-3">
//         {filteredSales.length === 0 ? (
//           <Card className="p-8 text-center text-muted-foreground">
//             No hay ventas que mostrar con los filtros seleccionados
//           </Card>
//         ) : (
//           filteredSales.map((sale, index) => (
//             // Corregido: saleId en lugar de id_sale
//             <Card key={sale.saleId} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-[#052A3D]">
//               <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-4 mb-2">
//                     <div>
//                       <p className="font-semibold text-lg text-[#052A3D]">Bs {sale.total.toLocaleString()}</p>
//                       <p className="text-xs text-muted-foreground">
//                         {/* Corregido: createdAt */}
//                         {new Date(sale.createdAt).toLocaleString('es-CO')}
//                       </p>
//                     </div>
//                     <div className="flex gap-2">
//                       <span className="px-2 py-1 rounded text-[10px] font-bold bg-[#052A3D]/10 text-[#052A3D] uppercase">
//                         {sale.shift}
//                       </span>
//                       <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
//                         sale.paymentType === 'cash' ? 'bg-green-100 text-green-800' :
//                         sale.paymentType === 'qr' ? 'bg-blue-100 text-blue-800' :
//                         'bg-purple-100 text-purple-800'
//                       }`}>
//                         {getPaymentTypeLabel(sale.paymentType)}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="text-sm">
//                     {/* Corregido: detail en lugar de items */}
//                     <p className="text-muted-foreground font-medium mb-1">
//                       {sale.detail?.length || 0} artículos
//                     </p>
//                     <ul className="space-y-1 text-xs opacity-75">
//                       {sale.detail?.slice(0, 2).map((item : CartItem, idx : number) => (
//                         <li key={idx}>• {item.name} (x{item.quantity}) - Bs {item.price}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 </div>
//                 <div className="flex gap-2 ml-4">
//                   <Button size="sm" variant="outline" onClick={() => handleViewDetails(sale)}>
//                     Ver Detalles
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="text-destructive hover:bg-destructive/10"
//                     onClick={() => handleDelete(sale.saleId)}
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             </Card>
//           ))
//         )}
//       </div>

//       {/* Detail Dialog */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="text-[#052A3D]">Resumen de Transacción</DialogTitle>
//             <DialogDescription>ID: {selectedSale?.saleId}</DialogDescription>
//           </DialogHeader>

//           {selectedSale && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
//                 <div>
//                   <p className="text-muted-foreground">Fecha</p>
//                   <p className="font-medium">{new Date(selectedSale.createdAt).toLocaleString()}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Tipo Pago</p>
//                   <p className="font-medium">{getPaymentTypeLabel(selectedSale.paymentType)}</p>
//                 </div>
//               </div>

//               <div>
//                 <h4 className="font-semibold mb-3 text-sm">Artículos ({selectedSale.detail.length})</h4>
//                 <div className="space-y-2">
//                   {selectedSale.detail.map((item : CartItem, idx : number) => (
//                     <div key={idx} className="flex justify-between p-2 rounded bg-muted/30 text-sm">
//                       <div>
//                         <p className="font-medium">{item.name}</p>
//                         <p className="text-xs opacity-60">Cant: {item.quantity}</p>
//                       </div>
//                       <p className="font-semibold">Bs {(item.price * item.quantity).toLocaleString()}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="border-t pt-4 flex justify-between items-center">
//                 <p className="text-lg font-bold text-[#052A3D]">Total</p>
//                 <p className="text-2xl font-black text-[#052A3D]">Bs {selectedSale.total.toLocaleString()}</p>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }