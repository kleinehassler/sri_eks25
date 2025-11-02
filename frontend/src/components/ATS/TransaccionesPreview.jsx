import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

function TransaccionesPreview({ data, periodo }) {
  if (!data) {
    return (
      <Alert severity="info" icon={<InfoIcon />}>
        Selecciona un periodo para ver el resumen de transacciones disponibles para el ATS
      </Alert>
    );
  }

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

  // Calcular totales
  const totalCompras = data.compras?.length || 0;
  const totalVentas = data.ventas?.length || 0;
  const totalVentasAgrupadas = data.ventas_agrupadas?.length || 0;
  const totalExportaciones = data.exportaciones?.length || 0;

  const montoTotalCompras = data.compras?.reduce((sum, c) => sum + (parseFloat(c.total_compra) || 0), 0) || 0;
  const montoTotalVentas = data.ventas?.reduce((sum, v) => sum + (parseFloat(v.total_venta) || 0), 0) || 0;
  const montoTotalExportaciones = data.exportaciones?.reduce((sum, e) => sum + (parseFloat(e.total_exportacion) || 0), 0) || 0;

  const baseIvaCompras = data.compras?.reduce((sum, c) => sum + (parseFloat(c.base_imponible_iva) || 0), 0) || 0;
  const ivaCompras = data.compras?.reduce((sum, c) => sum + (parseFloat(c.monto_iva) || 0), 0) || 0;

  // Retenciones recibidas (de ventas)
  const totalRetencionesIvaRecibidas = data.ventas?.reduce((sum, v) => sum + (parseFloat(v.valor_retencion_iva) || 0), 0) || 0;
  const totalRetencionesRentaRecibidas = data.ventas?.reduce((sum, v) => sum + (parseFloat(v.valor_retencion_renta) || 0), 0) || 0;

  // Validaciones
  const advertencias = [];
  if (totalCompras === 0 && totalVentas === 0) {
    advertencias.push('No hay transacciones validadas para este periodo');
  }
  if (totalCompras > 0 && montoTotalCompras === 0) {
    advertencias.push('Las compras tienen monto total cero');
  }

  return (
    <Box>
      {/* Alerta de estado */}
      {advertencias.length > 0 ? (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Advertencias detectadas:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {advertencias.map((adv, index) => (
              <li key={index}>
                <Typography variant="body2">{adv}</Typography>
              </li>
            ))}
          </ul>
        </Alert>
      ) : (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2">
            Se encontraron <strong>{totalCompras + totalVentas + totalExportaciones} transacciones validadas</strong> para
            el periodo <strong>{periodo}</strong>. El archivo ATS está listo para generar.
          </Typography>
        </Alert>
      )}

      {/* Cards de resumen */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ShoppingCartIcon />
                <Typography variant="h6">Compras</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {totalCompras}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Total: {formatCurrency(montoTotalCompras)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PointOfSaleIcon />
                <Typography variant="h6">Ventas</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {totalVentas}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Total: {formatCurrency(montoTotalVentas)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FlightTakeoffIcon />
                <Typography variant="h6">Exportaciones</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {totalExportaciones}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Total: {formatCurrency(montoTotalExportaciones)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detalle de Compras */}
      {totalCompras > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🛒 Detalle de Compras ({totalCompras})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Proveedor</strong></TableCell>
                    <TableCell><strong>RUC</strong></TableCell>
                    <TableCell align="right"><strong>Base IVA</strong></TableCell>
                    <TableCell align="right"><strong>IVA</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.compras.slice(0, 10).map((compra, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(compra.fecha_emision)}</TableCell>
                      <TableCell>{compra.razon_social_proveedor}</TableCell>
                      <TableCell>{compra.identificacion_proveedor}</TableCell>
                      <TableCell align="right">{formatCurrency(compra.base_imponible_iva)}</TableCell>
                      <TableCell align="right">{formatCurrency(compra.monto_iva)}</TableCell>
                      <TableCell align="right"><strong>{formatCurrency(compra.total_compra)}</strong></TableCell>
                      <TableCell>
                        <Chip label={compra.estado} color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {data.compras.length > 10 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Mostrando 10 de {data.compras.length} compras. Todas se incluirán en el ATS.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Detalle de Ventas */}
      {totalVentas > 0 && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              💰 Detalle de Ventas ({totalVentas} transacciones)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Identificación</strong></TableCell>
                    <TableCell align="right"><strong>Base IVA</strong></TableCell>
                    <TableCell align="right"><strong>IVA</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.ventas.slice(0, 10).map((venta, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(venta.fecha_emision)}</TableCell>
                      <TableCell>{venta.razon_social_cliente}</TableCell>
                      <TableCell>{venta.identificacion_cliente}</TableCell>
                      <TableCell align="right">{formatCurrency(venta.base_imponible_iva)}</TableCell>
                      <TableCell align="right">{formatCurrency(venta.monto_iva)}</TableCell>
                      <TableCell align="right"><strong>{formatCurrency(venta.total_venta)}</strong></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {data.ventas.length > 10 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Mostrando 10 de {data.ventas.length} ventas. Todas se incluirán en el ATS.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Ventas Agrupadas (como saldrán en el XML) */}
      {totalVentasAgrupadas > 0 && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📋 Ventas Agrupadas en el XML ({totalVentasAgrupadas} nodos)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Las ventas se agrupan por <strong>cliente</strong> y <strong>tipo de comprobante</strong> según los
                requerimientos del SRI. Cada fila representa un nodo en el XML del ATS.
              </Typography>
            </Alert>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Tipo Doc</strong></TableCell>
                    <TableCell align="center"><strong># Comprob.</strong></TableCell>
                    <TableCell align="right"><strong>Base 0%</strong></TableCell>
                    <TableCell align="right"><strong>Base IVA</strong></TableCell>
                    <TableCell align="right"><strong>IVA</strong></TableCell>
                    <TableCell align="right"><strong>Ret. IVA</strong></TableCell>
                    <TableCell align="right"><strong>Ret. IR</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.ventas_agrupadas.map((venta, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {venta.identificacion_cliente}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={venta.tipo_comprobante} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <strong>{venta.numeroComprobantes}</strong>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(venta.base_imponible_0)}</TableCell>
                      <TableCell align="right">{formatCurrency(venta.base_imponible_iva)}</TableCell>
                      <TableCell align="right">{formatCurrency(venta.monto_iva)}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color={venta.valor_retencion_iva > 0 ? 'error.main' : 'text.secondary'}>
                          {formatCurrency(venta.valor_retencion_iva)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color={venta.valor_retencion_renta > 0 ? 'error.main' : 'text.secondary'}>
                          {formatCurrency(venta.valor_retencion_renta)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              {totalVentasAgrupadas} nodos de venta se generarán en el XML del ATS (agrupados de {totalVentas} transacciones individuales)
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Resumen de Totales */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          📊 Resumen de Totales
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Base Imponible IVA (Compras)
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(baseIvaCompras)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                IVA Total (Compras)
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(ivaCompras)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Total Compras
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(montoTotalCompras)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Ventas
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(montoTotalVentas)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Retenciones IVA Recibidas
              </Typography>
              <Typography variant="h6" color="error.main">
                {formatCurrency(totalRetencionesIvaRecibidas)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Retenciones IR Recibidas
              </Typography>
              <Typography variant="h6" color="error.main">
                {formatCurrency(totalRetencionesRentaRecibidas)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Nodos de Venta en XML
              </Typography>
              <Typography variant="h6" color="info.main">
                {totalVentasAgrupadas}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Transacciones de Venta
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {totalVentas}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Información sobre el archivo */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 3 }}>
        <Typography variant="body2" gutterBottom>
          El archivo ATS se generará en formato XML conforme al esquema XSD del SRI. El nombre del archivo será
          <strong> ATS{periodo.replace('/', '')}.xml</strong> y se comprimirá en formato ZIP para la descarga.
        </Typography>
        {totalVentasAgrupadas > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Nota:</strong> Las ventas se agruparán automáticamente por cliente y tipo de comprobante,
            acumulando bases imponibles, IVA y retenciones recibidas según los requerimientos del SRI.
          </Typography>
        )}
      </Alert>
    </Box>
  );
}

export default TransaccionesPreview;
