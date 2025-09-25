import { db, type PurchaseOrder } from './database';
import type { IPurchaseOrder, IPurchaseOrderCreate, IPurchaseOrderUpdate, IPurchaseOrderWithContract, IPurchaseOrderStats } from '../types/purchaseOrder';
import { contractService } from './contractService';

export class PurchaseOrderService {
  async getAllPurchaseOrders(): Promise<IPurchaseOrderWithContract[]> {
    const purchaseOrders = await db.purchaseOrders.toArray();
    purchaseOrders.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

    const purchaseOrdersWithContracts = await Promise.all(
      purchaseOrders.map(async (order) => {
        const contract = await db.contracts.get(order.contractId);
        let contractInfo;

        if (contract) {
          const client = await db.clients.get(contract.clientId);
          contractInfo = {
            correlativeNumber: contract.correlativeNumber,
            clientName: client?.name || 'Cliente desconocido',
            pendingVolume: contract.pendingVolume
          };
        }

        return {
          ...order,
          contract: contractInfo
        } as IPurchaseOrderWithContract;
      })
    );

    return purchaseOrdersWithContracts;
  }

  async getPurchaseOrderById(id: number): Promise<IPurchaseOrder | undefined> {
    return await db.purchaseOrders.get(id) as IPurchaseOrder | undefined;
  }

  async getPurchaseOrdersByContract(contractId: number): Promise<IPurchaseOrder[]> {
    const orders = await db.purchaseOrders
      .where('contractId')
      .equals(contractId)
      .toArray() as IPurchaseOrder[];

    orders.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return orders;
  }

  async createPurchaseOrder(purchaseOrderData: IPurchaseOrderCreate): Promise<IPurchaseOrder> {
    const contract = await db.contracts.get(purchaseOrderData.contractId);
    if (!contract) {
      throw new Error('Contrato no encontrado');
    }

    // Validar que el volumen no exceda el volumen pendiente del contrato
    if (purchaseOrderData.volume > contract.pendingVolume) {
      throw new Error(`El volumen del pedido (${purchaseOrderData.volume}) excede el volumen pendiente del contrato (${contract.pendingVolume})`);
    }

    const now = new Date();
    const purchaseOrder: PurchaseOrder = {
      ...purchaseOrderData,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };

    const id = await db.purchaseOrders.add(purchaseOrder);

    // Actualizar el volumen atendido del contrato
    await contractService.updateContractVolumes(purchaseOrderData.contractId, purchaseOrderData.volume, 'add');

    const created = await this.getPurchaseOrderById(id as number);
    if (!created) {
      throw new Error('Error al crear el pedido de venta');
    }

    return created;
  }

  async updatePurchaseOrder(id: number, updateData: IPurchaseOrderUpdate): Promise<IPurchaseOrder> {
    const existingOrder = await this.getPurchaseOrderById(id);
    if (!existingOrder) {
      throw new Error('Pedido de venta no encontrado');
    }

    // Si se actualiza el volumen, validar y ajustar el contrato
    if (updateData.volume && updateData.volume !== existingOrder.volume) {
      const contract = await db.contracts.get(existingOrder.contractId);
      if (!contract) {
        throw new Error('Contrato no encontrado');
      }

      const volumeDifference = updateData.volume - existingOrder.volume;

      // Verificar que el nuevo volumen no exceda el disponible
      if (volumeDifference > contract.pendingVolume) {
        throw new Error(`El incremento de volumen (${volumeDifference}) excede el volumen pendiente del contrato (${contract.pendingVolume})`);
      }

      // Actualizar volúmenes del contrato
      await contractService.updateContractVolumes(existingOrder.contractId, volumeDifference, 'add');
    }

    const updatedData = {
      ...updateData,
      updatedAt: new Date()
    };

    await db.purchaseOrders.update(id, updatedData);

    const updated = await this.getPurchaseOrderById(id);
    if (!updated) {
      throw new Error('Error al actualizar el pedido de venta');
    }

    return updated;
  }

