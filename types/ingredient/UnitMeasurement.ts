export interface UnitMeasurement {
  id: number;
  groupId: number;
  name: string;
  symbol: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  state?: boolean;
}