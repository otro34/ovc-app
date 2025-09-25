import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  TablePagination,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import type { IPurchaseOrderWithContract } from '../../types/purchaseOrder';

interface PurchaseOrderListProps {
  onCreateOrder: () => void;
  onViewOrder?: (orderId: number) => void;
  onEditOrder?: (orderId: number) => void;
  onCancelOrder?: (orderId: number) => void;
  contractId?: number; // Para filtrar por contrato específico
}

export const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  onCreateOrder,
  onViewOrder,
  onEditOrder,
  onCancelOrder,
  contractId
}) => {
  const theme = useTheme();
  const [orders, setOrders] = useState<IPurchaseOrderWithContract[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<IPurchaseOrderWithContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<IPurchaseOrderWithContract | null>(null);

  useEffect(() => {
    loadOrders();
  }, [contractId]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      let orderData: IPurchaseOrderWithContract[];

      if (contractId) {
        // Para órdenes de contrato específico, necesitamos enriquecer con datos del contrato
        const allOrders = await purchaseOrderService.getAllPurchaseOrders();
        orderData = allOrders.filter(order => order.contractId === contractId);
      } else {
        orderData = await purchaseOrderService.getAllPurchaseOrders();
      }

      setOrders(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los pedidos');
      console.error('Error loading purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (!searchTerm) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter(order =>
      order.contract?.correlativeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.contract?.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredOrders(filtered);
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, order: IPurchaseOrderWithContract) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleView = () => {
    if (selectedOrder && onViewOrder) {
      onViewOrder(selectedOrder.id!);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedOrder && onEditOrder) {
      onEditOrder(selectedOrder.id!);
    }
    handleMenuClose();
  };

  const handleCancel = () => {
    if (selectedOrder && onCancelOrder) {
      onCancelOrder(selectedOrder.id!);
    }
    handleMenuClose();
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

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const canEditOrder = (order: IPurchaseOrderWithContract) => {
    return purchaseOrderService.canEditOrder(order);
  };

  const canCancelOrder = (order: IPurchaseOrderWithContract) => {
    return purchaseOrderService.canCancelOrder(order);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Cargando pedidos...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2">
          {contractId ? 'Pedidos del Contrato' : 'Lista de Pedidos de Venta'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateOrder}
        >
          Nuevo Pedido
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por contrato, cliente, estado o notas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Contrato</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Volumen</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Precio Unit.</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Total</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha Pedido</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha Entrega</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'No se encontraron pedidos que coincidan con la búsqueda' : 'No hay pedidos registrados'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {order.contract?.correlativeNumber || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.contract?.clientName || 'N/A'}
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
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, order)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {onViewOrder && (
          <MenuItem onClick={handleView}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            Ver detalles
          </MenuItem>
        )}

        {onEditOrder && selectedOrder && canEditOrder(selectedOrder) && (
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Editar
          </MenuItem>
        )}

        {onCancelOrder && selectedOrder && canCancelOrder(selectedOrder) && (
          <MenuItem onClick={handleCancel} sx={{ color: 'error.main' }}>
            <CancelIcon fontSize="small" sx={{ mr: 1 }} />
            Cancelar
          </MenuItem>
        )}

        {(!selectedOrder || (!canEditOrder(selectedOrder) && !canCancelOrder(selectedOrder))) && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No hay acciones disponibles
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};