  async cancelPurchaseOrder(id: number, reason?: string): Promise<IPurchaseOrder> {
    const existingOrder = await this.getPurchaseOrderById(id);
    if (!existingOrder) {
      throw new Error('Pedido de venta no encontrado');
    }

    if (existingOrder.status === 'cancelled') {
      throw new Error('El pedido ya está cancelado');
    }

    if (existingOrder.status === 'delivered') {
      throw new Error('No se puede cancelar un pedido entregado');
    }

    // Restaurar el volumen al contrato
    await contractService.updateContractVolumes(existingOrder.contractId, existingOrder.volume, 'subtract');

    const updatedData = {
      status: 'cancelled' as const,
      notes: reason ? `${existingOrder.notes || ''}\nCANCELADO: ${reason}`.trim() : existingOrder.notes,
      updatedAt: new Date()
    };

    await db.purchaseOrders.update(id, updatedData);

    const cancelled = await this.getPurchaseOrderById(id);
    if (!cancelled) {
      throw new Error('Error al cancelar el pedido de venta');
    }

    return cancelled;
  }

  async deletePurchaseOrder(id: number): Promise<void> {
    const existingOrder = await this.getPurchaseOrderById(id);
    if (!existingOrder) {
      throw new Error('Pedido de venta no encontrado');
    }

    // Si el pedido está activo, restaurar el volumen al contrato antes de eliminar
    if (existingOrder.status === 'pending' || existingOrder.status === 'delivered') {
      await contractService.updateContractVolumes(existingOrder.contractId, existingOrder.volume, 'subtract');
    }

    await db.purchaseOrders.delete(id);
  }

  async getPurchaseOrderStats(): Promise<IPurchaseOrderStats> {
    const orders = await db.purchaseOrders.toArray();

    const stats = orders.reduce((acc, order) => {
      acc.total++;
      acc[order.status]++;
      acc.totalVolume += order.volume;
      acc.totalValue += order.volume * order.price;
      return acc;
    }, {
      total: 0,
      pending: 0,
      delivered: 0,
      cancelled: 0,
      totalVolume: 0,
      totalValue: 0
    });

    return stats;
  }

  async getRecentPurchaseOrders(limit: number = 5): Promise<IPurchaseOrderWithContract[]> {
    const allOrders = await db.purchaseOrders.toArray();
    allOrders.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    const recentOrders = allOrders.slice(0, limit);

    const ordersWithContracts = await Promise.all(
      recentOrders.map(async (order) => {
        const contract = await db.contracts.get(order.contractId);
        let contractInfo;

        if (contract) {
          const client = await db.clients.get(contract.clientId);
          contractInfo = {
            correlativeNumber: contract.correlativeNumber,
            clientName: client?.name || 'Cliente desconocido',
            pendingVolume: contract.pendingVolume
          };
        }

        return {
          ...order,
          contract: contractInfo
        } as IPurchaseOrderWithContract;
      })
    );

    return ordersWithContracts;
  }

  async searchPurchaseOrders(query: string): Promise<IPurchaseOrderWithContract[]> {
    const allOrders = await this.getAllPurchaseOrders();

    const lowerQuery = query.toLowerCase();
    return allOrders.filter(order =>
      order.contract?.correlativeNumber.toLowerCase().includes(lowerQuery) ||
      order.contract?.clientName.toLowerCase().includes(lowerQuery) ||
      order.status.toLowerCase().includes(lowerQuery) ||
      order.notes?.toLowerCase().includes(lowerQuery)
    );
  }

  canCancelOrder(order: IPurchaseOrder): boolean {
    return order.status === 'pending';
  }

  canEditOrder(order: IPurchaseOrder): boolean {
    return order.status === 'pending';
  }

  canDeleteOrder(_order: IPurchaseOrder): boolean {
    return true; // Se puede eliminar cualquier pedido, con las validaciones correspondientes
  }
}

export const purchaseOrderService = new PurchaseOrderService();