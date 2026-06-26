import { supabase } from "@/lib/dataBase/supabaseClient"; // Asegúrate de tener configurado tu cliente aquí
import { CartItem, Sale, RespuestaGenericaDto } from "@/types";
import { ProductFittingsService } from "./productFittingsService"; // Ajusta la ruta a tu archivo de servicio
import { DateUtils } from "@/utils/date-utils";
import { configService } from "./configService";

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
    const groupId = configService.getGroupId();
    const fitingMasterList = await ProductFittingsService.getAll();

    // 1️⃣ Obtener sales con sus detalles (sales_details)
    const { data: sales, error } = await supabase
      .from("sales")
      .select(`
        *,
        detail:sales_details(*)
      `)
      .eq("groupId", groupId)
      .eq("state", true)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    // 2️⃣ Obtener TODOS los sub-detalles (sales_details_details) en una sola consulta
    const allSaleDetailIds = (sales || []).flatMap(sale => 
      (sale.detail || []).map((d: any) => d.id)
    ).filter(Boolean);

    let subDetailsMap: Record<number, any[]> = {};

    if (allSaleDetailIds.length > 0) {
      const { data: subDetails, error: subError } = await supabase
        .from("sales_details_details")
        .select("*")
        .in("saleDetailId", allSaleDetailIds);

      if (subError) throw subError;

      // 3️⃣ Agrupar sub-detalles por saleDetailId
      subDetailsMap = (subDetails || []).reduce((acc: Record<number, any[]>, sub: any) => {
        if (!acc[sub.saleDetailId]) {
          acc[sub.saleDetailId] = [];
        }
        acc[sub.saleDetailId].push(sub);
        return acc;
      }, {});
    }

    // 4️⃣ Formatear la respuesta final
    const formattedSales = (sales || []).map((sale: any) => {
      const formattedDetail = (sale.detail || []).map((item: any) => {
        // Obtener sub-detalles para este detail
        const subDetails = subDetailsMap[item.id] || [];

        // Procesar fittings del item principal
        const updatedProductFitting = Array.isArray(item.productFittings)
          ? item.productFittings
            .map((fittingId: number) => fitingMasterList.find((f) => f.id === fittingId))
            .filter(Boolean)
          : [];

        // Procesar sub-detalles con sus fittings
        const formattedSubDetails = subDetails.map((sub: any) => {
          const updatedSubFittings = Array.isArray(sub.productFittings)
            ? sub.productFittings
              .map((fittingId: number) => fitingMasterList.find((f) => f.id === fittingId))
              .filter(Boolean)
            : [];

          return {
            ...sub,
            productFittings: updatedSubFittings
          };
        });

        return {
          ...item,
          productFittings: updatedProductFitting,
          productDetailProduct: formattedSubDetails // 👈 Aquí van los sub-detalles
        };
      });

      return {
        ...sale,
        detail: formattedDetail
      };
    });

    return responderExito(formattedSales as unknown as Sale[]);
  } catch (error) {
    console.error("❌ Error en getSales:", error);
    return responderFalla("Error al obtener el historial de ventas");
  }
}

