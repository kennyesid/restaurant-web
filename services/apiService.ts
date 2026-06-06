import { RespuestaGenericaDto } from "@/types";
import axios, { AxiosRequestConfig, AxiosError, Method } from "axios";

export class ApiService {
  /**
   * Método genérico y centralizado para realizar cualquier petición HTTP.
   * * @param method Método HTTP: 'GET' | 'POST' | 'PUT' | 'DELETE', etc.
   * @param url URL o Endpoint al que se le hará la petición.
   * @param data Body para métodos POST/PUT o Params para métodos GET (opcional).
   * @param config Configuraciones adicionales de Axios (cabeceras, etc - opcional).
   */
  static async ejecutar<T>(
    method: Method | string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<RespuestaGenericaDto<T>> {
    try {
      // Configuramos la estructura base de la petición
      const opciones: AxiosRequestConfig = {
        method: method.toUpperCase(),
        url,
        ...config,
      };

      // Si es un GET o DELETE, enviamos los datos como query params
      if (opciones.method === "GET" || opciones.method === "DELETE") {
        opciones.params = data;
      } else {
        // Para POST, PUT, PATCH enviamos los datos en el body
        opciones.data = data;
      }

      // Realizamos la petición con Axios
      const respuesta = await axios(opciones);

      // Retornamos el mapeo exacto a tu interfaz en caso de éxito (Status 2xx)
      return {
        codigo: respuesta.status,
        mensaje: respuesta.statusText || "Operación realizada con éxito",
        contenido: respuesta.data as T,
      };

    } catch (error) {
      console.error(`Error en ApiService [${method.toUpperCase()}] -> ${url}:`, error);

      // Estructuramos el fallo para que nunca rompa el frontend y respete la interfaz
      const axiosError = error as AxiosError<any>;
      
      return {
        codigo: axiosError.response?.status || 500,
        mensaje: axiosError.response?.data?.mensaje || axiosError.message || "Error interno del servidor o de red",
        contenido: null, // Siempre va null si falla
      };
    }
  }

  // ========================================================
  // ATALJOS (MÉTODOS SHORTHAND) PARA MAYOR COMODIDAD
  // ========================================================

  static async get<T>(url: string, params?: any, config?: AxiosRequestConfig) {
    return this.ejecutar<T>("GET", url, params, config);
  }

  static async post<T>(url: string, body?: any, config?: AxiosRequestConfig) {
    return this.ejecutar<T>("POST", url, body, config);
  }

  static async put<T>(url: string, body?: any, config?: AxiosRequestConfig) {
    return this.ejecutar<T>("PUT", url, body, config);
  }

  static async delete<T>(url: string, params?: any, config?: AxiosRequestConfig) {
    return this.ejecutar<T>("DELETE", url, params, config);
  }
}