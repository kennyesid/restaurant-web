'use client';

import { useEffect, useState } from 'react';
import { getSales, deleteSale } from '@/services/salesService';
import { Button } from '@/components/ui/button';
import { CartItem, Sale } from '@/types';
import { Card } from '@/components/ui/card';
import { Trash2, Eye, Edit, Calendar, User, CreditCard, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Estados de Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterPaymentType, setFilterPaymentType] = useState('all');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getSales();
      console.log("Datos",data);
      setSales(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => {
    if (!sale.createdAt) return false;

    const dateObject = new Date(sale.createdAt);
    
    if (isNaN(dateObject.getTime())) {
      console.error(`Fecha inválida encontrada en la venta: ${sale.saleId}`, sale.createdAt);
      return false;
    }

    const saleDate = dateObject.toISOString().split('T')[0];
    const dateMatch = (!startDate || saleDate >= startDate) && (!endDate || saleDate <= endDate);
    const userMatch = filterUser === 'all' || sale.userId.toString() === filterUser;
    const paymentMatch = filterPaymentType === 'all' || sale.paymentType === filterPaymentType;
    return dateMatch && userMatch && paymentMatch;
  });

  const uniqueUsers = Array.from(new Set(sales.map(s => s.userId)));
  const uniquePaymentTypes = ["cash", "qr", "mixed"];

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = { cash: 'Efectivo', qr: 'QR', mixed: 'Mixto' };
    return labels[type] || type;
  };

  if (loading) return <div className="p-6 text-center font-medium text-[#052A3D]">Cargando historial...</div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
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
      <Card className="p-4 shadow-sm border-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
              <Calendar size={12} /> Fecha Inicio
            </label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-sm border-gray-200 rounded-md focus:ring-[#052A3D] focus:border-[#052A3D]" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
              <Calendar size={12} /> Fecha Fin
            </label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-sm border-gray-200 rounded-md focus:ring-[#052A3D] focus:border-[#052A3D]" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
              <User size={12} /> Usuario
            </label>
            <select 
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full text-sm border-gray-200 rounded-md focus:ring-[#052A3D]"
            >
              <option value="all">Todos los usuarios</option>
              {uniqueUsers.map((id, index) => <option key={index} value={id}>Usuario ID: {id}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
              <CreditCard size={12} /> Tipo de Pago
            </label>
            <select 
              value={filterPaymentType}
              onChange={(e) => setFilterPaymentType(e.target.value)}
              className="w-full text-sm border-gray-200 rounded-md focus:ring-[#052A3D]"
            >
              <option value="all">Todos los métodos</option>
              {uniquePaymentTypes.map(type => (
                <option key={type} value={type}>{getPaymentTypeLabel(type)}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* DATA TABLE */}
      <Card className="overflow-hidden border-none shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#052A3D] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Pago</th>
                <th className="px-6 py-4 font-semibold text-right">Total</th>
                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredSales.map((sale) => (
                <tr key={sale.saleId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">#{sale.saleId}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      ID: {sale.userId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                      sale.paymentType === 'cash' ? 'bg-green-100 text-green-700' : 
                      sale.paymentType === 'qr' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {getPaymentTypeLabel(sale.paymentType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[#052A3D]">
                    Bs {sale.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => { setSelectedSale(sale); setIsDialogOpen(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
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
      
      {/* El Dialog Detail se mantiene igual o puedes adaptarlo al mismo estilo visual */}
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