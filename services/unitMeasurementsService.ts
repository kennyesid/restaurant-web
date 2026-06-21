import { DatabaseService } from '@/lib/dataBase/databaseService';
import { UnitMeasurement } from '@/types';

// The unit_measurements table uses camelCase columns (e.g. groupId),
// so we initialize DatabaseService with hasGroupId = true and default group 1.
const unitMeasurementService = new DatabaseService<UnitMeasurement>('unit_measurements', 1, true);

/**
 * Obtener todas las unidades de medida activas
 */
export async function getUnitMeasurements(): Promise<UnitMeasurement[]> {
  try {
    return await unitMeasurementService.getAll('name', true);
  } catch (error) {
    console.error('Error al obtener unidades de medida:', error);
    return [];
  }
}
