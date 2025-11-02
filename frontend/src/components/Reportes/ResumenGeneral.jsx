import { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import reporteService from '../../services/reporteService';

function ResumenGeneral({ empresaId, periodo }) {
  const [loading, setLoading] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [topProveedores, setTopProveedores] = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (empresaId && periodo) {
      cargarResumen();
    }
  }, [empresaId, periodo]);

  const cargarResumen = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar resumen general
      const resumenResponse = await reporteService.getResumenGeneral({ periodo });
      const data = resumenResponse.data;

      // Transformar datos al formato esperado
      const resumenTransformado = {
        total_compras: data.compras?.total || 0,
        total_ventas: data.ventas?.total || 0,
        cantidad_compras: data.compras?.cantidad || 0,
        cantidad_ventas: data.ventas?.cantidad || 0,
        base_iva_compras: data.compras?.total || 0,
        base_iva_ventas: data.ventas?.total || 0,
        iva_compras: data.compras?.iva || 0,
        iva_ventas: data.ventas?.iva || 0
      };

      setResumen(resumenTransformado);

      // Los top proveedores y clientes no están disponibles en el nuevo backend
      // por ahora dejamos estos arrays vacíos
      setTopProveedores([]);
      setTopClientes([]);
    } catch (err) {
      setError(err.mensaje || 'Error al cargar el resumen');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!resumen) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Selecciona una empresa y periodo para ver el resumen
      </Alert>
    );
  }

  const ivaPorPagar = (resumen.iva_ventas || 0) - (resumen.iva_compras || 0);
  const margenBruto = (resumen.total_ventas || 0) - (resumen.total_compras || 0);

  return (
    <Box>
      {/* Cards de resumen principal */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Compras */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.lighter', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ShoppingCartIcon sx={{ fontSize: 40, color: 'error.main' }} />
                <Typography variant="h6" color="error.dark">
                  Compras
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="error.dark">
                {formatCurrency(resumen.total_compras)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {resumen.cantidad_compras || 0} transacciones
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Base IVA: {formatCurrency(resumen.base_iva_compras)}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                IVA: {formatCurrency(resumen.iva_compras)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Ventas */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.lighter', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PointOfSaleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                <Typography variant="h6" color="success.dark">
                  Ventas
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.dark">
                {formatCurrency(resumen.total_ventas)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {resumen.cantidad_ventas || 0} transacciones
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Base IVA: {formatCurrency(resumen.base_iva_ventas)}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                IVA: {formatCurrency(resumen.iva_ventas)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* IVA por Pagar/Favor */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: ivaPorPagar >= 0 ? 'warning.lighter' : 'info.lighter', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccountBalanceIcon sx={{ fontSize: 40, color: ivaPorPagar >= 0 ? 'warning.main' : 'info.main' }} />
                <Typography variant="h6" color={ivaPorPagar >= 0 ? 'warning.dark' : 'info.dark'}>
                  IVA {ivaPorPagar >= 0 ? 'por Pagar' : 'a Favor'}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color={ivaPorPagar >= 0 ? 'warning.dark' : 'info.dark'}>
                {formatCurrency(Math.abs(ivaPorPagar))}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Periodo: {periodo}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                IVA Ventas: {formatCurrency(resumen.iva_ventas)}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                IVA Compras: {formatCurrency(resumen.iva_compras)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Margen Bruto */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: margenBruto >= 0 ? 'primary.lighter' : 'error.lighter', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {margenBruto >= 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 40, color: 'error.main' }} />
                )}
                <Typography variant="h6" color={margenBruto >= 0 ? 'primary.dark' : 'error.dark'}>
                  Margen Bruto
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color={margenBruto >= 0 ? 'primary.dark' : 'error.dark'}>
                {formatCurrency(margenBruto)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Ventas - Compras
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                {resumen.total_ventas > 0
                  ? `${((margenBruto / resumen.total_ventas) * 100).toFixed(2)}%`
                  : '0%'}
                {' '}del total de ventas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Proveedores y Clientes */}
      <Grid container spacing={3}>
        {/* Top Proveedores */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🏪 Top 5 Proveedores
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {topProveedores.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>#</strong></TableCell>
                      <TableCell><strong>Proveedor</strong></TableCell>
                      <TableCell align="right"><strong>Total Compras</strong></TableCell>
                      <TableCell align="right"><strong>%</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProveedores.map((proveedor, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {proveedor.razon_social}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {proveedor.identificacion}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <strong>{formatCurrency(proveedor.total)}</strong>
                        </TableCell>
                        <TableCell align="right">
                          {resumen.total_compras > 0
                            ? `${((proveedor.total / resumen.total_compras) * 100).toFixed(1)}%`
                            : '0%'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No hay datos de proveedores para este periodo</Alert>
            )}
          </Paper>
        </Grid>

        {/* Top Clientes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              👥 Top 5 Clientes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {topClientes.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>#</strong></TableCell>
                      <TableCell><strong>Cliente</strong></TableCell>
                      <TableCell align="right"><strong>Total Ventas</strong></TableCell>
                      <TableCell align="right"><strong>%</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topClientes.map((cliente, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {cliente.razon_social}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cliente.identificacion}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <strong>{formatCurrency(cliente.total)}</strong>
                        </TableCell>
                        <TableCell align="right">
                          {resumen.total_ventas > 0
                            ? `${((cliente.total / resumen.total_ventas) * 100).toFixed(1)}%`
                            : '0%'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No hay datos de clientes para este periodo</Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ResumenGeneral;
