import { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import VentasTable from '../components/Ventas/VentasTable';
import VentaForm from '../components/Ventas/VentaForm';
import ventaService from '../services/ventaService';
import { useAuth } from '../context/AuthContext';

function Ventas() {
  const { user } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [validarDialogOpen, setValidarDialogOpen] = useState(false);
  const [eliminarAnuladosDialogOpen, setEliminarAnuladosDialogOpen] = useState(false);
  const [resultadoEliminacionAnulados, setResultadoEliminacionAnulados] = useState(null);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [formMode, setFormMode] = useState('create');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const response = await ventaService.getAll({
        empresaId: user?.empresa_id
      });
      setVentas(response.data || []);
    } catch (error) {
      showSnackbar(error.mensaje || 'Error al cargar las ventas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (venta = null) => {
    if (venta) {
      setFormMode('edit');
      setSelectedVenta(venta);
    } else {
      setFormMode('create');
      setSelectedVenta(null);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedVenta(null);
  };

  const handleSubmitForm = async (values) => {
    try {
      if (formMode === 'create') {
        await ventaService.create(values);
        showSnackbar('Venta creada exitosamente', 'success');
      } else {
        await ventaService.update(selectedVenta.id, values);
        showSnackbar('Venta actualizada exitosamente', 'success');
      }
      handleCloseForm();
      cargarVentas();
    } catch (error) {
      showSnackbar(error.mensaje || 'Error al guardar la venta', 'error');
    }
  };

  const handleOpenDeleteDialog = (venta) => {
    setSelectedVenta(venta);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedVenta(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await ventaService.delete(selectedVenta.id);
      showSnackbar('Venta eliminada exitosamente', 'success');
      handleCloseDeleteDialog();
      cargarVentas();
    } catch (error) {
      showSnackbar(error.mensaje || 'Error al eliminar la venta', 'error');
    }
  };

  const handleOpenValidarDialog = (venta) => {
    setSelectedVenta(venta);
    setValidarDialogOpen(true);
  };

  const handleCloseValidarDialog = () => {
    setValidarDialogOpen(false);
    setSelectedVenta(null);
  };

  const handleConfirmValidar = async () => {
    try {
      await ventaService.validar(selectedVenta.id);
      showSnackbar('Venta validada exitosamente', 'success');
      handleCloseValidarDialog();
      cargarVentas();
    } catch (error) {
      showSnackbar(error.mensaje || 'Error al validar la venta', 'error');
    }
  };

  const handleOpenEliminarAnuladosDialog = () => {
    setEliminarAnuladosDialogOpen(true);
    setResultadoEliminacionAnulados(null);
  };

  const handleCloseEliminarAnuladosDialog = () => {
    setEliminarAnuladosDialogOpen(false);
    setResultadoEliminacionAnulados(null);
  };

  const handleConfirmEliminarAnulados = async () => {
    setLoading(true);
    try {
      const response = await ventaService.eliminarAnulados({});
      setResultadoEliminacionAnulados(response);

      if (response.eliminados > 0) {
        showSnackbar(response.mensaje, 'success');
      } else {
        showSnackbar(response.mensaje, 'info');
      }

      await cargarVentas();
    } catch (error) {
      const errorMsg = error.mensaje || 'Error al eliminar las ventas anuladas';
      showSnackbar(errorMsg, 'error');
      setResultadoEliminacionAnulados({ error: errorMsg });
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
          <PointOfSaleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Gestión de Ventas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registro y control de ventas para el ATS
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={handleOpenEliminarAnuladosDialog}
            size="large"
          >
            Eliminar Anulados
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            size="large"
          >
            Nueva Venta
          </Button>
        </Box>
      </Box>

      {/* Información importante */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight="medium" gutterBottom>
          Instrucciones para registro de ventas:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Registra todas las ventas del periodo fiscal correspondiente</li>
          <li>Valida cada venta antes de incluirla en el ATS</li>
          <li>Solo las ventas con estado VALIDADO se incluirán en el anexo</li>
          <li>Verifica que los datos coincidan con los comprobantes electrónicos emitidos</li>
        </ul>
      </Alert>

      {/* Tabla de ventas */}
      <VentasTable
        ventas={ventas}
        loading={loading}
        onEdit={handleOpenForm}
        onDelete={handleOpenDeleteDialog}
        onValidar={handleOpenValidarDialog}
      />

      {/* Formulario de venta */}
      <VentaForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialValues={selectedVenta}
        mode={formMode}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta venta?
            <br />
            <br />
            <strong>Cliente:</strong> {selectedVenta?.razon_social_cliente}
            <br />
            <strong>Factura:</strong> {selectedVenta?.establecimiento}-{selectedVenta?.punto_emision}-{selectedVenta?.secuencial}
            <br />
            <strong>Total:</strong> ${parseFloat(selectedVenta?.total_venta || 0).toFixed(2)}
            <br />
            <br />
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de validación */}
      <Dialog open={validarDialogOpen} onClose={handleCloseValidarDialog}>
        <DialogTitle>Confirmar Validación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas validar esta venta?
            <br />
            <br />
            <strong>Cliente:</strong> {selectedVenta?.razon_social_cliente}
            <br />
            <strong>Factura:</strong> {selectedVenta?.establecimiento}-{selectedVenta?.punto_emision}-{selectedVenta?.secuencial}
            <br />
            <strong>Total:</strong> ${parseFloat(selectedVenta?.total_venta || 0).toFixed(2)}
            <br />
            <br />
            Una vez validada, la venta quedará lista para ser incluida en el ATS. Verifica que todos los datos sean correctos.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseValidarDialog} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirmValidar} color="success" variant="contained">
            Validar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación de anulados */}
      <Dialog
        open={eliminarAnuladosDialogOpen}
        onClose={handleCloseEliminarAnuladosDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Eliminar Ventas Anuladas</DialogTitle>
        <DialogContent>
          {!resultadoEliminacionAnulados ? (
            <>
              <DialogContentText>
                ¿Está seguro que desea eliminar <strong>permanentemente</strong> todas las ventas en estado <strong>ANULADO</strong>?
                <br />
                <br />
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="bold">
                    ¡ATENCIÓN!
                  </Typography>
                  <Typography variant="body2">
                    Esta acción es irreversible. Las ventas anuladas se eliminarán permanentemente de la base de datos y no podrán ser recuperadas.
                  </Typography>
                </Alert>
              </DialogContentText>
            </>
          ) : (
            <>
              {resultadoEliminacionAnulados.error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {resultadoEliminacionAnulados.error}
                  </Typography>
                </Alert>
              ) : (
                <Alert severity={resultadoEliminacionAnulados.eliminados > 0 ? 'success' : 'info'} sx={{ mb: 2 }}>
                  <Typography variant="h6">Eliminación Completada</Typography>
                  <Typography variant="body2">
                    {resultadoEliminacionAnulados.mensaje}
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEliminarAnuladosDialog} disabled={loading}>
            {resultadoEliminacionAnulados ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!resultadoEliminacionAnulados && (
            <Button
              onClick={handleConfirmEliminarAnulados}
              color="error"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar Permanentemente'}
            </Button>
          )}
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

export default Ventas;
