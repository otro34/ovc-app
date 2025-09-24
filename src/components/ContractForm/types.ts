import type { IClient } from '../../types/client';

export interface IContractFormProps {
  onSubmit: (data: IContractFormData) => void;
  onCancel: () => void;
  clients: IClient[];
  loading?: boolean;
  initialData?: IContractFormData;
}

export interface IContractFormData {
  clientId: number;
  totalVolume: number;
  salePrice: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
}