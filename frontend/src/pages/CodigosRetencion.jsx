import { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PercentIcon from '@mui/icons-material/Percent';
import CodigosRetencionTable from '../components/CodigosRetencion/CodigosRetencionTable';
import CodigoRetencionForm from '../components/CodigosRetencion/CodigoRetencionForm';
import codigoRetencionService from '../services/codigoRetencionService';

function CodigosRetencion() {
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [codigoToDelete, setCodigoToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar códigos al montar el componente
  useEffect(() => {
    loadCodigos();
  }, []);

  const loadCodigos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await codigoRetencionService.getAll({ limite: 1000 });
      setCodigos(response.data || []);
    } catch (err) {
      setError(err.mensaje || 'Error al cargar los códigos de retención');
      showSnackbar('Error al cargar los códigos de retención', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (codigo = null) => {
    setSelectedCodigo(codigo);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedCodigo(null);
    setFormOpen(false);
  };

  const handleSubmitForm = async (values) => {
    setLoading(true);
    try {
      if (selectedCodigo) {
        // Actualizar código existente
        await codigoRetencionService.update(selectedCodigo.id, values);
        showSnackbar('Código de retención actualizado correctamente', 'success');
      } else {
        // Crear nuevo código
        await codigoRetencionService.create(values);
        showSnackbar('Código de retención creado correctamente', 'success');
      }
      handleCloseForm();
      await loadCodigos();
    } catch (err) {
      const errorMsg = err.mensaje || err.error || err.message || 'Error al guardar el código de retención';
      showSnackbar(errorMsg, 'error');
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (codigo) => {
    setCodigoToDelete(codigo);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setCodigoToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!codigoToDelete) return;

    setLoading(true);
    try {
      await codigoRetencionService.delete(codigoToDelete.id);
      showSnackbar('Código de retención eliminado correctamente', 'success');
      handleCloseDeleteDialog();
      await loadCodigos();
    } catch (err) {
      const errorMsg = err.mensaje || 'Error al eliminar el código de retención';
      showSnackbar(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEstado = async (codigo) => {
    const nuevoEstado = codigo.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    setLoading(true);
    try {
      await codigoRetencionService.cambiarEstado(codigo.id, nuevoEstado);
      showSnackbar(
        `Código de retención ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente`,
        'success'
      );
      await loadCodigos();
    } catch (err) {
      const errorMsg = err.mensaje || 'Error al cambiar el estado del código de retención';
      showSnackbar(errorMsg, 'error');
    } finally {
      setLoading(false);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PercentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Códigos de Retención
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administra los códigos de retención en la fuente del SRI
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          size="large"
        >
          Nuevo Código
        </Button>
      </Box>

      {/* Error global */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Información */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Esta funcionalidad está disponible solo para el Administrador del Sistema. Los códigos de
        retención son utilizados en las transacciones de compras y ventas.
      </Alert>

      {/* Tabla de códigos */}
      <Paper sx={{ p: 3 }}>
        <CodigosRetencionTable
          codigos={codigos}
          loading={loading}
          error={error}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteDialog}
          onToggleEstado={handleToggleEstado}
        />
      </Paper>

      {/* Formulario de código */}
      <CodigoRetencionForm
        open={formOpen}
        onClose={handleCloseForm}
        codigo={selectedCodigo}
        onSubmit={handleSubmitForm}
        loading={loading}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar el código de retención{' '}
            <strong>{codigoToDelete?.codigo}</strong>?
            <br />
            <br />
            Esta acción cambiará el estado del código a INACTIVO.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de notificaciones */}
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

export default CodigosRetencion;
