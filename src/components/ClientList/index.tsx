import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Tooltip,
  Chip,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import type { IClient, IClientFilters } from '../../types/client';

interface ClientListProps {
  clients: IClient[];
  loading: boolean;
  onEdit: (client: IClient) => void;
  onDelete: (clientId: number) => void;
  onView: (client: IClient) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  loading,
  onEdit,
  onDelete,
  onView
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<IClientFilters>({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const handleFilterChange = (field: keyof IClientFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const filteredClients = React.useMemo(() => {
    let filtered = [...clients];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        (client.email && client.email.toLowerCase().includes(searchLower)) ||
        (client.phone && client.phone.includes(filters.search!))
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy || 'name'] || '';
      const bValue = b[filters.sortBy || 'name'] || '';

      const comparison = aValue.toString().localeCompare(bValue.toString());
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [clients, filters]);

  const paginatedClients = filteredClients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Cargando clientes...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 300px' }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, email o teléfono..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box sx={{ flex: '0 1 150px' }}>
          <FormControl fullWidth>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={filters.sortBy}
              label="Ordenar por"
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <MenuItem value="name">Nombre</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="createdAt">Fecha de creación</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: '0 1 130px' }}>
          <FormControl fullWidth>
            <InputLabel>Orden</InputLabel>
            <Select
              value={filters.sortOrder}
              label="Orden"
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            >
              <MenuItem value="asc">Ascendente</MenuItem>
              <MenuItem value="desc">Descendente</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Fecha de creación</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {filters.search ? 'No se encontraron clientes con ese criterio' : 'No hay clientes registrados'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map((client) => (
                <TableRow key={client.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {client.name}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box>
                      {client.email && (
                        <Chip
                          icon={<EmailIcon />}
                          label={client.email}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 0.5, mr: 0.5 }}
                        />
                      )}
                      {client.phone && (
                        <Chip
                          icon={<PhoneIcon />}
                          label={client.phone}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                      )}
                      {!client.email && !client.phone && (
                        <Typography variant="body2" color="text.secondary">
                          Sin información de contacto
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {client.address || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(client.createdAt)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Box>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          onClick={() => onView(client)}
                          size="small"
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Editar">
                        <IconButton
                          onClick={() => onEdit(client)}
                          size="small"
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar">
                        <IconButton
                          onClick={() => onDelete(client.id!)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredClients.length > 0 && (
        <TablePagination
          component="div"
          count={filteredClients.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      )}
    </Box>
  );
};