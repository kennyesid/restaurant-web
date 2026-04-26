import { storage } from "@/lib/storage";
import { CartItem, Product, Sale, RespuestaGenericaDto } from "@/types";

const SALES_KEY = "sales";

// --- HELPERS DE RESPUESTA (Simulando métodos estáticos de C#) ---
const responderExito = <T>(contenido: T, mensaje = "Operación exitosa"): RespuestaGenericaDto<T> => ({
  codigo: 200,
  mensaje,
  contenido
});

const responderFalla = <T>(mensaje: string, codigo = 400): RespuestaGenericaDto<T> => ({
  codigo,
  mensaje,
  contenido: null
});

export async function getSales(): Promise<RespuestaGenericaDto<Sale[]>> {
  try {
    const data = storage.getCollection<Sale>(SALES_KEY);
    return responderExito(data);
  } catch (error) {
    return responderFalla("Error al obtener el historial de ventas");
  }
}

export async function getSaleById(id: number): Promise<RespuestaGenericaDto<Sale>> {
  try {
    const sale = storage.getFromCollection<Sale>(SALES_KEY, id, "saleId");
    if (!sale) return responderFalla(`Venta #${id} no encontrada`, 404);
    return responderExito(sale);
  } catch (error) {
    return responderFalla("Error al buscar la venta");
  }
}

// export async function createSale(
//   sale: Omit<Sale, "saleId" | "createdAt" | "updatedAt">
// ): Promise<RespuestaGenericaDto<Sale>> {
//   try {
//     // SIMULACIÓN DE ERROR CRÍTICO
//     throw new Error("Error de conexión con el storage"); 

//     const currentSales = storage.getCollection<Sale>(SALES_KEY);
//     // ... resto del código que nunca se ejecutará
//   } catch (error) {
//     // Retornará: { codigo: 400, mensaje: "No se pudo procesar la venta", contenido: null }
//     return responderFalla("No se pudo procesar la venta");
//   }
// }

