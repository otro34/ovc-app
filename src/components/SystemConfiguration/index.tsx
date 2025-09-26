import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Alert,
  Snackbar
} from '@mui/material';
import { systemService } from '../../services/systemService';
import type { ISystemConfiguration, ISystemSettings } from '../../types/system';
import { GeneralSettings } from './GeneralSettings';
import { LocalizationSettings } from './LocalizationSettings';
import { FileSettings } from './FileSettings';
import { BackupSettings } from './BackupSettings';
import { NotificationSettings } from './NotificationSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`configuration-tabpanel-${index}`}
      aria-labelledby={`configuration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SystemConfiguration: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [config, setConfig] = useState<ISystemConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const loadConfiguration = useCallback(async () => {
    try {
      setLoading(true);
      const configuration = await systemService.getConfiguration();
      setConfig(configuration);
    } catch (error) {
      console.error('Error cargando configuración:', error);
      showNotification('Error al cargar la configuración', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleConfigUpdate = async (updates: Partial<ISystemConfiguration>) => {
    try {
      const updatedConfig = await systemService.updateConfiguration(updates);
      setConfig(updatedConfig);
      showNotification('Configuración actualizada correctamente', 'success');
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      showNotification('Error al actualizar la configuración', 'error');
    }
  };

  const handleResetToDefault = async () => {
    try {
      const defaultConfig = await systemService.resetToDefault();
      setConfig(defaultConfig);
      showNotification('Configuración restablecida a valores por defecto', 'success');
    } catch (error) {
      console.error('Error restableciendo configuración:', error);
      showNotification('Error al restablecer la configuración', 'error');
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Cargando configuración...</Typography>
      </Box>
    );
  }

  if (!config) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error">No se pudo cargar la configuración del sistema</Alert>
      </Box>
    );
  }

  const settings: ISystemSettings = {
    general: {
      companyName: config.companyName,
      companyLogo: config.companyLogo,
      sessionTimeout: config.sessionTimeout,
      systemMaintenanceMode: config.systemMaintenanceMode,
    },
    localization: {
      currency: config.currency,
      dateFormat: config.dateFormat,
      timeZone: config.timeZone,
    },
    fileManagement: {
      maxFileSize: config.maxFileSize,
      allowedFileTypes: config.allowedFileTypes,
    },
    backup: {
      backupEnabled: config.backupEnabled,
      backupFrequency: config.backupFrequency,
    },
    notifications: {
      emailNotifications: config.emailNotifications,
    },
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={1} sx={{ mb: 3, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Configuración del Sistema
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra los parámetros globales del sistema
        </Typography>
      </Paper>

      <Paper elevation={1}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="configuration tabs">
            <Tab label="General" />
            <Tab label="Localización" />
            <Tab label="Archivos" />
            <Tab label="Respaldo" />
            <Tab label="Notificaciones" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <GeneralSettings
            settings={settings.general}
            onUpdate={(updates) => handleConfigUpdate(updates)}
            onResetToDefault={handleResetToDefault}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <LocalizationSettings
            settings={settings.localization}
            onUpdate={(updates) => handleConfigUpdate(updates)}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <FileSettings
            settings={settings.fileManagement}
            onUpdate={(updates) => handleConfigUpdate(updates)}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <BackupSettings
            settings={settings.backup}
            onUpdate={(updates) => handleConfigUpdate(updates)}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={4}>
          <NotificationSettings
            settings={settings.notifications}
            onUpdate={(updates) => handleConfigUpdate(updates)}
          />
        </TabPanel>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};