import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Typography,
  Box,
  Alert,
  LinearProgress,
} from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { format } from 'date-fns';
import { dashboardService } from '../../services/dashboardService';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

type ExportFormat = 'json' | 'csv';
type DataType = 'clients' | 'contracts' | 'orders' | 'all';

export const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose }) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [dataTypes, setDataTypes] = useState<Set<DataType>>(new Set(['all']));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataTypeChange = (type: DataType) => {
    const newDataTypes = new Set(dataTypes);

    if (type === 'all') {
      // Si se selecciona "all", deseleccionar todo lo demás
      setDataTypes(new Set(['all']));
    } else {
      // Si se selecciona algo específico, quitar "all"
      newDataTypes.delete('all');

      if (newDataTypes.has(type)) {
        newDataTypes.delete(type);
      } else {
        newDataTypes.add(type);
      }

      // Si no hay nada seleccionado, seleccionar "all"
      if (newDataTypes.size === 0) {
        newDataTypes.add('all');
      }

      setDataTypes(newDataTypes);
    }
  };

  const convertToCSV = (data: Record<string, unknown>[], headers?: string[]): string => {
    if (data.length === 0) return '';

    const actualHeaders = headers || Object.keys(data[0]);
    const csvHeader = actualHeaders.join(',');

    const csvRows = data.map(row =>
      actualHeaders.map(header => {
        const value = row[header];
        // Escapar comillas y manejar valores null/undefined
        if (value == null) return '';
        const stringValue = String(value);
        // Si contiene coma, salto de línea o comilla, envolver en comillas
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    );

    return [csvHeader, ...csvRows].join('\n');
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);

      let exportType: DataType = 'all';

      if (dataTypes.has('all')) {
        exportType = 'all';
      } else if (dataTypes.size === 1) {
        exportType = Array.from(dataTypes)[0];
      } else {
        exportType = 'all'; // Si hay múltiples seleccionados, exportar todo
      }

      const data = await dashboardService.exportData(exportType);

      if (exportFormat === 'json') {
        // Exportar como JSON
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `ovc-export-${exportType}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

      } else if (exportFormat === 'csv') {
        // Exportar como CSV (crear archivo ZIP con múltiples CSVs si es necesario)
        const files: { name: string; content: string }[] = [];

        if (data.clients) {
          const clientsCSV = convertToCSV(data.clients, [
            'id', 'name', 'email', 'phone', 'address', 'createdAt'
          ]);
          files.push({ name: 'clients.csv', content: clientsCSV });
        }

        if (data.contracts) {
          const contractsCSV = convertToCSV(data.contracts, [
            'id', 'correlativeNumber', 'clientName', 'totalVolume',
            'attendedVolume', 'pendingVolume', 'salePrice', 'status',
            'startDate', 'endDate', 'createdAt'
          ]);
          files.push({ name: 'contracts.csv', content: contractsCSV });
        }

        if (data.orders) {
          const ordersCSV = convertToCSV(data.orders, [
            'id', 'contractNumber', 'clientName', 'volume', 'price',
            'totalValue', 'status', 'orderDate', 'deliveryDate', 'notes', 'createdAt'
          ]);
          files.push({ name: 'purchase_orders.csv', content: ordersCSV });
        }

        // Si solo hay un archivo, descargarlo directamente
        if (files.length === 1) {
          const blob = new Blob([files[0].content], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `ovc-export-${exportType}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          // Si hay múltiples archivos, crear un mensaje explicativo
          // En una implementación real, aquí se podría usar una librería como JSZip
          const combinedContent = files.map(file =>
            `=== ${file.name.toUpperCase()} ===\n${file.content}\n\n`
          ).join('');

          const blob = new Blob([combinedContent], { type: 'text/plain;charset=utf-8;' });
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `ovc-export-all-${format(new Date(), 'yyyy-MM-dd-HHmm')}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }

      onClose();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FileDownload sx={{ mr: 1 }} />
          Exportar Datos
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Selecciona el formato y los tipos de datos que deseas exportar.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Formato */}
        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">Formato de Exportación</FormLabel>
          <RadioGroup
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            row
          >
            <FormControlLabel
              value="json"
              control={<Radio />}
              label="JSON (Recomendado)"
            />
            <FormControlLabel
              value="csv"
              control={<Radio />}
              label="CSV (Excel)"
            />
          </RadioGroup>
        </FormControl>

        {/* Tipos de datos */}
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <FormLabel component="legend">Datos a Exportar</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={dataTypes.has('all')}
                  onChange={() => handleDataTypeChange('all')}
                />
              }
              label="Todos los datos"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={dataTypes.has('clients')}
                  onChange={() => handleDataTypeChange('clients')}
                  disabled={dataTypes.has('all')}
                />
              }
              label="Clientes"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={dataTypes.has('contracts')}
                  onChange={() => handleDataTypeChange('contracts')}
                  disabled={dataTypes.has('all')}
                />
              }
              label="Contratos"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={dataTypes.has('orders')}
                  onChange={() => handleDataTypeChange('orders')}
                  disabled={dataTypes.has('all')}
                />
              }
              label="Pedidos de Venta"
            />
          </FormGroup>
        </FormControl>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            El archivo se descargará automáticamente con la fecha y hora actual.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={loading}
          startIcon={<FileDownload />}
        >
          {loading ? 'Exportando...' : 'Exportar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};