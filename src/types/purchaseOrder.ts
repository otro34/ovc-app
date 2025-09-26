import type { PurchaseOrder as BasePurchaseOrder } from '../services/database';

export interface IPurchaseOrder extends BasePurchaseOrder {
  id: number;
  contractId: number;
  volume: number;
  price: number;
  orderDate: Date;
  deliveryDate?: Date;
  status: 'pending' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchaseOrderCreate {
  contractId: number;
  volume: number;
  price: number;
  orderDate: Date;
  deliveryDate?: Date | null;
  notes?: string;
}

export interface IPurchaseOrderUpdate {
  volume?: number;
  price?: number;
  orderDate?: Date;
  deliveryDate?: Date;
  status?: 'pending' | 'delivered' | 'cancelled';
  notes?: string;
}

export interface IPurchaseOrderWithContract extends IPurchaseOrder {
  contract?: {
    correlativeNumber: string;
    clientName: string;
    pendingVolume: number;
  };
}

export interface IPurchaseOrderStats {
  total: number;
  pending: number;
  delivered: number;
  cancelled: number;
  totalVolume: number;
  totalValue: number;
}