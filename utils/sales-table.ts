import { ApiService } from "./api.service"; // Ajusta tu ruta de ApiService
import { DateUtils } from "@/utils/date.utils"; // Tu clase utilitaria de fecha de Bolivia

/**
 * Calcula el siguiente número de orden diario basado en el histórico de la base de datos.
 * Todo ejecutado en el lado del cliente (Next.js).
 */
const obtenerSiguienteNumeroOrdenDelDia = async (): Promise<int> => {
  try {
    // 1. Consultamos las ventas a tu backend
    // Nota: Si tu API ya implementa paginación u ordenamiento, lo ideal es traer solo la última venta.
    // Si trae todo el listado, usaremos el mapeo sobre el contenido.
    const response = await ApiService.get<any[]>("https://localhost:7175/api/Sales");
    
    // Verificamos que tengamos datos válidos
    const ventas = response.contenido || [];

    if (ventas.length === 0) {
      return 1; // Si no hay registros históricos en la tabla, iniciamos en 1
    }

    // 2. Obtenemos la última venta (asumiendo que vienen ordenadas por ID o fecha, tomamos la última del array)
    const ultimaVenta = ventas[ventas.length - 1];

    // 3. Obtener la fecha actual de Bolivia en formato 'yyyy-MM-dd'
    // Tomamos los primeros 10 caracteres de "YYYY-MM-DDT..." -> "YYYY-MM-DD"
    const fechaActualBolivia = DateUtils.obtenerFechaBoliviaISO().substring(0, 10);

    // 4. Obtener la fecha de creación de la última venta en el mismo formato 'yyyy-MM-dd'
    // Manejamos 'createdAt' o 'createDateAt' según devuelva tu base de datos, limpiando nulos
    const fechaUltimaVentaRaw = ultimaVenta.createdAt || ultimaVenta.createDateAt || "";
    const fechaUltimaVenta = fechaUltimaVentaRaw.substring(0, 10);

    // 5. Comparación de las cadenas 'yyyy-MM-dd'
    if (fechaActualBolivia !== fechaUltimaVenta) {
      // Si las fechas son distintas, significa que cambió el día. Devolvemos 1.
      return 1;
    } else {
      // Si son del mismo día, extraemos el OrderNumber actual, aseguramos que sea número y sumamos +1
      const ultimoOrderNumber = Number(ultimaVenta.orderNumber || 0);
      return ultimoOrderNumber + 1;
    }

  } catch (error) {
    console.error("Error calculando el secuencial de órdenes en el cliente:", error);
    return 1; // Fallback seguro en caso de error de red para no congelar la app
  }
};