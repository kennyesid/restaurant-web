export class DateUtils {
  /**
   * Obtiene la fecha y hora actual adaptada estrictamente a la zona horaria de Bolivia (UTC-4),
   * formateada como una cadena ISO 8601 válida para serializadores de .NET.
   * @returns string Ejemplo: "2026-06-06T14:30:15.123-04:00"
   */
  static obtenerFechaBoliviaISO(): string {
    const ahora = new Date();
    
    // Desfase de Bolivia: 4 horas en milisegundos (4 horas * 60 min * 60 seg * 1000 ms)
    const desfaseBolivia = 4 * 60 * 60 * 1000; 
    const fechaBolivia = new Date(ahora.getTime() - desfaseBolivia);
    
    // Reemplazamos la 'Z' (UTC) por la compensación explícita de Bolivia '-04:00'
    return fechaBolivia.toISOString().replace("Z", "-04:00");
  }

  /**
   * Opcional: Convierte cualquier objeto Date o string de fecha a la zona horaria de Bolivia.
   * @param fechaCualquiera Fecha que se desea convertir
   */
  static formatearABoliviaISO(fechaCualquiera: Date | string): string {
    const fecha = new Date(fechaCualquiera);
    if (isNaN(fecha.getTime())) {
      return new Date().toISOString().replace("Z", "-04:00"); // Fallback seguro
    }
    const desfaseBolivia = 4 * 60 * 60 * 1000;
    const fechaBolivia = new Date(fecha.getTime() - desfaseBolivia);
    return fechaBolivia.toISOString().replace("Z", "-04:00");
  }

  static obtenerTipoFechaBoliviaLocal(): string {
    return new Date().toLocaleDateString("sv-SE", { 
      timeZone: "America/La_Paz" 
    });
  }
}