import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { ILoginCredentials } from '../../types/auth';

const schema = yup.object({
  username: yup.string().required('El usuario es requerido'),
  password: yup.string().required('La contraseña es requerida'),
});

interface LoginProps {
  onLogin: (credentials: ILoginCredentials) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginCredentials>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ILoginCredentials) => {
    setError('');
    setLoading(true);
    try {
      await onLogin(data);
    } catch {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', mt: 1 }}>
          <CardContent>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              OV-APP
            </Typography>
            <Typography component="h2" variant="h6" align="center" color="text.secondary" gutterBottom>
              Sistema de Gestión de Contratos
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                {...register('username')}
                margin="normal"
                required
                fullWidth
                id="username"
                label="Usuario"
                name="username"
                autoComplete="username"
                autoFocus
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={loading}
              />

              <TextField
                {...register('password')}
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;