import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import type { User } from '../../services/database';
import type { CreateUserRequest, UpdateUserRequest } from '../../services/userService';

interface UserFormProps {
  user: User | null;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    password: '',
    email: user?.email || '',
    name: user?.name || '',
    role: user?.role || 'user',
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setErrors([]);
  };

  const handleRoleChange = (event: any) => {
    setFormData(prev => ({
      ...prev,
      role: event.target.value as 'admin' | 'user'
    }));
    setErrors([]);
  };

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!formData.username.trim()) {
      validationErrors.push('El nombre de usuario es requerido');
    } else if (formData.username.length < 3) {
      validationErrors.push('El nombre de usuario debe tener al menos 3 caracteres');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      validationErrors.push('El nombre de usuario solo puede contener letras, números y guiones bajos');
    }

    // Solo validar contraseña si es nuevo usuario o si se está cambiando
    if (!user && !formData.password) {
      validationErrors.push('La contraseña es requerida para nuevos usuarios');
    } else if (formData.password && formData.password.length < 6) {
      validationErrors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        validationErrors.push('El formato del email no es válido');
      }
    }

    if (formData.name && formData.name.trim() && formData.name.trim().length < 2) {
      validationErrors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!formData.role) {
      validationErrors.push('El rol es requerido');
    }

    return validationErrors;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Preparar datos para envío
    let submitData: CreateUserRequest | UpdateUserRequest;

    if (user) {
      // Editando usuario existente
      submitData = {
        username: formData.username.trim(),
        email: formData.email.trim() || undefined,
        name: formData.name.trim() || undefined,
        role: formData.role,
      } as UpdateUserRequest;
    } else {
      // Creando nuevo usuario
      submitData = {
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim() || undefined,
        name: formData.name.trim() || undefined,
        role: formData.role,
      } as CreateUserRequest;
    }

    // Para usuarios existentes, solo incluir contraseña si se proporcionó
    if (user && formData.password) {
      (submitData as UpdateUserRequest & { password?: string }).password = formData.password;
    }

    onSubmit(submitData);
  };

  const isEditing = Boolean(user);

  return (
    <Box>
      <Paper elevation={1} sx={{ mb: 3, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onCancel}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {isEditing
            ? 'Modifica la información del usuario'
            : 'Completa la información para crear un nuevo usuario'
          }
        </Typography>
      </Paper>

      <Paper elevation={1}>
        <Box sx={{ p: 3 }}>
          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <TextField
                  fullWidth
                  label="Nombre de usuario"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  required
                  helperText="Solo letras, números y guiones bajos"
                />

                <FormControl fullWidth required>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={formData.role}
                    label="Rol"
                    onChange={handleRoleChange}
                  >
                    <MenuItem value="user">Usuario</MenuItem>
                    <MenuItem value="admin">Administrador</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Divider />
              <Typography variant="h6">
                Información Personal
              </Typography>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <TextField
                  fullWidth
                  label="Nombre completo"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                />
              </Stack>

              <Divider />
              <Typography variant="h6">
                {isEditing ? 'Cambiar Contraseña (opcional)' : 'Contraseña'}
              </Typography>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  required={!isEditing}
                  helperText={
                    isEditing
                      ? "Dejar en blanco para mantener la contraseña actual"
                      : "Mínimo 6 caracteres"
                  }
                />
              </Stack>

              {isEditing && (
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Nota:</strong> Para cambiar la contraseña de manera más segura,
                    utilice la opción "Cambiar contraseña" desde la lista de usuarios.
                  </Typography>
                </Alert>
              )}
            </Stack>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
              >
                {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};