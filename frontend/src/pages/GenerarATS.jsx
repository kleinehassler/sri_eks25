import { useState } from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import GenerateIcon from '@mui/icons-material/PlayArrow';
import WarningIcon from '@mui/icons-material/Warning';
import PeriodoSelector from '../components/ATS/PeriodoSelector';
import TransaccionesPreview from '../components/ATS/TransaccionesPreview';
import atsService from '../services/atsService';
import compraService from '../services/compraService';
import { useAuth } from '../context/AuthContext';

function GenerarATS() {
  const { user } = useAuth();
  const [empresaId, setEmpresaId] = useState(user?.empresa_id || '');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [archivoGenerado, setArchivoGenerado] = useState(null);

  const handlePeriodoSelected = async (periodo) => {
    setPeriodoSeleccionado(periodo);
    setPreviewData(null);
    setArchivoGenerado(null);
    await cargarPreview(periodo);
  };

  const cargarPreview = async (periodo) => {
    setLoading(true);
    try {
      // Obtener vista previa completa del ATS (compras, ventas, exportaciones)
      const response = await atsService.previsualizar(empresaId, periodo);

      // La respuesta del backend ya tiene la estructura correcta
      setPreviewData(response.data);
      showSnackbar('Vista previa cargada correctamente', 'success');
    } catch (error) {
      showSnackbar(error.mensaje || 'Error al cargar la vista previa', 'error');
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmDialog = () => {
    // Validar que haya transacciones
    const totalTransacciones = (previewData?.resumen?.total_compras || 0) +
                               (previewData?.resumen?.total_ventas || 0) +
                               (previewData?.resumen?.total_exportaciones || 0);

    if (totalTransacciones === 0) {
      showSnackbar('No hay transacciones validadas para generar el ATS', 'warning');
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleGenerarATS = async () => {
    setConfirmDialogOpen(false);
    setGenerando(true);

    try {
      // Generar ATS
      const response = await atsService.generar(empresaId, periodoSeleccionado);

      setArchivoGenerado(response.data);
      showSnackbar('ATS generado correctamente', 'success');
    } catch (error) {
      showSnackbar(error.mensaje || 'Error al generar el ATS', 'error');
    } finally {
      setGenerando(false);
    }
  };

  const handleDescargarXML = async () => {
    if (!archivoGenerado) return;

    try {
      const blob = await atsService.descargar(archivoGenerado.id, 'xml');

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = archivoGenerado.archivo_xml || `ATS${periodoSeleccionado.replace('/', '')}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSnackbar('Archivo XML descargado', 'success');
    } catch (error) {
      showSnackbar('Error al descargar el archivo XML', 'error');
    }
  };

  const handleDescargarZIP = async () => {
    if (!archivoGenerado) return;

    try {
      const blob = await atsService.descargar(archivoGenerado.id, 'zip');

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = archivoGenerado.archivo_zip || `ATS${periodoSeleccionado.replace('/', '')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSnackbar('Archivo ZIP descargado', 'success');
    } catch (error) {
      showSnackbar('Error al descargar el archivo ZIP', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Generar Anexo Transaccional Simplificado (ATS)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Genera el archivo XML del ATS para presentar al SRI
          </Typography>
        </Box>
      </Box>

      {/* Selector de Periodo */}
      <PeriodoSelector
        onPeriodoSelected={handlePeriodoSelected}
        empresaId={empresaId}
      />

      {/* Barra de progreso durante carga */}
      {loading && <LinearProgress sx={{ mt: 3 }} />}

      {/* Preview de Transacciones */}
      {periodoSeleccionado && !loading && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Transacciones del Periodo: {periodoSeleccionado}
            </Typography>
            {previewData && (
              <Button
                variant="contained"
                size="large"
                startIcon={<GenerateIcon />}
                onClick={handleOpenConfirmDialog}
                disabled={generando}
              >
                {generando ? 'Generando...' : 'Generar ATS'}
              </Button>
            )}
          </Box>

          <TransaccionesPreview data={previewData} periodo={periodoSeleccionado} />
        </Paper>
      )}

      {/* Área de descarga */}
      {archivoGenerado && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'success.lighter' }}>
          <Typography variant="h6" color="success.dark" gutterBottom>
            ✅ ATS Generado Exitosamente
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            El archivo ATS ha sido generado correctamente. Puedes descargarlo en formato XML o ZIP.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDescargarXML}
            >
              Descargar XML
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DownloadIcon />}
              onClick={handleDescargarZIP}
            >
              Descargar ZIP
            </Button>
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              <strong>Archivo XML:</strong> {archivoGenerado.archivo_xml}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              <strong>Archivo ZIP:</strong> {archivoGenerado.archivo_zip}
            </Typography>
            {archivoGenerado.estadisticas && (
              <>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  <strong>Estadísticas:</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Compras: {archivoGenerado.estadisticas.total_compras || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Ventas: {archivoGenerado.estadisticas.total_ventas || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Exportaciones: {archivoGenerado.estadisticas.total_exportaciones || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Retenciones: {archivoGenerado.estadisticas.total_retenciones || 0}
                </Typography>
              </>
            )}
          </Box>
        </Paper>
      )}

      {/* Información adicional */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" fontWeight="medium" gutterBottom>
          Información importante sobre el ATS:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Solo se incluyen transacciones con estado VALIDADO</li>
          <li>El archivo se genera en formato XML conforme al esquema XSD del SRI</li>
          <li>El periodo debe coincidir con el mes de emisión de las facturas</li>
          <li>El archivo ZIP es el formato requerido para subir al portal del SRI</li>
          <li>Verifica los datos antes de generar el ATS</li>
        </ul>
      </Alert>

      {/* Diálogo de confirmación */}
      <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            Confirmar Generación de ATS
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas generar el Anexo Transaccional Simplificado (ATS) para el periodo{' '}
            <strong>{periodoSeleccionado}</strong>?
            <br />
            <br />
            <strong>Resumen:</strong>
            <ul>
              <li>Compras: {previewData?.resumen?.total_compras || 0}</li>
              <li>Ventas: {previewData?.resumen?.total_ventas || 0}</li>
              <li>Exportaciones: {previewData?.resumen?.total_exportaciones || 0}</li>
            </ul>
            <br />
            El archivo se generará en formato XML y se comprimirá en formato ZIP. Asegúrate de que
            todas las transacciones estén validadas y correctas antes de continuar.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} disabled={generando}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerarATS}
            variant="contained"
            color="primary"
            disabled={generando}
            startIcon={generando && <CircularProgress size={20} />}
          >
            {generando ? 'Generando...' : 'Generar'}
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

export default GenerarATS;
