import type { IContractWithClient } from '../../types/contract';

export interface IContractDetailsProps {
  contract: IContractWithClient;
  onClose: () => void;
  onEdit?: (contract: IContractWithClient) => void;
  onDelete?: (contractId: number) => void;
  purchaseOrders?: IPurchaseOrder[];
  loading?: boolean;
}

export interface IPurchaseOrder {
  id?: number;
  contractId: number;
  volume: number;
  price: number;
  orderDate: Date;
  deliveryDate?: Date;
  status: 'pending' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IContractProgress {
  percentage: number;
  attendedVolume: number;
  pendingVolume: number;
  totalVolume: number;
  isCompleted: boolean;
}