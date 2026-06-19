import { Sale } from "@/types";
import React from "react";

// Interfaces basadas exactamente en tus clases de C#
// interface ProductDetailProduct {
//     id: number;
//     productId: number;
//     name: string;
//     price: number;
//     reasonModification?: string;
//     quantity: number;
//     productFittings?: string[];
//     state: boolean;
// }

// interface OrderDetail {
//     id: number;
//     name: string;
//     quantity: number;
//     price: number;
//     categoryId: number;
//     productDetailProduct?: ProductDetailProduct[];
//     reasonModification?: string;
//     isCountable: boolean;
//     productFittings?: string[];
// }

// interface OrderPrintRequest {
//     detail?: OrderDetail[];
//     paymentType: string;
//     userId: number;
//     userCustomerId: number;
//     userName?: string;
//     userDocument?: string;
//     orderNumber: number;
//     orderStatus: number;
//     tenantId: number;
//     state: boolean;
//     total: number;
//     orderType: string;
//     shift?: string;
//     id: number;
//     createdAt: string | Date;
// }

interface RestaurantTicketProps {
    order: Sale;
}

export default function RestaurantTicket({ order }: RestaurantTicketProps) {
    const fechaFormateada = new Date(order.createdAt).toLocaleString("es-BO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    return (
        <div className="w-[80%] bg-white p-5 font-mono text-xs text-gray-900 relative">

            {/* Efecto decorativo de corte de ticketera en la parte superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_40%,_#f3f4f6_40%)] bg-[length:8px_8px] bg-repeat-x"></div>

            {/* Encabezado */}
            < div className="text-center space-y-1 pt-2" >
                <p className="text-sm font-bold tracking-widest">====================================</p>
                <h2 className="text-base font-black tracking-tight">LA COCINA DE YESHUA</h2>
                <p className="text-sm font-bold tracking-widest">====================================</p>
            </div >

            {/* Datos del Pedido */}
            < div className="mt-3 space-y-0.5" >
                <p className="font-black text-sm">Pedido #: {order.orderNumber}</p>
                <p>Tipo: <span className="font-bold">{order.orderType.toUpperCase()}</span></p>
                <p>Pago: <span className="font-bold">{order.paymentType.toUpperCase()}</span></p>
                <p>Fecha: <span className="font-bold">{fechaFormateada}</span></p>

                {
                    order.userName && (
                        <p>Cliente: <span className="font-bold">{order.userName.toUpperCase()}</span></p>
                    )
                }
                {
                    order.userDocument && (
                        <p>Documento: <span>{order.userDocument}</span></p>
                    )
                }
            </div >

            <p className="my-2 tracking-widest">------------------------------------</p>

            {/* Cabecera de la Tabla de Productos */}
            <div className="flex justify-between font-bold text-gray-700">
                <span className="w-10 text-left">CANT</span>
                <span className="flex-1 text-left px-1">PRODUCTO</span>
                <span className="w-16 text-right">PRECIO</span>
            </div>
            <p className="my-2 tracking-widest">------------------------------------</p>

            <div className="space-y-3">
                {order.detail?.filter(x => x.isCountable).map((item) => (
                    <div key={item.id} className="space-y-1">
                        <div className="flex justify-between items-start">
                            <span className="w-10 font-bold text-left">{item.quantity}</span>
                            <span className="flex-1 font-bold text-left px-1 break-words">
                                {item.name.toUpperCase()}
                            </span>
                            <span className="w-16 text-right">
                                {Number(item.price).toFixed(2)}
                            </span>
                        </div>

                        {/* Detalles Hijos (ProductDetailProduct) */}
                        {item.productDetailProduct?.map((detail) => (
                            <div key={detail.id} className="space-y-0.5">
                                {(detail.quantity ?? 0) > 0 && (
                                    <div className="flex justify-between text-gray-700 pl-4">
                                        <span className="w-6 font-bold">{detail.quantity}</span>
                                        <span className="flex-1 font-bold text-left break-words">
                                            {(detail.name ?? "-").toUpperCase()}
                                        </span>
                                        <span className="w-16 text-right font-bold">
                                            {Number(detail.price).toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                {/* Modificaciones del hijo */}
                                {/* {detail.reasonModification && (
                                    <div className="pl-8 text-gray-600 italic font-bold">
                                        * {detail.reasonModification.toUpperCase()}
                                    </div>
                                )} */}

                                {/* Guarniciones (Fittings) del hijo */}
                                {detail.productFittings?.map((fitting, idx) => (
                                    <div key={idx} className="pl-8 text-gray-600 font-bold">
                                        + {fitting.toUpperCase()}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Modificación del Item Principal */}
                        {item.reasonModification && (
                            <div className="pl-4 text-gray-600 italic font-bold">
                                * {item.reasonModification.toUpperCase()}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <p className="my-2 tracking-widest">------------------------------------</p>

            {/* Bloque del Total */}
            <div className="flex justify-between items-center text-sm font-black pt-1">
                <span>TOTAL</span>
                <span>Bs {Number(order.total).toFixed(2)}</span>
            </div>

            <p className="my-2 tracking-widest">====================================</p>

            {/* Footer */}
            <div className="text-center space-y-0.5 mt-2 text-gray-600">
                <p>Gracias por su compra</p>
                <p>Vuelva pronto</p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_40%,_#ffffff_40%)] bg-[length:8px_8px] bg-repeat-x transform rotate-180 translate-y-[2px]"></div>
        </div >

    );
}