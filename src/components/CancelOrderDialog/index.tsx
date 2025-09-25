import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import type { IPurchaseOrder } from '../../types/purchaseOrder';

interface CancelOrderDialogProps {
  open: boolean;
  order: IPurchaseOrder | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelOrderDialog: React.FC<CancelOrderDialogProps> = ({
  open,
  order,
  onClose,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!order) return;

    setLoading(true);
    setError(null);

    try {
      await purchaseOrderService.cancelPurchaseOrder(order.id!, reason.trim() || undefined);

      setReason('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
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
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
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

  if (!order) {
    return null;
  }

  const canCancel = purchaseOrderService.canCancelOrder(order);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        Cancelar Pedido de Venta
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {!canCancel && (
            <Alert severity="error">
              Este pedido no se puede cancelar. Solo los pedidos en estado "Pendiente" pueden ser cancelados.
            </Alert>
          )}

          {/* Order Details */}
          <Box sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'grey.50'
          }}>
            <Typography variant="subtitle2" gutterBottom>
              Detalles del Pedido
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">ID:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>#{order.id}</Typography>

              <Typography variant="body2" color="text.secondary">Volumen:</Typography>
              <Typography variant="body2">{order.volume.toLocaleString()} unidades</Typography>

              <Typography variant="body2" color="text.secondary">Precio unitario:</Typography>
              <Typography variant="body2">{formatCurrency(order.price)}</Typography>

              <Typography variant="body2" color="text.secondary">Total:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(order.volume * order.price)}
              </Typography>

              <Typography variant="body2" color="text.secondary">Estado:</Typography>
              <Box>
                <Chip
                  label={getStatusLabel(order.status)}
                  color={getStatusColor(order.status)}
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary">Fecha del pedido:</Typography>
              <Typography variant="body2">{formatDate(order.orderDate)}</Typography>

              {order.deliveryDate && (
                <>
                  <Typography variant="body2" color="text.secondary">Fecha de entrega:</Typography>
                  <Typography variant="body2">{formatDate(order.deliveryDate)}</Typography>
                </>
              )}

              {order.notes && (
                <>
                  <Typography variant="body2" color="text.secondary">Notas:</Typography>
                  <Typography variant="body2">{order.notes}</Typography>
                </>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Warning */}
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Advertencia:</strong> Al cancelar este pedido:
            </Typography>
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
              <li>El volumen ({order.volume.toLocaleString()} unidades) se restaurará al contrato</li>
              <li>El estado del pedido cambiará a "Cancelado"</li>
              <li>Esta acción no se puede deshacer</li>
            </ul>
          </Alert>

          {/* Cancellation Reason */}
          {canCancel && (
            <TextField
              label="Motivo de cancelación (opcional)"
              multiline
              rows={3}
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe el motivo por el cual se cancela este pedido..."
              helperText="Este motivo se agregará a las notas del pedido"
              disabled={loading}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cerrar
        </Button>
        {canCancel && (
          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};