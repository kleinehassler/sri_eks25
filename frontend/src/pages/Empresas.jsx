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
import BusinessIcon from '@mui/icons-material/Business';
import EmpresasTable from '../components/Empresas/EmpresasTable';
import EmpresaForm from '../components/Empresas/EmpresaForm';
import empresaService from '../services/empresaService';

function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar empresas al montar el componente
  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await empresaService.getAll();
      setEmpresas(response.data || []);
    } catch (err) {
      setError(err.mensaje || 'Error al cargar las empresas');
      showSnackbar('Error al cargar las empresas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (empresa = null) => {
    setSelectedEmpresa(empresa);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedEmpresa(null);
    setFormOpen(false);
  };

  const handleSubmitForm = async (values) => {
    setLoading(true);
    try {
      if (selectedEmpresa) {
        // Actualizar empresa existente
        await empresaService.update(selectedEmpresa.id, values);
        showSnackbar('Empresa actualizada correctamente', 'success');
      } else {
        // Crear nueva empresa
        await empresaService.create(values);
        showSnackbar('Empresa creada correctamente', 'success');
      }
      handleCloseForm();
      await loadEmpresas();
    } catch (err) {
      const errorMsg = err.mensaje || err.message || 'Error al guardar la empresa';
      showSnackbar(errorMsg, 'error');
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (empresa) => {
    setEmpresaToDelete(empresa);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setEmpresaToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!empresaToDelete) return;

    setLoading(true);
    try {
      await empresaService.delete(empresaToDelete.id);
      showSnackbar('Empresa eliminada correctamente', 'success');
      handleCloseDeleteDialog();
      await loadEmpresas();
    } catch (err) {
      const errorMsg = err.mensaje || 'Error al eliminar la empresa';
      showSnackbar(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEstado = async (empresa) => {
    const nuevoEstado = empresa.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    setLoading(true);
    try {
      await empresaService.cambiarEstado(empresa.id, nuevoEstado);
      showSnackbar(
        `Empresa ${nuevoEstado === 'ACTIVO' ? 'activada' : 'desactivada'} correctamente`,
        'success'
      );
      await loadEmpresas();
    } catch (err) {
      const errorMsg = err.mensaje || 'Error al cambiar el estado de la empresa';
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
          <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Gestión de Empresas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administra las empresas del sistema
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          size="large"
        >
          Nueva Empresa
        </Button>
      </Box>

      {/* Error global */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabla de empresas */}
      <Paper sx={{ p: 3 }}>
        <EmpresasTable
          empresas={empresas}
          loading={loading}
          error={error}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteDialog}
          onToggleEstado={handleToggleEstado}
        />
      </Paper>

      {/* Formulario de empresa */}
      <EmpresaForm
        open={formOpen}
        onClose={handleCloseForm}
        empresa={selectedEmpresa}
        onSubmit={handleSubmitForm}
        loading={loading}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar la empresa{' '}
            <strong>{empresaToDelete?.razon_social}</strong>?
            <br />
            <br />
            Esta acción no se puede deshacer y eliminará todos los datos relacionados con esta
            empresa.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={loading}>
            Eliminar
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

export default Empresas;
