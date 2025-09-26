import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Slider,
} from '@mui/material';
import { systemService } from '../../services/systemService';

interface FileSettingsProps {
  settings: {
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  onUpdate: (updates: { maxFileSize?: number; allowedFileTypes?: string[] }) => void;
}

const COMMON_FILE_TYPES = [
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', // Imágenes
  'pdf', 'doc', 'docx', 'txt', 'rtf', // Documentos
  'xlsx', 'xls', 'csv', 'ods', // Hojas de cálculo
  'zip', 'rar', '7z', 'tar', 'gz', // Archivos comprimidos
  'mp4', 'avi', 'mov', 'wmv', 'flv', // Videos
  'mp3', 'wav', 'flac', 'aac', // Audio
];

export const FileSettings: React.FC<FileSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const [formData, setFormData] = useState(settings);
  const [newFileType, setNewFileType] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleMaxFileSizeChange = (_event: Event, value: number | number[]) => {
    setFormData(prev => ({
      ...prev,
      maxFileSize: value as number
    }));
    setValidationErrors([]);
  };

  const handleAddFileType = () => {
    const fileType = newFileType.toLowerCase().replace('.', '').trim();
    if (fileType && !formData.allowedFileTypes.includes(fileType)) {
      setFormData(prev => ({
        ...prev,
        allowedFileTypes: [...prev.allowedFileTypes, fileType]
      }));
      setNewFileType('');
    }
  };

  const handleRemoveFileType = (typeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.filter(type => type !== typeToRemove)
    }));
  };

  const handleAddCommonType = (type: string) => {
    if (!formData.allowedFileTypes.includes(type)) {
      setFormData(prev => ({
        ...prev,
        allowedFileTypes: [...prev.allowedFileTypes, type]
      }));
    }
  };

  const handleSave = async () => {
    const errors = systemService.validateConfiguration(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (formData.allowedFileTypes.length === 0) {
      setValidationErrors(['Debe permitir al menos un tipo de archivo']);
      return;
    }

    onUpdate(formData);
  };

  const handleReset = () => {
    setFormData(settings);
    setValidationErrors([]);
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(settings);

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${Math.round(sizeInMB * 1024)} KB`;
    }
    return `${sizeInMB} MB`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configuración de Archivos
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
                Tamaño Máximo de Archivo
              </Typography>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography gutterBottom>
                  Tamaño máximo: {formatFileSize(formData.maxFileSize)}
                </Typography>
                <Slider
                  value={formData.maxFileSize}
                  onChange={handleMaxFileSizeChange}
                  aria-labelledby="max-file-size-slider"
                  min={1}
                  max={100}
                  step={1}
                  marks={[
                    { value: 1, label: '1MB' },
                    { value: 5, label: '5MB' },
                    { value: 10, label: '10MB' },
                    { value: 25, label: '25MB' },
                    { value: 50, label: '50MB' },
                    { value: 100, label: '100MB' },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatFileSize}
                />
              </Box>
              <Alert severity="info">
                Archivos más grandes pueden afectar el rendimiento de la aplicación
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tipos de Archivo Permitidos
              </Typography>

              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Agregar tipo de archivo</InputLabel>
                  <OutlinedInput
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFileType();
                      }
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <Button size="small" onClick={handleAddFileType}>
                          Agregar
                        </Button>
                      </InputAdornment>
                    }
                    label="Agregar tipo de archivo"
                    placeholder="pdf, jpg, xlsx..."
                  />
                </FormControl>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tipos comunes:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {COMMON_FILE_TYPES.filter(type => !formData.allowedFileTypes.includes(type)).map((type) => (
                    <Chip
                      key={type}
                      label={type}
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() => handleAddCommonType(type)}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Tipos permitidos ({formData.allowedFileTypes.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 200, overflowY: 'auto' }}>
                  {formData.allowedFileTypes.map((type) => (
                    <Chip
                      key={type}
                      label={type}
                      size="small"
                      color="primary"
                      onDelete={() => handleRemoveFileType(type)}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="warning" sx={{ mt: 3 }}>
        Cambiar estos parámetros puede afectar la funcionalidad de carga de archivos existente.
        Asegúrese de probar la carga de archivos después de hacer cambios.
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