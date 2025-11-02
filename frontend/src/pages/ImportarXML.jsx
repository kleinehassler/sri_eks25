import { useState } from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  LinearProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PreviewIcon from '@mui/icons-material/Preview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import XMLUploader from '../components/XML/XMLUploader';
import XMLPreview from '../components/XML/XMLPreview';
import xmlImportService from '../services/xmlImportService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const steps = ['Subir Archivos', 'Revisar Datos', 'Confirmar Importación'];

function ImportarXML() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [tipoDocumento, setTipoDocumento] = useState('factura');
  const [periodo, setPeriodo] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [importResults, setImportResults] = useState(null);

  const handleFilesSelected = (selectedFiles) => {
    setFiles(selectedFiles);
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      // Validar que haya archivos
      if (files.length === 0) {
        showSnackbar('Debes seleccionar al menos un archivo XML', 'error');
        return;
      }
      // Validar periodo
      if (!periodo || !/^\d{2}\/\d{4}$/.test(periodo)) {
        showSnackbar('El periodo debe tener el formato MM/YYYY', 'error');
        return;
      }
      // Previsualizar primer archivo
      await handlePreview();
    } else if (activeStep === 1) {
      // Ir a confirmación
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    if (activeStep === 1) {
      setPreviewData(null);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      // Previsualizar el primer archivo
      const response = await xmlImportService.previsualizar(files[0], tipoDocumento);
      setPreviewData(response.data);
      setActiveStep(1);
      showSnackbar('Archivo procesado correctamente', 'success');
    } catch (error) {
      showSnackbar(error.mensaje || 'Error al procesar el archivo XML', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleConfirmImport = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);

    try {
      // Preparar datos adicionales para la importación
      const additionalData = {
        codigo_sustento: '01', // Código de sustento por defecto
        tipo_proveedor: '02'   // Proveedor residente o establecido en el Ecuador
      };

      // Importar todos los archivos
      const result = await xmlImportService.importarMultiple(
        files,
        additionalData,
        tipoDocumento
      );

      setImportResults(result);

      // Mostrar resultados
      const successCount = result.results.length;
      const errorCount = result.errors.length;

      if (errorCount === 0) {
        showSnackbar(
          `${successCount} ${tipoDocumento === 'factura' ? 'compras' : 'retenciones'} importadas correctamente`,
          'success'
        );
      } else {
        showSnackbar(
          `${successCount} importadas correctamente, ${errorCount} con errores`,
          'warning'
        );
      }

      // Avanzar al paso final
      setActiveStep(2);
    } catch (error) {
      console.error('Error en importación:', error);
      showSnackbar(error.mensaje || 'Error al importar archivos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    // Redirigir a la página de compras
    navigate('/compras');
  };

  const handleReset = () => {
    setActiveStep(0);
    setFiles([]);
    setPreviewData(null);
    setImportResults(null);
    setPeriodo('');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Renderizar contenido según el paso
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            {/* Configuración */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Configuración de Importación
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Documento</InputLabel>
                    <Select
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value)}
                      label="Tipo de Documento"
                    >
                      <MenuItem value="factura">Factura (Compra)</MenuItem>
                      <MenuItem value="retencion">Comprobante de Retención</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Periodo *"
                    placeholder="MM/YYYY"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    helperText="Ejemplo: 01/2024"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Uploader */}
            <XMLUploader onFilesSelected={handleFilesSelected} maxFiles={20} />

            {/* Información */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Información importante:</strong>
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>Los archivos XML deben ser emitidos por el SRI de Ecuador</li>
                <li>
                  {tipoDocumento === 'factura'
                    ? 'Las facturas se importarán como compras en el sistema'
                    : 'Las retenciones se vincularán a las compras existentes'}
                </li>
                <li>El periodo debe coincidir con la fecha de emisión de los documentos</li>
                <li>Puedes importar múltiples archivos a la vez</li>
              </ul>
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Previsualización de Datos Extraídos
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Revisa cuidadosamente los datos extraídos del XML antes de confirmar la importación.
              {files.length > 1 && (
                <strong>
                  {' '}
                  Se importarán {files.length} archivos en total.
                </strong>
              )}
            </Typography>

            <XMLPreview data={previewData} tipoDocumento={tipoDocumento} />

            {files.length > 1 && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <strong>Nota:</strong> Esta es la previsualización del primer archivo. Al confirmar,
                se procesarán todos los {files.length} archivos seleccionados.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Importando archivos...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Por favor espera, esto puede tomar unos momentos
                </Typography>
              </Box>
            ) : importResults ? (
              <Box>
                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
                  <Typography variant="h6">¡Importación Completada!</Typography>
                </Alert>

                {/* Resumen de resultados */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                      <CardContent>
                        <Typography variant="h4" fontWeight="bold">
                          {importResults.results.length}
                        </Typography>
                        <Typography variant="body1">Archivos Importados</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ bgcolor: importResults.errors.length > 0 ? 'error.light' : 'grey.200' }}>
                      <CardContent>
                        <Typography variant="h4" fontWeight="bold">
                          {importResults.errors.length}
                        </Typography>
                        <Typography variant="body1">Errores</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Detalles de errores */}
                {importResults.errors.length > 0 && (
                  <Paper sx={{ p: 2, bgcolor: 'error.lighter', mb: 3 }}>
                    <Typography variant="h6" color="error" gutterBottom>
                      Archivos con errores:
                    </Typography>
                    {importResults.errors.map((error, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{error.file}:</strong> {error.error}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                )}

                {/* Acciones finales */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={handleReset} fullWidth>
                    Importar Más Archivos
                  </Button>
                  <Button variant="contained" onClick={handleFinish} fullWidth>
                    Ir a Compras
                  </Button>
                </Box>
              </Box>
            ) : null}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <UploadFileIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Importar XML del SRI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Importa facturas y retenciones desde archivos XML
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Barra de progreso durante carga */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Contenido del paso actual */}
      <Paper sx={{ p: 3 }}>{renderStepContent()}</Paper>

      {/* Botones de navegación */}
      {activeStep < 2 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === 1 ? handleOpenConfirmDialog : handleNext}
            disabled={loading || (activeStep === 0 && files.length === 0)}
            endIcon={activeStep === 1 ? <SaveIcon /> : <ArrowForwardIcon />}
          >
            {loading ? 'Procesando...' : activeStep === 1 ? 'Confirmar Importación' : 'Siguiente'}
          </Button>
        </Box>
      )}

      {/* Diálogo de confirmación */}
      <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirmar Importación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas importar {files.length}{' '}
            {files.length === 1 ? 'archivo' : 'archivos'}?
            <br />
            <br />
            <strong>Tipo:</strong> {tipoDocumento === 'factura' ? 'Facturas (Compras)' : 'Retenciones'}
            <br />
            <strong>Periodo:</strong> {periodo}
            <br />
            <br />
            Los datos se guardarán en el sistema y podrás editarlos posteriormente si es necesario.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancelar</Button>
          <Button onClick={handleConfirmImport} variant="contained" color="primary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ImportarXML;
