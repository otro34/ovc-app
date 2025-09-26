import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
} from '@mui/material';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setErrors([]);
  };

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!formData.currentPassword) {
      validationErrors.push('La contraseña actual es requerida');
    }

    if (!formData.newPassword) {
      validationErrors.push('La nueva contraseña es requerida');
    } else if (formData.newPassword.length < 6) {
      validationErrors.push('La nueva contraseña debe tener al menos 6 caracteres');
    }

    if (formData.newPassword !== formData.confirmPassword) {
      validationErrors.push('Las contraseñas nuevas no coinciden');
    }

    if (formData.currentPassword && formData.newPassword &&
        formData.currentPassword === formData.newPassword) {
      validationErrors.push('La nueva contraseña debe ser diferente a la actual');
    }

    return validationErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.id) {
      setErrors(['Error: Usuario no autenticado']);
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      // Verificar la contraseña actual
      const currentUser = await userService.getUserById(user.id);
      if (!currentUser) {
        throw new Error('Usuario no encontrado');
      }

      // En un sistema real, esto debería verificar el hash de la contraseña
      if (currentUser.password !== formData.currentPassword) {
        throw new Error('La contraseña actual es incorrecta');
      }

      // Cambiar la contraseña
      await userService.changePassword(user.id, formData.newPassword);

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      setErrors([
        error instanceof Error ? error.message : 'Error al cambiar la contraseña'
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors([]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Cambiar Contraseña
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Para cambiar tu contraseña, ingresa tu contraseña actual y la nueva contraseña.
          </Typography>

          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Contraseña actual"
              type="password"
              value={formData.currentPassword}
              onChange={handleInputChange('currentPassword')}
              required
              disabled={loading}
              autoFocus
            />

            <TextField
              fullWidth
              label="Nueva contraseña"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange('newPassword')}
              required
              helperText="Mínimo 6 caracteres"
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Confirmar nueva contraseña"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              required
              helperText="Debe coincidir con la nueva contraseña"
              disabled={loading}
            />
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Recomendaciones:</strong>
              <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                <li>Usa al menos 8 caracteres</li>
                <li>Combina mayúsculas, minúsculas y números</li>
                <li>Evita información personal</li>
                <li>No reutilices contraseñas de otras cuentas</li>
              </ul>
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};