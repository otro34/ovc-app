import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from '@mui/material';
import type { IClientFormProps, IClientFormData } from '../../types/client';

const clientSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: yup
    .string()
    .email('Email inválido')
    .optional()
    .transform((value) => value === '' ? undefined : value),
  phone: yup
    .string()
    .optional()
    .transform((value) => value === '' ? undefined : value)
    .matches(/^[\d\s\-+()]*$/, 'Teléfono inválido'),
  address: yup
    .string()
    .optional()
    .transform((value) => value === '' ? undefined : value)
    .max(200, 'La dirección no puede exceder 200 caracteres')
});

export const ClientForm: React.FC<IClientFormProps> = ({
  client,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(clientSchema),
    mode: 'onChange',
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || ''
    }
  });

  const handleFormSubmit = (data: Record<string, unknown>) => {
    const cleanData: IClientFormData = {
      name: (data.name as string).trim(),
      email: (data.email as string)?.trim() || undefined,
      phone: (data.phone as string)?.trim() || undefined,
      address: (data.address as string)?.trim() || undefined
    };
    onSubmit(cleanData);
  };

  return (
    <Dialog open={true} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        {client ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                {...register('name')}
                label="Nombre *"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={loading}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  {...register('email')}
                  label="Email"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={loading}
                />

                <TextField
                  {...register('phone')}
                  label="Teléfono"
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  disabled={loading}
                />
              </Box>

              <TextField
                {...register('address')}
                label="Dirección"
                fullWidth
                multiline
                rows={2}
                error={!!errors.address}
                helperText={errors.address?.message}
                disabled={loading}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || loading}
          >
            {loading ? 'Guardando...' : client ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};