import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { userService } from '../../services/userService';
import type { User } from '../../services/database';
import type { CreateUserRequest, UpdateUserRequest } from '../../services/userService';
import { UserList } from './UserList';
import { UserForm } from './UserForm';
import { UserStats } from './UserStats';
import { PasswordChangeDialog } from './PasswordChangeDialog';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const userList = await userService.getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      showNotification('Error al cargar los usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar al usuario "${user.username}"?`)) {
      return;
    }

    try {
      await userService.deleteUser(user.id!);
      await loadUsers();
      showNotification('Usuario eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      showNotification(
        error instanceof Error ? error.message : 'Error al eliminar el usuario',
        'error'
      );
    }
  };

  const handleFormSubmit = async (formData: CreateUserRequest | UpdateUserRequest) => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id!, formData as UpdateUserRequest);
        showNotification('Usuario actualizado correctamente', 'success');
      } else {
        await userService.createUser(formData as CreateUserRequest);
        showNotification('Usuario creado correctamente', 'success');
      }

      setShowForm(false);
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      console.error('Error guardando usuario:', error);
      showNotification(
        error instanceof Error ? error.message : 'Error al guardar el usuario',
        'error'
      );
    }
  };

  const handleChangePassword = (user: User) => {
    setPasswordChangeUser(user);
    setShowPasswordDialog(true);
  };

  const handlePasswordChange = async (newPassword: string) => {
    if (!passwordChangeUser) return;

    try {
      await userService.changePassword(passwordChangeUser.id!, newPassword);
      showNotification('Contraseña cambiada correctamente', 'success');
      setShowPasswordDialog(false);
      setPasswordChangeUser(null);
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      showNotification(
        error instanceof Error ? error.message : 'Error al cambiar la contraseña',
        'error'
      );
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (showForm) {
    return (
      <UserForm
        user={editingUser}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingUser(null);
        }}
      />
    );
  }

  return (
    <Box>
      <Paper elevation={1} sx={{ mb: 3, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Gestión de Usuarios
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administra los usuarios del sistema y sus permisos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            Nuevo Usuario
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <UserStats users={users} />
        </Grid>

        <Grid item xs={12}>
          <UserList
            users={users}
            loading={loading}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onChangePassword={handleChangePassword}
            onRefresh={loadUsers}
          />
        </Grid>
      </Grid>

      {showPasswordDialog && passwordChangeUser && (
        <PasswordChangeDialog
          user={passwordChangeUser}
          open={showPasswordDialog}
          onSubmit={handlePasswordChange}
          onClose={() => {
            setShowPasswordDialog(false);
            setPasswordChangeUser(null);
          }}
        />
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};