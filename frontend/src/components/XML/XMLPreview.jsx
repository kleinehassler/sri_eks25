import {
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

function XMLPreview({ data, tipoDocumento = 'factura' }) {
  if (!data) {
    return (
      <Alert severity="info" icon={<InfoIcon />}>
        Sube un archivo XML para ver la previsualización de los datos extraídos
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

  // Renderizar preview de factura
  const renderFacturaPreview = () => (
    <Box>
      {/* Alerta de éxito */}
      <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
        Archivo XML procesado correctamente. Revisa los datos extraídos antes de confirmar la importación.
      </Alert>

      {/* Información del Proveedor */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📋 Información del Proveedor
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                RUC del Proveedor
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {data.identificacion_proveedor || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Razón Social
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {data.razon_social_proveedor || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Dirección
              </Typography>
              <Typography variant="body2">
                {data.direccion_proveedor || 'No especificada'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Establecimiento
              </Typography>
              <Typography variant="body2">
                {data.establecimiento || '-'}
              </Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Datos del Comprobante */}
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📄 Datos del Comprobante
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Tipo de Comprobante
              </Typography>
              <Typography variant="body1">
                <Chip
                  label={data.tipo_comprobante || 'Factura'}
                  color="primary"
                  size="small"
                />
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Número de Autorización
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {data.numero_autorizacion || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Fecha de Emisión
              </Typography>
              <Typography variant="body2">
                {formatDate(data.fecha_emision)}
              </Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Valores e Impuestos */}
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            💰 Valores e Impuestos
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Concepto</strong></TableCell>
                  <TableCell align="right"><strong>Valor</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Base Imponible IVA</TableCell>
                  <TableCell align="right">
                    {formatCurrency(data.base_imponible_iva)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Base Imponible 0%</TableCell>
                  <TableCell align="right">
                    {formatCurrency(data.base_imponible_cero)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Base No Objeto de IVA</TableCell>
                  <TableCell align="right">
                    {formatCurrency(data.base_no_objeto_iva)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Monto IVA</TableCell>
                  <TableCell align="right">
                    <Typography color="primary" fontWeight="medium">
                      {formatCurrency(data.monto_iva)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Monto ICE</TableCell>
                  <TableCell align="right">
                    {formatCurrency(data.monto_ice)}
                  </TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'success.lighter' }}>
                  <TableCell>
                    <strong>Total de la Compra</strong>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {formatCurrency(data.total_compra)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Información Adicional */}
      {data.informacion_adicional && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              ℹ️ Información Adicional
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {data.informacion_adicional}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );

  // Renderizar preview de retención
  const renderRetencionPreview = () => (
    <Box>
      {/* Alerta de éxito */}
      <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
        Comprobante de Retención procesado correctamente. Revisa los datos antes de confirmar.
      </Alert>

      {/* Información Básica */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          📋 Información del Comprobante
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              RUC del Proveedor
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.identificacion_proveedor || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Número de Autorización
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.numero_autorizacion || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Fecha de Emisión
            </Typography>
            <Typography variant="body2">
              {formatDate(data.fecha_emision)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Base Imponible
            </Typography>
            <Typography variant="body1" fontWeight="medium" color="primary">
              {formatCurrency(data.base_imponible)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Detalle de Retenciones */}
      {data.retenciones && data.retenciones.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            💰 Detalle de Retenciones
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Código</strong></TableCell>
                  <TableCell><strong>Tipo</strong></TableCell>
                  <TableCell align="right"><strong>Base</strong></TableCell>
                  <TableCell align="right"><strong>%</strong></TableCell>
                  <TableCell align="right"><strong>Valor</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.retenciones.map((ret, index) => (
                  <TableRow key={index}>
                    <TableCell>{ret.codigo || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={ret.tipo || 'IVA'}
                        size="small"
                        color={ret.tipo === 'IVA' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(ret.base)}</TableCell>
                    <TableCell align="right">{ret.porcentaje}%</TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(ret.valor)}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );

  // Advertencias
  const renderWarnings = () => {
    const warnings = [];

    // Validar datos faltantes o inconsistentes
    if (!data.identificacion_proveedor) {
      warnings.push('No se pudo extraer el RUC del proveedor');
    }
    if (!data.razon_social_proveedor) {
      warnings.push('No se pudo extraer la razón social del proveedor');
    }
    if (!data.numero_autorizacion) {
      warnings.push('No se encontró número de autorización');
    }
    if (data.total_compra <= 0) {
      warnings.push('El total de la compra es 0 o negativo');
    }

    if (warnings.length === 0) return null;

    return (
      <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight="medium" gutterBottom>
          Se detectaron las siguientes advertencias:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {warnings.map((warning, index) => (
            <li key={index}>
              <Typography variant="body2">{warning}</Typography>
            </li>
          ))}
        </ul>
      </Alert>
    );
  };

  return (
    <Box>
      {renderWarnings()}
      {tipoDocumento === 'factura' ? renderFacturaPreview() : renderRetencionPreview()}
    </Box>
  );
}

export default XMLPreview;
