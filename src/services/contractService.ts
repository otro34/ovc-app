import { db, type Contract } from './database';

export class ContractService {
  async generateCorrelativeNumber(): Promise<string> {
    const lastContract = await db.contracts
      .orderBy('correlativeNumber')
      .reverse()
      .first();

    if (!lastContract) {
      return '000001';
    }

    const lastNumber = parseInt(lastContract.correlativeNumber);
    const nextNumber = lastNumber + 1;
    return nextNumber.toString().padStart(6, '0');
  }

  async create(contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'correlativeNumber' | 'attendedVolume' | 'pendingVolume'>): Promise<Contract> {
    const correlativeNumber = await this.generateCorrelativeNumber();

    const newContract: Omit<Contract, 'id'> = {
      ...contractData,
      correlativeNumber,
      attendedVolume: 0,
      pendingVolume: contractData.totalVolume,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const id = await db.contracts.add(newContract);
    return { ...newContract, id };
  }

  async findAll(): Promise<Contract[]> {
    return await db.contracts.orderBy('createdAt').reverse().toArray();
  }

  async findById(id: number): Promise<Contract | undefined> {
    return await db.contracts.get(id);
  }

  async findByClientId(clientId: number): Promise<Contract[]> {
    return await db.contracts.where('clientId').equals(clientId).toArray();
  }

  async findRecent(limit: number = 5): Promise<Contract[]> {
    return await db.contracts
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray();
  }

  async update(id: number, updates: Partial<Omit<Contract, 'id' | 'correlativeNumber' | 'createdAt'>>): Promise<Contract | null> {
    const existing = await db.contracts.get(id);
    if (!existing) {
      throw new Error('Contract not found');
    }

    // Check if contract has purchase orders
    const purchaseOrders = await db.purchaseOrders.where('contractId').equals(id).toArray();
    if (purchaseOrders.length > 0) {
      throw new Error('Cannot update contract with existing purchase orders');
    }

    const updatedContract = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    if ('totalVolume' in updates) {
      updatedContract.pendingVolume = updatedContract.totalVolume - updatedContract.attendedVolume;
    }

    await db.contracts.update(id, updatedContract);
    return updatedContract;
  }

  async delete(id: number): Promise<boolean> {
    const purchaseOrders = await db.purchaseOrders.where('contractId').equals(id).toArray();
    if (purchaseOrders.length > 0) {
      throw new Error('Cannot delete contract with existing purchase orders');
    }

    await db.contracts.delete(id);
    return true;
  }

  async updateVolumes(contractId: number, volumeChange: number): Promise<void> {
    const contract = await db.contracts.get(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const newAttendedVolume = contract.attendedVolume + volumeChange;
    if (newAttendedVolume < 0) {
      throw new Error('Attended volume cannot be negative');
    }
    if (newAttendedVolume > contract.totalVolume) {
      throw new Error('Attended volume cannot exceed total volume');
    }

    await db.contracts.update(contractId, {
      attendedVolume: newAttendedVolume,
      pendingVolume: contract.totalVolume - newAttendedVolume,
      updatedAt: new Date()
    });
  }

  async updateContractVolumes(contractId: number, volume: number, operation: 'add' | 'subtract'): Promise<void> {
    const volumeChange = operation === 'add' ? volume : -volume;
    await this.updateVolumes(contractId, volumeChange);
  }

  async canEditContract(id: number): Promise<boolean> {
    const purchaseOrders = await db.purchaseOrders.where('contractId').equals(id).toArray();
    return purchaseOrders.length === 0;
  }

  async canDeleteContract(id: number): Promise<boolean> {
    const purchaseOrders = await db.purchaseOrders.where('contractId').equals(id).toArray();
    return purchaseOrders.length === 0;
  }

  async getContractStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  }> {
    const all = await db.contracts.toArray();

    return {
      total: all.length,
      active: all.filter(c => c.status === 'active').length,
      completed: all.filter(c => c.status === 'completed').length,
      cancelled: all.filter(c => c.status === 'cancelled').length
    };
  }
}

export const contractService = new ContractService();