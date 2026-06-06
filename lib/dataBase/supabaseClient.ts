import { createClient } from '@supabase/supabase-js';

// 1. Obtenemos las variables de entorno de tu archivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. Control de seguridad: Validamos que las variables existan para evitar errores silenciosos
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el archivo .env.local'
  );
}

// 3. Inicializamos el cliente único que usará toda la aplicación
export const supabase = createClient(supabaseUrl, supabaseAnonKey);