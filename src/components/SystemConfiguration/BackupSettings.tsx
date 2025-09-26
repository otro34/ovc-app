import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Divider,
} from '@mui/material';

interface BackupSettingsProps {
  settings: {
    backupEnabled: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
  onUpdate: (updates: { backupEnabled: boolean; backupFrequency: 'daily' | 'weekly' | 'monthly' }) => void;
}

export const BackupSettings: React.FC<BackupSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const [formData, setFormData] = useState(settings);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => {
    const target = event.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onUpdate(formData);
  };

  const handleReset = () => {
    setFormData(settings);
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(settings);

  const getFrequencyDescription = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Se realizará un respaldo automático todos los días a las 2:00 AM';
      case 'weekly':
        return 'Se realizará un respaldo automático todos los domingos a las 2:00 AM';
      case 'monthly':
        return 'Se realizará un respaldo automático el primer día de cada mes a las 2:00 AM';
      default:
        return '';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configuración de Respaldo
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Respaldo Automático
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={formData.backupEnabled}
                onChange={handleInputChange('backupEnabled')}
                color="primary"
              />
            }
            label="Habilitar respaldo automático"
          />

          {formData.backupEnabled && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Frecuencia de Respaldo</InputLabel>
                <Select
                  value={formData.backupFrequency}
                  label="Frecuencia de Respaldo"
                  onChange={handleInputChange('backupFrequency')}
                >
                  <MenuItem value="daily">Diario</MenuItem>
                  <MenuItem value="weekly">Semanal</MenuItem>
                  <MenuItem value="monthly">Mensual</MenuItem>
                </Select>
              </FormControl>

              <Alert severity="info" sx={{ mt: 2 }}>
                {getFrequencyDescription(formData.backupFrequency)}
              </Alert>
            </Box>
          )}

          {!formData.backupEnabled && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Los respaldos automáticos están deshabilitados. Es recomendable mantener
              respaldos regulares de sus datos para evitar pérdida de información.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Respaldo Manual
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Genere un respaldo manual de todos los datos del sistema en cualquier momento.
          </Typography>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              // Esta funcionalidad se implementaría con el servicio de exportación existente
              alert('Funcionalidad de respaldo manual - por implementar con el servicio de exportación');
            }}
          >
            Crear Respaldo Ahora
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Restaurar Respaldo
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Restaure los datos del sistema desde un archivo de respaldo previo.
          </Typography>

          <Alert severity="warning" sx={{ mb: 2 }}>
            Restaurar un respaldo reemplazará todos los datos actuales del sistema.
            Esta acción no se puede deshacer.
          </Alert>

          <Button
            variant="outlined"
            color="warning"
            onClick={() => {
              // Esta funcionalidad requeriría un componente de carga de archivos
              alert('Funcionalidad de restaurar respaldo - requiere implementación de carga de archivos');
            }}
          >
            Restaurar desde Archivo
          </Button>
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