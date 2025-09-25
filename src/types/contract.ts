export interface IContract {
  id?: number;
  correlativeNumber: string;
  clientId: number;
  totalVolume: number;
  attendedVolume: number;
  pendingVolume: number;
  salePrice: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateContract {
  clientId: number;
  totalVolume: number;
  salePrice: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
}

export interface IUpdateContract {
  totalVolume?: number;
  salePrice?: number;
  startDate?: Date;
  endDate?: Date;
  status?: 'active' | 'completed' | 'cancelled';
}

export interface IContractWithClient extends IContract {
  clientName: string;
  clientEmail?: string;
}

export interface IContractStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  totalVolume: number;
  attendedVolume: number;
  pendingVolume: number;
}