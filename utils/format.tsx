import { IMAGE_DEFAULT } from "@/lib/constants/constants";

// export const getImageUrl = (url?: string): string => {
//   if (!url) return `data:image/avif;base64,${IMAGE_DEFAULT}`;
//   return url.startsWith('data:') ? url : `data:image/avif;base64,${url}`;
// };

export const getImageUrl = (url?: string): string => {
  // 1. Si no viene nada, retorna la imagen por defecto en Base64
  if (!url) return `data:image/avif;base64,${IMAGE_DEFAULT}`;

  // 2. Si ya viene con cualquier prefijo de data URI, lo dejamos pasar
  if (url.startsWith('data:')) {
    return url;
  }

  // 3. Es una URL válida de internet o una ruta local?
  const isUrlOrPath = url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/') ||
    url.includes('.');

  // 4. Si no es una URL/ruta y parece Base64, le agregamos el prefijo
  if (!isUrlOrPath) {
    return `data:image/avif;base64,${url}`;
  }

  // 5. En caso de ser una URL o ruta estándar, la retornamos directamente
  return url;
};