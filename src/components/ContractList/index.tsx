import React, { useState, useMemo } from 'react';
import {
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  Visibility,
  Assignment
} from '@mui/icons-material';

import {
  ListContainer,
  SearchContainer,
  FilterContainer,
  ContractCard,
  ContractHeader,
  ContractInfo,
  ContractActions,
  ContractDetails,
  DetailItem,
  EmptyState
} from './styles';
import type { IContractListProps, IContractFilters } from './types';
import type { IContractWithClient } from '../../types/contract';

const ContractList: React.FC<IContractListProps> = ({
  contracts,
  loading = false,
  onEdit,
  onDelete,
  onView,
  searchTerm = '',
  onSearchChange
}) => {
  const [filters, setFilters] = useState<IContractFilters>({
    status: 'all',
    client: '',
    dateRange: { start: '', end: '' }
  });

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const matchesSearch = searchTerm === '' ||
        contract.correlativeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.clientName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filters.status === 'all' || contract.status === filters.status;

      const matchesClient = filters.client === '' ||
        contract.clientName.toLowerCase().includes(filters.client.toLowerCase());

      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [contracts, searchTerm, filters]);

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

  const calculateProgress = (contract: IContractWithClient) => {
    return contract.totalVolume > 0
      ? (contract.attendedVolume / contract.totalVolume) * 100
      : 0;
  };

  if (loading) {
    return (
      <ListContainer>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <SearchContainer>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por número correlativo o cliente..."
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
        <FilterContainer>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filters.status}
              label="Estado"
              onChange={(e) => setFilters(prev => ({
                ...prev,
                status: e.target.value as IContractFilters['status']
              }))}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Activo</MenuItem>
              <MenuItem value="completed">Completado</MenuItem>
              <MenuItem value="cancelled">Cancelado</MenuItem>
            </Select>
          </FormControl>
        </FilterContainer>
      </SearchContainer>

      {filteredContracts.length === 0 ? (
        <EmptyState>
          <Assignment sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No se encontraron contratos
          </Typography>
          <Typography variant="body2">
            {searchTerm || filters.status !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando tu primer contrato'
            }
          </Typography>
        </EmptyState>
      ) : (
        filteredContracts.map((contract) => (
          <ContractCard key={contract.id} onClick={() => onView?.(contract)}>
            <ContractHeader>
              <ContractInfo>
                <Box display="flex" alignItems="center" gap={1}>
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
                  Progreso: {calculateProgress(contract).toFixed(1)}% ({contract.attendedVolume.toFixed(2)} / {contract.totalVolume.toFixed(2)} Ton)
                </Typography>
              </ContractInfo>
              <ContractActions onClick={(e) => e.stopPropagation()}>
                {onView && (
                  <Tooltip title="Ver detalles">
                    <IconButton size="small" onClick={() => onView(contract)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                )}
                {onEdit && contract.status === 'active' && (
                  <Tooltip title="Editar contrato">
                    <IconButton size="small" onClick={() => onEdit(contract)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                )}
                {onDelete && contract.attendedVolume === 0 && contract.id != null && (
                  <Tooltip title="Eliminar contrato">
                    <IconButton size="small" onClick={() => onDelete(contract.id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                )}
              </ContractActions>
            </ContractHeader>

            <ContractDetails>
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
            </ContractDetails>
          </ContractCard>
        ))
      )}

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          Mostrando {filteredContracts.length} de {contracts.length} contratos
        </Typography>
      </Box>
    </ListContainer>
  );
};

export default ContractList;