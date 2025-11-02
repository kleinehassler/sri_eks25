import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Stack
} from '@mui/material';
import { Download, FilterList } from '@mui/icons-material';
import reporteService from '../../services/reporteService';

function ReporteRetenciones({ tipo }) {
  const [loading, setLoading] = useState(false);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    periodo: '',
    fecha_desde: '',
    fecha_hasta: '',
    estado: '',
    tipo_impuesto: ''
  });

  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = currentDate.getFullYear().toString();

  useEffect(() => {
    // Establecer periodo por defecto
    setFiltros(prev => ({
      ...prev,
      periodo: `${currentMonth}/${currentYear}`
    }));
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (tipo) {
        case 'porcentaje':
          response = await reporteService.getReporteRetencionesPorPorcentaje(filtros);
          break;
        case 'codigo':
          response = await reporteService.getReporteRetencionesPorCodigo(filtros);
          break;
        case 'sin-retenciones':
          response = await reporteService.getReporteComprasSinRetenciones(filtros);
          break;
        case 'recibidas-iva':
          response = await reporteService.getReporteRetencionesRecibidasIVA(filtros);
          break;
        case 'recibidas-ir':
          response = await reporteService.getReporteRetencionesRecibidasIR(filtros);
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }
      setDatos(response.data);
    } catch (err) {
      setError(err.mensaje || 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    try {
      let tipoExport;
      switch(tipo) {
        case 'porcentaje':
          tipoExport = 'porcentaje';
          break;
        case 'codigo':
          tipoExport = 'codigo';
          break;
        case 'sin-retenciones':
          tipoExport = 'sin-retenciones';
          break;
        case 'recibidas-iva':
          tipoExport = 'recibidas-iva';
          break;
        case 'recibidas-ir':
          tipoExport = 'recibidas-ir';
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      const blob = await reporteService.exportarRetencionesExcel(tipoExport, filtros);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${tipo}_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al exportar el reporte');
    }
  };

  const handleChangeFiltro = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const renderTotales = () => {
    if (!datos) return null;

    if (tipo === 'sin-retenciones') {
      return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total Compras
                </Typography>
                <Typography variant="h5" color="error">
                  {datos.totales?.cantidad || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Base IVA
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(datos.totales?.total_base_iva)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total IVA
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(datos.totales?.total_iva)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total General
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(datos.totales?.total_compras)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {tipo.includes('recibidas') ? 'Total Ventas' : 'Total Retenciones'}
              </Typography>
              <Typography variant="h5" color="primary">
                {datos.totales?.total_retenciones || datos.totales?.total_ventas || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Base Imponible Total
              </Typography>
              <Typography variant="h6">
                {formatCurrency(datos.totales?.total_base || datos.totales?.total_base_iva || datos.totales?.total)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Retenido
              </Typography>
              <Typography variant="h6" color="secondary">
                {formatCurrency(datos.totales?.total_retenido || datos.totales?.total_retencion_iva || datos.totales?.total_retencion_renta)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderTabla = () => {
    if (!datos) return null;

    if (tipo === 'porcentaje') {
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell>Tipo Impuesto</TableCell>
                <TableCell align="right">Porcentaje</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Base Imponible</TableCell>
                <TableCell align="right">Total Retenido</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datos.detalle?.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Chip
                      label={row.tipo_impuesto}
                      color={row.tipo_impuesto === 'IVA' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{row.porcentaje_retencion}%</TableCell>
                  <TableCell align="right">{row.cantidad_retenciones}</TableCell>
                  <TableCell align="right">{formatCurrency(row.total_base_imponible)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(row.total_retenido)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    if (tipo === 'codigo') {
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell>Tipo Impuesto</TableCell>
                <TableCell>Código</TableCell>
                <TableCell align="right">Porcentaje</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Base Imponible</TableCell>
                <TableCell align="right">Total Retenido</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datos.detalle?.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Chip
                      label={row.tipo_impuesto}
                      color={row.tipo_impuesto === 'IVA' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{row.codigo_retencion}</TableCell>
                  <TableCell align="right">{row.porcentaje_retencion}%</TableCell>
                  <TableCell align="right">{row.cantidad_retenciones}</TableCell>
                  <TableCell align="right">{formatCurrency(row.total_base_imponible)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(row.total_retenido)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    if (tipo === 'sin-retenciones') {
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'error.light' }}>
                <TableCell>Fecha</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell>Factura</TableCell>
                <TableCell align="right">Base IVA</TableCell>
                <TableCell align="right">IVA</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datos.compras?.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{row.fecha_emision}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{row.razon_social_proveedor}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.identificacion_proveedor}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {row.establecimiento}-{row.punto_emision}-{row.secuencial}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(row.base_imponible_iva)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.monto_iva)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(row.total_compra)}
                  </TableCell>
                  <TableCell>
                    <Chip label={row.estado} size="small" color="default" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    if (tipo === 'recibidas-iva' || tipo === 'recibidas-ir') {
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'success.light' }}>
                <TableCell>Cliente</TableCell>
                <TableCell align="right">Cantidad Ventas</TableCell>
                <TableCell align="right">Total Ventas</TableCell>
                {tipo === 'recibidas-iva' && (
                  <TableCell align="right">Base IVA</TableCell>
                )}
                <TableCell align="right">
                  {tipo === 'recibidas-iva' ? 'Retención IVA' : 'Retención IR'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datos.detalle?.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{row.razon_social_cliente}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.identificacion_cliente}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{row.cantidad_ventas}</TableCell>
                  <TableCell align="right">{formatCurrency(row.total_ventas)}</TableCell>
                  {tipo === 'recibidas-iva' && (
                    <TableCell align="right">{formatCurrency(row.total_base_iva)}</TableCell>
                  )}
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {formatCurrency(row.total_retencion_iva || row.total_retencion_renta)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    return null;
  };

  return (
    <Box>
      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList />
            <Typography variant="h6">Filtros</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Periodo (MM/YYYY)"
                value={filtros.periodo}
                onChange={(e) => handleChangeFiltro('periodo', e.target.value)}
                placeholder="01/2024"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Fecha Desde"
                type="date"
                value={filtros.fecha_desde}
                onChange={(e) => handleChangeFiltro('fecha_desde', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Fecha Hasta"
                type="date"
                value={filtros.fecha_hasta}
                onChange={(e) => handleChangeFiltro('fecha_hasta', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Estado"
                value={filtros.estado}
                onChange={(e) => handleChangeFiltro('estado', e.target.value)}
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="BORRADOR">Borrador</MenuItem>
                <MenuItem value="VALIDADO">Validado</MenuItem>
                <MenuItem value="INCLUIDO_ATS">Incluido ATS</MenuItem>
                <MenuItem value="ANULADO">Anulado</MenuItem>
              </TextField>
            </Grid>
            {(tipo === 'porcentaje' || tipo === 'codigo') && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Tipo Impuesto"
                  value={filtros.tipo_impuesto}
                  onChange={(e) => handleChangeFiltro('tipo_impuesto', e.target.value)}
                  size="small"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="IVA">IVA</MenuItem>
                  <MenuItem value="RENTA">Renta</MenuItem>
                </TextField>
              </Grid>
            )}
          </Grid>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={cargarDatos}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Aplicar Filtros'}
            </Button>
            {datos && (
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportar}
              >
                Exportar a Excel
              </Button>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Totales */}
      {!loading && datos && renderTotales()}

      {/* Tabla */}
      {!loading && datos && renderTabla()}

      {/* Sin datos */}
      {!loading && !datos && (
        <Alert severity="info">
          Aplica los filtros para visualizar el reporte
        </Alert>
      )}

      {!loading && datos && (tipo === 'sin-retenciones' ? datos.compras?.length === 0 : datos.detalle?.length === 0) && (
        <Alert severity="warning">
          No se encontraron registros con los filtros aplicados
        </Alert>
      )}
    </Box>
  );
}

ReporteRetenciones.propTypes = {
  tipo: PropTypes.oneOf(['porcentaje', 'codigo', 'sin-retenciones', 'recibidas-iva', 'recibidas-ir']).isRequired
};

export default ReporteRetenciones;
