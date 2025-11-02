import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

function VentasTable({ ventas, onEdit, onDelete, onValidar, loading }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodoFilter, setPeriodoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [filteredVentas, setFilteredVentas] = useState([]);

  useEffect(() => {
    let result = ventas || [];

    // Filtro por búsqueda (cliente, RUC, número de factura)
    if (searchTerm) {
      result = result.filter(venta =>
        venta.razon_social_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venta.identificacion_cliente?.includes(searchTerm) ||
        venta.secuencial?.includes(searchTerm)
      );
    }

    // Filtro por periodo
    if (periodoFilter) {
      result = result.filter(venta => venta.periodo === periodoFilter);
    }

    // Filtro por estado
    if (estadoFilter) {
      result = result.filter(venta => venta.estado === estadoFilter);
    }

    setFilteredVentas(result);
    setPage(0); // Reset a la primera página cuando cambian los filtros
  }, [ventas, searchTerm, periodoFilter, estadoFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setPeriodoFilter('');
    setEstadoFilter('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC');
  };

  const getEstadoColor = (estado) => {
    const estados = {
      BORRADOR: 'default',
      VALIDADO: 'success',
      INCLUIDO_ATS: 'info',
      ANULADO: 'error'
    };
    return estados[estado] || 'default';
  };

  // Calcular totales
  const totales = filteredVentas.reduce((acc, venta) => {
    acc.total += parseFloat(venta.total_venta || 0);
    acc.iva += parseFloat(venta.monto_iva || 0);
    acc.base_iva += parseFloat(venta.base_imponible_iva || 0);
    return acc;
  }, { total: 0, iva: 0, base_iva: 0 });

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Panel de filtros */}
      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por cliente, RUC o secuencial..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Periodo"
              placeholder="MM/YYYY"
              value={periodoFilter}
              onChange={(e) => setPeriodoFilter(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFilter}
                label="Estado"
                onChange={(e) => setEstadoFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="BORRADOR">Borrador</MenuItem>
                <MenuItem value="VALIDADO">Validado</MenuItem>
                <MenuItem value="INCLUIDO_ATS">Incluido ATS</MenuItem>
                <MenuItem value="ANULADO">Anulado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={!searchTerm && !periodoFilter && !estadoFilter}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>

        {/* Resumen de totales */}
        {filteredVentas.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Total Ventas
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(totales.total)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Base Imponible IVA
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(totales.base_iva)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  IVA Total
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(totales.iva)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* Tabla */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Periodo</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>RUC/CI</strong></TableCell>
              <TableCell><strong>Factura</strong></TableCell>
              <TableCell align="right"><strong>Base IVA</strong></TableCell>
              <TableCell align="right"><strong>IVA</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  Cargando ventas...
                </TableCell>
              </TableRow>
            ) : filteredVentas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  No se encontraron ventas
                </TableCell>
              </TableRow>
            ) : (
              filteredVentas
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((venta) => (
                  <TableRow key={venta.id} hover>
                    <TableCell>{venta.periodo}</TableCell>
                    <TableCell>{formatDate(venta.fecha_emision)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {venta.razon_social_cliente}
                      </Typography>
                    </TableCell>
                    <TableCell>{venta.identificacion_cliente}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {venta.establecimiento}-{venta.punto_emision}-{venta.secuencial}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(venta.base_imponible_iva)}</TableCell>
                    <TableCell align="right">{formatCurrency(venta.monto_iva)}</TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(venta.total_venta)}</strong>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={venta.estado}
                        color={getEstadoColor(venta.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        {venta.estado === 'BORRADOR' && (
                          <Tooltip title="Validar venta">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => onValidar(venta)}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onEdit(venta)}
                            disabled={venta.estado === 'INCLUIDO_ATS'}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(venta)}
                            disabled={venta.estado === 'INCLUIDO_ATS'}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredVentas.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Paper>
  );
}

export default VentasTable;
