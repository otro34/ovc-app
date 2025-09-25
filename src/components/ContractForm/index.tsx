import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';

import { FormContainer, FormActions, FormRow, FormField } from './styles';
import type { IContractFormProps, IContractFormData } from './types';

const validationSchema = yup.object({
  clientId: yup
    .number()
    .required('Cliente es requerido')
    .positive('Debe seleccionar un cliente válido'),
  totalVolume: yup
    .number()
    .required('Volumen total es requerido')
    .positive('El volumen debe ser positivo')
    .min(0.01, 'El volumen mínimo es 0.01'),
  salePrice: yup
    .number()
    .required('Precio de venta es requerido')
    .positive('El precio debe ser positivo')
    .min(0.01, 'El precio mínimo es 0.01'),
  startDate: yup
    .string()
    .required('Fecha de inicio es requerida'),
  endDate: yup
    .string()
    .required('Fecha de fin es requerida')
    .test('date-order', 'La fecha de fin debe ser posterior a la fecha de inicio', function(value) {
      const { startDate } = this.parent;
      if (startDate && value) {
        return new Date(value) > new Date(startDate);
      }
      return true;
    }),
  status: yup
    .string()
    .oneOf(['active', 'completed', 'cancelled'])
    .required('Estado es requerido')
});

const ContractForm: React.FC<IContractFormProps> = ({
  onSubmit,
  onCancel,
  clients,
  loading = false,
  initialData
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<IContractFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: initialData || {
      clientId: 0,
      totalVolume: 0,
      salePrice: 0,
      startDate: '',
      endDate: '',
      status: 'active' as const
    },
    mode: 'onChange'
  });

  const onFormSubmit = (data: IContractFormData) => {
    onSubmit(data);
  };

  const formatCurrency = (value: string) => {
    const number = parseFloat(value.replace(/[^\d.]/g, ''));
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  return (
    <FormContainer>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Editar Contrato' : 'Nuevo Contrato'}
      </Typography>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <FormRow>
          <FormField>
            <FormControl fullWidth error={!!errors.clientId}>
              <InputLabel>Cliente *</InputLabel>
              <Controller
                name="clientId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Cliente *"
                    disabled={loading}
                  >
                    <MenuItem value={0}>Seleccione un cliente</MenuItem>
                    {clients
                      .filter((client) => client.id !== undefined && client.id !== null)
                      .map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))}
                  </Select>
                )}
              />
              {errors.clientId && (
                <FormHelperText>{errors.clientId.message}</FormHelperText>
              )}
            </FormControl>
          </FormField>

          <FormField>
            <FormControl fullWidth error={!!errors.status}>
              <InputLabel>Estado</InputLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Estado"
                    disabled={loading}
                  >
                    <MenuItem value="active">Activo</MenuItem>
                    <MenuItem value="completed">Completado</MenuItem>
                    <MenuItem value="cancelled">Cancelado</MenuItem>
                  </Select>
                )}
              />
              {errors.status && (
                <FormHelperText>{errors.status.message}</FormHelperText>
              )}
            </FormControl>
          </FormField>
        </FormRow>

        <FormRow>
          <FormField>
            <Controller
              name="totalVolume"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Volumen Total *"
                  type="number"
                  error={!!errors.totalVolume}
                  helperText={errors.totalVolume?.message}
                  disabled={loading}
                  inputProps={{
                    min: 0.01,
                    step: 0.01
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">Ton</InputAdornment>
                  }}
                />
              )}
            />
          </FormField>

          <FormField>
            <Controller
              name="salePrice"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Precio de Venta *"
                  type="text"
                  value={value ? formatCurrency(value.toString()) : ''}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^\d.]/g, '');
                    onChange(parseFloat(numericValue) || 0);
                  }}
                  error={!!errors.salePrice}
                  helperText={errors.salePrice?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              )}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Fecha de Inicio *"
                  type="date"
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </FormField>

          <FormField>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Fecha de Fin *"
                  type="date"
                  error={!!errors.endDate}
                  helperText={errors.endDate?.message}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </FormField>
        </FormRow>

        <FormActions>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            startIcon={<Cancel />}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !isValid}
            startIcon={loading ? <CircularProgress size={16} /> : <Save />}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </FormActions>
      </form>
    </FormContainer>
  );
};

export default ContractForm;