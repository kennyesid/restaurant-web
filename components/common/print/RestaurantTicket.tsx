import { Sale } from "@/types";
import React from "react";

interface RestaurantTicketProps {
    order: Sale;
}

export default function RestaurantTicket({ order }: RestaurantTicketProps) {
    const fechaFormateada = new Date(order.createdAt).toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    return (
        <div className="max-w-4xl mx-auto bg-white border border-indigo-200 shadow-lg text-gray-800 text-sm font-sans ">

            <div className="bg-rest-primary text-white py-3 px-6 text-center">
                <h1 className="text-3xl font-extrabold tracking-wide uppercase">Factura de Venta / Nota de Pedido</h1>
            </div>

            <div className="p-6 grid grid-cols-12 gap-4 border-b border-indigo-200">
                <div className="col-span-7 space-y-1">
                    <p><span className="font-bold text-gray-700">Nombre del Restaurante:</span> LA COCINA DE YESHUA</p>
                    <p><span className="font-bold text-gray-700">Dirección:</span> Av. Principal #123</p>
                    <p><span className="font-bold text-gray-700">Teléfono:</span> +591 70000000</p>
                </div>
                <div className="col-span-5 space-y-1 border-l border-indigo-100 pl-4">
                    <p><span className="font-bold text-gray-700">NIT / GSTIN:</span> 123456789</p>
                    <p><span className="font-bold text-gray-700">N° Factura/Pedido:</span> #{order.orderNumber}</p>
                    <p>
                        <span className="font-bold text-gray-700">Fecha:</span>{" "}
                        {new Date(order?.createdAt || Date.now()).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* 3. Sección "Bill To:" (Datos del Cliente) */}
            <div className="bg-rest-primary text-white py-1.5 px-6 font-bold text-base">
                Cliente (Bill To):
            </div>
            <div className="p-6 grid grid-cols-12 gap-4 border-b border-indigo-200 bg-gray-50/50">
                <div className="col-span-7 space-y-1">
                    <p><span className="font-bold text-gray-700">Nombre:</span> {order.userCustomerName}</p>
                    <p><span className="font-bold text-gray-700">CI / NIT:</span> {order.userDocument}</p>
                    <p><span className="font-bold text-gray-700">Tipo de Pedido:</span> <span className="uppercase">{order.orderType}</span> {order.table ? `(Mesa ${order.table})` : ""}</p>
                </div>
                <div className="col-span-5 space-y-1 border-l border-indigo-100 pl-4">
                    <p><span className="font-bold text-gray-700">Método de Pago:</span> <span className="uppercase font-semibold">{order.paymentType}</span></p>
                    <p><span className="font-bold text-gray-700">Estado de Pago:</span> {order.salePaid ? "PAGADO" : "PENDIENTE"}</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-rest-primary text-white text-xs uppercase">
                            <th className="py-2.5 px-3 border-r border-indigo-500 w-12 text-center">N°</th>
                            <th className="py-2.5 px-4 border-r border-indigo-500">Descripción del Producto</th>
                            <th className="py-2.5 px-3 border-r border-indigo-500 w-20 text-center">Cant.</th>
                            <th className="py-2.5 px-3 border-r border-indigo-500 w-28 text-right">Precio Un.</th>
                            <th className="py-2.5 px-4 w-28 text-right">Monto (Bs)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100 text-xs">
                        {order.detail?.map((item, index) => {
                            const itemSubtotal = item.subTotal ?? (item.quantity * item.price);
                            return (
                                <tr key={item.id || index} className="align-top hover:bg-indigo-50/30">
                                    <td className="py-3 px-3 border-r border-indigo-100 text-center font-medium text-gray-600">
                                        {index + 1}
                                    </td>
                                    <td className="py-3 px-4 border-r border-indigo-100 space-y-1">
                                        <div className="font-bold text-gray-900 text-sm">{item.name}</div>

                                        {/* Detalles Internos (cartItemDetail) */}
                                        {item.cartItemDetail && item.cartItemDetail.length > 0 && (
                                            <div className="pl-3 border-l-2 border-indigo-200 space-y-1 mt-1 text-gray-600">
                                                {item.cartItemDetail.map((subItem) => (
                                                    <div key={subItem.id} className="text-[11px]">
                                                        <span className="font-semibold text-gray-700">• {subItem.name}</span>
                                                        {subItem.orderTypeSend && (
                                                            <span className="ml-2 text-indigo-600 font-bold">[{subItem.orderTypeSend}]</span>
                                                        )}
                                                        {subItem.reasonModification && (
                                                            <span className="ml-2 italic text-amber-600">({subItem.reasonModification})</span>
                                                        )}

                                                        {/* Opciones seleccionadas dentro del sub-plato */}
                                                        {subItem.productDetailProduct && subItem.productDetailProduct.length > 0 && (
                                                            <div className="pl-3 text-gray-500">
                                                                {subItem.productDetailProduct
                                                                    .filter((p) => p.selected)
                                                                    .map((p) => p.name)
                                                                    .join(", ")}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Modificación directa del ítem */}
                                        {item.reasonModification && (
                                            <p className="text-amber-600 italic text-[11px] pl-2">
                                                Obs: {item.reasonModification}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-3 px-3 border-r border-indigo-100 text-center font-semibold text-gray-700">
                                        {item.quantity}
                                    </td>
                                    <td className="py-3 px-3 border-r border-indigo-100 text-right text-gray-700">
                                        Bs {Number(item.price).toFixed(2)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                                        Bs {Number(itemSubtotal).toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* 5. Footer con Resumen / Totales */}
            <div className="grid grid-cols-12 border-t border-indigo-200">

                {/* Lado Izquierdo: Información Adicional */}
                <div className="col-span-7 p-4 border-r border-indigo-200 space-y-3 bg-gray-50/30">
                    <div>
                        <p className="font-bold text-gray-700 text-xs uppercase mb-1">Notas / Observaciones:</p>
                        <p className="text-gray-500 text-xs italic">
                            ¡Gracias por preferir La Cocina de Yeshua! Conserve este comprobante para cualquier reclamo.
                        </p>
                    </div>
                </div>

                {/* Lado Derecho: Desglose de Totales */}
                <div className="col-span-5 divide-y divide-indigo-100 text-xs">
                    <div className="flex justify-between p-2.5 px-4">
                        <span className="text-gray-600 font-medium">Subtotal:</span>
                        <span className="font-semibold">Bs {Number(order.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2.5 px-4">
                        <span className="text-gray-600 font-medium">Descuento:</span>
                        <span className="font-semibold">Bs 0.00</span>
                    </div>
                    <div className="flex justify-between p-2.5 px-4">
                        <span className="text-gray-600 font-medium">Monto Pagado:</span>
                        <span className="font-semibold">Bs {Number(order.amountPaid || order.total).toFixed(2)}</span>
                    </div>
                    {order.changeReturned !== undefined && order.changeReturned > 0 && (
                        <div className="flex justify-between p-2.5 px-4">
                            <span className="text-gray-600 font-medium">Cambio:</span>
                            <span className="font-semibold">Bs {Number(order.changeReturned).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between p-3 px-4 bg-indigo-50 font-bold text-sm text-indigo-950 border-t-2 border-indigo-600">
                        <span>TOTAL:</span>
                        <span>Bs {Number(order.total).toFixed(2)}</span>
                    </div>
                </div>

            </div>

            {/* 6. Pie de Página */}
            <div className="bg-gray-100 py-2 px-4 text-center text-xs text-gray-500 border-t border-gray-200">
                Generado por Sistema de Gestión de Restaurante
            </div>

        </div>
    );
}

// import { Sale } from "@/types";
// import React from "react";

// interface RestaurantTicketProps {
//     order: Sale;
// }

// export default function RestaurantTicket({ order }: RestaurantTicketProps) {
//     const fechaFormateada = new Date(order.createdAt).toLocaleString("es-BO", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//     });

//     return (
//         <div className="w-[80%] bg-white p-5 font-mono text-xs text-gray-900 relative">

//             <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_40%,_#f3f4f6_40%)] bg-[length:8px_8px] bg-repeat-x"></div>

//             < div className="text-center space-y-1 pt-2" >
//                 <p className="text-sm font-bold tracking-widest">====================================</p>
//                 <h2 className="text-base font-black tracking-tight">LA COCINA DE YESHUA</h2>
//                 <p className="text-sm font-bold tracking-widest">====================================</p>
//             </div >

//             < div className="mt-3 space-y-0.5" >
//                 <p className="font-black text-sm">Pedido #: {order.orderNumber}</p>
//                 <p>Tipo: <span className="font-bold">{order.orderType.toUpperCase()}</span></p>
//                 <p>Pago: <span className="font-bold">{order.paymentType.toUpperCase()}</span></p>
//                 <p>Fecha: <span className="font-bold">{fechaFormateada}</span></p>

//                 {
//                     order.userName && (
//                         <p>Cliente: <span className="font-bold">{order.userName.toUpperCase()}</span></p>
//                     )
//                 }
//                 {
//                     order.userDocument && (
//                         <p>Documento: <span>{order.userDocument}</span></p>
//                     )
//                 }
//             </div >

//             <p className="my-2 tracking-widest">------------------------------------</p>

//             <div className="flex justify-between font-bold text-gray-700">
//                 <span className="w-10 text-left">CANT</span>
//                 <span className="flex-1 text-left px-1">PRODUCTO</span>
//                 <span className="w-16 text-right">PRECIO</span>
//             </div>
//             <p className="my-2 tracking-widest">------------------------------------</p>

//             <div className="space-y-3">
//                 {order.detail?.filter(x => x.isCountable).map((item) => (
//                     <div key={item.id} className="space-y-1">
//                         <div className="flex justify-between items-start">
//                             <span className="w-10 font-bold text-left">{item.quantity}</span>
//                             <span className="flex-1 font-bold text-left px-1 break-words">
//                                 {item.name.toUpperCase()}
//                             </span>
//                             <span className="w-16 text-right">
//                                 {Number(item.price).toFixed(2)}
//                             </span>
//                         </div>


//                         {item.productDetailProduct?.map((detail) => (
//                             <div key={detail.id} className="space-y-0.5">
//                                 {(detail.quantity ?? 0) > 0 && (
//                                     <div className="flex justify-between text-gray-700 pl-4">
//                                         <span className="w-6 font-bold">{detail.quantity}</span>
//                                         <span className="flex-1 font-bold text-left break-words">
//                                             {(detail.name ?? "-").toUpperCase()}
//                                         </span>
//                                         <span className="w-16 text-right font-bold">

//                                             0
//                                         </span>
//                                     </div>
//                                 )}

//                                 {Array.isArray(detail.productFittings) && detail.productFittings.length > 0 && (
//                                     <div className="pl-8 space-y-0.5">
//                                         {detail.productFittings.map((fitting, idx) => {
//                                             const fittingText =
//                                                 typeof fitting === 'string'
//                                                     ? fitting
//                                                     : (fitting as any)?.name || '';

//                                             if (!fittingText) return null;

//                                             return (
//                                                 <div key={idx} className="text-gray-600 font-bold">
//                                                     + {fittingText.toUpperCase()}
//                                                 </div>
//                                             );
//                                         })}
//                                     </div>
//                                 )}
//                             </div>
//                         ))}

//                         {item.reasonModification && (
//                             <div className="pl-4 text-gray-600 italic font-bold">
//                                 * {item.reasonModification.toUpperCase()}
//                             </div>
//                         )}
//                     </div>
//                 ))}
//             </div>

//             <p className="my-2 tracking-widest">------------------------------------</p>

//             <div className="flex justify-between items-center text-sm font-black pt-1">
//                 <span>TOTAL</span>
//                 <span>Bs {Number(order.total).toFixed(2)}</span>
//             </div>

//             <p className="my-2 tracking-widest">====================================</p>

//             <div className="text-center space-y-0.5 mt-2 text-gray-600">
//                 <p>Gracias por su compra</p>
//                 <p>Vuelva pronto</p>
//             </div>

//             <div className="absolute bottom-0 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_40%,_#ffffff_40%)] bg-[length:8px_8px] bg-repeat-x transform rotate-180 translate-y-[2px]"></div>
//         </div >

//     );
// }