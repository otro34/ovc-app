import type { IContractWithClient } from '../../types/contract';

export interface IRecentContractsProps {
  contracts: IContractWithClient[];
  loading?: boolean;
  onView?: (contract: IContractWithClient) => void;
  limit?: number;
  title?: string;
}