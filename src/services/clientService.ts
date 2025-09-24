import { db } from './database';
import type { IClient, IClientFormData, IClientFilters } from '../types/client';

export class ClientService {
  async createClient(clientData: IClientFormData): Promise<number> {
    const now = new Date();
    const client: Omit<IClient, 'id'> = {
      ...clientData,
      createdAt: now,
      updatedAt: now
    };

    const id = await db.clients.add(client);
    return id as number;
  }

  async getAllClients(filters?: IClientFilters): Promise<IClient[]> {
    let query = db.clients.orderBy(filters?.sortBy || 'name');

    if (filters?.sortOrder === 'desc') {
      query = query.reverse();
    }

    let clients = await query.toArray();

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      clients = clients.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        (client.email && client.email.toLowerCase().includes(searchLower)) ||
        (client.phone && client.phone.includes(filters.search!))
      );
    }

    return clients;
  }

  async getClientById(id: number): Promise<IClient | undefined> {
    return await db.clients.get(id);
  }

  async updateClient(id: number, clientData: IClientFormData): Promise<void> {
    const updateData = {
      ...clientData,
      updatedAt: new Date()
    };

    await db.clients.update(id, updateData);
  }

  async deleteClient(id: number): Promise<void> {
    const hasContracts = await this.hasClientContracts(id);
    if (hasContracts) {
      throw new Error('No se puede eliminar el cliente porque tiene contratos asociados');
    }

    await db.clients.delete(id);
  }

  async hasClientContracts(clientId: number): Promise<boolean> {
    const contractCount = await db.contracts.where('clientId').equals(clientId).count();
    return contractCount > 0;
  }

  async getClientStats(clientId: number) {
    const contracts = await db.contracts.where('clientId').equals(clientId).toArray();
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    const totalVolume = contracts.reduce((sum, c) => sum + c.totalVolume, 0);
    const attendedVolume = contracts.reduce((sum, c) => sum + c.attendedVolume, 0);

    return {
      totalContracts,
      activeContracts,
      totalVolume,
      attendedVolume,
      pendingVolume: totalVolume - attendedVolume
    };
  }

  async searchClients(searchTerm: string): Promise<IClient[]> {
    const searchLower = searchTerm.toLowerCase();
    const clients = await db.clients.toArray();

    return clients.filter(client =>
      client.name.toLowerCase().includes(searchLower) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.phone && client.phone.includes(searchTerm))
    );
  }
}

export const clientService = new ClientService();