export interface RespuestaGenericaDto<T> {
  codigo: number;
  mensaje: string;
  contenido: T | null;
}