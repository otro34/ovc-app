export interface ISystemConfiguration {
  id?: number;
  sessionTimeout: number; // en minutos
  companyName: string;
  companyLogo?: string;
  currency: string;
  dateFormat: string;
  timeZone: string;
  maxFileSize: number; // en MB
  allowedFileTypes: string[];
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  emailNotifications: boolean;
  systemMaintenanceMode: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any; // Index signature for flexibility
}

export interface ISystemSettings {
  general: {
    companyName: string;
    companyLogo?: string;
    sessionTimeout: number;
    systemMaintenanceMode: boolean;
  };
  localization: {
    currency: string;
    dateFormat: string;
    timeZone: string;
  };
  fileManagement: {
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  backup: {
    backupEnabled: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
  notifications: {
    emailNotifications: boolean;
  };
}