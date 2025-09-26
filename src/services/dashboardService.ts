import { db } from './database';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export interface DashboardStats {
  // Métricas principales
  totalClients: number;
  activeContracts: number;
  monthlyOrders: number;
  pendingVolume: number;

  // Métricas adicionales
  totalContractValue: number;
  attendedVolume: number;
  pendingOrders: number;
  completionRate: number;

  // Métricas de tendencias
  monthlyRevenue: number;
  averageOrderValue: number;
}

export interface RecentActivity {
  recentContracts: Array<{
    id: number;
    correlativeNumber: string;
    clientName: string;
    totalVolume: number;
    createdAt: Date;
  }>;
  recentOrders: Array<{
    id: number;
    contractNumber: string;
    clientName: string;
    volume: number;
    totalValue: number;
    status: string;
    orderDate: Date;
  }>;
}

export interface MonthlyTrend {
  month: string;
  contracts: number;
  orders: number;
  volume: number;
  revenue: number;
}

export class DashboardService {

  async getStats(): Promise<DashboardStats> {
    try {
      // Obtener datos base
      const [clients, contracts, orders] = await Promise.all([
        db.clients.toArray(),
        db.contracts.toArray(),
        db.purchaseOrders.toArray()
      ]);

      // Calcular fecha de inicio y fin del mes actual
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Filtrar contratos activos
      const activeContracts = contracts.filter(c => c.status === 'active');

      // Filtrar pedidos del mes actual
      const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      // Filtrar pedidos pendientes
      const pendingOrders = orders.filter(order => order.status === 'pending');

      // Calcular métricas agregadas
      const totalContractValue = activeContracts.reduce((sum, contract) =>
        sum + (contract.totalVolume * contract.salePrice), 0);

      const pendingVolume = activeContracts.reduce((sum, contract) =>
        sum + contract.pendingVolume, 0);

      const attendedVolume = activeContracts.reduce((sum, contract) =>
        sum + contract.attendedVolume, 0);

      const monthlyRevenue = monthlyOrders.reduce((sum, order) =>
        sum + (order.volume * order.price), 0);

      const averageOrderValue = orders.length > 0
        ? orders.reduce((sum, order) => sum + (order.volume * order.price), 0) / orders.length
        : 0;

      const totalVolume = attendedVolume + pendingVolume;
      const completionRate = totalVolume > 0 ? (attendedVolume / totalVolume) * 100 : 0;

      return {
        totalClients: clients.length,
        activeContracts: activeContracts.length,
        monthlyOrders: monthlyOrders.length,
        pendingVolume,
        totalContractValue,
        attendedVolume,
        pendingOrders: pendingOrders.length,
        completionRate,
        monthlyRevenue,
        averageOrderValue
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getRecentActivity(): Promise<RecentActivity> {
    try {
      const [contracts, orders, clients] = await Promise.all([
        db.contracts.orderBy('createdAt').reverse().limit(5).toArray(),
        db.purchaseOrders.orderBy('createdAt').reverse().limit(5).toArray(),
        db.clients.toArray()
      ]);

      // Enriquecer contratos con información del cliente
      const recentContracts = await Promise.all(
        contracts.map(async (contract) => {
          const client = clients.find(c => c.id === contract.clientId);
          return {
            id: contract.id!,
            correlativeNumber: contract.correlativeNumber,
            clientName: client?.name || 'Cliente desconocido',
            totalVolume: contract.totalVolume,
            createdAt: contract.createdAt || new Date()
          };
        })
      );

      // Enriquecer pedidos con información del contrato y cliente
      const recentOrders = await Promise.all(
        orders.map(async (order) => {
          const contract = await db.contracts.get(order.contractId);
          const client = contract ? clients.find(c => c.id === contract.clientId) : null;

          return {
            id: order.id!,
            contractNumber: contract?.correlativeNumber || 'N/A',
            clientName: client?.name || 'Cliente desconocido',
            volume: order.volume,
            totalValue: order.volume * order.price,
            status: order.status,
            orderDate: new Date(order.orderDate)
          };
        })
      );

      return {
        recentContracts,
        recentOrders
      };
    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw error;
    }
  }

  async getMonthlyTrends(months: number = 6): Promise<MonthlyTrend[]> {
    try {
      const [contracts, orders] = await Promise.all([
        db.contracts.toArray(),
        db.purchaseOrders.toArray()
      ]);

      const trends: MonthlyTrend[] = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);

        const monthContracts = contracts.filter(contract => {
          const createdAt = contract.createdAt ? new Date(contract.createdAt) : null;
          return createdAt && createdAt >= monthStart && createdAt <= monthEnd;
        });

        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= monthStart && orderDate <= monthEnd;
        });

        const monthVolume = monthOrders.reduce((sum, order) => sum + order.volume, 0);
        const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.volume * order.price), 0);

        trends.push({
          month: format(date, 'MMM yyyy'),
          contracts: monthContracts.length,
          orders: monthOrders.length,
          volume: monthVolume,
          revenue: monthRevenue
        });
      }

      return trends;
    } catch (error) {
      console.error('Error getting monthly trends:', error);
      throw error;
    }
  }

  // Método para exportar datos
  async exportData(type: 'contracts' | 'orders' | 'clients' | 'all' = 'all') {
    try {
      const data: any = {};

      if (type === 'all' || type === 'clients') {
        data.clients = await db.clients.toArray();
      }

      if (type === 'all' || type === 'contracts') {
        const contracts = await db.contracts.toArray();
        const clients = await db.clients.toArray();

        data.contracts = contracts.map(contract => {
          const client = clients.find(c => c.id === contract.clientId);
          return {
            ...contract,
            clientName: client?.name || 'Cliente desconocido'
          };
        });
      }

      if (type === 'all' || type === 'orders') {
        const orders = await db.purchaseOrders.toArray();
        const contracts = await db.contracts.toArray();
        const clients = await db.clients.toArray();

        data.orders = orders.map(order => {
          const contract = contracts.find(c => c.id === order.contractId);
          const client = contract ? clients.find(c => c.id === contract.clientId) : null;

          return {
            ...order,
            contractNumber: contract?.correlativeNumber || 'N/A',
            clientName: client?.name || 'Cliente desconocido',
            totalValue: order.volume * order.price
          };
        });
      }

      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();