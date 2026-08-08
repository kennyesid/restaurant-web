import { supabase } from "@/lib/dataBase/supabaseClient"; // Asegúrate de tener configurado tu cliente aquí
import { CartItem, Sale, RespuestaGenericaDto, KitchenPreparationGroup } from "@/types";
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

export async function getAllSalesWithDetailsCombo(): Promise<RespuestaGenericaDto<Sale[]>> {
  try {

    const groupId = configService.getGroupId();

    const { data: sales, error: salesError } = await supabase
      .from("sales")
      .select("*")
      .eq("groupId", groupId)
      .eq("state", true)
      .order("createdAt", { ascending: false });

    if (salesError) throw salesError;

    if (!sales || sales.length === 0) {
      return responderExito([], "Ventas obtenidas con éxito");
    }

    const saleIds = sales.map(s => s.id);

    const { data: comboGroups, error: comboError } = await supabase
      .from("sales_detail_group")
      .select("*")
      .in("saleId", saleIds);

    if (comboError) throw comboError;

    const { data: details, error: detailError } = await supabase
      .from("sales_details")
      .select("*")
      .in("saleId", saleIds);

    if (detailError) throw detailError;

    const comboMap = new Map<number, any>();

    (comboGroups ?? []).forEach(combo => {
      comboMap.set(combo.id, {
        id: combo.productId,
        name: combo.name,
        price: combo.price,
        imageUrl: "",
        categoryId: 6,
        // isPromotion: false,
        // isCountable: false,
        productDetailProduct: [],
        productId: combo.productId,
        quantity: combo.quantity,
        subTotal: combo.subtotal,
        cartItemDetail: [],
        sales_detail_group_id: combo.id,
        saleId: combo.saleId
      });
    });

    (details ?? []).forEach(detail => {
      if (!detail.sales_detail_group_id || detail.sales_detail_group_id === 0)
        return;

      const combo = comboMap.get(detail.sales_detail_group_id);

      if (!combo)
        return;

      let plate = combo.cartItemDetail.find(
        (x: any) => x.id === detail.combosecuencia
      );

      if (!plate) {
        plate = {
          id: detail.combosecuencia,
          cartItemId: combo.productId,
          name: `Plato ${detail.combosecuencia}`,
          price: 0,
          categoryId: combo.categoryId,
          productId: combo.productId,
          quantity: 1,
          modified: detail.modified,
          subTotal: 0,
          modifiedSubtotal: detail.modifiedSubtotal,
          reasonModification: detail.reasonModification,
          orderTypeSend: detail.orderTypeSend,
          // isPromotion: false,
          // isCountable: true,
          imageUrl: "",
          completed: true,
          createdAt: detail.createdAt,
          updatedAt: detail.updatedAt,
          state: detail.state,
          productFittings: [],
          productDetailProduct: [],
        };
        combo.cartItemDetail.push(plate);
      }

      //------------------------------------------------------
      // Agregar producto al plato
      //------------------------------------------------------

      plate.productDetailProduct.push({
        id: detail.id,
        categoryId: detail.categoryId,
        productId: detail.productId,
        name: detail.name,
        description: detail.description,
        legend: detail.legend,
        price: detail.price,
        // isPromotion: detail.isPromotion,
        imageUrl: detail.imageUrl,
        isFeatured: detail.isFeatured,
        isAvailable: true,
        state: detail.state,
        groupId: detail.groupId,
        code: detail.code,
        displayOrder: detail.displayOrder,
        piecesOfChicken: detail.piecesOfChicken,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
        selected: detail.selected,
        productFittings: [],
        // productFittings: updatedProductFittings
      });
    });

    //==============================================================
    // 8. AGRUPAR DETALLES POR VENTA
    //==============================================================

    const detailsBySale = new Map<number, any[]>();

    (details ?? []).forEach(detail => {
      if (!detailsBySale.has(detail.saleId)) {
        detailsBySale.set(detail.saleId, []);
      }
      detailsBySale.get(detail.saleId)!.push(detail);
    });

    //==============================================================
    // 9. AGRUPAR COMBOS POR VENTA
    //==============================================================

    const combosBySale = new Map<number, any[]>();

    Array.from(comboMap.values()).forEach(combo => {

      if (!combosBySale.has(combo.saleId)) {
        combosBySale.set(combo.saleId, []);
      }

      combosBySale.get(combo.saleId)!.push(combo);

    });

    //==============================================================
    // 10. CONSTRUIR RESPUESTA
    //==============================================================

    const formattedSales: Sale[] = sales.map((sale: Sale) => {

      //------------------------------------------
      // Productos normales
      //------------------------------------------

      const normalProducts = (detailsBySale.get(sale.id) ?? [])
        .filter(d => !d.sales_detail_group_id || d.sales_detail_group_id === 0)
        .map((item: CartItem) => {
          return {
            id: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            categoryId: item.categoryId,
            productId: item.productId,
            quantity: item.quantity,
            subTotal: item.price * item.quantity,
            modified: item.modified,
            modifiedSubtotal: item.modifiedSubtotal,
            reasonModification: item.reasonModification,
            // isPromotion: item.isPromotion,
            // isCountable: item.isCountable,
            // selected: item.selected ?? false,
            productFittings: [],
            // productFittings: updatedProductFittings,
            productDetailProduct: [],
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            state: item.state
          };
        });

      const combos = combosBySale.get(sale.id) ?? [];

      const detail = [
        ...combos,
        ...normalProducts
      ];

      return {
        id: sale.id,
        detail,
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
        // shift: sale.shift,
        // table: sale.table,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt
      } as Sale;
    });

    console.log("formattedSales", JSON.stringify(formattedSales));

    return responderExito(
      formattedSales,
      "Ventas obtenidas con éxito"
    );

  } catch (error: any) {

    console.error("❌ Error en getAllSalesWithDetails:", {
      mensaje: error?.message,
      detalles: error?.details,
      codigo: error?.code,
    });

    return responderFalla(
      `Error al obtener las ventas: ${error?.message || "Error de datos"}`
    );

  }
}

