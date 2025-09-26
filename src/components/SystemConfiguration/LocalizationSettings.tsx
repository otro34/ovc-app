import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { systemService } from '../../services/systemService';

interface LocalizationSettingsProps {
  settings: {
    currency: string;
    dateFormat: string;
    timeZone: string;
  };
  onUpdate: (updates: { currency: string; dateFormat: string; timeZone: string }) => void;
}

const CURRENCIES = [
  { value: 'COP', label: 'Peso Colombiano (COP)' },
  { value: 'USD', label: 'Dólar Estadounidense (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: '31/12/2023 (DD/MM/YYYY)' },
  { value: 'MM/DD/YYYY', label: '12/31/2023 (MM/DD/YYYY)' },
  { value: 'YYYY-MM-DD', label: '2023-12-31 (YYYY-MM-DD)' },
];

const TIMEZONES = [
  { value: 'America/Bogota', label: 'Colombia (UTC-5)' },
  { value: 'America/New_York', label: 'Nueva York (UTC-5/-4)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (UTC-8/-7)' },
  { value: 'Europe/Madrid', label: 'Madrid (UTC+1/+2)' },
  { value: 'Asia/Tokyo', label: 'Tokio (UTC+9)' },
];

export const LocalizationSettings: React.FC<LocalizationSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const [formData, setFormData] = useState(settings);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
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

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(settings);

  const formatCurrencyExample = (currency: string) => {
    const amount = 1234567.89;
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch {
      return `${amount.toLocaleString()} ${currency}`;
    }
  };

  const formatDateExample = (format: string) => {
    switch (format) {
      case 'DD/MM/YYYY':
        return '31/12/2023';
      case 'MM/DD/YYYY':
        return '12/31/2023';
      case 'YYYY-MM-DD':
        return '2023-12-31';
      default:
        return format;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configuración de Localización
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

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
      >
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Moneda
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Moneda</InputLabel>
                <Select
                  value={formData.currency}
                  label="Moneda"
                  onChange={handleInputChange('currency')}
                >
                  {CURRENCIES.map((currency) => (
                    <MenuItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Ejemplo: {formatCurrencyExample(formData.currency)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Formato de Fecha
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Formato de Fecha</InputLabel>
                <Select
                  value={formData.dateFormat}
                  label="Formato de Fecha"
                  onChange={handleInputChange('dateFormat')}
                >
                  {DATE_FORMATS.map((format) => (
                    <MenuItem key={format.value} value={format.value}>
                      {format.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Ejemplo: {formatDateExample(formData.dateFormat)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Zona Horaria
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Zona Horaria</InputLabel>
                <Select
                  value={formData.timeZone}
                  label="Zona Horaria"
                  onChange={handleInputChange('timeZone')}
                >
                  {TIMEZONES.map((tz) => (
                    <MenuItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {formData.timeZone}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      <Alert severity="info" sx={{ mt: 3 }}>
        Los cambios de localización afectarán cómo se muestran las fechas, números y moneda
        en toda la aplicación. Es recomendable informar a los usuarios antes de hacer estos cambios.
      </Alert>

      <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
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