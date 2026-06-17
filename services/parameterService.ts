import { DatabaseService } from "@/lib/dataBase/databaseService"; // Ajusta la ruta a tu clase base

// 💡 Definimos la interfaz exacta según tu esquema de PostgreSQL
export interface ParameterEntity {
  id: number;
  groupKey: string;
  code: string;
  value: string;
  name: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  state: boolean;
}

export class ParameterService {
  private databaseService: DatabaseService<ParameterEntity>;

  constructor() {
    // Inicializamos el servicio genérico apuntando estrictamente a la tabla 'parameters'
    this.databaseService = new DatabaseService<ParameterEntity>("parameters");
  }

  /**
   * Obtiene un parámetro completo buscando por su código único (ej: 'API_PRINT_URL')
   */
  async obtenerPorCodigo(code: string): Promise<ParameterEntity | null> {
    try {
      // Reutiliza tu método genérico 'getByField' buscando en la columna 'code'
      const parametro = await this.databaseService.getByField("code", code);
      return parametro;
    } catch (error) {
      console.error(
        `[ParameterService] Error al obtener el código ${code}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Método directo y utilitario para obtener solo el texto de la columna 'description'
   * (Donde guardamos la URL de la ticketera) pasando un valor por defecto si no existe.
   */
  async obtenerValorUrl(code: string, urlPorDefecto: string): Promise<string> {
    const parametro = await this.obtenerPorCodigo(code);

    // Si el parámetro existe, está activo y tiene contenido en description, lo devuelve
    if (parametro && parametro.state && parametro.description) {
      return parametro.description;
    }

    // Si pasa algo, usamos el fallback seguro (localhost)
    return urlPorDefecto;
  }

  /**
   * Obtiene todos los parámetros que pertenezcan a una misma agrupación (ej: 'IMPRESION')
   */
  async obtenerPorGrupo(groupKey: string): Promise<ParameterEntity[]> {
    try {
      // Como getAll trae todo, filtramos en memoria los que correspondan al grupo y estén activos
      const todos = await this.databaseService.getAll("sortOrder", true);
      return todos.filter((p) => p.groupKey === groupKey && p.state);
    } catch (error) {
      console.error(
        `[ParameterService] Error al obtener el grupo ${groupKey}:`,
        error,
      );
      return [];
    }
  }
}

// Exportamos una instancia única (Singleton) para no recrearla en cada importación
export const parameterService = new ParameterService();