export async function getAllSalesWithDetailsComboChef(): Promise<RespuestaGenericaDto<Sale[]>> {
  try {

    const groupId = configService.getGroupId();

    const { data: sales, error: salesError } = await supabase
      .from("sales")
      .select("*")
      .eq("groupId", groupId)
      .eq("orderStatus", 2)
      .eq("state", true)
      .order("createdAt", { ascending: true });

    if (salesError) throw salesError;

    if (!sales || sales.length === 0) {
      return responderExito([], "Ventas obtenidas con éxito");
    }

    const saleIds = sales.map(s => s.id);

    const { data: comboGroups, error: comboError } = await supabase
      .from("sales_detail_group")
      .select("*")
      .in("saleId", saleIds);

    if (comboError) throw comboError;

    const { data: details, error: detailError } = await supabase
      .from("sales_details")
      .select("*")
      .eq("selected", true)
      .in("saleId", saleIds);

    if (detailError) throw detailError;

    const comboMap = new Map<number, any>();

    (comboGroups ?? []).forEach(combo => {
      comboMap.set(combo.id, {
        id: combo.productId,
        name: combo.name,
        price: combo.price,
        imageUrl: "",
        categoryId: 6,
        productDetailProduct: [],
        productId: combo.productId,
        quantity: combo.quantity,
        subTotal: combo.subtotal,
        cartItemDetail: [],
        sales_detail_group_id: combo.id,
        saleId: combo.saleId
      });
    });

    (details ?? []).forEach(detail => {
      if (!detail.sales_detail_group_id || detail.sales_detail_group_id === 0)
        return;

      const combo = comboMap.get(detail.sales_detail_group_id);

      if (!combo)
        return;

      let plate = combo.cartItemDetail.find(
        (x: any) => x.id === detail.combosecuencia
      );

      if (!plate) {
        plate = {
          id: detail.combosecuencia,
          cartItemId: combo.productId,
          // name: `Plato ${detail.combosecuencia}`,
          name: combo.name,
          price: 0,
          categoryId: combo.categoryId,
          productId: combo.productId,
          quantity: 1,
          modified: detail.modified,
          subTotal: 0,
          modifiedSubtotal: detail.modifiedSubtotal,
          reasonModification: detail.reasonModification,
          orderTypeSend: detail.orderTypeSend,
          imageUrl: "",
          completed: true,
          createdAt: detail.createdAt,
          updatedAt: detail.updatedAt,
          state: detail.state,
          productFittings: [],
          productDetailProduct: [],
        };
        combo.cartItemDetail.push(plate);
      }

      plate.productDetailProduct.push({
        id: detail.id,
        categoryId: detail.categoryId,
        productId: detail.productId,
        name: detail.name,
        description: detail.description,
        legend: detail.legend,
        price: detail.price,
        imageUrl: detail.imageUrl,
        isFeatured: detail.isFeatured,
        isAvailable: true,
        state: detail.state,
        groupId: detail.groupId,
        code: detail.code,
        displayOrder: detail.displayOrder,
        piecesOfChicken: detail.piecesOfChicken,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
        selected: detail.selected,
        productFittings: [],
      });
    });

    const detailsBySale = new Map<number, any[]>();

    (details ?? []).forEach(detail => {
      if (!detailsBySale.has(detail.saleId)) {
        detailsBySale.set(detail.saleId, []);
      }
      detailsBySale.get(detail.saleId)!.push(detail);
    });

    const combosBySale = new Map<number, any[]>();

    Array.from(comboMap.values()).forEach(combo => {

      if (!combosBySale.has(combo.saleId)) {
        combosBySale.set(combo.saleId, []);
      }

      combosBySale.get(combo.saleId)!.push(combo);

    });

    const formattedSales: Sale[] = sales.map((sale: Sale) => {

      const normalProducts = (detailsBySale.get(sale.id) ?? [])
        .filter(d => !d.sales_detail_group_id || d.sales_detail_group_id === 0)
        .map((item: CartItem) => {
          return {
            id: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            categoryId: item.categoryId,
            productId: item.productId,
            quantity: item.quantity,
            subTotal: item.price * item.quantity,
            modified: item.modified,
            modifiedSubtotal: item.modifiedSubtotal,
            reasonModification: item.reasonModification,
            productFittings: [],
            productDetailProduct: [],
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            state: item.state
          };
        });

      const combos = combosBySale.get(sale.id) ?? [];

      const detail = [
        ...combos,
        ...normalProducts
      ];

      return {
        id: sale.id,
        detail,
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
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt
      } as Sale;
    });

    console.log("formattedSales", JSON.stringify(formattedSales));

    return responderExito(
      formattedSales,
      "Ventas obtenidas con éxito"
    );
  } catch (error: any) {
    console.error("❌ Error en getAllSalesWithDetails:", {
      mensaje: error?.message,
      detalles: error?.details,
      codigo: error?.code,
    });
    return responderFalla(
      `Error al obtener las ventas: ${error?.message || "Error de datos"}`
    );
  }
}

