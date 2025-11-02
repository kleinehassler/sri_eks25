import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function XMLUploader({ onFilesSelected, maxFiles = 10, acceptedFileTypes = '.xml' }) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    // Validar extensión
    if (!file.name.toLowerCase().endsWith('.xml')) {
      return 'Solo se aceptan archivos XML';
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'El archivo no debe superar 5MB';
    }

    // Validar que no esté duplicado
    if (files.some(f => f.name === file.name && f.size === file.size)) {
      return 'Este archivo ya fue agregado';
    }

    return null;
  };

  const handleFiles = useCallback((newFiles) => {
    setError(null);

    const fileArray = Array.from(newFiles);
    const validFiles = [];
    const errors = [];

    // Validar cada archivo
    fileArray.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    });

    // Verificar límite de archivos
    if (files.length + validFiles.length > maxFiles) {
      setError(`Solo puedes subir un máximo de ${maxFiles} archivos`);
      return;
    }

    // Mostrar errores si los hay
    if (errors.length > 0) {
      setError(errors.join(', '));
    }

    // Agregar archivos válidos
    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      if (onFilesSelected) {
        onFilesSelected(updatedFiles);
      }
    }
  }, [files, maxFiles, onFilesSelected]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = '';
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (onFilesSelected) {
      onFilesSelected(updatedFiles);
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setError(null);
    if (onFilesSelected) {
      onFilesSelected([]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Zona de drag & drop */}
      <Paper
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'grey.400',
          bgcolor: isDragging ? 'action.hover' : 'background.paper',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <CloudUploadIcon
          sx={{
            fontSize: 60,
            color: isDragging ? 'primary.main' : 'grey.400',
            mb: 2,
          }}
        />
        <Typography variant="h6" gutterBottom>
          {isDragging ? '¡Suelta los archivos aquí!' : 'Arrastra archivos XML aquí'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          o
        </Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ mt: 1 }}
        >
          Seleccionar Archivos
          <input
            type="file"
            hidden
            accept={acceptedFileTypes}
            multiple
            onChange={handleFileInput}
          />
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
          Archivos XML del SRI (Facturas o Retenciones) • Máximo {maxFiles} archivos • Hasta 5MB cada uno
        </Typography>
      </Paper>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Lista de archivos seleccionados */}
      {files.length > 0 && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" />
              <Typography variant="h6">
                Archivos Seleccionados ({files.length})
              </Typography>
            </Box>
            <Button
              size="small"
              color="error"
              onClick={handleClearAll}
              startIcon={<DeleteIcon />}
            >
              Limpiar Todo
            </Button>
          </Box>

          <List>
            {files.map((file, index) => (
              <ListItem
                key={index}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <InsertDriveFileIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary={
                    <Typography variant="body1" noWrap>
                      {file.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip label={formatFileSize(file.size)} size="small" />
                      <Chip label="XML" size="small" color="primary" variant="outlined" />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}

export default XMLUploader;
