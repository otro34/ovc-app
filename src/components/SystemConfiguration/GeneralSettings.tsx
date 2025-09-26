import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  Slider,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { systemService } from '../../services/systemService';

interface GeneralSettingsProps {
  settings: {
    companyName: string;
    companyLogo?: string;
    sessionTimeout: number;
    systemMaintenanceMode: boolean;
  };
  onUpdate: (updates: any) => void;
  onResetToDefault: () => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settings,
  onUpdate,
  onResetToDefault,
}) => {
  const [formData, setFormData] = useState(settings);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setValidationErrors([]);
  };

  const handleSliderChange = (field: string) => (_event: Event, value: number | number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value as number
    }));
    setValidationErrors([]);
  };

  const handleSave = async () => {
    const errors = systemService.validateConfiguration(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    onUpdate(formData);
  };

  const handleReset = () => {
    setFormData(settings);
    setValidationErrors([]);
  };

  const handleResetToDefault = () => {
    setResetDialogOpen(false);
    onResetToDefault();
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(settings);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configuración General
      </Typography>

      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información de la Empresa
              </Typography>
              <TextField
                fullWidth
                label="Nombre de la Empresa"
                value={formData.companyName}
                onChange={handleInputChange('companyName')}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="URL del Logo"
                value={formData.companyLogo || ''}
                onChange={handleInputChange('companyLogo')}
                margin="normal"
                placeholder="https://ejemplo.com/logo.png"
                helperText="URL del logo de la empresa (opcional)"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuración de Sesión
              </Typography>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography gutterBottom>
                  Tiempo de expiración de sesión: {formData.sessionTimeout} minutos
                </Typography>
                <Slider
                  value={formData.sessionTimeout}
                  onChange={handleSliderChange('sessionTimeout')}
                  aria-labelledby="session-timeout-slider"
                  min={5}
                  max={480}
                  step={5}
                  marks={[
                    { value: 5, label: '5min' },
                    { value: 30, label: '30min' },
                    { value: 60, label: '1h' },
                    { value: 240, label: '4h' },
                    { value: 480, label: '8h' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado del Sistema
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.systemMaintenanceMode}
                    onChange={handleInputChange('systemMaintenanceMode')}
                    color="warning"
                  />
                }
                label="Modo Mantenimiento"
              />
              {formData.systemMaintenanceMode && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  El modo mantenimiento impedirá que los usuarios normales accedan al sistema.
                  Solo los administradores podrán iniciar sesión.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
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
        <Button
          variant="outlined"
          color="warning"
          onClick={() => setResetDialogOpen(true)}
        >
          Restablecer Todo
        </Button>
      </Box>

      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Restablecer Configuración</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea restablecer toda la configuración del sistema
            a los valores por defecto? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleResetToDefault} color="warning" autoFocus>
            Restablecer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};