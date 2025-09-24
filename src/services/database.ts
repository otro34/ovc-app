import Dexie, { type EntityTable } from 'dexie';

export interface User {
  id?: number;
  username: string;
  password: string;
  email?: string;
  name?: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Client {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Contract {
  id?: number;
  correlativeNumber: string;
  clientId: number;
  totalVolume: number;
  attendedVolume: number;
  pendingVolume: number;
  salePrice: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PurchaseOrder {
  id?: number;
  contractId: number;
  volume: number;
  price: number;
  orderDate: Date;
  deliveryDate?: Date;
  status: 'pending' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class OVDatabase extends Dexie {
  users!: EntityTable<User, 'id'>;
  clients!: EntityTable<Client, 'id'>;
  contracts!: EntityTable<Contract, 'id'>;
  purchaseOrders!: EntityTable<PurchaseOrder, 'id'>;

  constructor() {
    super('OVDatabase');

    this.version(1).stores({
      users: '++id, username, email, role, createdAt',
      clients: '++id, name, email, phone, createdAt',
      contracts: '++id, correlativeNumber, clientId, status, startDate, endDate, createdAt',
      purchaseOrders: '++id, contractId, orderDate, deliveryDate, status, createdAt'
    });

    this.on('populate', () => this.populate());
  }

  private async populate() {
    // Crear usuarios por defecto
    await this.users.bulkAdd([
      {
        username: 'admin',
        password: 'admin123',
        email: 'admin@ovapp.com',
        name: 'Administrador',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'usuario',
        password: 'user123',
        email: 'user@ovapp.com',
        name: 'Usuario Test',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  }
}

export const db = new OVDatabase();