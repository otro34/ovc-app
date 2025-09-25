import React from 'react';
import {
  Typography,
  Chip,
  Box,
  LinearProgress,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Assignment,
  Schedule,
  TrendingUp,
  CheckCircle
} from '@mui/icons-material';

import {
  RecentContainer,
  ContractItem,
  ContractMainInfo,
  ContractIcon,
  ContractInfo,
  ContractMeta,
  ProgressContainer,
  EmptyState
} from './styles';
import type { IRecentContractsProps } from './types';
import type { IContractWithClient } from '../../types/contract';

const RecentContracts: React.FC<IRecentContractsProps> = ({
  contracts,
  loading = false,
  onView,
  limit = 5,
  title = 'Contratos Recientes'
}) => {
  const displayContracts = contracts.slice(0, limit);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Schedule />;
      case 'completed':
        return <CheckCircle />;
      case 'cancelled':
        return <Assignment />;
      default:
        return <Assignment />;
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
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const calculateProgress = (contract: IContractWithClient) => {
    return contract.totalVolume > 0
      ? (contract.attendedVolume / contract.totalVolume) * 100
      : 0;
  };

  const getDaysUntilEnd = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <RecentContainer>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={24} />
        </Box>
      </RecentContainer>
    );
  }

  return (
    <RecentContainer>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">
          {title}
        </Typography>
        {contracts.length > limit && (
          <Typography variant="caption" color="text.secondary">
            +{contracts.length - limit} más
          </Typography>
        )}
      </Box>

      {displayContracts.length === 0 ? (
        <EmptyState>
          <Assignment sx={{ fontSize: 32, mb: 1 }} />
          <Typography variant="body2">
            No hay contratos recientes
          </Typography>
        </EmptyState>
      ) : (
        displayContracts.map((contract) => {
          const progress = calculateProgress(contract);
          const daysUntilEnd = getDaysUntilEnd(contract.endDate);

          return (
            <ContractItem
              key={contract.id}
              onClick={() => onView?.(contract)}
            >
              <ContractMainInfo>
                <ContractIcon>
                  {getStatusIcon(contract.status)}
                </ContractIcon>
                <ContractInfo>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      #{contract.correlativeNumber}
                    </Typography>
                    <Chip
                      label={getStatusLabel(contract.status)}
                      color={getStatusColor(contract.status) as 'success' | 'info' | 'error' | 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {contract.clientName}
                  </Typography>
                  <ContractMeta>
                    <Typography variant="caption">
                      {formatCurrency(contract.salePrice)}
                    </Typography>
                    <Typography variant="caption">•</Typography>
                    <Typography variant="caption">
                      {contract.totalVolume.toFixed(1)} Ton
                    </Typography>
                    <Typography variant="caption">•</Typography>
                    <Typography variant="caption">
                      Vence {formatDate(contract.endDate)}
                    </Typography>
                  </ContractMeta>
                </ContractInfo>
              </ContractMainInfo>

              <ProgressContainer>
                <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    {progress.toFixed(0)}% completado
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ width: 60, height: 4, borderRadius: 2 }}
                      color={
                        progress === 100 ? 'success' :
                        progress > 75 ? 'info' :
                        progress > 50 ? 'warning' : 'primary'
                      }
                    />
                    <Tooltip title={`${daysUntilEnd} días restantes`}>
                      <TrendingUp
                        fontSize="small"
                        color={daysUntilEnd < 30 ? 'error' : 'action'}
                      />
                    </Tooltip>
                  </Box>
                </Box>
              </ProgressContainer>
            </ContractItem>
          );
        })
      )}
    </RecentContainer>
  );
};

export default RecentContracts;