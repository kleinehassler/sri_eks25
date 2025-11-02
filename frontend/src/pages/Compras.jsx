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
  Snackbar,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ComprasTable from '../components/Compras/ComprasTable';
import CompraForm from '../components/Compras/CompraForm';
import compraService from '../services/compraService';
import { useAuth } from '../context/AuthContext';

function Compras() {
  const { user } = useAuth();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [compraToDelete, setCompraToDelete] = useState(null);
  const [validarDialogOpen, setValidarDialogOpen] = useState(false);
  const [compraToValidar, setCompraToValidar] = useState(null);
  const [validarMasivoDialogOpen, setValidarMasivoDialogOpen] = useState(false);
  const [resultadosValidacionMasiva, setResultadosValidacionMasiva] = useState(null);
  const [eliminarAnuladosDialogOpen, setEliminarAnuladosDialogOpen] = useState(false);
  const [resultadoEliminacionAnulados, setResultadoEliminacionAnulados] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    periodo: '',
    estado: ''
  });

  // Cargar compras al montar el componente
  useEffect(() => {
    loadCompras();
  }, []);

  const loadCompras = async (appliedFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Combinar filtros actuales con los aplicados
      const finalFilters = { ...filters, ...appliedFilters };
      const response = await compraService.getAll(finalFilters);
      setCompras(response.data || []);
    } catch (err) {
      setError(err.mensaje || 'Error al cargar las compras');
      showSnackbar('Error al cargar las compras', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    loadCompras(newFilters);
  };

  const handleOpenForm = (compra = null) => {
    setSelectedCompra(compra);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedCompra(null);
    setFormOpen(false);
  };

  const handleSubmitForm = async (values) => {
    setLoading(true);
    try {
      // Asegurar que empresa_id esté presente
      const compraData = {
        ...values,
        empresa_id: user?.empresa_id || values.empresa_id
      };

      if (selectedCompra) {
        // Actualizar compra existente
        await compraService.update(selectedCompra.id, compraData);
        showSnackbar('Compra actualizada correctamente', 'success');
      } else {
        // Crear nueva compra
        await compraService.create(compraData);
        showSnackbar('Compra creada correctamente', 'success');
      }
      handleCloseForm();
      await loadCompras();
    } catch (err) {
      const errorMsg = err.mensaje || err.message || 'Error al guardar la compra';
      showSnackbar(errorMsg, 'error');
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (compra) => {
    setCompraToDelete(compra);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setCompraToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!compraToDelete) return;

    setLoading(true);
    try {
      await compraService.delete(compraToDelete.id);
      showSnackbar('Compra eliminada correctamente', 'success');
      handleCloseDeleteDialog();
      await loadCompras();
    } catch (err) {
      const errorMsg = err.mensaje || 'Error al eliminar la compra';
      showSnackbar(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenValidarDialog = (compra) => {
    setCompraToValidar(compra);
    setValidarDialogOpen(true);
  };

  const handleCloseValidarDialog = () => {
    setCompraToValidar(null);
    setValidarDialogOpen(false);
  };

  const handleConfirmValidar = async () => {
    if (!compraToValidar) return;

    setLoading(true);
    try {
      await compraService.validar(compraToValidar.id);
      showSnackbar('Compra validada correctamente', 'success');
      handleCloseValidarDialog();
      await loadCompras();
    } catch (err) {
      const errorMsg = err.mensaje || 'Error al validar la compra';
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

  const handleOpenValidarMasivoDialog = () => {
    setValidarMasivoDialogOpen(true);
  };

  const handleCloseValidarMasivoDialog = () => {
    setValidarMasivoDialogOpen(false);
    setResultadosValidacionMasiva(null);
  };

  const handleConfirmValidarMasivo = async () => {
    setLoading(true);
    try {
      // Aplicar los filtros actuales a la validación masiva
      const response = await compraService.validarMasivo(filters);
      setResultadosValidacionMasiva(response.data);

      // Mostrar mensaje de éxito
      if (response.data.errores.length === 0) {
        showSnackbar(response.mensaje, 'success');
      } else {
        showSnackbar(
          `${response.data.validadas} compras validadas, ${response.data.errores.length} con errores`,
          'warning'
        );
      }

      // Recargar las compras
      await loadCompras();
    } catch (err) {
      const errorMsg = err.mensaje || 'Error al validar las compras';
      showSnackbar(errorMsg, 'error');
    } finally {
      setLoading(false);
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
      // Aplicar los filtros actuales a la eliminación
      const response = await compraService.eliminarAnulados(filters);
      setResultadoEliminacionAnulados(response);

      // Mostrar mensaje de éxito
      if (response.eliminados > 0) {
        showSnackbar(response.mensaje, 'success');
      } else {
        showSnackbar(response.mensaje, 'info');
      }

      // Recargar las compras
      await loadCompras();
    } catch (err) {
      const errorMsg = err.mensaje || 'Error al eliminar las compras anuladas';
      showSnackbar(errorMsg, 'error');
      setResultadoEliminacionAnulados({ error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ShoppingCartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Gestión de Compras
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administra las compras y facturas de proveedores
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
            variant="outlined"
            color="success"
            startIcon={<CheckCircleOutlineIcon />}
            onClick={handleOpenValidarMasivoDialog}
            size="large"
          >
            Validar Borradores
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            size="large"
          >
            Nueva Compra
          </Button>
        </Box>
      </Box>

      {/* Error global */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabla de compras con filtros */}
      <Paper sx={{ p: 3 }}>
        <ComprasTable
          compras={compras}
          loading={loading}
          error={error}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteDialog}
          onValidar={handleOpenValidarDialog}
          onFilterChange={handleFilterChange}
        />
      </Paper>

      {/* Formulario de compra */}
      <CompraForm
        open={formOpen}
        onClose={handleCloseForm}
        compra={selectedCompra}
        onSubmit={handleSubmitForm}
        loading={loading}
        empresaId={user?.empresa_id}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar la compra del proveedor{' '}
            <strong>{compraToDelete?.razon_social_proveedor}</strong>?
            <br />
            <br />
            <strong>Fecha:</strong> {compraToDelete?.fecha_emision ? new Date(compraToDelete.fecha_emision).toLocaleDateString('es-EC') : '-'}
            <br />
            <strong>Total:</strong> ${compraToDelete?.total_compra || 0}
            <br />
            <br />
            Esta acción no se puede deshacer.
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

      {/* Diálogo de confirmación de validación */}
      <Dialog open={validarDialogOpen} onClose={handleCloseValidarDialog}>
        <DialogTitle>Confirmar validación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea validar la compra del proveedor{' '}
            <strong>{compraToValidar?.razon_social_proveedor}</strong>?
            <br />
            <br />
            <strong>Fecha:</strong> {compraToValidar?.fecha_emision ? new Date(compraToValidar.fecha_emision).toLocaleDateString('es-EC') : '-'}
            <br />
            <strong>Total:</strong> ${compraToValidar?.total_compra || 0}
            <br />
            <br />
            Una vez validada, la compra será incluida en el cálculo del ATS y no podrá ser modificada sin desvalidarla primero.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseValidarDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmValidar} color="success" variant="contained" disabled={loading}>
            Validar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de validación masiva */}
      <Dialog
        open={validarMasivoDialogOpen}
        onClose={handleCloseValidarMasivoDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Validar Compras en Borrador</DialogTitle>
        <DialogContent>
          {!resultadosValidacionMasiva ? (
            <>
              <DialogContentText>
                ¿Está seguro que desea validar todas las compras en estado <strong>BORRADOR</strong>?
                <br />
                <br />
                Esta acción validará automáticamente todas las compras que cumplan con los requisitos
                de totales y datos completos.
                <br />
                <br />
                {filters.periodo && (
                  <>
                    <strong>Periodo:</strong> {filters.periodo}
                    <br />
                  </>
                )}
                {filters.estado && filters.estado === 'BORRADOR' && (
                  <>
                    <strong>Estado:</strong> Solo BORRADORES
                    <br />
                  </>
                )}
                <br />
                Las compras validadas podrán ser incluidas en el ATS.
              </DialogContentText>
            </>
          ) : (
            <>
              <Alert severity={resultadosValidacionMasiva.errores.length === 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
                <Typography variant="h6">Validación Completada</Typography>
                <Typography variant="body2">
                  {resultadosValidacionMasiva.validadas} de {resultadosValidacionMasiva.total} compras validadas exitosamente
                </Typography>
              </Alert>

              {resultadosValidacionMasiva.errores.length > 0 && (
                <>
                  <Typography variant="subtitle1" color="error" gutterBottom>
                    Compras con errores:
                  </Typography>
                  <List dense>
                    {resultadosValidacionMasiva.errores.map((error, index) => (
                      <ListItem key={index} sx={{ bgcolor: 'error.lighter', mb: 1, borderRadius: 1 }}>
                        <ListItemText
                          primary={`${error.proveedor} - ${new Date(error.fecha).toLocaleDateString('es-EC')}`}
                          secondary={error.error}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseValidarMasivoDialog} disabled={loading}>
            {resultadosValidacionMasiva ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!resultadosValidacionMasiva && (
            <Button
              onClick={handleConfirmValidarMasivo}
              color="success"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Validando...' : 'Validar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación de anulados */}
      <Dialog
        open={eliminarAnuladosDialogOpen}
        onClose={handleCloseEliminarAnuladosDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Eliminar Compras Anuladas</DialogTitle>
        <DialogContent>
          {!resultadoEliminacionAnulados ? (
            <>
              <DialogContentText>
                ¿Está seguro que desea eliminar <strong>permanentemente</strong> todas las compras en estado <strong>ANULADO</strong>?
                <br />
                <br />
                {filters.periodo && (
                  <>
                    <strong>Periodo:</strong> {filters.periodo}
                    <br />
                  </>
                )}
                <br />
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <strong>¡ATENCIÓN!</strong> Esta acción es irreversible. Las compras anuladas se eliminarán permanentemente de la base de datos y no podrán ser recuperadas.
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

export default Compras;