export async function getAllSalesWithDetails(): Promise<RespuestaGenericaDto<Sale[]>> {
  try {
    const groupId = configService.getGroupId();
    const fitingMasterList = await ProductFittingsService.getAll();

// subDetails:sales_details_details!inner(*)

    const { data: sales, error } = await supabase
      .from("sales")
      .select(`
        *,
        detail:sales_details(
          *,
          subDetails:sales_details_details(*)
        )
      `)
      .eq("groupId", groupId)
      .eq("state", true)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    const formattedSales = (sales || []).map((sale: any) => {
      const formattedDetail = (sale.detail || []).map((item: any) => {
        const updatedProductFittings = Array.isArray(item.productFittings)
          ? item.productFittings
            .map((fittingId: number) => fitingMasterList.find((f) => f.id === fittingId))
            .filter(Boolean)
          : [];

        const formattedSubDetails = (item.subDetails || []).map((sub: any) => {
          const updatedSubFittings = Array.isArray(sub.productFittings)
            ? sub.productFittings
              .map((fittingId: number) => fitingMasterList.find((f) => f.id === fittingId))
              .filter(Boolean)
            : [];

          return {
            id: sub.id,
            productId: sub.productId,
            name: sub.name,
            price: sub.price || 0,
            reasonModification: sub.reasonModification || null,
            quantity: sub.quantity || 0,
            productFittings: updatedSubFittings.map((f: any) => f.name),
            state: sub.state ?? true,
            categoryId: sub.categoryId,
            isCountable: sub.isCountable ?? false,
            modifiedSubtotal: sub.modifiedSubtotal,
            createdAt: sub.createdAt,
            updatedAt: sub.updatedAt,
            imageUrl: sub.imageUrl,
            description: sub.description,
          };
        });

        return {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          categoryId: item.categoryId,
          productId: item.productId,
          productFittings: updatedProductFittings.map((f: any) => f.name),
          productDetailProduct: formattedSubDetails, 
          isCountable: item.isCountable ?? true,
          reasonModification: item.reasonModification || null,
          modifiedSubtotal: item.modifiedSubtotal,
          subTotal: item.subTotal,
          state: item.state ?? true,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          imageUrl: item.imageUrl,
          description: item.description,
        };
      });

      // Retornar la venta completa
      return {
        id: sale.id,
        detail: formattedDetail,
        paymentType: sale.paymentType,
        userId: sale.userId,
        groupId: sale.groupId,
        userName: sale.userName,
        userCustomerId: sale.userCustomerId,
        userCustomerName: sale.userCustomerName,
        userDocument: sale.userDocument,
        orderNumber: sale.orderNumber,
        orderStatus: sale.orderStatus,
        tenantId: sale.tenantId,
        state: sale.state,
        total: sale.total,
        amountPaid: sale.amountPaid,
        changeReturned: sale.changeReturned,
        orderType: sale.orderType,
        shift: sale.shift,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
      };
    });

    return responderExito(formattedSales as unknown as Sale[], "Ventas obtenidas con éxito");
  } catch (error: any) {
    console.error("❌ Error en getAllSalesWithDetails:", {
      mensaje: error?.message,
      detalles: error?.details,
      codigo: error?.code,
    });
    return responderFalla(`Error al obtener las ventas: ${error?.message || 'Error de datos'}`);
  }
}

// export async function getSales(): Promise<RespuestaGenericaDto<Sale[]>> {
//   try {
//     const groupId = configService.getGroupId();
//     const fitingMasterList = await ProductFittingsService.getAll();

//     const { data: sales, error } = await supabase
//       .from("sales")
//       .select(`
//         *,
//         detail:sales_details(*)
//       `)
//       .eq("groupId", groupId)
//       .eq("state", true)
//       .order("createdAt", { ascending: false });

//     if (error) throw error;

//     const formattedSales = (sales || []).map((sale: any) => {
//       const formattedDetail = (sale.detail || []).map((item: any) => {
//         const updatedProductFitting = Array.isArray(item.productFitting)
//           ? item.productFitting
//             .map((fittingId: number) => fitingMasterList.find((f) => f.id === fittingId))
//             .filter(Boolean)
//           : [];

//         return {
//           ...item,
//           productFitting: updatedProductFitting
//         };
//       });

//       return {
//         ...sale,
//         detail: formattedDetail
//       };
//     });

