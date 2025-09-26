import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { SystemConfiguration } from '../components/SystemConfiguration';
import { UserManagement } from '../components/UserManagement';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Administration: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { user } = useAuth();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          No tiene permisos para acceder al área de administración.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={1} sx={{ mb: 3, p: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Administración del Sistema
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Panel de control para administradores - Configuración avanzada del sistema
        </Typography>
      </Paper>

      <Paper elevation={1}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="admin navigation tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Configuración del Sistema" />
            <Tab label="Gestión de Usuarios" />
            <Tab label="Configuración de Seguridad" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <SystemConfiguration />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <UserManagement />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuración de Seguridad
            </Typography>
            <Alert severity="info">
              Las opciones de cambio de contraseña y configuración de seguridad
              estarán disponibles aquí. Esta funcionalidad se implementará en la siguiente fase.
            </Alert>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Administration;