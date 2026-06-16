import { supabase } from "@/lib/dataBase/supabaseClient"; // Asegúrate de tener configurado tu cliente aquí
import { CartItem, Sale, RespuestaGenericaDto } from "@/types";
import { ProductFittingsService } from "./productFittingsService"; // Ajusta la ruta a tu archivo de servicio
import { DateUtils } from "@/utils/date-utils";

const responderExito = <T>(
  contenido: T,
  mensaje = "Operación exitosa",
): RespuestaGenericaDto<T> => ({
  codigo: 200,
  mensaje,
  contenido,
});

const responderFalla = <T>(
  mensaje: string,
  codigo = 400,
): RespuestaGenericaDto<T> => ({
  codigo,
  mensaje,
  contenido: null,
});

// ========================================================
// OBTENER TODAS LAS VENTAS (CON SU DETALLE COMPLETO)
// ========================================================

export async function getSales(): Promise<RespuestaGenericaDto<Sale[]>> {
  try {
    // 1. Obtenemos la lista limpia de guarniciones activas desde el nuevo servicio
    const fitingMasterList = await ProductFittingsService.getAll();

    // 2. Traemos todas las ventas con su detalle plano de la base de datos

    const { data: sales, error } = await supabase
      .from("sales")
      .select(`
        *,
        detail:sales_details(*)
      `)
      .eq("state", true)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    // 3. Recorremos el historial e hidratamos los IDs de cada detalle
    const formattedSales = (sales || []).map((sale: any) => {
      const formattedDetail = (sale.detail || []).map((item: any) => {
        // Mapeamos el array de enteros de la base de datos a los objetos completos
        const updatedProductFitting = Array.isArray(item.productFitting)
          ? item.productFitting
              .map((fittingId: number) => fitingMasterList.find((f) => f.id === fittingId))
              .filter(Boolean) // Limpia nulos por si algún ID ya no existiera
          : [];

        return {
          ...item,
          productFitting: updatedProductFitting // Inyectamos el array de objetos completos
        };
      });

      return {
        ...sale,
        detail: formattedDetail
      };
    });

    // 4. Retornamos la respuesta exitosa con la estructura que el frontend espera
    return responderExito(formattedSales as unknown as Sale[]);
  } catch (error) {
    console.error(error);
    return responderFalla("Error al obtener el historial de ventas");
  }
}

// ========================================================
// OBTENER UNA VENTA POR ID
// ========================================================
export async function getSaleById(id: number): Promise<RespuestaGenericaDto<Sale>> {
  try {
    const { data: sale, error } = await supabase
      .from("sales")
      .select(`
        *,
        detail:sales_details!saleId (*)
      `)
      .eq("id", id)
      .eq("state", true)
      .single();

    if (error) return responderFalla(`Venta #${id} no encontrada`, 404);

    return responderExito(sale as unknown as Sale);
  } catch (error) {
    console.error(error);
    return responderFalla("Error al buscar la venta");
  }
}

// ========================================================
// CREAR UNA VENTA (CON OPERACIONES EN CASCADA MANUAL)
// ========================================================
export async function createSale(
  saleData: Omit<Sale, "id" | "createdAt" | "updatedAt">
): Promise<RespuestaGenericaDto<Sale>> {
  try {
    console.log("saleData", JSON.stringify(saleData));
    const { detail, ...headerVenta } = saleData;

    // 1. Insertar la cabecera de la venta (Sales)
    const { data: newSale, error: saleError } = await supabase
      .from("sales")
      .insert([headerVenta])
      .select()
      .single();

    if (saleError) throw saleError;
    const saleId = newSale.id;

    // const finalDetail: CartItem[] = [];
    const finalDetail: any[] = [];

    if (detail && detail.length > 0) {
    for (const item of detail) {
      // 1. Extraemos los campos que no van directo al spread o necesitan transformación
      const { id: frontId, productFittings, productDetailProduct, ...cartItemData } = item;

      // 2. Transformamos la lista de objetos de guarniciones en un array limpio de IDs numéricos [2, 3]
      const fittingIds = Array.isArray(productFittings)
        ? productFittings.map((f: any) => (typeof f === 'object' ? f.id : f)).filter(Boolean)
        : [];

      // 3. Insertamos directamente todo el producto aplanado en "sales_details"
      const { data: insertedDetail, error: itemError } = await supabase
        .from("sales_details")
        .insert([{ 
          ...cartItemData, 
          saleId,
          productFittings: fittingIds // Guardamos el array de enteros [2, 3] directo en la columna
        }]) 
        .select()
        .single();

      if (itemError) throw itemError;

      // 4. Agregamos el registro procesado al array de respuesta
      finalDetail.push(insertedDetail);
    }
  }

    const responsePayload: Sale = {
      ...newSale,
      detail: finalDetail
    };

    return responderExito(responsePayload, "Venta registrada con éxito");
  } catch (error: any) {
    // 👇 ESTO ES CLAVE: Obliga al navegador a imprimir el mensaje directo sin colapsarlo como Object
    console.error("❌ ERROR CRÍTICO DE SUPABASE:", {
      mensaje: error?.message,
      detalles: error?.details,
      pista: error?.hint,
      codigo: error?.code,
      objetoCompleto: error
    });
    
    return responderFalla(`No se pudo procesar la venta: ${error?.message || 'Error de datos'}`);
  }
}

