// lib/imageOptimizer.ts

/**
 * Redimensiona y convierte una imagen a WebP (base64)
 * @param file Archivo de imagen original
 * @param maxWidth Ancho máximo en píxeles (mantiene proporción)
 * @param quality Calidad WebP (0-1)
 * @returns Promise<string> base64 de la imagen optimizada
 */
export const optimizeAndConvertToWebP = (
  file: File,
  maxWidth: number = 800,
  quality: number = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 1. Leer el archivo original
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        // 2. Calcular nuevas dimensiones manteniendo aspect ratio
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // 3. Crear canvas y dibujar imagen redimensionada
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto 2D'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // 4. Convertir a WebP (base64)
        const webpBase64 = canvas.toDataURL('image/webp', quality);
        resolve(webpBase64);
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
  });
};