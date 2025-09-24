import type { IContractWithClient } from '../../types/contract';

export interface IContractListProps {
  contracts: IContractWithClient[];
  loading?: boolean;
  onEdit?: (contract: IContractWithClient) => void;
  onDelete?: (contractId: number) => void;
  onView?: (contract: IContractWithClient) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export interface IContractFilters {
  status: 'all' | 'active' | 'completed' | 'cancelled';
  client: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface IContractListItemProps {
  contract: IContractWithClient;
  onEdit?: (contract: IContractWithClient) => void;
  onDelete?: (contractId: number) => void;
  onView?: (contract: IContractWithClient) => void;
}