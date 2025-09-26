import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import type { IPurchaseOrder } from '../../types/purchaseOrder';

interface OrderStatusDialogProps {
  order: IPurchaseOrder;
  open: boolean;
  onClose: () => void;
  onStatusChange: (orderId: number, newStatus: string, data?: any) => void;
}

type StatusAction = 'deliver' | 'cancel' | 'reactivate';

export const OrderStatusDialog: React.FC<OrderStatusDialogProps> = ({
  order,
  open,
  onClose,
  onStatusChange,
}) => {
  const [action, setAction] = useState<StatusAction>('deliver');
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date());
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(false);

  const getAvailableActions = (): StatusAction[] => {
    switch (order.status) {
      case 'pending':
        return ['deliver', 'cancel'];
      case 'cancelled':
        return ['reactivate'];
      case 'delivered':
        return []; // Los pedidos entregados no se pueden cambiar
      default:
        return [];
    }
  };

  const getActionLabel = (action: StatusAction): string => {
    switch (action) {
      case 'deliver':
        return 'Marcar como Entregado';
      case 'cancel':
        return 'Cancelar Pedido';
      case 'reactivate':
        return 'Reactivar Pedido';
    }
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

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let data: any = {};

      switch (action) {
        case 'deliver':
          data.deliveryDate = deliveryDate;
          break;
        case 'cancel':
          if (!cancelReason.trim()) {
            alert('Por favor, ingrese un motivo para la cancelación');
            setLoading(false);
            return;
          }
          data.reason = cancelReason.trim();
          break;
        case 'reactivate':
          // No requiere datos adicionales
          break;
      }

      await onStatusChange(order.id!, action, data);
      handleClose();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert(error instanceof Error ? error.message : 'Error al cambiar el estado del pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAction('deliver');
      setDeliveryDate(new Date());
      setCancelReason('');
      onClose();
    }
  };

  const availableActions = getAvailableActions();

  if (availableActions.length === 0) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Estado del Pedido</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            Este pedido está en estado "Entregado" y no se puede modificar.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cambiar Estado del Pedido
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Pedido ID: #{order.id}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">
                Estado actual:
              </Typography>
              <Chip
                label={getStatusLabel(order.status)}
                color={getStatusColor(order.status)}
                size="small"
              />
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Volumen: {order.volume.toLocaleString()} unidades
            </Typography>
            <Typography variant="body2">
              Precio: ${order.price.toLocaleString('es-CO')} COP
            </Typography>
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel>Acción a realizar</InputLabel>
            <Select
              value={action}
              label="Acción a realizar"
              onChange={(e) => setAction(e.target.value as StatusAction)}
              disabled={loading}
            >
              {availableActions.map((actionOption) => (
                <MenuItem key={actionOption} value={actionOption}>
                  {getActionLabel(actionOption)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {action === 'deliver' && (
            <Box sx={{ mt: 2 }}>
              <DatePicker
                label="Fecha de entrega"
                value={deliveryDate}
                onChange={(newDate) => setDeliveryDate(newDate || new Date())}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                  },
                }}
              />
              <Alert severity="success" sx={{ mt: 1 }}>
                El pedido será marcado como entregado y no podrá ser modificado posteriormente.
              </Alert>
            </Box>
          )}

          {action === 'cancel' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Motivo de cancelación"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={loading}
                required
                helperText="Ingrese el motivo por el cual se cancela el pedido"
              />
              <Alert severity="warning" sx={{ mt: 1 }}>
                Al cancelar el pedido, se restaurará el volumen disponible en el contrato.
                El pedido podrá ser reactivado posteriormente si es necesario.
              </Alert>
            </Box>
          )}

          {action === 'reactivate' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              El pedido será reactivado y volverá al estado "Pendiente".
              Se verificará que el contrato tenga volumen disponible suficiente.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            color={action === 'cancel' ? 'error' : 'primary'}
          >
            {loading ? 'Procesando...' : getActionLabel(action)}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};