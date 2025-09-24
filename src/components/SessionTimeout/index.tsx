import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress,
  Box
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

export const SessionTimeout: React.FC = () => {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const { getSessionTimeRemaining, logout, updateActivity } = useAuth();

  useEffect(() => {
    const checkSessionTimer = setInterval(() => {
      const timeLeft = getSessionTimeRemaining();

      if (timeLeft <= 0) {
        logout();
        return;
      }

      if (timeLeft <= 5) {
        setRemainingTime(timeLeft);
        setIsWarningOpen(true);
      } else {
        setIsWarningOpen(false);
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(checkSessionTimer);
  }, [getSessionTimeRemaining, logout]);

  useEffect(() => {
    if (isWarningOpen) {
      const countdownTimer = setInterval(() => {
        const timeLeft = getSessionTimeRemaining();
        setRemainingTime(timeLeft);

        if (timeLeft <= 0) {
          setIsWarningOpen(false);
          logout();
        }
      }, 1000); // Actualizar cada segundo durante la alerta

      return () => clearInterval(countdownTimer);
    }
  }, [isWarningOpen, getSessionTimeRemaining, logout]);

  const handleExtendSession = () => {
    updateActivity();
    setIsWarningOpen(false);
  };

  const handleLogout = () => {
    setIsWarningOpen(false);
    logout();
  };

  const progressValue = remainingTime > 0 ? (remainingTime / 5) * 100 : 0;

  return (
    <Dialog
      open={isWarningOpen}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Tu sesión está por expirar
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Tu sesión expirará en {remainingTime} minuto{remainingTime !== 1 ? 's' : ''}.
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          ¿Deseas continuar con tu sesión?
        </Typography>
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            color="warning"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogout} color="error">
          Cerrar Sesión
        </Button>
        <Button onClick={handleExtendSession} variant="contained" color="primary">
          Continuar Sesión
        </Button>
      </DialogActions>
    </Dialog>
  );
};