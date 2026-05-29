import { storage } from "@/lib/storage";
import { CartItem, Product, Sale, RespuestaGenericaDto } from "@/types";

const SALES_KEY = "sales";

function getRandomAprilDate(): Date {
  const day = Math.floor(Math.random() * 30) + 1; // Días del 1 al 30
  const hour = Math.floor(Math.random() * 14) + 8; // Horario laboral entre 08:00 y 22:00
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);

  return new Date(2026, 3, day, hour, minute, second); // Mes 3 es Abril en JS
}

const salesMockData: Sale[] = [];

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

export async function getSales(): Promise<RespuestaGenericaDto<Sale[]>> {
  try {
    let data = storage.getCollection<Sale>(SALES_KEY);

    if (!data || data.length === 0) {
      salesMockData.forEach((sale) => {
        storage.addToCollection(SALES_KEY, sale, "saleId");
      });
      data = storage.getCollection<Sale>(SALES_KEY);
    }

    return responderExito(data);
  } catch (error) {
    return responderFalla("Error al obtener el historial de ventas");
  }
}

export async function getSaleById(
  id: number,
): Promise<RespuestaGenericaDto<Sale>> {
  try {
    const sale = storage.getFromCollection<Sale>(SALES_KEY, id, "id");
    if (!sale) return responderFalla(`Venta #${id} no encontrada`, 404);
    return responderExito(sale);
  } catch (error) {
    return responderFalla("Error al buscar la venta");
  }
}

export async function createSale(
  sale: Omit<Sale, "id" | "createdAt" | "updatedAt">
): Promise<RespuestaGenericaDto<Sale>> {
  try {
    const currentSales = storage.getCollection<Sale>(SALES_KEY);
    const maxId = currentSales.length > 0 ? Math.max(...currentSales.map(s => s.id)) : 0;

    const newSale: Sale = {
      ...sale,
      id: maxId + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    storage.addToCollection(SALES_KEY, newSale, "id");
    return responderExito(newSale, "Venta registrada con éxito");
  } catch (error) {
    return responderFalla("No se pudo procesar la venta");
  }
}

export async function deleteSale(
  id: number,
): Promise<RespuestaGenericaDto<boolean>> {
  try {
    const deleted = storage.removeFromCollection(SALES_KEY, id, "id");
    return deleted 
      ? responderExito(true, "Venta eliminada") 
      : responderFalla("No se encontró la venta para eliminar");
  } catch (error) {
    return responderFalla("Error al intentar eliminar el registro");
  }
}

export async function getTotalSalesByShift(): Promise<
  RespuestaGenericaDto<Record<string, number>>
> {
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

export async function getTopProducts(
  limit: number = 5,
): Promise<RespuestaGenericaDto<any[]>> {
  try {
    const sales = storage.getCollection<Sale>(SALES_KEY);
    const productMap = new Map<
      number,
      { name: string; quantity: number; revenue: number }
    >();

    sales.forEach((sale) => {
      sale.detail?.forEach((item) => {
        if (productMap.has(item.id)) {
          const existing = productMap.get(item.id)!;
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          productMap.set(item.id, {
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

export async function getTotalRevenue(): Promise<RespuestaGenericaDto<number>> {
  try {
    const sales = storage.getCollection<Sale>(SALES_KEY);
    const total = sales.reduce((sum, sale) => sum + sale.total, 0);
    return responderExito(total);
  } catch (error) {
    return responderFalla("Error al calcular ingresos totales");
  }
}