export async function createSale(
  sale: Omit<Sale, "saleId" | "createdAt" | "updatedAt">
): Promise<RespuestaGenericaDto<Sale>> {
  try {
    const currentSales = storage.getCollection<Sale>(SALES_KEY);
    const maxId = currentSales.length > 0 ? Math.max(...currentSales.map(s => s.saleId)) : 0;

    const newSale: Sale = {
      ...sale,
      saleId: maxId + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    storage.addToCollection(SALES_KEY, newSale, "saleId");
    return responderExito(newSale, "Venta registrada con éxito");
  } catch (error) {
    return responderFalla("No se pudo procesar la venta");
  }
}

export async function deleteSale(id: number): Promise<RespuestaGenericaDto<boolean>> {
  try {
    const deleted = storage.removeFromCollection(SALES_KEY, id, "saleId");
    return deleted 
      ? responderExito(true, "Venta eliminada") 
      : responderFalla("No se encontró la venta para eliminar");
  } catch (error) {
    return responderFalla("Error al intentar eliminar el registro");
  }
}

export async function getTotalSalesByShift(): Promise<RespuestaGenericaDto<Record<string, number>>> {
  try {
    const sales = storage.getCollection<Sale>(SALES_KEY);
    const shifts: Record<string, number> = {};

    sales.forEach((sale) => {
      const shiftName = sale.shift || "Sin Turno";
      if (!shifts[shiftName]) {
        shifts[shiftName] = 0;
      }
      shifts[shiftName] += sale.total;
    });

    return responderExito(shifts);
  } catch (error) {
    return responderFalla("Error al calcular ventas por turno");
  }
}

export async function getTopProducts(limit: number = 5): Promise<RespuestaGenericaDto<any[]>> {
  try {
    const sales = storage.getCollection<Sale>(SALES_KEY);
    const productMap = new Map<number, { name: string; quantity: number; revenue: number }>();

    sales.forEach((sale) => {
      sale.detail?.forEach((item) => {
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

    const result = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return responderExito(result);
  } catch (error) {
    return responderFalla("Error al generar ranking de productos");
  }
}

/**
 * Retorna la sumatoria total de ingresos históricos
 */
export async function getTotalRevenue(): Promise<RespuestaGenericaDto<number>> {
  try {
    const sales = storage.getCollection<Sale>(SALES_KEY);
    const total = sales.reduce((sum, sale) => sum + sale.total, 0);
    return responderExito(total);
  } catch (error) {
    return responderFalla("Error al calcular ingresos totales");
  }
}



// import { storage } from "@/lib/storage";
// import { CartItem, Product, Sale } from "@/types";

// export interface SaleDetail extends Product {
//   quantity: number;
// }

// // export interface Sale {
// //   saleId: number;
// //   // detail: SaleDetail[];
// //   detail: CartItem[]; // Cambiado de 'items' a 'detail'
// //   userId: number;
// //   tenantId: number;
// //   total: number;
// //   payment_type: "cash" | "qr" | "mixed";
// //   shift: string;
// //   created_at: Date;
// //   updated_at: Date;
// //   state: boolean;
// // }

// // export interface Sale {
// //   id_sale: string;
// //   items: { productId: string; name: string; quantity: number; price: number }[];
// //   total: number;
// //   payment_type: 'cash' | 'qr' | 'mixed';
// //   timestamp: string;
// //   shift: string;
// //   id_tenant: string;
// //   created_at: string;
// //   updated_at: string;
// // }
// const SALES_KEY = "sales";
// const DEFAULT_TENANT_ID = 1;
// const DEFAULT_USER_ID = 1;

// // Función para generar ID numérico basado en la colección existente
// function generateNumericId(collection: Sale[]): number {
//   if (collection.length === 0 || collection === null) return 1;
//   const maxId = Math.max(...collection.map((s) => s.saleId));
//   return maxId + 1;
// }

// // Inicialización de datos con la nueva estructura
// function initializeDefaults() {
//   const existingSales = storage.getCollection<Sale>(SALES_KEY);
//   if (existingSales.length === 0) {
//     const defaultSales: Sale[] = [
//       {
//         saleId: 1,
//         userId: DEFAULT_USER_ID,
//         tenantId: DEFAULT_TENANT_ID,
//         detail: [], // Aquí irían los objetos SaleDetail completos
//         total: 60,
//         paymentType: "cash",
//         shift: "Mañana",
//         state: true,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ];
//     storage.setCollection(SALES_KEY, defaultSales);
//   }
// }

// if (typeof window !== "undefined") {
//   initializeDefaults();
// }

// // Sale CRUD
// export async function getSales(): Promise<Sale[]> {
//   return storage.getCollection<Sale>(SALES_KEY);
// }

// export async function getSaleById(id: number): Promise<Sale | null> {
//   // Cambiado a 'saleId' para coincidir con la interfaz
//   return storage.getFromCollection<Sale>(SALES_KEY, id, "saleId");
// }

// export async function getSalesByShift(shift: string): Promise<Sale[]> {
//   const sales = await getSales();
//   return sales.filter((s) => s.shift === shift);
// }

// export async function createSale(
//   sale: Omit<Sale, "saleId" | "createdAt" | "updatedAt">,
// ): Promise<Sale> {
//   const currentSales = storage.getCollection<Sale>(SALES_KEY);
//   const newSale: Sale = {
//     ...sale,
//     saleId: generateNumericId(currentSales),
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };

//   storage.addToCollection(SALES_KEY, newSale, "saleId");
//   return newSale;
// }

// export async function deleteSale(id: number): Promise<boolean> {
//   return storage.removeFromCollection(SALES_KEY, id, "saleId");
// }

// // Analytics Corregidos
// export function getTotalSalesByShift(): Record<string, number> {
//   const sales = storage.getCollection<Sale>(SALES_KEY);
//   const shifts: Record<string, number> = {};

//   sales.forEach((sale) => {
//     if (!shifts[sale.shift]) {
//       shifts[sale.shift] = 0;
//     }
//     shifts[sale.shift] += sale.total;
//   });

//   return shifts;
// }

// export function getTopProducts(limit: number = 5) {
//   const sales = storage.getCollection<Sale>(SALES_KEY);
//   const productMap = new Map<
//     number,
//     { name: string; quantity: number; revenue: number }
//   >();

//   sales.forEach((sale) => {
//     // Cambiado de 'items' a 'detail'
//     sale.detail?.forEach((item) => {
//       if (productMap.has(item.productId)) {
//         const existing = productMap.get(item.productId)!;
//         existing.quantity += item.quantity;
//         existing.revenue += item.price * item.quantity;
//       } else {
//         productMap.set(item.productId, {
//           name: item.name,
//           quantity: item.quantity,
//           revenue: item.price * item.quantity,
//         });
//       }
//     });
//   });

//   return Array.from(productMap.values())
//     .sort((a, b) => b.revenue - a.revenue)
//     .slice(0, limit);
// }

// export function getTotalRevenue(): number {
//   const sales = storage.getCollection<Sale>(SALES_KEY);
//   return sales.reduce((sum, sale) => sum + sale.total, 0);
// }