//     return responderExito(formattedSales as unknown as Sale[]);
//   } catch (error) {
//     console.error(error);
//     return responderFalla("Error al obtener el historial de ventas");
//   }
// }

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
    const { detail, ...headerVenta } = saleData;
    
    // 1. Insertar cabecera de la venta
    const { data: newSale, error: saleError } = await supabase
      .from("sales")
      .insert([headerVenta])
      .select()
      .single();

    if (saleError) throw saleError;
    const saleId = newSale.id;

    const finalDetail: any[] = [];

    // 2. Filtrar SOLO los items con isCountable: true
    const countableItems = detail.filter(item => item.isCountable === true);

    if (countableItems && countableItems.length > 0) {
      for (const item of countableItems) {
        // 3. Procesar item principal (sales_details)
        const { 
          id: frontId, 
          productFittings, 
          productDetailProduct, 
          ...cartItemData 
        } = item;

        // Transformar fittings a array de IDs
        const fittingIds = Array.isArray(productFittings)
          ? productFittings.map((f: any) => (typeof f === 'object' ? f.id : f)).filter(Boolean)
          : [];

        // Insertar en sales_details
        const { data: insertedDetail, error: itemError } = await supabase
          .from("sales_details")
          .insert([{
            ...cartItemData,
            saleId,
            productFittings: fittingIds
          }])
          .select()
          .single();

        if (itemError) throw itemError;

        const saleDetailId = insertedDetail.id;

        // 4. Procesar productDetailProduct (sub-items) - SOLO si existe y tiene elementos
        const detailProducts = Array.isArray(productDetailProduct) 
          ? productDetailProduct.filter(p => p && Object.keys(p).length > 0) 
          : [];

        const insertedSubDetails: any[] = [];

        if (detailProducts.length > 0) {
          for (const subItem of detailProducts) {
            // 4a. Extraer datos del sub-item
            const { 
              id: subFrontId,
              productFittings: subFittings,
              ...subItemData 
            } = subItem;

            // Transformar fittings del sub-item a array de IDs
            const subFittingIds = Array.isArray(subFittings)
              ? subFittings.map((f: any) => (typeof f === 'object' ? f.id : f)).filter(Boolean)
              : [];

            // 4b. Insertar en sales_details_details (relacionado con saleDetailId)
            const { data: insertedSubDetail, error: subError } = await supabase
              .from("sales_details_details")
              .insert([{
                ...subItemData,
                saleDetailId, // 👈 Relación con el detail padre
                productFittings: subFittingIds
              }])
              .select()
              .single();

            if (subError) throw subError;
            insertedSubDetails.push(insertedSubDetail);
          }
        }

        // 5. Armar el objeto final con su detalle y sub-detalles
        finalDetail.push({
          ...insertedDetail,
          productDetailProduct: insertedSubDetails // 👈 Los sub-items guardados
        });
      }
    }

    // 6. Construir respuesta
    const responsePayload: Sale = {
      ...newSale,
      detail: finalDetail
    };

    return responderExito(responsePayload, "Venta registrada con éxito");
  } catch (error: any) {
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

// export async function createSale(
//   saleData: Omit<Sale, "id" | "createdAt" | "updatedAt">
// ): Promise<RespuestaGenericaDto<Sale>> {
//   try {
//     const { detail, ...headerVenta } = saleData;
//     const { data: newSale, error: saleError } = await supabase
//       .from("sales")
//       .insert([headerVenta])
//       .select()
//       .single();

//     if (saleError) throw saleError;
//     const saleId = newSale.id;

//     // const finalDetail: CartItem[] = [];
//     const finalDetail: any[] = [];

//     if (detail && detail.length > 0) {
//       for (const item of detail) {
//         // 1. Extraemos los campos que no van directo al spread o necesitan transformación
//         const { id: frontId, productFittings, productDetailProduct, ...cartItemData } = item;

//         // 2. Transformamos la lista de objetos de guarniciones en un array limpio de IDs numéricos [2, 3]
//         const fittingIds = Array.isArray(productFittings)
//           ? productFittings.map((f: any) => (typeof f === 'object' ? f.id : f)).filter(Boolean)
//           : [];

//         // 3. Insertamos directamente todo el producto aplanado en "sales_details"
//         const { data: insertedDetail, error: itemError } = await supabase
//           .from("sales_details")
//           .insert([{
//             ...cartItemData,
//             saleId,
//             productFittings: fittingIds // Guardamos el array de enteros [2, 3] directo en la columna
//           }])
//           .select()
//           .single();

//         if (itemError) throw itemError;

//         // 4. Agregamos el registro procesado al array de respuesta
//         finalDetail.push(insertedDetail);
//       }
//     }

//     const responsePayload: Sale = {
//       ...newSale,
//       detail: finalDetail
//     };

//     return responderExito(responsePayload, "Venta registrada con éxito");
//   } catch (error: any) {
//     console.error("❌ ERROR CRÍTICO DE SUPABASE:", {
//       mensaje: error?.message,
//       detalles: error?.details,
//       pista: error?.hint,
//       codigo: error?.code,
//       objetoCompleto: error
//     });

//     return responderFalla(`No se pudo procesar la venta: ${error?.message || 'Error de datos'}`);
//   }
// }

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
// export async function getTotalSalesByShift(): Promise<RespuestaGenericaDto<Record<string, number>>> {
//   try {
//     // Traemos solo las columnas necesarias para no sobrecargar ancho de banda
//     const { data: sales, error } = await supabase
//       .from("sales")
//       .select("shift, total")
//       .eq("state", true);

//     if (error) throw error;

//     const shifts: Record<string, number> = {};
//     sales.forEach((sale) => {
//       const shiftName = sale.shift || "Sin Turno";
//       if (!shifts[shiftName]) shifts[shiftName] = 0;
//       shifts[shiftName] += Number(sale.total);
//     });

//     return responderExito(shifts);
//   } catch (error) {
//     console.error(error);
//     return responderFalla("Error al calcular ventas por turno");
//   }
// }

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
    const groupId = configService.getGroupId();
    const { data: sales, error } = await supabase
      .from("sales")
      .select("total")
      .eq("groupId", groupId)
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
    const groupId = configService.getGroupId();
    const { data, error } = await supabase
      .from('sales')
      .select('orderNumber, createdAt')
      .eq("groupId", groupId)
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

// ========================================================
// MÉTRICA: VENTAS POR USUARIO (userDocument)
// ========================================================
// export async function getSalesByUserDocument(): Promise<RespuestaGenericaDto<{ userDocument: string; count: number; totalAmount: number; userName?: string }[]>> {
//   try {
//     const groupId = configService.getGroupId();

//     const { data: sales, error } = await supabase
//       .from("sales")
//       .select("userDocument, total, userName")
//       .eq("groupId", groupId)
//       .eq("state", true);

//     if (error) throw error;

//     // Agrupar por userDocument
//     const userMap = new Map<string, {
//       userDocument: string;
//       count: number;
//       totalAmount: number;
//       userName?: string
//     }>();

//     (sales || []).forEach((sale) => {
//       const doc = sale.userDocument || "SIN_DOCUMENTO";
//       const total = Number(sale.total) || 0;

//       if (userMap.has(doc)) {
//         const existing = userMap.get(doc)!;
//         existing.count += 1;
//         existing.totalAmount += total;
//         // Si no tiene nombre, intentar asignar el primero que aparezca
//         if (!existing.userName && sale.userName) {
//           existing.userName = sale.userName;
//         }
//       } else {
//         userMap.set(doc, {
//           userDocument: doc,
//           count: 1,
//           totalAmount: total,
//           userName: sale.userName || undefined
//         });
//       }
//     });

//     const result = Array.from(userMap.values())
//       .sort((a, b) => b.count - a.count); // Ordenar por cantidad descendente

//     return responderExito(result);
//   } catch (error) {
//     console.error(error);
//     return responderFalla("Error al obtener ventas por usuario");
//   }
// }

// Cantidad total de ventas
// export async function getTotalSalesCount(): Promise<RespuestaGenericaDto<number>> {
//   try {
//     const groupId = configService.getGroupId();

//     const { count, error } = await supabase
//       .from("sales")
//       .select("*", { count: "exact", head: true })
//       .eq("groupId", groupId)
//       .eq("state", true);

//     if (error) throw error;

//     return responderExito(count || 0);
//   } catch (error) {
//     console.error(error);
//     return responderFalla("Error al obtener el total de ventas");
//   }
// }