// ========================================================
// ELIMINACIÓN LÓGICA (UPDATE state = false)
// ========================================================
export async function deleteSale(id: number): Promise<RespuestaGenericaDto<boolean>> {
  try {
    // Hacemos un soft delete cambiando el estado a false
    const { data, error } = await supabase
      .from("sales")
      .update({ state: false, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) throw error;

    return data && data.length > 0
      ? responderExito(true, "Venta eliminada con éxito")
      : responderFalla("No se encontró la venta para eliminar", 404);
  } catch (error) {
    console.error(error);
    return responderFalla("Error al intentar eliminar el registro");
  }
}

// ========================================================
// MÉTRICA: TOTAL DE VENTAS POR TURNO
// ========================================================
export async function getTotalSalesByShift(): Promise<RespuestaGenericaDto<Record<string, number>>> {
  try {
    // Traemos solo las columnas necesarias para no sobrecargar ancho de banda
    const { data: sales, error } = await supabase
      .from("sales")
      .select("shift, total")
      .eq("state", true);

    if (error) throw error;

    const shifts: Record<string, number> = {};
    sales.forEach((sale) => {
      const shiftName = sale.shift || "Sin Turno";
      if (!shifts[shiftName]) shifts[shiftName] = 0;
      shifts[shiftName] += Number(sale.total);
    });

    return responderExito(shifts);
  } catch (error) {
    console.error(error);
    return responderFalla("Error al calcular ventas por turno");
  }
}

// ========================================================
// MÉTRICA: RANKING DE PRODUCTOS MÁS VENDIDOS
// ========================================================
export async function getTopProducts(limit: number = 5): Promise<RespuestaGenericaDto<any[]>> {
  try {
    // Obtenemos directamente los items de los carritos de ventas activas
    const { data: items, error } = await supabase
      .from("cart_items")
      .select("name, quantity, price, sales!inner(state)")
      .eq("sales.state", true);

    if (error) throw error;

    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    items.forEach((item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity); 

      if (productMap.has(item.name)) {
        const existing = productMap.get(item.name)!;
        existing.quantity += quantity;
        existing.revenue += price * quantity;
      } else {
        productMap.set(item.name, {
          name: item.name,
          quantity: quantity,
          revenue: price * quantity,
        });
      }
    });

    const result = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return responderExito(result);
  } catch (error) {
    console.error(error);
    return responderFalla("Error al generar ranking de productos");
  }
}

// ========================================================
// MÉTRICA: INGRESOS TOTALES
// ========================================================
export async function getTotalRevenue(): Promise<RespuestaGenericaDto<number>> {
  try {
    const { data: sales, error } = await supabase
      .from("sales")
      .select("total")
      .eq("state", true);

    if (error) throw error;

    const total = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    return responderExito(total);
  } catch (error) {
    console.error(error);
    return responderFalla("Error al calcular ingresos totales");
  }
}

export async function obtenerSiguienteOrdenDiariaSupabase(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('sales') 
      .select('orderNumber, createdAt') 
      .order('id', { ascending: false }) 
      .limit(1); 

    console.log('data', data);
    console.log('error', error);

    if (error) throw error;

    const fechaActualBolivia = DateUtils.obtenerFechaBoliviaISO().substring(0, 10);

    if (!data || data.length === 0) {
      return 1;
    }

    const ultimaVenta = data[0];

    const fechaUltimaVenta = ultimaVenta.createdAt 
      ? ultimaVenta.createdAt.substring(0, 10) 
      : "";

    // 5. Comparación lógica
    if (fechaActualBolivia !== fechaUltimaVenta) {
      // Si las fechas son diferentes, es el primer pedido de un nuevo día. Reseteamos a 1.
      return 1;
    } else {
      // Si estamos en el mismo día, incrementamos el último número de orden en +1
      const ultimoNumero = Number(ultimaVenta.orderNumber || 0);
      return ultimoNumero + 1;
    }

  } catch (error: any) {
    console.error("Error al calcular el número de orden diario en Supabase:", error.message);
    // Fallback seguro: si falla la red, devolvemos 1 para no congelar la experiencia del cliente
    return 1; 
  }
}

//  INICIO

// import { storage } from "@/lib/storage";
// import { CartItem, Product, Sale, RespuestaGenericaDto } from "@/types";

// const SALES_KEY = "sales";