export async function getAllSalesWithDetailsComboChefById(saleId?: number): Promise<RespuestaGenericaDto<Sale | null>> {
  try {

    const groupId = configService.getGroupId();
    let query = supabase
      .from("sales")
      .select("*")
      .eq("groupId", groupId)
      .eq("orderStatus", 2)
      .eq("state", true);

    if (saleId) {
      query = query.eq("id", saleId);
    } else {
      query = query.order("createdAt", { ascending: false });
    }

    const { data: sales, error: salesError } = await query;

    if (salesError) throw salesError;

    if (!sales || sales.length === 0) {
      return responderExito(null, "Ventas obtenidas con éxito");
    }

    const saleIds = sales.map(s => s.id);

    const { data: comboGroups, error: comboError } = await supabase
      .from("sales_detail_group")
      .select("*")
      .in("saleId", saleIds);

    if (comboError) throw comboError;

    const { data: details, error: detailError } = await supabase
      .from("sales_details")
      .select("*")
      .eq("selected", true)
      .in("saleId", saleIds);

    if (detailError) throw detailError;

    const comboMap = new Map<number, any>();

    (comboGroups ?? []).forEach(combo => {
      comboMap.set(combo.id, {
        id: combo.productId,
        name: combo.name,
        price: combo.price,
        imageUrl: "",
        categoryId: 6,
        productDetailProduct: [],
        productId: combo.productId,
        quantity: combo.quantity,
        subTotal: combo.subtotal,
        cartItemDetail: [],
        sales_detail_group_id: combo.id,
        saleId: combo.saleId
      });
    });

    (details ?? []).forEach(detail => {
      if (!detail.sales_detail_group_id || detail.sales_detail_group_id === 0)
        return;

      const combo = comboMap.get(detail.sales_detail_group_id);

      if (!combo)
        return;

      let plate = combo.cartItemDetail.find(
        (x: any) => x.id === detail.combosecuencia
      );

      if (!plate) {
        plate = {
          id: detail.combosecuencia,
          cartItemId: combo.productId,
          // name: `Plato ${detail.combosecuencia}`,
          name: combo.name,
          price: 0,
          categoryId: combo.categoryId,
          productId: combo.productId,
          quantity: 1,
          modified: detail.modified,
          subTotal: 0,
          modifiedSubtotal: detail.modifiedSubtotal,
          reasonModification: detail.reasonModification,
          orderTypeSend: detail.orderTypeSend,
          imageUrl: "",
          completed: true,
          createdAt: detail.createdAt,
          updatedAt: detail.updatedAt,
          state: detail.state,
          productFittings: [],
          productDetailProduct: [],
        };
        combo.cartItemDetail.push(plate);
      }

      plate.productDetailProduct.push({
        id: detail.id,
        categoryId: detail.categoryId,
        productId: detail.productId,
        name: detail.name,
        description: detail.description,
        legend: detail.legend,
        price: detail.price,
        imageUrl: detail.imageUrl,
        isFeatured: detail.isFeatured,
        isAvailable: true,
        state: detail.state,
        groupId: detail.groupId,
        code: detail.code,
        displayOrder: detail.displayOrder,
        piecesOfChicken: detail.piecesOfChicken,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
        selected: detail.selected,
        productFittings: [],
      });
    });

    const detailsBySale = new Map<number, any[]>();

    (details ?? []).forEach(detail => {
      if (!detailsBySale.has(detail.saleId)) {
        detailsBySale.set(detail.saleId, []);
      }
      detailsBySale.get(detail.saleId)!.push(detail);
    });

    const combosBySale = new Map<number, any[]>();

    Array.from(comboMap.values()).forEach(combo => {

      if (!combosBySale.has(combo.saleId)) {
        combosBySale.set(combo.saleId, []);
      }

      combosBySale.get(combo.saleId)!.push(combo);

    });

    const sale = sales[0];
    const normalProducts = (detailsBySale.get(sale.id) ?? [])
      .filter(d => !d.sales_detail_group_id || d.sales_detail_group_id === 0)
      .map((item: CartItem) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        categoryId: item.categoryId,
        productId: item.productId,
        quantity: item.quantity,
        subTotal: item.price * item.quantity,
        modified: item.modified,
        modifiedSubtotal: item.modifiedSubtotal,
        reasonModification: item.reasonModification,
        productFittings: [],
        productDetailProduct: [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        state: item.state
      }));

    const combos = combosBySale.get(sale.id) ?? [];

    const detail = [
      ...combos,
      ...normalProducts
    ];

    const formattedSale: Sale = {
      id: sale.id,
      detail,
      table: sale.table,
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
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt
    };

    return responderExito(
      formattedSale,
      "Ventas obtenidas con éxito"
    );
  } catch (error: any) {
    console.error("❌ Error en getAllSalesWithDetails:", {
      mensaje: error?.message,
      detalles: error?.details,
      codigo: error?.code,
    });
    return responderFalla(
      `Error al obtener las ventas: ${error?.message || "Error de datos"}`
    );
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
    // const countableItems = detail.filter(item => item.isCountable === true);
    const countableItems = detail;
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
              ...subItemData
            } = subItem;

            // 4b. Insertar en sales_details_details (relacionado con saleDetailId)
            const { data: insertedSubDetail, error: subError } = await supabase
              .from("sales_details_details")
              .insert([{
                ...subItemData,
                saleDetailId, // 👈 Relación con el detail padre
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

export async function createSaleCombo(
  saleData: Omit<Sale, "id" | "createdAt" | "updatedAt">
): Promise<RespuestaGenericaDto<Sale>> {
  try {
    const { detail, ...headerVenta } = saleData;
    const { data: newSale, error: saleError } = await supabase
      .from("sales")
      .insert([headerVenta])
      .select()
      .single();

    if (saleError) throw saleError;
    const saleId = newSale.id;

    const finalDetail: any[] = [];

    for (const item of detail) {

      // ============================================================
      // PRODUCTO TIPO COMBO (ALMUERZO)
      // ============================================================
      // if (item.categoryId === 6) {
      if ((item.cartItemDetail ?? []).length > 0) {

        const flagCategoryCombo = item.categoryId === 6;
        let saleDetailGroupId = 0;


        const { data: groupInserted, error: groupError } = await supabase
          .from("sales_detail_group")
          .insert({
            saleId,
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subTotal
          })
          .select()
          .single();

        if (groupError) throw groupError;
        saleDetailGroupId = groupInserted.id;

        for (let sequence = 0; sequence < (item.cartItemDetail ?? []).length; sequence++) {
          const plate = item.cartItemDetail![sequence];

          if ((plate.productDetailProduct ?? []).length > 0) {
            for (const product of (plate.productDetailProduct ?? [])) {
              const {
                id,
                groupId,
                code,
                displayOrder,
                piecesOfChicken,
                createdAt,
                ...productData
              } = product;

              const { data: insertedDetailCombo, error } = await supabase
                .from("sales_details")
                .insert({
                  saleId,
                  sales_detail_group_id: saleDetailGroupId,
                  combosecuencia: sequence + 1,
                  productId: product.productId,
                  categoryId: product.categoryId,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                  modified: plate.modified,
                  modifiedSubtotal: plate.modifiedSubtotal,
                  reasonModification: plate.reasonModification,
                  orderTypeSend: plate.orderTypeSend,
                  // isPromotion: product.isPromotion,
                  // isCountable: true,
                  imageUrl: product.imageUrl,
                  productFittings: [],
                  selected: product.selected
                });

              if (error) throw error;

              finalDetail.push(insertedDetailCombo);
            }
          }
          else {
            const { data: insertedDetailNoCombo, error: itemError } = await supabase
              .from("sales_details")
              .insert({
                saleId,
                productId: plate.productId,
                categoryId: plate.categoryId,
                name: plate.name,
                price: plate.price,
                quantity: plate.quantity ?? 1,
                modified: plate.modified ?? false,
                modifiedSubtotal: plate.modifiedSubtotal,
                reasonModification: plate.reasonModification,
                orderTypeSend: plate.orderTypeSend,
                // isPromotion: plate.isPromotion ?? false,
                // isCountable: plate.isCountable ?? false,
                imageUrl: item.imageUrl,
                productFittings: [],
                padreDetailId: 0,
                sales_detail_group_id: saleDetailGroupId,
                combosecuencia: sequence + 1,
                selected: true
                // selected: false   REVISAR
              })
              .select()
              .single();

            if (itemError) throw itemError;
            finalDetail.push(insertedDetailNoCombo);
          }
        }
        continue;
      }

      const {
        id: frontId,
        productFittings,
        productDetailProduct,
        cartItemDetail,
        subTotal,
        ...cartItemData
      } = item;

      const { data: insertedDetail, error: itemError } = await supabase
        .from("sales_details")
        .insert({
          ...cartItemData,
          saleId,
          orderTypeSend: item.orderTypeSend,
          selected: true,
          productFittings: []
        })
        .select()
        .single();

      if (itemError) throw itemError;

      finalDetail.push({
        ...insertedDetail
      });

    }

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

export async function updateSaleCombo(
  saleId: number,
  saleData: Omit<Sale, "id" | "createdAt" | "updatedAt">
): Promise<RespuestaGenericaDto<Sale>> {
  try {
    const { detail, ...headerVenta } = saleData;

    // 1. Actualizar cabecera de la venta
    const { data: updatedSale, error: saleError } = await supabase
      .from("sales")
      .update({
        ...headerVenta,
        updatedAt: new Date().toISOString()
      })
      .eq("id", saleId)
      .select()
      .single();

    if (saleError) throw saleError;

    // 2. Eliminar detalles previos de la venta para evitar duplicados
    const { error: deleteDetailsError } = await supabase
      .from("sales_details")
      .delete()
      .eq("saleId", saleId);
    if (deleteDetailsError) throw deleteDetailsError;

    const { error: deleteGroupError } = await supabase
      .from("sales_detail_group")
      .delete()
      .eq("saleId", saleId);
    if (deleteGroupError) throw deleteGroupError;

    // 3. Re-insertar detalles nuevos
    const finalDetail: any[] = [];

    for (const item of detail) {
      if ((item.cartItemDetail ?? []).length > 0) {
        let saleDetailGroupId = 0;

        const { data: groupInserted, error: groupError } = await supabase
          .from("sales_detail_group")
          .insert({
            saleId,
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subTotal
          })
          .select()
          .single();

        if (groupError) throw groupError;
        saleDetailGroupId = groupInserted.id;

        for (let sequence = 0; sequence < (item.cartItemDetail ?? []).length; sequence++) {
          const plate = item.cartItemDetail![sequence];

          if ((plate.productDetailProduct ?? []).length > 0) {
            for (const product of (plate.productDetailProduct ?? [])) {
              const {
                id,
                groupId,
                code,
                displayOrder,
                piecesOfChicken,
                createdAt,
                ...productData
              } = product;

              const { data: insertedDetailCombo, error } = await supabase
                .from("sales_details")
                .insert({
                  saleId,
                  sales_detail_group_id: saleDetailGroupId,
                  combosecuencia: sequence + 1,
                  productId: product.productId,
                  categoryId: product.categoryId,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                  modified: plate.modified,
                  modifiedSubtotal: plate.modifiedSubtotal,
                  reasonModification: plate.reasonModification,
                  orderTypeSend: plate.orderTypeSend,
                  imageUrl: product.imageUrl,
                  productFittings: [],
                  selected: product.selected
                })
                .select()
                .single();

              if (error) throw error;
              finalDetail.push(insertedDetailCombo);
            }
          }
          else {
            const { data: insertedDetailNoCombo, error: itemError } = await supabase
              .from("sales_details")
              .insert({
                saleId,
                productId: plate.productId,
                categoryId: plate.categoryId,
                name: plate.name,
                price: plate.price,
                quantity: plate.quantity ?? 1,
                modified: plate.modified ?? false,
                modifiedSubtotal: plate.modifiedSubtotal,
                reasonModification: plate.reasonModification,
                orderTypeSend: plate.orderTypeSend,
                imageUrl: item.imageUrl,
                productFittings: [],
                padreDetailId: 0,
                sales_detail_group_id: saleDetailGroupId,
                combosecuencia: sequence + 1,
                selected: true
              })
              .select()
              .single();

            if (itemError) throw itemError;
            finalDetail.push(insertedDetailNoCombo);
          }
        }
        continue;
      }

      const {
        id: frontId,
        productFittings,
        productDetailProduct,
        cartItemDetail,
        subTotal,
        ...cartItemData
      } = item;

      const { data: insertedDetail, error: itemError } = await supabase
        .from("sales_details")
        .insert({
          ...cartItemData,
          saleId,
          orderTypeSend: item.orderTypeSend,
          selected: true,
          productFittings: []
        })
        .select()
        .single();

      if (itemError) throw itemError;
      finalDetail.push(insertedDetail);
    }

    const responsePayload: Sale = {
      ...updatedSale,
      detail: finalDetail
    };

    return responderExito(responsePayload, "Venta actualizada con éxito");
  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO DE SUPABASE AL ACTUALIZAR:", error);
    return responderFalla(`No se pudo actualizar la venta: ${error?.message || 'Error de datos'}`);
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
// OBTENER VENTAS PENDIENTES DE LA COCINA (orderStatus = 2)
// ========================================================
// 1. Tipos TypeScript (Interfaces para la respuesta agrupada)

export interface GroupedKitchenItem {
  reasonModification: string | null;
  items: any[]; // Detalles / ítems filtrados que pertenecen a esta modificación
}

export interface GroupedByOrderTypeSend {
  orderTypeSend: string;
  reasons: GroupedKitchenItem[];
}

export interface GroupedKitchenResponse {
  groups: GroupedByOrderTypeSend[];
}

// 2. Método Refactorizado
export async function getSalesInKitchenGrouped(): Promise<RespuestaGenericaDto<GroupedByOrderTypeSend[]>> {
  try {
    const groupId = configService.getGroupId();

    const { data: sales, error } = await supabase
      .from("sales")
      .select(`
        *,
        detail:sales_details(*)
      `)
      .eq("groupId", groupId)
      .eq("state", true)
      .eq("orderStatus", 2)
      .order("createdAt", { ascending: true });

    if (error) throw error;

    const groupedMap = new Map<string, { orderTypeGlobal: string; reasons: Map<string, any[]> }>();

    (sales || []).forEach((sale: any) => {
      const orderTypeGlobal = sale.orderType || "SIN_TIPO";

      (sale.detail || []).forEach((item: any) => {
        if (!item.selected) return;

        const orderTypeSendKey = item.orderTypeSend || "SIN_TIPO";

        if (!groupedMap.has(orderTypeSendKey)) {
          groupedMap.set(orderTypeSendKey, {
            orderTypeGlobal,
            reasons: new Map<string, any[]>(),
          });
        }

        const group = groupedMap.get(orderTypeSendKey)!;

        const reasonKey = item.reasonModification || "SIN_MODIFICACION";

        if (!group.reasons.has(reasonKey)) {
          group.reasons.set(reasonKey, []);
        }

        const formattedItem = {
          id: item.id,
          saleId: sale.id,
          orderNumber: sale.orderNumber,
          userName: sale.userName,
          userCustomerName: sale.userCustomerName,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          categoryId: item.categoryId,
          productId: item.productId,
          productFittings: [],
          productDetailProduct: [],
          isCountable: item.isCountable ?? true,
          reasonModification: item.reasonModification || null,
          modifiedSubtotal: item.modifiedSubtotal,
          subTotal: item.subTotal,
          state: item.state ?? true,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          imageUrl: item.imageUrl,
          description: item.description,
          selected: item.selected,
        };

        group.reasons.get(reasonKey)!.push(formattedItem);
      });
    });

    const formattedAgroupation: GroupedByOrderTypeSend[] = Array.from(groupedMap.entries()).map(
      ([orderTypeSend, group]) => ({
        orderTypeSend,
        orderTypeGlobal: group.orderTypeGlobal,
        reasons: Array.from(group.reasons.entries()).map(([reasonModification, items]) => ({
          reasonModification: reasonModification === "SIN_MODIFICACION" ? null : reasonModification,
          items,
        })),
      })
    );

    return responderExito(
      formattedAgroupation,
      "Ventas de cocina agrupadas por tipo de envío y modificación obtenidas con éxito"
    );
  } catch (error: any) {
    console.error("❌ Error en getSalesInKitchenGrouped:", error);
    return responderFalla(`Error al obtener ventas de cocina: ${error?.message || "Error de datos"}`);
  }
}

export function transformKitchenOrders(sales: any[]) {
  return sales;
}

// export function transformKitchenPreparation(
//   sales: any[]
// ): KitchenPreparationGroup[] {
//   const groups = new Map<string, KitchenPreparationGroup>();

//   for (const sale of sales) {
//     const defaultOrderType = sale.orderType || "PARA MESA";

//     for (const detail of sale.detail) {
//       // CASO 1: Ítems simples sin detalle de sub-platos (ej. Refresco, Pollo al Horno directo)
//       if (!detail.cartItemDetail || detail.cartItemDetail.length === 0) {
//         const orderTypeSend = defaultOrderType;
//         const reason = detail.reasonModification?.trim() || null;

//         // La clave ahora distingue por Tipo de Orden
//         const key = `${orderTypeSend}__${reason ?? "SIN_RAZON"}`;

//         if (!groups.has(key)) {
//           groups.set(key, {
//             orderTypeSend,
//             orderTypeGlobal: sale.orderType,
//             reasons: [],
//           });
//         }

//         const group = groups.get(key)!;
//         let reasonGroup = group.reasons.find(
//           (r) => r.reasonModification === reason
//         );

//         if (!reasonGroup) {
//           reasonGroup = {
//             reasonModification: reason,
//             items: [],
//           };
//           group.reasons.push(reasonGroup);
//         }

//         // Buscamos si el producto ya existe en la lista para agrupar/sumar cantidades
//         const existingItem = reasonGroup.items.find(
//           (i) => i.id === detail.id || (i.productId === detail.productId && i.saleId === sale.id)
//         );

//         if (existingItem) {
//           existingItem.quantity += detail.quantity;
//         } else {
//           reasonGroup.items.push({
//             ...detail,
//             saleId: sale.id,
//             orderNumber: sale.orderNumber,
//             userName: sale.userName,
//             userCustomerName: sale.userCustomerName,
//           });
//         }

//         continue;
//       }

//       // CASO 2: Ítems compuestos (ej. Almuerzo Sábado con cartItemDetail)
//       for (const plate of detail.cartItemDetail) {
//         // Si el plato no define un orderTypeSend específico, hereda el de la Venta
//         const orderTypeSend = plate.orderTypeSend?.trim() || defaultOrderType;
//         const reason = plate.reasonModification?.trim() || null;
//         const key = `${orderTypeSend}__${reason ?? "SIN_RAZON"}`;

//         if (!groups.has(key)) {
//           groups.set(key, {
//             orderTypeSend,
//             orderTypeGlobal: sale.orderType,
//             reasons: [],
//           });
//         }

//         const group = groups.get(key)!;
//         let reasonGroup = group.reasons.find(
//           (r) => r.reasonModification === reason
//         );

//         if (!reasonGroup) {
//           reasonGroup = {
//             reasonModification: reason,
//             items: [],
//           };
//           group.reasons.push(reasonGroup);
//         }

//         for (const product of plate.productDetailProduct) {
//           // Agrupamos por producto dentro de la misma venta y grupo de razones
//           const existingProduct = reasonGroup.items.find(
//             (i) => i.productId === product.productId && i.saleId === sale.id
//           );

//           if (existingProduct) {
//             existingProduct.quantity += plate.quantity;
//           } else {
//             reasonGroup.items.push({
//               ...product,
//               saleId: sale.id,
//               orderNumber: sale.orderNumber,
//               userName: sale.userName,
//               userCustomerName: sale.userCustomerName,
//               quantity: plate.quantity,
//               reasonModification: reason,
//               modifiedSubtotal: plate.modifiedSubtotal,
//             });
//           }
//         }
//       }
//     }
//   }

//   const result = Array.from(groups.values());

//   // Ordenamiento: "PARA LLEVAR" primero
//   result.sort((a, b) => {
//     const isALllevar = a.orderTypeSend?.toUpperCase().includes("LLEVAR");
//     const isBLllevar = b.orderTypeSend?.toUpperCase().includes("LLEVAR");

//     if (isALllevar && !isBLllevar) return -1;
//     if (!isALllevar && isBLllevar) return 1;

//     return (a.orderTypeSend ?? "").localeCompare(b.orderTypeSend ?? "");
//   });

//   return result;
// }

export function transformKitchenPreparation(
  sales: any[]
): KitchenPreparationGroup[] {
  const groups = new Map<string, KitchenPreparationGroup>();
  console.log("sales: ", JSON.stringify(sales));
  for (const sale of sales) {
    for (const detail of sale.detail) {
      if (!detail.cartItemDetail || detail.cartItemDetail.length === 0) {
        const orderTypeSend = "";
        const reason = null;
        const key = `${orderTypeSend}__${reason}`;
        if (!groups.has(key)) {
          groups.set(key, {
            orderTypeSend,
            orderTypeGlobal: sale.orderType,
            reasons: []
          });
        }
        const group = groups.get(key)!;
        let reasonGroup = group.reasons.find(
          r => r.reasonModification === reason
        );
        if (!reasonGroup) {
          reasonGroup = {
            reasonModification: reason,
            items: []
          };
          group.reasons.push(reasonGroup);
        }
        reasonGroup.items.push({
          ...detail,
          saleId: sale.id,
          orderNumber: sale.orderNumber,
          userName: sale.userName,
          userCustomerName: sale.userCustomerName
        });
        continue;
      }
      for (const plate of detail.cartItemDetail) {
        const orderTypeSend = plate.orderTypeSend ?? "";
        const reason = plate.reasonModification?.trim() || null;
        const key = `${orderTypeSend}__${reason}`;
        if (!groups.has(key)) {
          groups.set(key, {
            orderTypeSend,
            orderTypeGlobal: sale.orderType,
            reasons: []
          });
        }
        const group = groups.get(key)!;
        let reasonGroup = group.reasons.find(
          r => r.reasonModification === reason
        );
        if (!reasonGroup) {
          reasonGroup = {
            reasonModification: reason,
            items: []
          };
          group.reasons.push(reasonGroup);
        }
        for (const product of plate.productDetailProduct) {
          const existingItem = reasonGroup.items.find(
            item => item.productId === product.productId
          );
          if (existingItem) {
            existingItem.quantity += plate.quantity;
          } else {
            reasonGroup.items.push({
              ...product,
              saleId: sale.id,
              orderNumber: sale.orderNumber,
              userName: sale.userName,
              userCustomerName: sale.userCustomerName,
              quantity: plate.quantity,
              reasonModification: reason,
              modifiedSubtotal: plate.modifiedSubtotal
            });
          }
        }
        // for (const product of plate.productDetailProduct) {
        //   reasonGroup.items.push({
        //     ...product,
        //     saleId: sale.id,
        //     orderNumber: sale.orderNumber,
        //     userName: sale.userName,
        //     userCustomerName: sale.userCustomerName,
        //     quantity: plate.quantity,
        //     reasonModification: reason,
        //     modifiedSubtotal: plate.modifiedSubtotal
        //   });
        // }
      }
    }
  }

  const result = Array.from(groups.values());

  result.sort((a, b) => {
    if (a.orderTypeSend === "PARA_LLEVAR" && b.orderTypeSend !== "PARA_LLEVAR") {
      return -1;
    }

    if (a.orderTypeSend !== "PARA_LLEVAR" && b.orderTypeSend === "PARA_LLEVAR") {
      return 1;
    }
    return (a.orderTypeSend ?? "").localeCompare(b.orderTypeSend ?? "");
  });
  console.log("transformKitchenPreparation: ", JSON.stringify(result));
  return result;
}

export async function getSalesInKitchen(): Promise<RespuestaGenericaDto<Sale[]>> {
  try {
    const groupId = configService.getGroupId();

    const { data: sales, error } = await supabase
      .from("sales")
      .select(`
    *,
    detail:sales_details(*)
  `)
      .eq("groupId", groupId)
      .eq("state", true)
      .eq("orderStatus", 2)
      .order("createdAt", { ascending: true });

    if (error) throw error;

    const formattedSales = (sales || []).map((sale: any) => {
      const formattedDetail = (sale.detail || []).map((item: any) => {

        const formattedSubDetails = (item.subDetails || []).map((sub: any) => {

          return {
            id: sub.id,
            productId: sub.productId,
            name: sub.name,
            price: sub.price || 0,
            reasonModification: sub.reasonModification || null,
            quantity: sub.quantity || 0,
            productFittings: [],
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
          productFittings: [],
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

    return responderExito(formattedSales as unknown as Sale[], "Ventas de cocina obtenidas con éxito");
  } catch (error: any) {
    console.error("❌ Error en getSalesInKitchen:", error);
    return responderFalla(`Error al obtener ventas de cocina: ${error?.message || 'Error de datos'}`);
  }
}

// ========================================================
// OBTENER UNA VENTA DETALLADA POR ID (PARA REALTIME)
// ========================================================
export async function getSaleWithDetailsById(id: number): Promise<RespuestaGenericaDto<Sale>> {
  try {
    const fitingMasterList = await ProductFittingsService.getAll();

    const { data: sale, error } = await supabase
      .from("sales")
      .select(`
        *,
        detail:sales_details(
          *,
          subDetails:sales_details_details(*)
        )
      `)
      .eq("id", id)
      .eq("state", true)
      .single();

    if (error) throw error;
    if (!sale) return responderFalla(`No se encontró el pedido con ID ${id}`, 404);

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

    const formattedSale: Sale = {
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
      table: sale.table,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };

    return responderExito(formattedSale, "Pedido obtenido con éxito");
  } catch (error: any) {
    console.error("❌ Error en getSaleWithDetailsById:", error);
    return responderFalla(`Error al obtener detalles del pedido: ${error?.message || 'Error de datos'}`);
  }
}

// ========================================================
// ACTUALIZAR ESTADO DEL PEDIDO (orderStatus)
// ========================================================
export async function updateSaleOrderStatus(id: number, orderStatus: number): Promise<RespuestaGenericaDto<boolean>> {
  try {
    const { data, error } = await supabase
      .from("sales")
      .update({ orderStatus, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) throw error;

    return data && data.length > 0
      ? responderExito(true, "Estado de pedido actualizado con éxito")
      : responderFalla("No se encontró el pedido para actualizar", 404);
  } catch (error: any) {
    console.error("❌ Error en updateSaleOrderStatus:", error);
    return responderFalla(`Error al actualizar el estado: ${error?.message || 'Error de base de datos'}`);
  }
}