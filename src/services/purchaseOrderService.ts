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
      deliveryDate: purchaseOrderData.deliveryDate || undefined,
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

  canDeleteOrder(): boolean {
    return true; // Se puede eliminar cualquier pedido, con las validaciones correspondientes
  }

  /**
   * Cambia el estado de un pedido a 'delivered' (entregado)
   */
  async markAsDelivered(orderId: number, deliveryDate?: Date): Promise<IPurchaseOrder> {
    const order = await this.getPurchaseOrderById(orderId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    if (order.status !== 'pending') {
      throw new Error('Solo se pueden entregar pedidos pendientes');
    }

    const updatedOrder: IPurchaseOrder = {
      ...order,
      status: 'delivered',
      deliveryDate: deliveryDate || new Date(),
      updatedAt: new Date()
    };

    await db.purchaseOrders.update(orderId, updatedOrder);

    // Actualizar estado del contrato
    await contractService.updateContractStatus(order.contractId);

    return updatedOrder;
  }

  /**
   * Cambia el estado de un pedido a 'cancelled' (cancelado) y restaura el volumen del contrato
   */
  async markAsCancelled(orderId: number, reason?: string): Promise<IPurchaseOrder> {
    const order = await this.getPurchaseOrderById(orderId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    if (order.status !== 'pending') {
      throw new Error('Solo se pueden cancelar pedidos pendientes');
    }

    // Verificar el estado actual del contrato antes de cancelar
    const contract = await db.contracts.get(order.contractId);
    if (!contract) {
      throw new Error('Contrato no encontrado');
    }

    console.log('Cancelando pedido:', {
      orderId,
      orderVolume: order.volume,
      contractAttendedVolume: contract.attendedVolume,
      contractPendingVolume: contract.pendingVolume,
      contractTotalVolume: contract.totalVolume
    });

    // Verificar si hay suficiente volumen atendido para cancelar
    if (contract.attendedVolume < order.volume) {
      console.warn(`Inconsistencia de datos detectada. Reparando automáticamente...`);

      // Reparar la inconsistencia: recalcular los volúmenes basado en pedidos reales
      await this.repairContractVolumes(order.contractId);

      // Obtener el contrato actualizado después de la reparación
      const repairedContract = await db.contracts.get(order.contractId);
      if (!repairedContract) {
        throw new Error('Error al obtener el contrato reparado');
      }

      console.log('Volúmenes después de reparación:', {
        contractAttendedVolume: repairedContract.attendedVolume,
        contractPendingVolume: repairedContract.pendingVolume,
      });

      // Verificar nuevamente después de la reparación
      if (repairedContract.attendedVolume < order.volume) {
        throw new Error(`Error persistente: El contrato reparado tiene volumen atendido ${repairedContract.attendedVolume} pero el pedido a cancelar tiene volumen ${order.volume}.`);
      }
    }

    // Restaurar el volumen al contrato usando el método del servicio
    await contractService.updateContractVolumes(order.contractId, order.volume, 'subtract');

    const updatedOrder: IPurchaseOrder = {
      ...order,
      status: 'cancelled',
      notes: reason ? `${order.notes || ''}\n[CANCELADO: ${reason}]`.trim() : order.notes,
      updatedAt: new Date()
    };

    await db.purchaseOrders.update(orderId, updatedOrder);

    // Actualizar estado del contrato
    await contractService.updateContractStatus(order.contractId);

    return updatedOrder;
  }

  /**
   * Repara inconsistencias en los volúmenes del contrato recalculando desde los pedidos reales
   */
  async repairContractVolumes(contractId: number): Promise<void> {
    try {
      const contract = await db.contracts.get(contractId);
      if (!contract) {
        throw new Error('Contrato no encontrado');
      }

      // Obtener todos los pedidos activos (no cancelados) del contrato
      const activeOrders = await db.purchaseOrders
        .where('contractId')
        .equals(contractId)
        .filter(order => order.status === 'pending' || order.status === 'delivered')
        .toArray();

      // Calcular el volumen atendido real basado en pedidos activos
      const realAttendedVolume = activeOrders.reduce((total, order) => total + order.volume, 0);
      const realPendingVolume = contract.totalVolume - realAttendedVolume;

      console.log('Reparación de volúmenes:', {
        contractId,
        currentAttended: contract.attendedVolume,
        currentPending: contract.pendingVolume,
        calculatedAttended: realAttendedVolume,
        calculatedPending: realPendingVolume,
        totalVolume: contract.totalVolume,
        activeOrders: activeOrders.length
      });

      // Actualizar el contrato con los volúmenes correctos
      await db.contracts.update(contractId, {
        attendedVolume: realAttendedVolume,
        pendingVolume: realPendingVolume,
        updatedAt: new Date()
      });

    } catch (error) {
      console.error('Error reparando volúmenes del contrato:', error);
      throw error;
    }
  }

  /**
   * Reactiva un pedido cancelado (solo si el contrato tiene volumen disponible)
   */
  async reactivateOrder(orderId: number): Promise<IPurchaseOrder> {
    const order = await this.getPurchaseOrderById(orderId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    if (order.status !== 'cancelled') {
      throw new Error('Solo se pueden reactivar pedidos cancelados');
    }

    // Verificar si el contrato tiene volumen disponible
    const contract = await db.contracts.get(order.contractId);
    if (!contract) {
      throw new Error('Contrato no encontrado');
    }

    if (contract.pendingVolume < order.volume) {
      throw new Error('El contrato no tiene suficiente volumen disponible para reactivar este pedido');
    }

    // Actualizar volúmenes del contrato
    const updatedContract = {
      ...contract,
      attendedVolume: contract.attendedVolume + order.volume,
      pendingVolume: contract.pendingVolume - order.volume,
      updatedAt: new Date()
    };
    await db.contracts.update(order.contractId, updatedContract);

    // Reactivar pedido
    const updatedOrder: IPurchaseOrder = {
      ...order,
      status: 'pending',
      deliveryDate: undefined,
      updatedAt: new Date()
    };

    await db.purchaseOrders.update(orderId, updatedOrder);

    // Actualizar estado del contrato
    await contractService.updateContractStatus(order.contractId);

    return updatedOrder;
  }
}

export const purchaseOrderService = new PurchaseOrderService();