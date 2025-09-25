import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import { Add, Assignment } from '@mui/icons-material';

import ContractForm from '../components/ContractForm';
import ContractList from '../components/ContractList';
import ContractDetails from '../components/ContractDetails';
import RecentContracts from '../components/RecentContracts';
import { contractService } from '../services/contractService';
import { clientService } from '../services/clientService';
import type { IContractWithClient, ICreateContract } from '../types/contract';
import type { IClient } from '../types/client';
import type { IContractFormData } from '../components/ContractForm/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    {...other}
  >
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<IContractWithClient[]>([]);
  const [recentContracts, setRecentContracts] = useState<IContractWithClient[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingContract, setEditingContract] = useState<IContractWithClient | null>(null);
  const [viewingContract, setViewingContract] = useState<IContractWithClient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; contractId: number | null }>({
    open: false,
    contractId: null
  });
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      const [contractsData, clientsData] = await Promise.all([
        contractService.findAll(),
        clientService.getAllClients()
      ]);

      const contractsWithClient: IContractWithClient[] = contractsData.map((contract): IContractWithClient => {
        const client = clientsData.find((c) => c.id === contract.clientId);
        return {
          ...contract,
          clientName: client?.name || 'Cliente no encontrado',
          clientEmail: client?.email
        };
      });

      setContracts(contractsWithClient);
      setClients(clientsData);

      const recent = await contractService.findRecent(5);
      const recentWithClient: IContractWithClient[] = recent.map((contract): IContractWithClient => {
        const client = clientsData.find((c) => c.id === contract.clientId);
        return {
          ...contract,
          clientName: client?.name || 'Cliente no encontrado',
          clientEmail: client?.email
        };
      });
      setRecentContracts(recentWithClient);

    } catch (error) {
      console.error('Error loading contracts:', error);
      showNotification('Error al cargar los contratos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const handleSubmit = async (data: IContractFormData) => {
    try {
      setFormLoading(true);

      const contractData: ICreateContract = {
        clientId: data.clientId,
        totalVolume: data.totalVolume,
        salePrice: data.salePrice,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status
      };

      if (editingContract) {
        await contractService.update(editingContract.id!, contractData);
        showNotification('Contrato actualizado exitosamente');
      } else {
        await contractService.create(contractData);
        showNotification('Contrato creado exitosamente');
      }

      await loadContracts();
      handleCloseForm();
    } catch (error: unknown) {
      console.error('Error saving contract:', error);
      showNotification(error instanceof Error ? error.message : 'Error al guardar el contrato', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (contract: IContractWithClient) => {
    if (!contract.id) return;

    try {
      const canEdit = await contractService.canEditContract(contract.id);
      if (!canEdit) {
        showNotification('No se puede editar un contrato con pedidos de venta asociados', 'warning');
        return;
      }
      setEditingContract(contract);
      setShowForm(true);
    } catch (error) {
      console.error('Error checking edit permissions:', error);
      showNotification('Error al verificar permisos de edición', 'error');
    }
  };

  const handleDelete = (contractId: number) => {
    setDeleteDialog({ open: true, contractId });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.contractId) return;

    try {
      await contractService.delete(deleteDialog.contractId);
      await loadContracts();
      showNotification('Contrato eliminado exitosamente');
    } catch (error: unknown) {
      console.error('Error deleting contract:', error);
      showNotification(error instanceof Error ? error.message : 'Error al eliminar el contrato', 'error');
    } finally {
      setDeleteDialog({ open: false, contractId: null });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingContract(null);
  };

  const handleView = (contract: IContractWithClient) => {
    setViewingContract(contract);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setViewingContract(null);
  };

  const handleEditFromDetails = (contract: IContractWithClient) => {
    handleCloseDetails();
    handleEdit(contract);
  };

  const handleDeleteFromDetails = (contractId: number) => {
    handleCloseDetails();
    handleDelete(contractId);
  };

  const getFormInitialData = (): IContractFormData | undefined => {
    if (!editingContract) return undefined;

    return {
      clientId: editingContract.clientId,
      totalVolume: editingContract.totalVolume,
      salePrice: editingContract.salePrice,
      startDate: new Date(editingContract.startDate).toISOString().split('T')[0],
      endDate: new Date(editingContract.endDate).toISOString().split('T')[0],
      status: editingContract.status
    };
  };

  return (
    <Container maxWidth="xl">
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Assignment color="primary" fontSize="large" />
            <Typography variant="h4" component="h1">
              Gestión de Contratos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowForm(true)}
            disabled={clients.length === 0}
          >
            Nuevo Contrato
          </Button>
        </Box>

        {clients.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Necesitas registrar al menos un cliente antes de crear contratos.
          </Alert>
        )}
      </Box>

      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Todos los Contratos" />
        <Tab label="Recientes" />
      </Tabs>

      <TabPanel value={selectedTab} index={0}>
        <ContractList
          contracts={contracts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        <RecentContracts
          contracts={recentContracts}
          loading={loading}
          onView={handleView}
          limit={10}
          title="Contratos Recientes"
        />
      </TabPanel>

      <Dialog
        open={showForm}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <ContractForm
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            clients={clients}
            loading={formLoading}
            initialData={getFormInitialData()}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDetails}
        onClose={handleCloseDetails}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {viewingContract && (
            <ContractDetails
              contract={viewingContract}
              onClose={handleCloseDetails}
              onEdit={handleEditFromDetails}
              onDelete={handleDeleteFromDetails}
              purchaseOrders={[]} // TODO: Load purchase orders from service
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, contractId: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este contrato? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, contractId: null })}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Contracts;