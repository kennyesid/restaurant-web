export interface OrderTypeSend {
  id: number;
  groupId: number | null;
  code: string;
  name: string;
  value: string | null;
  description: string | null;
  color:string;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
  state: boolean;
}