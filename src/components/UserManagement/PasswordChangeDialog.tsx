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
import type { User } from '../../services/database';

interface PasswordChangeDialogProps {
  user: User;
  open: boolean;
  onSubmit: (newPassword: string) => void;
  onClose: () => void;
}

export const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({
  user,
  open,
  onSubmit,
  onClose,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors: string[] = [];

    if (!newPassword) {
      validationErrors.push('La nueva contraseña es requerida');
    } else if (newPassword.length < 6) {
      validationErrors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (newPassword !== confirmPassword) {
      validationErrors.push('Las contraseñas no coinciden');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(newPassword);
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setErrors([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Cambiar Contraseña
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Cambiar la contraseña del usuario: <strong>{user.username}</strong>
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
              label="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors([]);
              }}
              required
              helperText="Mínimo 6 caracteres"
              autoFocus
            />

            <TextField
              fullWidth
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors([]);
              }}
              required
              helperText="Debe coincidir con la contraseña anterior"
            />
          </Box>

          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta acción cambiará la contraseña del usuario inmediatamente.
            El usuario deberá usar la nueva contraseña para iniciar sesión.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained">
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};