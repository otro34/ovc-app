import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import type { IClient } from '../../types/client';
import { clientService } from '../../services/clientService';

interface ClientDetailsProps {
  client: IClient;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

interface ClientStats {
  totalContracts: number;
  activeContracts: number;
  totalVolume: number;
  attendedVolume: number;
  pendingVolume: number;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({
  client,
  open,
  onClose,
  onEdit
}) => {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClientStats = async () => {
      if (!client.id) return;

      try {
        setLoading(true);
        const clientStats = await clientService.getClientStats(client.id);
        setStats(clientStats);
      } catch (error) {
        console.error('Error loading client stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open && client.id) {
      loadClientStats();
    }
  }, [client.id, open]);

  const formatDate = (date?: Date) => {
    if (!date) return 'No disponible';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
    icon,
    label,
    value
  }) => (
    <Box display="flex" alignItems="center" mb={2}>
      <Box mr={2} color="primary.main">
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1">
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <PersonIcon sx={{ mr: 1 }} />
          Detalles del Cliente
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información Personal
                </Typography>

                <InfoItem
                  icon={<PersonIcon />}
                  label="Nombre"
                  value={client.name}
                />

                <InfoItem
                  icon={<EmailIcon />}
                  label="Email"
                  value={client.email || 'No proporcionado'}
                />

                <InfoItem
                  icon={<PhoneIcon />}
                  label="Teléfono"
                  value={client.phone || 'No proporcionado'}
                />

                <InfoItem
                  icon={<LocationIcon />}
                  label="Dirección"
                  value={client.address || 'No proporcionada'}
                />

                <Divider sx={{ my: 2 }} />

                <InfoItem
                  icon={<CalendarIcon />}
                  label="Fecha de registro"
                  value={formatDate(client.createdAt)}
                />

                {client.updatedAt && client.updatedAt !== client.createdAt && (
                  <InfoItem
                    icon={<CalendarIcon />}
                    label="Última actualización"
                    value={formatDate(client.updatedAt)}
                  />
                )}
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AssessmentIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Estadísticas de Contratos
                  </Typography>
                </Box>

                {loading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : stats ? (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box sx={{ flex: 1, textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary">
                          {stats.totalContracts}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Contratos Totales
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1, textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="h4" color="success.main">
                          {stats.activeContracts}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Contratos Activos
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="info.main">
                          {stats.totalVolume.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Volumen Total (TM)
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main">
                          {stats.attendedVolume.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Volumen Atendido (TM)
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="warning.main">
                          {stats.pendingVolume.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Volumen Pendiente (TM)
                        </Typography>
                      </Box>
                    </Box>

                    {stats.totalContracts > 0 && (
                      <Box mt={2}>
                        <Chip
                          label={
                            stats.totalVolume > 0
                              ? `${((stats.attendedVolume / stats.totalVolume) * 100).toFixed(1)}% Completado`
                              : '0% Completado'
                          }
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    No se pudieron cargar las estadísticas
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
        <Button onClick={onEdit} variant="contained">
          Editar Cliente
        </Button>
      </DialogActions>
    </Dialog>
  );
};