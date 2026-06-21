import { DatabaseService } from "@/lib/dataBase/databaseService";
import { ProductFittings } from "@/types/product/productFittings";
import { configService } from "./configService";

// 1. Instanciamos el servicio genérico pasándole el tipo y el nombre exacto de la tabla
const groupId = configService.getGroupId(); 
const repository = new DatabaseService<ProductFittings>("product_fittings", groupId);

export class ProductFittingsService {
  
  // ========================================================
  // OBTENER TODAS LAS GUARNICIONES
  // ========================================================
  static async getAll(): Promise<ProductFittings[]> {
    try {
      // 1. Obtenemos los registros ordenados por nombre usando el servicio genérico
      const data = await repository.getAll("name", true);

      // 2. Filtramos para devolver solo las que están activas (state === true)
      return data.filter(item => item.state === true);
    } catch (error) {
      console.error("Error en ProductFittingsService.getAll:", error);
      throw error; // Propagamos el error para que lo ataje el controlador o componente
    }
  }

  // ========================================================
  // OBTENER UNA GUARNICIÓN POR ID
  // ========================================================
  static async getById(id: number): Promise<ProductFittings | null> {
    try {
      return await repository.getByField("id", id);
    } catch (error) {
      console.error(`Error en ProductFittingsService.getById [id=${id}]:`, error);
      throw error;
    }
  }
}