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
    return { ...newContract, id } as Contract;
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

  /**
   * Evalúa y actualiza el estado del contrato basado en sus pedidos
   */
  async updateContractStatus(contractId: number): Promise<void> {
    try {
      const contract = await db.contracts.get(contractId);
      if (!contract) {
        throw new Error('Contrato no encontrado');
      }

      // Obtener todos los pedidos del contrato
      const orders = await db.purchaseOrders.where('contractId').equals(contractId).toArray();

      let newStatus: 'active' | 'completed' | 'cancelled' = contract.status;

      // Verificar si el contrato está vencido
      const now = new Date();
      const isExpired = now > new Date(contract.endDate);

      // Lógica para determinar el nuevo estado
      if (orders.length === 0) {
        // Sin pedidos: mantener active o cambiar a cancelled si está vencido
        newStatus = isExpired ? 'cancelled' : 'active';
      } else {
        // Con pedidos: evaluar el estado basado en los pedidos
        const pendingOrders = orders.filter(o => o.status === 'pending');
        const deliveredOrders = orders.filter(o => o.status === 'delivered');
        const cancelledOrders = orders.filter(o => o.status === 'cancelled');

        if (pendingOrders.length > 0) {
          // Hay pedidos pendientes: mantener activo (incluso si está vencido)
          newStatus = 'active';
        } else if (deliveredOrders.length > 0 && cancelledOrders.length >= 0) {
          // Solo hay pedidos entregados/cancelados, verificar volumen
          const deliveredVolume = deliveredOrders.reduce((sum, order) => sum + order.volume, 0);

          if (deliveredVolume >= contract.totalVolume) {
            // Todo el volumen fue entregado: completado
            newStatus = 'completed';
          } else if (isExpired) {
            // No se completó el volumen y está vencido: cancelado
            newStatus = 'cancelled';
          } else {
            // Aún puede recibir más pedidos
            newStatus = 'active';
          }
        } else {
          // Solo pedidos cancelados: evaluar por fecha de vencimiento
          newStatus = isExpired ? 'cancelled' : 'active';
        }
      }

      // Actualizar el estado si ha cambiado
      if (newStatus !== contract.status) {
        await db.contracts.update(contractId, {
          status: newStatus,
          updatedAt: new Date()
        });

        console.log(`Contrato ${contract.correlativeNumber} cambió de estado: ${contract.status} → ${newStatus}`);
      }
    } catch (error) {
      console.error('Error actualizando estado del contrato:', error);
      throw error;
    }
  }

  /**
   * Actualiza los estados de todos los contratos
   */
  async updateAllContractStatuses(): Promise<void> {
    try {
      const contracts = await db.contracts.toArray();

      for (const contract of contracts) {
        if (contract.id) {
          await this.updateContractStatus(contract.id);
        }
      }
    } catch (error) {
      console.error('Error actualizando estados de contratos:', error);
      throw error;
    }
  }

  /**
   * Marca un contrato como cancelado manualmente
   */
  async markContractAsCancelled(contractId: number, reason?: string): Promise<void> {
    try {
      const contract = await db.contracts.get(contractId);
      if (!contract) {
        throw new Error('Contrato no encontrado');
      }

      // Verificar que no tenga pedidos pendientes
      const pendingOrders = await db.purchaseOrders
        .where('contractId')
        .equals(contractId)
        .filter(order => order.status === 'pending')
        .toArray();

      if (pendingOrders.length > 0) {
        throw new Error('No se puede cancelar un contrato con pedidos pendientes. Cancele los pedidos primero.');
      }

      await db.contracts.update(contractId, {
        status: 'cancelled',
        updatedAt: new Date()
      });

      console.log(`Contrato ${contract.correlativeNumber} cancelado manualmente${reason ? ': ' + reason : ''}`);
    } catch (error) {
      console.error('Error cancelando contrato:', error);
      throw error;
    }
  }

  /**
   * Reactiva un contrato cancelado
   */
  async reactivateContract(contractId: number): Promise<void> {
    try {
      const contract = await db.contracts.get(contractId);
      if (!contract) {
        throw new Error('Contrato no encontrado');
      }

      if (contract.status !== 'cancelled') {
        throw new Error('Solo se pueden reactivar contratos cancelados');
      }

      // Verificar que no esté vencido
      const now = new Date();
      const isExpired = now > new Date(contract.endDate);

      if (isExpired) {
        throw new Error('No se puede reactivar un contrato vencido. Extienda la fecha de vencimiento primero.');
      }

      await db.contracts.update(contractId, {
        status: 'active',
        updatedAt: new Date()
      });

      console.log(`Contrato ${contract.correlativeNumber} reactivado`);
    } catch (error) {
      console.error('Error reactivando contrato:', error);
      throw error;
    }
  }
}

export const contractService = new ContractService();