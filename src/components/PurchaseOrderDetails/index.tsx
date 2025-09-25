import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Alert,
  Paper,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  LocalShipping as LocalShippingIcon,
  CalendarToday as CalendarIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { contractService } from '../../services/contractService';
import { clientService } from '../../services/clientService';
import type { IPurchaseOrder } from '../../types/purchaseOrder';
import type { Contract } from '../../services/database';
import type { IClient } from '../../types/client';

interface PurchaseOrderDetailsProps {
  orderId: number | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (orderId: number) => void;
  onCancel?: (orderId: number) => void;
}

export const PurchaseOrderDetails: React.FC<PurchaseOrderDetailsProps> = ({
  orderId,
  open,
  onClose,
  onEdit,
  onCancel
}) => {
  const [order, setOrder] = useState<IPurchaseOrder | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [client, setClient] = useState<IClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId && open) {
      loadOrderDetails();
    }
  }, [orderId, open]);

  const loadOrderDetails = async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      // Cargar el pedido
      const orderData = await purchaseOrderService.getPurchaseOrderById(orderId);
      if (!orderData) {
        throw new Error('Pedido no encontrado');
      }

      setOrder(orderData);

      // Cargar el contrato
      const contractData = await contractService.findById(orderData.contractId);
      if (contractData) {
        setContract(contractData);

        // Cargar el cliente
        const clientData = await clientService.getClientById(contractData.clientId);
        if (clientData) {
          setClient(clientData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles del pedido');
      console.error('Error loading order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd \'de\' MMMM \'de\' yyyy', { locale: es });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const canEdit = order && purchaseOrderService.canEditOrder(order);
  const canCancel = order && purchaseOrderService.canCancelOrder(order);

  const handleEdit = () => {
    if (order && onEdit) {
      onEdit(order.id!);
      onClose();
    }
  };

  const handleCancel = () => {
    if (order && onCancel) {
      onCancel(order.id!);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalShippingIcon color="primary" />
          <Typography variant="h5" component="h2">
            Detalles del Pedido
          </Typography>
          {order && (
            <Chip
              label={`#${order.id}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {loading && (
          <Typography>Cargando detalles del pedido...</Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {order && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Estado del Pedido */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">Estado:</Typography>
              <Chip
                label={getStatusLabel(order.status)}
                color={getStatusColor(order.status)}
                size="medium"
              />
            </Box>

            <Divider />

            {/* Información del Contrato y Cliente */}
            {contract && client && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon color="primary" />
                  Información del Contrato
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Número de Contrato:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {contract.correlativeNumber}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Cliente:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" />
                      {client.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Email del Cliente:</Typography>
                    <Typography variant="body1">
                      {client.email || 'No especificado'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Teléfono del Cliente:</Typography>
                    <Typography variant="body1">
                      {client.phone || 'No especificado'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Detalles del Pedido */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingIcon color="primary" />
                Detalles del Pedido
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Volumen:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {order.volume.toLocaleString()} unidades
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Precio por unidad:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(order.price)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Valor Total:</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {formatCurrency(order.volume * order.price)}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Fechas */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="primary" />
                Fechas Importantes
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Fecha del Pedido:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {formatDate(order.orderDate)}
                  </Typography>
                </Box>
                {order.deliveryDate && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Fecha de Entrega:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {formatDate(order.deliveryDate)}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="body2" color="text.secondary">Fecha de Creación:</Typography>
                  <Typography variant="body1">
                    {order.createdAt ? formatDate(order.createdAt) : 'No especificada'}
                  </Typography>
                </Box>
                {order.updatedAt && order.updatedAt !== order.createdAt && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Última Modificación:</Typography>
                    <Typography variant="body1">
                      {formatDate(order.updatedAt)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Notas */}
            {order.notes && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotesIcon color="primary" />
                  Notas y Observaciones
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {order.notes}
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
        {canEdit && onEdit && (
          <Button onClick={handleEdit} variant="outlined" color="primary">
            Editar
          </Button>
        )}
        {canCancel && onCancel && (
          <Button onClick={handleCancel} variant="outlined" color="error">
            Cancelar Pedido
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};