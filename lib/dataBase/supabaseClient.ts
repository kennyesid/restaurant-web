import { createClient } from '@supabase/supabase-js';

// ROJO ROJO CAMBIAR DESPUES DE LAS PRUEBAS A ESTO
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = "https://uzhyjvqftsyqdpvkoxji.supabase.co";
const supabaseAnonKey = "sb_publishable_NhxXZg4zO9TjhY_fAOHMCg_ZaAPuW4G";

// 2. Control de seguridad: Validamos que las variables existan para evitar errores silenciosos
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el archivo .env.local'
  );
}

// 3. Inicializamos el cliente único que usará toda la aplicación
export const supabase = createClient(supabaseUrl, supabaseAnonKey);