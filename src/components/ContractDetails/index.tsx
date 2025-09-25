import React from 'react';
import {
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Close,
  Edit,
  Delete,
  Assignment,
  Person,
  CalendarToday,
  AttachMoney,
  Scale,
  CheckCircle,
  Schedule,
  Cancel,
  LocalShipping
} from '@mui/icons-material';

import {
  DetailsContainer,
  HeaderSection,
  InfoSection,
  InfoGrid,
  InfoCard,
  ProgressSection,
  PurchaseOrdersSection,
  PurchaseOrderCard,
  ActionsSection,
  StatusChip
} from './styles';
import type { IContractDetailsProps, IContractProgress } from './types';
import { useContractPermissions } from '../../hooks/useContractPermissions';

const ContractDetails: React.FC<IContractDetailsProps> = ({
  contract,
  onClose,
  onEdit,
  onDelete,
  purchaseOrders = []
}) => {
  const { canEdit, canDelete } = useContractPermissions(contract);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const getProgress = (): IContractProgress => {
    const percentage = contract.totalVolume > 0
      ? (contract.attendedVolume / contract.totalVolume) * 100
      : 0;

    return {
      percentage,
      attendedVolume: contract.attendedVolume,
      pendingVolume: contract.pendingVolume,
      totalVolume: contract.totalVolume,
      isCompleted: percentage >= 100
    };
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };


  const getPurchaseOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Schedule color="warning" />;
      case 'cancelled':
        return <Cancel color="error" />;
      default:
        return <LocalShipping />;
    }
  };

  const getPurchaseOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const progress = getProgress();

  return (
    <DetailsContainer>
      <HeaderSection>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Assignment color="primary" fontSize="large" />
              <Typography variant="h4" component="h1">
                Contrato #{contract.correlativeNumber}
              </Typography>
              <StatusChip status={contract.status}>
                {getStatusLabel(contract.status)}
              </StatusChip>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Person color="action" />
              <Typography variant="h6" color="primary">
                {contract.clientName}
              </Typography>
            </Box>
            {contract.clientEmail && (
              <Typography variant="body2" color="text.secondary">
                {contract.clientEmail}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} size="large">
            <Close />
          </IconButton>
        </Box>
      </HeaderSection>

      <InfoSection>
        <InfoGrid>
          <InfoCard className="primary">
            <AttachMoney fontSize="large" />
            <Typography variant="h6" gutterBottom>
              Precio Total
            </Typography>
            <Typography variant="h4">
              {formatCurrency(contract.salePrice)}
            </Typography>
          </InfoCard>

          <InfoCard>
            <Scale fontSize="large" />
            <Typography variant="h6" gutterBottom>
              Volumen Total
            </Typography>
            <Typography variant="h4">
              {contract.totalVolume.toFixed(2)} Ton
            </Typography>
          </InfoCard>

          <InfoCard className="success">
            <CheckCircle fontSize="large" />
            <Typography variant="h6" gutterBottom>
              Vol. Atendido
            </Typography>
            <Typography variant="h4">
              {contract.attendedVolume.toFixed(2)} Ton
            </Typography>
          </InfoCard>

          <InfoCard className="warning">
            <Schedule fontSize="large" />
            <Typography variant="h6" gutterBottom>
              Vol. Pendiente
            </Typography>
            <Typography variant="h4">
              {contract.pendingVolume.toFixed(2)} Ton
            </Typography>
          </InfoCard>
        </InfoGrid>

        <Box display="flex" gap={3} mt={2}>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CalendarToday color="action" />
              <Typography variant="body1" fontWeight="medium">
                Fecha de Inicio:
              </Typography>
            </Box>
            <Typography variant="body1">
              {formatDate(contract.startDate)}
            </Typography>
          </Box>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CalendarToday color="action" />
              <Typography variant="body1" fontWeight="medium">
                Fecha de Fin:
              </Typography>
            </Box>
            <Typography variant="body1">
              {formatDate(contract.endDate)}
            </Typography>
          </Box>
        </Box>
      </InfoSection>

      <ProgressSection>
        <Typography variant="h6" gutterBottom>
          Progreso del Contrato
        </Typography>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Box flex={1}>
            <LinearProgress
              variant="determinate"
              value={progress.percentage}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Typography variant="h6" fontWeight="bold" color="primary">
            {progress.percentage.toFixed(1)}%
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {progress.isCompleted
            ? '✅ Contrato completado'
            : `Quedan ${progress.pendingVolume.toFixed(2)} toneladas por atender`
          }
        </Typography>
      </ProgressSection>

      <PurchaseOrdersSection>
        <Typography variant="h6" gutterBottom>
          Pedidos de Venta Asociados ({purchaseOrders.length})
        </Typography>

        {purchaseOrders.length === 0 ? (
          <Box textAlign="center" py={3}>
            <LocalShipping sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No hay pedidos de venta registrados para este contrato
            </Typography>
          </Box>
        ) : (
          <List>
            {purchaseOrders.map((order) => (
              <PurchaseOrderCard key={order.id}>
                <ListItem>
                  <Box display="flex" alignItems="center" gap={1} mr={2}>
                    {getPurchaseOrderStatusIcon(order.status)}
                  </Box>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {order.volume.toFixed(2)} Toneladas
                        </Typography>
                        <Chip
                          label={getPurchaseOrderStatusLabel(order.status)}
                          color={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'pending' ? 'warning' :
                            'error'
                          }
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Precio: {formatCurrency(order.price)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Fecha: {formatDateShort(order.orderDate)}
                          {order.deliveryDate && ` | Entrega: ${formatDateShort(order.deliveryDate)}`}
                        </Typography>
                        {order.notes && (
                          <Typography variant="body2" color="text.secondary">
                            Notas: {order.notes}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </PurchaseOrderCard>
            ))}
          </List>
        )}
      </PurchaseOrdersSection>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="caption" color="text.secondary">
            Creado: {formatDateShort(contract.createdAt || new Date())}
          </Typography>
          {contract.updatedAt && contract.updatedAt !== contract.createdAt && (
            <Typography variant="caption" color="text.secondary" display="block">
              Actualizado: {formatDateShort(contract.updatedAt)}
            </Typography>
          )}
        </Box>

        <ActionsSection>
          <Button variant="outlined" onClick={onClose}>
            Cerrar
          </Button>

          {onEdit && (
            <Tooltip title={canEdit ? "Editar contrato" : "No se puede editar: el contrato tiene pedidos asociados o no está activo"}>
              <span>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Edit />}
                  onClick={() => onEdit(contract)}
                  disabled={!canEdit}
                >
                  Editar
                </Button>
              </span>
            </Tooltip>
          )}

          {onDelete && contract.id && (
            <Tooltip title={canDelete ? "Eliminar contrato" : "No se puede eliminar: el contrato tiene pedidos asociados o no está activo"}>
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => onDelete(contract.id!)}
                  disabled={!canDelete}
                >
                  Eliminar
                </Button>
              </span>
            </Tooltip>
          )}
        </ActionsSection>
      </Box>
    </DetailsContainer>
  );
};

export default ContractDetails;