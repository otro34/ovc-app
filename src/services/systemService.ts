import { db } from './database';
import type { ISystemConfiguration } from '../types/system';

export class SystemService {
  private readonly DEFAULT_CONFIG: Omit<ISystemConfiguration, 'id'> = {
    sessionTimeout: 30,
    companyName: 'OV-APP',
    currency: 'COP',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'America/Bogota',
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'xlsx', 'csv'],
    backupEnabled: true,
    backupFrequency: 'daily',
    emailNotifications: true,
    systemMaintenanceMode: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  /**
   * Obtiene la configuración del sistema
   */
  async getConfiguration(): Promise<ISystemConfiguration> {
    try {
      const config = await db.systemConfiguration.orderBy('id').last();
      if (!config) {
        return await this.createDefaultConfiguration();
      }
      return config;
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      throw new Error('Error al obtener la configuración del sistema');
    }
  }

  /**
   * Actualiza la configuración del sistema
   */
  async updateConfiguration(updates: Partial<ISystemConfiguration>): Promise<ISystemConfiguration> {
    try {
      const currentConfig = await this.getConfiguration();

      const updatedConfig: ISystemConfiguration = {
        ...currentConfig,
        ...updates,
        updatedAt: new Date()
      };

      if (currentConfig.id) {
        await db.systemConfiguration.update(currentConfig.id, updatedConfig);
        return { ...updatedConfig, id: currentConfig.id };
      } else {
        const id = await db.systemConfiguration.add(updatedConfig);
        return { ...updatedConfig, id };
      }
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      throw new Error('Error al actualizar la configuración del sistema');
    }
  }

  /**
   * Crea la configuración por defecto
   */
  private async createDefaultConfiguration(): Promise<ISystemConfiguration> {
    try {
      const id = await db.systemConfiguration.add(this.DEFAULT_CONFIG);
      return { ...this.DEFAULT_CONFIG, id } as ISystemConfiguration;
    } catch (error) {
      console.error('Error creando configuración por defecto:', error);
      throw new Error('Error al crear la configuración por defecto');
    }
  }

  /**
   * Resetea la configuración a valores por defecto
   */
  async resetToDefault(): Promise<ISystemConfiguration> {
    try {
      await db.systemConfiguration.clear();
      return await this.createDefaultConfiguration();
    } catch (error) {
      console.error('Error reseteando configuración:', error);
      throw new Error('Error al resetear la configuración');
    }
  }

  /**
   * Valida los valores de configuración
   */
  validateConfiguration(config: Partial<ISystemConfiguration>): string[] {
    const errors: string[] = [];

    if (config.sessionTimeout !== undefined && (config.sessionTimeout < 5 || config.sessionTimeout > 480)) {
      errors.push('El tiempo de sesión debe estar entre 5 y 480 minutos');
    }

    if (config.companyName !== undefined && config.companyName.trim().length < 2) {
      errors.push('El nombre de la empresa debe tener al menos 2 caracteres');
    }

    if (config.maxFileSize !== undefined && (config.maxFileSize < 1 || config.maxFileSize > 100)) {
      errors.push('El tamaño máximo de archivo debe estar entre 1 y 100 MB');
    }

    if (config.currency && !['COP', 'USD', 'EUR'].includes(config.currency)) {
      errors.push('Moneda no soportada');
    }

    if (config.dateFormat && !['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].includes(config.dateFormat)) {
      errors.push('Formato de fecha no soportado');
    }

    return errors;
  }

  /**
   * Obtiene configuraciones específicas de manera tipada
   */
  async getSessionTimeout(): Promise<number> {
    const config = await this.getConfiguration();
    return config.sessionTimeout;
  }

  async getCompanyName(): Promise<string> {
    const config = await this.getConfiguration();
    return config.companyName;
  }

  async getCurrency(): Promise<string> {
    const config = await this.getConfiguration();
    return config.currency;
  }

  async isMaintenanceMode(): Promise<boolean> {
    const config = await this.getConfiguration();
    return config.systemMaintenanceMode;
  }
}

export const systemService = new SystemService();