// function getRandomAprilDate(): Date {
//   const day = Math.floor(Math.random() * 30) + 1; // Días del 1 al 30
//   const hour = Math.floor(Math.random() * 14) + 8; // Horario laboral entre 08:00 y 22:00
//   const minute = Math.floor(Math.random() * 60);
//   const second = Math.floor(Math.random() * 60);

//   return new Date(2026, 3, day, hour, minute, second); // Mes 3 es Abril en JS
// }

// const salesMockData: Sale[] = [];

// const responderExito = <T>(
//   contenido: T,
//   mensaje = "Operación exitosa",
// ): RespuestaGenericaDto<T> => ({
//   codigo: 200,
//   mensaje,
//   contenido,
// });

// const responderFalla = <T>(
//   mensaje: string,
//   codigo = 400,
// ): RespuestaGenericaDto<T> => ({
//   codigo,
//   mensaje,
//   contenido: null,
// });

// export async function getSales(): Promise<RespuestaGenericaDto<Sale[]>> {
//   try {
//     let data = storage.getCollection<Sale>(SALES_KEY);

//     if (!data || data.length === 0) {
//       salesMockData.forEach((sale) => {
//         storage.addToCollection(SALES_KEY, sale, "saleId");
//       });
//       data = storage.getCollection<Sale>(SALES_KEY);
//     }

//     return responderExito(data);
//   } catch (error) {
//     return responderFalla("Error al obtener el historial de ventas");
//   }
// }

// export async function getSaleById(
//   id: number,
// ): Promise<RespuestaGenericaDto<Sale>> {
//   try {
//     const sale = storage.getFromCollection<Sale>(SALES_KEY, id, "id");
//     if (!sale) return responderFalla(`Venta #${id} no encontrada`, 404);
//     return responderExito(sale);
//   } catch (error) {
//     return responderFalla("Error al buscar la venta");
//   }
// }

// export async function createSale(
//   sale: Omit<Sale, "id" | "createdAt" | "updatedAt">
// ): Promise<RespuestaGenericaDto<Sale>> {
//   try {
//     const currentSales = storage.getCollection<Sale>(SALES_KEY);
//     const maxId = currentSales.length > 0 ? Math.max(...currentSales.map(s => s.id)) : 0;

//     const newSale: Sale = {
//       ...sale,
//       id: maxId + 1,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     storage.addToCollection(SALES_KEY, newSale, "id");
//     return responderExito(newSale, "Venta registrada con éxito");
//   } catch (error) {
//     return responderFalla("No se pudo procesar la venta");
//   }
// }

// export async function deleteSale(
//   id: number,
// ): Promise<RespuestaGenericaDto<boolean>> {
//   try {
//     const deleted = storage.removeFromCollection(SALES_KEY, id, "id");
//     return deleted 
//       ? responderExito(true, "Venta eliminada") 
//       : responderFalla("No se encontró la venta para eliminar");
//   } catch (error) {
//     return responderFalla("Error al intentar eliminar el registro");
//   }
// }

// export async function getTotalSalesByShift(): Promise<
//   RespuestaGenericaDto<Record<string, number>>
// > {
//   try {
//     const sales = storage.getCollection<Sale>(SALES_KEY);
//     const shifts: Record<string, number> = {};

//     sales.forEach((sale) => {
//       const shiftName = sale.shift || "Sin Turno";
//       if (!shifts[shiftName]) {
//         shifts[shiftName] = 0;
//       }
//       shifts[shiftName] += sale.total;
//     });

//     return responderExito(shifts);
//   } catch (error) {
//     return responderFalla("Error al calcular ventas por turno");
//   }
// }

// export async function getTopProducts(
//   limit: number = 5,
// ): Promise<RespuestaGenericaDto<any[]>> {
//   try {
//     const sales = storage.getCollection<Sale>(SALES_KEY);
//     const productMap = new Map<
//       number,
//       { name: string; quantity: number; revenue: number }
//     >();

//     sales.forEach((sale) => {
//       sale.detail?.forEach((item) => {
//         if (productMap.has(item.id)) {
//           const existing = productMap.get(item.id)!;
//           existing.quantity += item.quantity;
//           existing.revenue += item.price * item.quantity;
//         } else {
//           productMap.set(item.id, {
//             name: item.name,
//             quantity: item.quantity,
//             revenue: item.price * item.quantity,
//           });
//         }
//       });
//     });

//     const result = Array.from(productMap.values())
//       .sort((a, b) => b.revenue - a.revenue)
//       .slice(0, limit);

//     return responderExito(result);
//   } catch (error) {
//     return responderFalla("Error al generar ranking de productos");
//   }
// }

// export async function getTotalRevenue(): Promise<RespuestaGenericaDto<number>> {
//   try {
//     const sales = storage.getCollection<Sale>(SALES_KEY);
//     const total = sales.reduce((sum, sale) => sum + sale.total, 0);
//     return responderExito(total);
//   } catch (error) {
//     return responderFalla("Error al calcular ingresos totales");
//   }
// }
