import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ClientList } from '../components/ClientList';
import { ClientForm } from '../components/ClientForm';
import { ClientDetails } from '../components/ClientDetails';
import { clientService } from '../services/clientService';
import type { IClient, IClientFormData } from '../types/client';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const clientsData = await clientService.getAllClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
      showSnackbar('Error al cargar los clientes', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCreateClient = () => {
    setSelectedClient(null);
    setFormOpen(true);
  };

  const handleEditClient = (client: IClient) => {
    setSelectedClient(client);
    setFormOpen(true);
  };

  const handleViewClient = (client: IClient) => {
    setSelectedClient(client);
    setDetailsOpen(true);
  };

  const handleDeleteClick = (clientId: number) => {
    setClientToDelete(clientId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await clientService.deleteClient(clientToDelete);
      await loadClients();
      showSnackbar('Cliente eliminado correctamente', 'success');
    } catch (error: unknown) {
      console.error('Error deleting client:', error);
      showSnackbar((error as Error).message || 'Error al eliminar el cliente', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const handleFormSubmit = async (clientData: IClientFormData) => {
    try {
      setFormLoading(true);

      if (selectedClient) {
        await clientService.updateClient(selectedClient.id!, clientData);
        showSnackbar('Cliente actualizado correctamente', 'success');
      } else {
        await clientService.createClient(clientData);
        showSnackbar('Cliente creado correctamente', 'success');
      }

      await loadClients();
      setFormOpen(false);
      setSelectedClient(null);
    } catch (error: unknown) {
      console.error('Error saving client:', error);
      showSnackbar((error as Error).message || 'Error al guardar el cliente', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setFormOpen(false);
    setSelectedClient(null);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedClient(null);
  };

  const handleDetailsEdit = () => {
    setDetailsOpen(false);
    setFormOpen(true);
  };

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Gestión de Clientes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClient}
          >
            Nuevo Cliente
          </Button>
        </Box>

        <ClientList
          clients={clients}
          loading={loading}
          onEdit={handleEditClient}
          onDelete={handleDeleteClick}
          onView={handleViewClient}
        />

        {formOpen && (
          <ClientForm
            client={selectedClient || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={formLoading}
          />
        )}

        {detailsOpen && selectedClient && (
          <ClientDetails
            client={selectedClient}
            open={detailsOpen}
            onClose={handleDetailsClose}
            onEdit={handleDetailsEdit}
          />
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
        >
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas eliminar este cliente?
              Esta acción no se puede deshacer.
            </DialogContentText>
            <DialogContentText sx={{ mt: 2, color: 'warning.main' }}>
              <strong>Nota:</strong> No se puede eliminar un cliente que tenga contratos asociados.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};