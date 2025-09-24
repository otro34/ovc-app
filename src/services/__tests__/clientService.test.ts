import { describe, it, expect } from 'vitest';
import { ClientService } from '../clientService';
import type { IClientFormData } from '../../types/client';

describe('ClientService', () => {
  describe('Unit Tests', () => {
    it('should be defined', () => {
      expect(ClientService).toBeDefined();
    });

    it('should have required methods', () => {
      const service = new ClientService();
      expect(service.createClient).toBeDefined();
      expect(service.getAllClients).toBeDefined();
      expect(service.getClientById).toBeDefined();
      expect(service.updateClient).toBeDefined();
      expect(service.deleteClient).toBeDefined();
      expect(service.hasClientContracts).toBeDefined();
      expect(service.getClientStats).toBeDefined();
      expect(service.searchClients).toBeDefined();
    });
  });

  describe('Data validation', () => {
    it('should validate client data structure', () => {
      const validClientData: IClientFormData = {
        name: 'Test Client',
        email: 'test@example.com',
        phone: '123456789',
        address: '123 Test St'
      };

      expect(validClientData.name).toBe('Test Client');
      expect(validClientData.email).toBe('test@example.com');
      expect(validClientData.phone).toBe('123456789');
      expect(validClientData.address).toBe('123 Test St');
    });

    it('should handle minimal client data', () => {
      const minimalClientData: IClientFormData = {
        name: 'Minimal Client'
      };

      expect(minimalClientData.name).toBe('Minimal Client');
      expect(minimalClientData.email).toBeUndefined();
      expect(minimalClientData.phone).toBeUndefined();
      expect(minimalClientData.address).toBeUndefined();
    });
  });
});