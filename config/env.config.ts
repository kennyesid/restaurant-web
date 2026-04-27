/**
 * Configuración centralizada del sistema
 * Evita llamar a process.env directamente en los componentes.
 */
export const EnvConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  tenantId: Number(process.env.NEXT_PUBLIC_TENANT_ID) || 1,
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Restaurante App",
  isProduction: process.env.NODE_ENV === "production",
  paddingTop: process.env.NEXT_PUBLIC_PADDING_TOP || 10,
  testPendejo: process.env.NEXT_PUBLIC_TEST || "pendejooooosss",

  /**
   * Validador para asegurar que las variables críticas están presentes
   */
  validate() {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.warn(
        "⚠️ Advertencia: NEXT_PUBLIC_API_URL no está definida en el .env",
      );
    }
  },
};

// Ejecutamos validación rápida al importar
if (typeof window !== "undefined") {
  EnvConfig.validate();
}
