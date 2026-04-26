/**
 * Configuración centralizada del sistema
 * Evita llamar a process.env directamente en los componentes.
 */
export const EnvConfig = {
    // URL Base de tu API de C#
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    
    // Identificadores globales
    tenantId: Number(process.env.NEXT_PUBLIC_TENANT_ID) || 1,
    
    // Nombre de la App
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'Restaurante App',

    // Entorno actual
    isProduction: process.env.NODE_ENV === 'production',

    testPendejo: process.env.NEXT_PUBLIC_TEST || 'pendejooooosss',
    /**
     * Validador para asegurar que las variables críticas están presentes
     */
    validate() {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          console.warn("⚠️ Advertencia: NEXT_PUBLIC_API_URL no está definida en el .env");
        }
    }
};

// Ejecutamos validación rápida al importar
if (typeof window !== 'undefined') {
    EnvConfig.validate();
}