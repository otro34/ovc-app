import React, { useState, useMemo } from 'react';
import {
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  Assignment
} from '@mui/icons-material';

import {
  ListContainer,
  SearchContainer,
  FilterContainer,
  EmptyState
} from './styles';
import ContractCard from '../ContractCard';
import type { IContractListProps, IContractFilters } from './types';

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
          <ContractCard
            key={contract.id}
            contract={contract}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
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