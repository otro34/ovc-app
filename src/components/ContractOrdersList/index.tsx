import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { contractService } from '../../services/contractService';
import type { IPurchaseOrder } from '../../types/purchaseOrder';
import type { Contract } from '../../services/database';

interface ContractOrdersListProps {
  contractId: number;
  onCreateOrder?: (contractId: number) => void;
  onCancelOrder?: (orderId: number) => void;
  showCreateButton?: boolean;
}

export const ContractOrdersList: React.FC<ContractOrdersListProps> = ({
  contractId,
  onCreateOrder,
  onCancelOrder,
  showCreateButton = true
}) => {
  const theme = useTheme();
  const [contract, setContract] = useState<Contract | null>(null);
  const [orders, setOrders] = useState<IPurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContractAndOrders();
  }, [contractId]);

  const loadContractAndOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const [contractData, ordersData] = await Promise.all([
        contractService.findById(contractId),
        purchaseOrderService.getPurchaseOrdersByContract(contractId)
      ]);

      if (!contractData) {
        throw new Error('Contrato no encontrado');
      }

      setContract(contractData);
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      console.error('Error loading contract and orders:', err);
    } finally {
      setLoading(false);
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

  const canCancelOrder = (order: IPurchaseOrder) => {
    return purchaseOrderService.canCancelOrder(order);
  };

  const handleCancelOrder = async (orderId: number) => {
    if (onCancelOrder) {
      onCancelOrder(orderId);
    }
  };

  const calculateTotals = () => {
    return orders.reduce((acc, order) => {
      if (order.status !== 'cancelled') {
        acc.volume += order.volume;
        acc.value += order.volume * order.price;
      }
      return acc;
    }, { volume: 0, value: 0 });
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Cargando pedidos del contrato...</Typography>
      </Paper>
    );
  }

  if (error || !contract) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">
          {error || 'Error al cargar el contrato'}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShippingIcon color="primary" />
            Pedidos de Venta - Contrato {contract.correlativeNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Total de {orders.length} pedido{orders.length !== 1 ? 's' : ''} registrado{orders.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {showCreateButton && contract.pendingVolume > 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onCreateOrder?.(contractId)}
          >
            Nuevo Pedido
          </Button>
        )}
      </Box>

      {/* Contract Summary */}
      <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Volumen Total del Contrato</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {contract.totalVolume.toLocaleString()} unidades
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Volumen Disponible</Typography>
            <Typography variant="h6" sx={{
              fontWeight: 'bold',
              color: contract.pendingVolume > 0 ? 'success.main' : 'warning.main'
            }}>
              {contract.pendingVolume.toLocaleString()} unidades
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Orders Summary */}
      {orders.length > 0 && (
        <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 1 }}>
          <Typography variant="subtitle2" color="info.main" gutterBottom>
            Resumen de Pedidos
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Volumen Total Pedidos</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {totals.volume.toLocaleString()} unidades
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Valor Total Pedidos</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {formatCurrency(totals.value)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Pedidos Pendientes</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {orders.filter(o => o.status === 'pending').length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Pedidos Entregados</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {orders.filter(o => o.status === 'delivered').length}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Orders Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Volumen</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Precio Unit.</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Total</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha Pedido</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha Entrega</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Notas</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No hay pedidos registrados para este contrato
                  </Typography>
                  {showCreateButton && contract.pendingVolume > 0 && (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => onCreateOrder?.(contractId)}
                      sx={{ mt: 2 }}
                    >
                      Crear primer pedido
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      #{order.id}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {order.volume.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatCurrency(order.price)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {formatCurrency(order.volume * order.price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(order.status)}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(order.orderDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.deliveryDate ? formatDate(order.deliveryDate) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 150 }}>
                      {order.notes ? (
                        order.notes.length > 50 ?
                          `${order.notes.substring(0, 50)}...` :
                          order.notes
                      ) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {canCancelOrder(order) ? (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleCancelOrder(order.id!)}
                      >
                        Cancelar
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};