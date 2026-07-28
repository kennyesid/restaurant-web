import { ParameterEntity } from "./parameterService";

// lib/configService.ts
class ConfigService {
  private static instance: ConfigService;
  private _groupId: number = 1; 
  private _parameters: ParameterEntity[] = []; // ← Nuevo: almacena la lista completa
  private _parametersMap: Map<string, ParameterEntity> = new Map(); 

  private constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public setGroupId(groupId: number) {
    this._groupId = groupId;
  }

  public getGroupId(): number {
    return this._groupId;
  }

  public clearGroupId() {
    this._groupId = 0; 
  }

  /**
   * Carga la lista de parámetros y la guarda en memoria.
   * Llama a este método al inicio de la aplicación o después de cambiar de grupo.
   */
  public loadParameters(parameters: ParameterEntity[]): void {
    this._parameters = parameters;
    // Construir mapa para búsqueda rápida por código (case-insensitive)
    this._parametersMap.clear();
    for (const param of parameters) {
      this._parametersMap.set(param.code.toLowerCase(), param);
    }
  }

  /**
   * Obtiene todos los parámetros del grupo actual.
   */
  public getParameters(): ParameterEntity[] {
    return this._parameters;
  }

  /**
   * Obtiene un parámetro por su código (case-insensitive).
   * Retorna undefined si no existe.
   */
  public getParameterByCode(code: string): ParameterEntity | undefined {
    return this._parametersMap.get(code.toLowerCase());
  }

  /**
   * Obtiene el valor de un parámetro por su código.
   * Retorna el valor o null si no existe.
   */
  public getParameterValue(code: string): string | null {
    return this._parametersMap.get(code.toLowerCase())?.value ?? null;
  }

  /**
   * Obtiene los parámetros filtrados por groupKey.
   */
  public getParametersByGroupKey(groupKey: string): ParameterEntity[] {
    return this._parameters.filter(
      (p) => p.groupKey === groupKey && p.state
    );
  }

  /**
   * Obtiene los parámetros del grupo actual (groupId).
   */
  public getParametersByGroupId(groupId?: number): ParameterEntity[] {
    const targetGroupId = groupId ?? this._groupId;
    return this._parameters.filter(
      (p) => p.groupId === targetGroupId && p.state
    );
  }

  /**
   * Limpia los parámetros en memoria (útil al cerrar sesión o cambiar de entorno).
   */
  public clearParameters(): void {
    this._parameters = [];
    this._parametersMap.clear();
  }

  /**
   * Verifica si un parámetro está activo.
   */
  public isParameterActive(code: string): boolean {
    return this._parametersMap.get(code.toLowerCase())?.state ?? false;
  }
}

export const configService = ConfigService.getInstance();