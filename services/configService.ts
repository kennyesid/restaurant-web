// lib/configService.ts
class ConfigService {
  private static instance: ConfigService;
  private _groupId: number = 1; 

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
}

export const configService = ConfigService.getInstance();