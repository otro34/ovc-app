import type { IContractWithClient } from '../../types/contract';

export interface IContractCardProps {
  contract: IContractWithClient;
  onEdit?: (contract: IContractWithClient) => void;
  onDelete?: (contractId: number) => void;
  onView?: (contract: IContractWithClient) => void;
}