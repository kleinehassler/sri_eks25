import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Box,
  Typography,
  TablePagination,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

function ComprasTable({ compras, loading, error, onEdit, onDelete, onValidar, onFilterChange }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    periodo: '',
    estado: ''
  });

  // Filtrar compras por búsqueda local
  const filteredCompras = compras.filter(compra =>
    compra.identificacion_proveedor.includes(searchTerm) ||
    compra.razon_social_proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    compra.numero_autorizacion?.includes(searchTerm)
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
    setPage(0);
  };

  const handleClearFilters = () => {
    const clearedFilters = { periodo: '', estado: '' };
    setFilters(clearedFilters);
    setSearchTerm('');
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
    setPage(0);
  };

  // Obtener el color del chip según el estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'BORRADOR':
        return 'warning';
      case 'VALIDADO':
        return 'success';
      case 'INCLUIDO_ATS':
        return 'info';
      case 'ANULADO':
        return 'error';
      default:
        return 'default';
    }
  };

  // Formatear número como moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar compras: {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Filtros</Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Búsqueda */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por RUC, proveedor o autorización..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Filtro por Periodo */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Periodo"
              placeholder="MM/YYYY"
              value={filters.periodo}
              onChange={(e) => handleFilterChange('periodo', e.target.value)}
              helperText="Formato: 01/2024"
            />
          </Grid>

          {/* Filtro por Estado */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="BORRADOR">Borrador</MenuItem>
                <MenuItem value="VALIDADO">Validado</MenuItem>
                <MenuItem value="INCLUIDO_ATS">Incluido en ATS</MenuItem>
                <MenuItem value="ANULADO">Anulado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Botón limpiar filtros */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ height: '56px' }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Mensaje sin datos */}
      {compras.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No hay compras registradas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Haz clic en "Nueva Compra" para agregar la primera compra
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nº Compra</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Proveedor</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>RUC</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nº Autorización</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo Doc.</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Base IVA</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">IVA</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCompras
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((compra) => (
                    <TableRow
                      key={compra.id}
                      hover
                      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(compra.fecha_emision)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                          {compra.establecimiento}-{compra.punto_emision}-{compra.secuencial}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {compra.razon_social_proveedor}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {compra.identificacion_proveedor}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={compra.numero_autorizacion || 'Sin autorización'}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              maxWidth: '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer'
                            }}
                          >
                            {compra.numero_autorizacion
                              ? `${compra.numero_autorizacion.substring(0, 20)}...`
                              : '-'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {compra.tipo_comprobante || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(compra.base_imponible_iva)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(compra.monto_iva)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(compra.total_compra)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={compra.estado}
                          color={getEstadoColor(compra.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {compra.estado === 'BORRADOR' && (
                            <Tooltip title="Validar">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => onValidar(compra)}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => onEdit(compra)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onDelete(compra)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredCompras.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </TableContainer>

          {/* Resumen */}
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Compras:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {filteredCompras.length}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Base Imponible Total:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {formatCurrency(
                    filteredCompras.reduce((sum, c) => sum + (parseFloat(c.base_imponible_iva) || 0), 0)
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Total General:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatCurrency(
                    filteredCompras.reduce((sum, c) => sum + (parseFloat(c.total_compra) || 0), 0)
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
}

export default ComprasTable;
