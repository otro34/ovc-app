import React from 'react';
import {
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Box,
  CircularProgress
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility
} from '@mui/icons-material';

import {
  CardContainer,
  CardHeader,
  CardInfo,
  CardActions,
  CardDetails,
  DetailItem
} from './styles';
import type { IContractCardProps } from './types';
import { useContractPermissions } from '../../hooks/useContractPermissions';

const ContractCard: React.FC<IContractCardProps> = ({
  contract,
  onEdit,
  onDelete,
  onView
}) => {
  const { canEdit, canDelete, loading } = useContractPermissions(contract);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
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
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const calculateProgress = () => {
    return contract.totalVolume > 0
      ? (contract.attendedVolume / contract.totalVolume) * 100
      : 0;
  };

  return (
    <CardContainer onClick={() => onView?.(contract)}>
      <CardHeader>
        <CardInfo>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="h6">
              #{contract.correlativeNumber}
            </Typography>
            <Chip
              label={getStatusLabel(contract.status)}
              color={getStatusColor(contract.status) as 'success' | 'info' | 'error' | 'default'}
              size="small"
            />
          </Box>
          <Typography variant="subtitle1" color="primary">
            {contract.clientName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Progreso: {calculateProgress().toFixed(1)}% ({contract.attendedVolume.toFixed(2)} / {contract.totalVolume.toFixed(2)} Ton)
          </Typography>
        </CardInfo>

        <CardActions onClick={(e) => e.stopPropagation()}>
          {loading && <CircularProgress size={20} />}

          {!loading && onView && (
            <Tooltip title="Ver detalles">
              <IconButton size="small" onClick={() => onView(contract)}>
                <Visibility />
              </IconButton>
            </Tooltip>
          )}

          {!loading && onEdit && (
            <Tooltip title={canEdit ? "Editar contrato" : "No se puede editar: el contrato tiene pedidos asociados o no está activo"}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => onEdit(contract)}
                  disabled={!canEdit}
                >
                  <Edit />
                </IconButton>
              </span>
            </Tooltip>
          )}

          {!loading && onDelete && contract.id && (
            <Tooltip title={canDelete ? "Eliminar contrato" : "No se puede eliminar: el contrato tiene pedidos asociados o no está activo"}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => onDelete(contract.id!)}
                  disabled={!canDelete}
                >
                  <Delete />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </CardActions>
      </CardHeader>

      <CardDetails>
        <DetailItem>
          <Typography variant="caption" color="text.secondary">
            Precio Total
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {formatCurrency(contract.salePrice)}
          </Typography>
        </DetailItem>
        <DetailItem>
          <Typography variant="caption" color="text.secondary">
            Volumen Pendiente
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {contract.pendingVolume.toFixed(2)} Ton
          </Typography>
        </DetailItem>
        <DetailItem>
          <Typography variant="caption" color="text.secondary">
            Fecha Inicio
          </Typography>
          <Typography variant="body2">
            {formatDate(contract.startDate)}
          </Typography>
        </DetailItem>
        <DetailItem>
          <Typography variant="caption" color="text.secondary">
            Fecha Fin
          </Typography>
          <Typography variant="body2">
            {formatDate(contract.endDate)}
          </Typography>
        </DetailItem>
      </CardDetails>
    </CardContainer>
  );
};

export default ContractCard;