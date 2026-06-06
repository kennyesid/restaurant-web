import { supabase } from '@/lib/dataBase/supabaseClient';

interface BaseEntity {
  id: number;
}

export class DatabaseService<T> {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // Obtener todos los registros con orden opcional
async getAll(orderBy: keyof T & string = 'id' as keyof T & string, ascending = true): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order(orderBy, { ascending });


    if (error) {
      console.error(`Error en getAll de la tabla ${this.tableName}:`, error.message);
      throw error;
    }
    return data as T[];
  }

  // Obtener un solo registro por un campo y valor específico (ej: id, 1)
// Obtener un solo registro por un campo y valor específico
async getByField(column: keyof T & string, value: any): Promise<T | null> {
  const { data, error } = await (supabase
    .from(this.tableName) as any)
    .select('*')
    .eq(column as any, value) // 💡 Forzamos 'as any' aquí para calmar el tipado interno de Supabase
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Registro no encontrado
    console.error(`Error en getByField en ${this.tableName} [${column}=${value}]:`, error.message);
    throw error;
  }
  return data as T;
}

  // Crear un nuevo registro
async create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
  const { data, error } = await supabase
    .from(this.tableName)
    // 💡 Casteamos [item] como any[] para saltar la validación estricta de exceso de propiedades de Supabase
    .insert([item] as any) 
    .select()
    .single();

  if (error) {
    console.error(`Error en create de la tabla ${this.tableName}:`, error.message);
    throw error;
  }
  return data as T;
}

  // Actualizar un registro buscando por una columna (ej: id)
  async update(column: keyof T & string, value: any, updates: Partial<Omit<T, 'id'>>): Promise<T | null> {
    const { data, error } = await (supabase
      .from(this.tableName) as any)
      .update(updates as any)
      .eq(column as any, value)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error(`Error en update de la tabla ${this.tableName}:`, error.message);
      throw error;
    }
    return data as T;
  }

  // Eliminar un registro buscando por una columna
  async delete(column: keyof T & string, value: any): Promise<boolean> {
    const { error } = await (supabase
      .from(this.tableName) as any)
      .delete()
      .eq(column as any, value);

    if (error) {
      console.error(`Error en delete de la tabla ${this.tableName}:`, error.message);
      return false;
    }
    return true;
  }
}

export async function uploadProductImage(file: File): Promise<string | null> {
  try {
    // 1. Generamos un nombre único para el archivo para evitar que un usuario pise la foto de otro
    // Ejemplo: "1718234912345-mi-almuerzo.jpg"
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `products/${fileName}`; // Se guardará dentro de una carpeta 'products' en el bucket

    // 2. Subimos el archivo binario directamente al Storage de Supabase
    const { data, error } = await supabase.storage
      .from('product-images') // El nombre del bucket que creaste
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // false evita que se sobreescriban archivos existentes
      });

    if (error) throw error;

    // 3. Obtenemos la URL pública para poder visualizarla en las etiquetas <img src="..." />
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    // Retorna la URL completa: https://hvpizqrjxpjhrywkdwjk.supabase.co/storage/v1/object/public/product-images/products/1718234912345-abc.jpg
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return null;
  }
}