import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Divider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { IPurchaseOrderCreate, IPurchaseOrder } from '../../types/purchaseOrder';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { contractService } from '../../services/contractService';
import { clientService } from '../../services/clientService';
import type { Contract } from '../../services/database';

interface PurchaseOrderFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedContractId?: number;
  editOrder?: IPurchaseOrder | null;
}

interface ContractOption {
  id: number;
  correlativeNumber: string;
  clientName: string;
  pendingVolume: number;
  totalVolume: number;
  salePrice: number;
}

const validationSchema = yup.object({
  contractId: yup.number()
    .required('El contrato es requerido')
    .test('valid-contract', 'Debe seleccionar un contrato válido', value => value > 0),
  volume: yup.number()
    .required('El volumen es requerido')
    .test('positive-volume', 'El volumen debe ser mayor a 0', value => value > 0)
    .max(999999, 'El volumen no puede exceder 999,999'),
  price: yup.number()
    .required('El precio es requerido')
    .test('positive-price', 'El precio debe ser mayor a 0', value => value > 0)
    .max(999999999, 'El precio no puede exceder 999,999,999'),
  orderDate: yup.date()
    .required('La fecha del pedido es requerida')
    .max(new Date(), 'La fecha no puede ser futura'),
  deliveryDate: yup.date()
    .nullable()
    .min(yup.ref('orderDate'), 'La fecha de entrega debe ser posterior a la fecha del pedido'),
  notes: yup.string().max(500, 'Las notas no pueden exceder 500 caracteres')
});

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  open,
  onClose,
  onSuccess,
  preselectedContractId,
  editOrder
}) => {
  const isEditMode = Boolean(editOrder);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractOption | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onTouched',
    defaultValues: {
      contractId: editOrder?.contractId || preselectedContractId || 0,
      volume: editOrder?.volume || 0,
      price: editOrder?.price || 0,
      orderDate: editOrder ? new Date(editOrder.orderDate) : new Date(),
      deliveryDate: editOrder?.deliveryDate ? new Date(editOrder.deliveryDate) : undefined,
      notes: editOrder?.notes || ''
    }
  });

  const contractId = watch('contractId');
  const volume = watch('volume');

  useEffect(() => {
    if (open) {
      loadContracts();
      if (editOrder) {
        // Load edit data
        setValue('contractId', editOrder.contractId);
        setValue('volume', editOrder.volume);
        setValue('price', editOrder.price);
        setValue('orderDate', new Date(editOrder.orderDate));
        setValue('deliveryDate', editOrder.deliveryDate ? new Date(editOrder.deliveryDate) : undefined);
        setValue('notes', editOrder.notes || '');
      } else if (preselectedContractId) {
        setValue('contractId', preselectedContractId);
      }
    }
  }, [open, preselectedContractId, editOrder, setValue, isEditMode]);

  useEffect(() => {
    if (contractId) {
      const contract = contracts.find(c => c.id === contractId);
      setSelectedContract(contract || null);

      if (contract && !isEditMode) {
        // Solo sugerir el precio del contrato en modo creación
        setValue('price', contract.salePrice);
      }
    } else {
      setSelectedContract(null);
    }
  }, [contractId, contracts, setValue, isEditMode]);

  const loadContracts = async () => {
    try {
      const allContracts = await contractService.findAll();
      let contractsToShow: Contract[];

      if (isEditMode && editOrder) {
        // En modo edición, incluir siempre el contrato del pedido que se está editando
        contractsToShow = allContracts.filter(c =>
          (c.status === 'active' && c.pendingVolume > 0) || c.id === editOrder.contractId
        );
      } else {
        // En modo creación, solo contratos activos con volumen disponible
        contractsToShow = allContracts.filter(c =>
          c.status === 'active' && c.pendingVolume > 0
        );
      }

      const contractOptions = await Promise.all(
        contractsToShow.map(async (contract: Contract) => {
          const client = await clientService.getClientById(contract.clientId);
          return {
            id: contract.id!,
            correlativeNumber: contract.correlativeNumber,
            clientName: client?.name || 'Cliente desconocido',
            pendingVolume: contract.pendingVolume,
            totalVolume: contract.totalVolume,
            salePrice: contract.salePrice
          };
        })
      );

      setContracts(contractOptions);
    } catch (err) {
      setError('Error al cargar los contratos');
      console.error('Error loading contracts:', err);
    }
  };

  const onSubmit = async (data: any) => {
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      if (isEditMode && editOrder) {
        // Update existing order
        const updateData = {
          volume: data.volume,
          price: data.price,
          orderDate: data.orderDate,
          deliveryDate: data.deliveryDate,
          notes: data.notes || undefined
        };

        await purchaseOrderService.updatePurchaseOrder(editOrder.id!, updateData);
      } else {
        // Create new order
        const purchaseOrderData: IPurchaseOrderCreate = {
          contractId: data.contractId,
          volume: data.volume,
          price: data.price,
          orderDate: data.orderDate,
          deliveryDate: data.deliveryDate,
          notes: data.notes || undefined
        };

        await purchaseOrderService.createPurchaseOrder(purchaseOrderData);
      }

      reset();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : (isEditMode ? 'Error al actualizar el pedido de venta' : 'Error al crear el pedido de venta'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    setSelectedContract(null);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit(onSubmit)
        }}
      >
        <DialogTitle>{isEditMode ? 'Editar Pedido de Venta' : 'Registrar Pedido de Venta'}</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Selección de Contrato */}
            <FormControl fullWidth error={!!errors.contractId}>
              <InputLabel id="contract-select-label">Contrato</InputLabel>
              <Controller
                name="contractId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="contract-select-label"
                    label="Contrato"
                    value={field.value || ''}
                    disabled={isEditMode}
                  >
                    <MenuItem value="">
                      <em>Selecciona un contrato</em>
                    </MenuItem>
                    {contracts.map((contract) => (
                      <MenuItem key={contract.id} value={contract.id}>
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {contract.correlativeNumber} - {contract.clientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Volumen pendiente: {contract.pendingVolume.toLocaleString()} |
                            Precio: {formatCurrency(contract.salePrice)}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.contractId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.contractId.message}
                </Typography>
              )}
            </FormControl>

            {/* Información del Contrato Seleccionado */}
            {selectedContract && (
              <Box sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.300'
              }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Información del Contrato
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Cliente:</strong> {selectedContract.clientName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Volumen total:</strong> {selectedContract.totalVolume.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Volumen disponible:</strong> {selectedContract.pendingVolume.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Precio sugerido:</strong> {formatCurrency(selectedContract.salePrice)}
                </Typography>
              </Box>
            )}

            <Divider />

            {/* Datos del Pedido */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="volume"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Volumen"
                    type="number"
                    fullWidth
                    error={!!errors.volume}
                    helperText={
                      errors.volume?.message ||
                      (selectedContract && !isEditMode && volume > selectedContract.pendingVolume ?
                        `Excede volumen disponible (${selectedContract.pendingVolume.toLocaleString()})` : '') ||
                      (selectedContract && isEditMode && editOrder != null && volume > (selectedContract.pendingVolume + editOrder.volume) ?
                        `Excede volumen disponible (${(selectedContract.pendingVolume + editOrder.volume).toLocaleString()})` : '') ||
                      ''
                    }
                    inputProps={{
                      min: 1,
                      max: selectedContract ?
                        (isEditMode && editOrder ? selectedContract.pendingVolume + editOrder.volume : selectedContract.pendingVolume)
                        : 999999
                    }}
                  />
                )}
              />

              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Precio por unidad"
                    type="number"
                    fullWidth
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    inputProps={{ min: 1, step: "0.01" }}
                  />
                )}
              />
            </Box>

            {/* Total calculado */}
            {volume > 0 && watch('price') > 0 && (
              <Box sx={{
                p: 1.5,
                bgcolor: 'primary.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'primary.200'
              }}>
                <Typography variant="subtitle2" color="primary">
                  <strong>Valor total estimado: {formatCurrency(volume * watch('price'))}</strong>
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="orderDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Fecha del pedido"
                    format="dd/MM/yyyy"
                    maxDate={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.orderDate,
                        helperText: errors.orderDate?.message
                      }
                    }}
                  />
                )}
              />

              <Controller
                name="deliveryDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Fecha de entrega (opcional)"
                    format="dd/MM/yyyy"
                    minDate={watch('orderDate')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.deliveryDate,
                        helperText: errors.deliveryDate?.message
                      }
                    }}
                  />
                )}
              />
            </Box>

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notas (opcional)"
                  multiline
                  rows={3}
                  fullWidth
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                  placeholder="Observaciones adicionales sobre el pedido..."
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              loading ||
              !contractId ||
              contractId === 0 ||
              !volume ||
              volume <= 0 ||
              !watch('price') ||
              watch('price') <= 0 ||
              (selectedContract != null && !isEditMode && volume > selectedContract.pendingVolume) ||
              (selectedContract != null && isEditMode && editOrder != null && volume > (selectedContract.pendingVolume + editOrder.volume))
            }
          >
{loading ? 'Guardando...' : (isEditMode ? 'Actualizar Pedido' : 'Registrar Pedido')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};