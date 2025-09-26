import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  List as ListIcon
} from '@mui/icons-material';
import { PurchaseOrderForm } from '../components/PurchaseOrderForm';
import { PurchaseOrderList } from '../components/PurchaseOrderList';
import { CancelOrderDialog } from '../components/CancelOrderDialog';
import { PurchaseOrderDetails } from '../components/PurchaseOrderDetails';
import { OrderStatusDialog } from '../components/OrderStatusDialog';
import { purchaseOrderService } from '../services/purchaseOrderService';
import type { IPurchaseOrder } from '../types/purchaseOrder';

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
      id={`purchase-orders-tabpanel-${index}`}
      aria-labelledby={`purchase-orders-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PurchaseOrders() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [preselectedContractId, setPreselectedContractId] = useState<number | undefined>();
  const [editOrder, setEditOrder] = useState<IPurchaseOrder | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    order: IPurchaseOrder | null;
  }>({
    open: false,
    order: null
  });
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    orderId: number | null;
  }>({
    open: false,
    orderId: null
  });
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    order: IPurchaseOrder | null;
  }>({
    open: false,
    order: null
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Manejar navegación desde contrato details
  useEffect(() => {
    const state = location.state as {
      preselectedContractId?: number;
      openForm?: boolean;
      cancelOrderId?: number;
      fromContract?: boolean;
    };

    if (state?.preselectedContractId && state?.openForm) {
      setPreselectedContractId(state.preselectedContractId);
      setShowForm(true);
    } else if (state?.cancelOrderId && state?.fromContract) {
      // Handle cancel order action from contract details
      handleCancelOrder(state.cancelOrderId);
    }

    // Limpiar el estado para evitar reapertura
    if (state) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state, handleCancelOrder]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateOrder = (contractId?: number) => {
    setPreselectedContractId(contractId);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setPreselectedContractId(undefined);
    setEditOrder(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCancelOrder = useCallback(async (orderId: number) => {
    try {
      const order = await purchaseOrderService.getPurchaseOrderById(orderId);
      if (order) {
        setCancelDialog({ open: true, order });
      }
    } catch (error) {
      console.error('Error loading order for cancellation:', error);
    }
  }, []);

  const handleCancelDialogClose = () => {
    setCancelDialog({ open: false, order: null });
  };

  const handleCancelSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleViewOrder = (orderId: number) => {
    setDetailsDialog({ open: true, orderId });
  };

  const handleCloseDetails = () => {
    setDetailsDialog({ open: false, orderId: null });
  };

  const handleEditFromDetails = async (orderId: number) => {
    handleCloseDetails();
    await handleEditOrder(orderId);
  };

  const handleCancelFromDetails = (orderId: number) => {
    handleCloseDetails();
    handleCancelOrder(orderId);
  };

  const handleEditOrder = async (orderId: number) => {
    try {
      const order = await purchaseOrderService.getPurchaseOrderById(orderId);
      if (order) {
        setEditOrder(order);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error loading order for editing:', error);
    }
  };

  const handleChangeStatus = async (orderId: number) => {
    try {
      const order = await purchaseOrderService.getPurchaseOrderById(orderId);
      if (order) {
        setStatusDialog({
          open: true,
          order: order
        });
      }
    } catch (error) {
      console.error('Error loading order for status change:', error);
    }
  };

  const handleStatusChange = async (orderId: number, action: string, data?: { deliveryDate?: Date; reason?: string }) => {
    try {
      switch (action) {
        case 'deliver':
          await purchaseOrderService.markAsDelivered(orderId, data?.deliveryDate);
          break;
        case 'cancel':
          await purchaseOrderService.markAsCancelled(orderId, data?.reason);
          break;
        case 'reactivate':
          await purchaseOrderService.reactivateOrder(orderId);
          break;
        default:
          throw new Error('Acción no válida');
      }

      // Actualizar la lista
      setRefreshKey(prev => prev + 1);

      // Cerrar diálogo
      setStatusDialog({
        open: false,
        order: null
      });
    } catch (error) {
      console.error('Error changing order status:', error);
      throw error; // Re-throw para que el diálogo maneje el error
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <ShoppingCartIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Pedidos de Venta
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestión de pedidos de venta vinculados a contratos
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab
              icon={<ListIcon />}
              label="Lista de Pedidos"
              id="purchase-orders-tab-0"
              aria-controls="purchase-orders-tabpanel-0"
            />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <PurchaseOrderList
            key={refreshKey}
            onCreateOrder={() => handleCreateOrder()}
            onViewOrder={handleViewOrder}
            onEditOrder={handleEditOrder}
            onCancelOrder={handleCancelOrder}
            onChangeStatus={handleChangeStatus}
          />
        </TabPanel>

        {/* Form Dialog */}
        <PurchaseOrderForm
          open={showForm}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          preselectedContractId={preselectedContractId}
          editOrder={editOrder}
        />

        {/* Cancel Dialog */}
        <CancelOrderDialog
          open={cancelDialog.open}
          order={cancelDialog.order}
          onClose={handleCancelDialogClose}
          onSuccess={handleCancelSuccess}
        />

        {/* Details Dialog */}
        <PurchaseOrderDetails
          orderId={detailsDialog.orderId}
          open={detailsDialog.open}
          onClose={handleCloseDetails}
          onEdit={handleEditFromDetails}
          onCancel={handleCancelFromDetails}
        />

        {/* Status Change Dialog */}
        {statusDialog.order && (
          <OrderStatusDialog
            order={statusDialog.order}
            open={statusDialog.open}
            onClose={() => setStatusDialog({ open: false, order: null })}
            onStatusChange={handleStatusChange}
          />
        )}
      </Box>
    </Container>
  );
}