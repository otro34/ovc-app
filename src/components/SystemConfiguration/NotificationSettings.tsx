import React, { useState } from 'react';
import {
  Box,
  FormControlLabel,
  Switch,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Divider,
} from '@mui/material';

interface NotificationSettingsProps {
  settings: {
    emailNotifications: boolean;
  };
  onUpdate: (updates: { emailNotifications: boolean }) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const [formData, setFormData] = useState(settings);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const handleSave = () => {
    onUpdate(formData);
  };

  const handleReset = () => {
    setFormData(settings);
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(settings);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configuración de Notificaciones
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notificaciones por Email
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={formData.emailNotifications}
                onChange={handleInputChange('emailNotifications')}
                color="primary"
              />
            }
            label="Habilitar notificaciones por email"
          />

          {formData.emailNotifications ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Las notificaciones por email están habilitadas. Los usuarios recibirán
              notificaciones sobre eventos importantes del sistema.
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Las notificaciones por email están deshabilitadas. Los usuarios no
              recibirán notificaciones automáticas por correo electrónico.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tipos de Notificaciones
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Las notificaciones se enviarán para los siguientes eventos:
          </Typography>

          <Box component="ul" sx={{ pl: 2 }}>
            <li>Nuevos contratos registrados</li>
            <li>Pedidos de venta creados o modificados</li>
            <li>Contratos próximos a vencer</li>
            <li>Volúmenes de contrato completados</li>
            <li>Alertas del sistema y mantenimiento</li>
            <li>Cambios en la configuración del sistema</li>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Nota:</strong> Para que las notificaciones por email funcionen correctamente,
              es necesario configurar un servidor SMTP válido en la configuración del servidor.
              Contacte al administrador del sistema si necesita configurar el servicio de email.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configuración Avanzada
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configuraciones adicionales de notificaciones que requieren configuración del servidor.
          </Typography>

          <Button
            variant="outlined"
            disabled
            sx={{ mr: 1, mb: 1 }}
          >
            Configurar SMTP
          </Button>
          <Button
            variant="outlined"
            disabled
            sx={{ mr: 1, mb: 1 }}
          >
            Plantillas de Email
          </Button>
          <Button
            variant="outlined"
            disabled
            sx={{ mr: 1, mb: 1 }}
          >
            Horarios de Envío
          </Button>

          <Alert severity="info" sx={{ mt: 2 }}>
            Estas funciones avanzadas requieren configuración adicional del servidor
            y están disponibles en versiones futuras del sistema.
          </Alert>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!hasChanges}
        >
          Guardar Cambios
        </Button>
        <Button
          variant="outlined"
          onClick={handleReset}
          disabled={!hasChanges}
        >
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};