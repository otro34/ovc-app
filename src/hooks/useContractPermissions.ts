import { useState, useEffect } from 'react';
import { contractService } from '../services/contractService';
import type { IContractWithClient } from '../types/contract';

interface ContractPermissions {
  canEdit: boolean;
  canDelete: boolean;
  loading: boolean;
}

export const useContractPermissions = (contract: IContractWithClient): ContractPermissions => {
  const [permissions, setPermissions] = useState<ContractPermissions>({
    canEdit: false,
    canDelete: false,
    loading: true
  });

  useEffect(() => {
    const checkPermissions = async () => {
      if (!contract.id) {
        setPermissions({ canEdit: false, canDelete: false, loading: false });
        return;
      }

      try {
        setPermissions({ canEdit: false, canDelete: false, loading: true });

        const [canEdit, canDelete] = await Promise.all([
          contractService.canEditContract(contract.id),
          contractService.canDeleteContract(contract.id)
        ]);

        // Additional business rules
        const contractCanEdit = canEdit && contract.status === 'active';
        const contractCanDelete = canDelete && contract.status === 'active';

        setPermissions({
          canEdit: contractCanEdit,
          canDelete: contractCanDelete,
          loading: false
        });
      } catch (error) {
        console.error('Error checking contract permissions:', error);
        setPermissions({ canEdit: false, canDelete: false, loading: false });
      }
    };

    checkPermissions();
  }, [contract.id, contract.status]);

  return permissions;
};

export default useContractPermissions;