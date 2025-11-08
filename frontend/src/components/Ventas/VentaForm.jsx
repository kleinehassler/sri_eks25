import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Alert,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalculateIcon from '@mui/icons-material/Calculate';
import { formatEstablecimiento, formatPuntoEmision, formatSecuencial } from '../../utils/formatters';

const validationSchema = Yup.object({
  periodo: Yup.string()
    .required('El periodo es requerido')
    .matches(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Formato debe ser MM/YYYY'),
  tipo_comprobante: Yup.string().required('El tipo de comprobante es requerido'),
  tipo_identificacion_cliente: Yup.string().required('El tipo de identificación es requerido'),
  identificacion_cliente: Yup.string()
    .required('La identificación del cliente es requerida')
    .min(10, 'Mínimo 10 caracteres')
    .max(20, 'Máximo 20 caracteres'),
  razon_social_cliente: Yup.string()
    .required('La razón social del cliente es requerida')
    .max(300, 'Máximo 300 caracteres'),
  fecha_emision: Yup.date().required('La fecha de emisión es requerida'),
  establecimiento: Yup.string()
    .required('El establecimiento es requerido')
    .matches(/^[0-9]{3}$/, 'Debe tener 3 dígitos'),
  punto_emision: Yup.string()
    .required('El punto de emisión es requerido')
    .matches(/^[0-9]{3}$/, 'Debe tener 3 dígitos'),
  secuencial: Yup.string()
    .required('El secuencial es requerido')
    .matches(/^[0-9]{1,9}$/, 'Debe ser numérico de hasta 9 dígitos'),
  numero_autorizacion: Yup.string()
    .required('El número de autorización es requerido')
    .min(10, 'Mínimo 10 caracteres')
    .max(49, 'Máximo 49 caracteres'),
  base_imponible_0: Yup.number().min(0, 'No puede ser negativo'),
  base_imponible_iva: Yup.number().min(0, 'No puede ser negativo'),
  base_imponible_no_objeto_iva: Yup.number().min(0, 'No puede ser negativo'),
  base_imponible_exento_iva: Yup.number().min(0, 'No puede ser negativo'),
  monto_iva: Yup.number().min(0, 'No puede ser negativo'),
  monto_ice: Yup.number().min(0, 'No puede ser negativo'),
  valor_retencion_iva: Yup.number().min(0, 'No puede ser negativo'),
  valor_retencion_renta: Yup.number().min(0, 'No puede ser negativo'),
  total_venta: Yup.number().required('El total es requerido').min(0, 'Debe ser mayor o igual a 0')
});

function VentaForm({ open, onClose, onSubmit, initialValues, mode = 'create' }) {
  const formik = useFormik({
    initialValues: initialValues || {
      periodo: '',
      tipo_comprobante: '01',
      tipo_identificacion_cliente: '01',
      identificacion_cliente: '',
      razon_social_cliente: '',
      fecha_emision: '',
      establecimiento: '001',
      punto_emision: '001',
      secuencial: '',
      numero_autorizacion: '',
      base_imponible_0: 0,
      base_imponible_iva: 0,
      base_imponible_no_objeto_iva: 0,
      base_imponible_exento_iva: 0,
      monto_iva: 0,
      monto_ice: 0,
      valor_retencion_iva: 0,
      valor_retencion_renta: 0,
      total_venta: 0,
      forma_pago: '01',
      observaciones: ''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    }
  });

  // Auto-calcular total cuando cambian las bases
  useEffect(() => {
    const base_0 = parseFloat(formik.values.base_imponible_0) || 0;
    const base_iva = parseFloat(formik.values.base_imponible_iva) || 0;
    const base_no_objeto = parseFloat(formik.values.base_imponible_no_objeto_iva) || 0;
    const base_exento = parseFloat(formik.values.base_imponible_exento_iva) || 0;
    const iva = parseFloat(formik.values.monto_iva) || 0;
    const ice = parseFloat(formik.values.monto_ice) || 0;

    const total = base_0 + base_iva + base_no_objeto + base_exento + iva + ice;
    formik.setFieldValue('total_venta', total.toFixed(2));
  }, [
    formik.values.base_imponible_0,
    formik.values.base_imponible_iva,
    formik.values.base_imponible_no_objeto_iva,
    formik.values.base_imponible_exento_iva,
    formik.values.monto_iva,
    formik.values.monto_ice
  ]);

  // Calcular IVA automáticamente
  const calcularIVA = () => {
    const baseIva = parseFloat(formik.values.base_imponible_iva) || 0;
    const iva = (baseIva * 0.15).toFixed(2); // 15% IVA
    formik.setFieldValue('monto_iva', iva);
  };

  /**
   * Manejar formato de establecimiento con padding de ceros
   */
  const handleEstablecimientoBlur = (e) => {
    formik.handleBlur(e);
    const formatted = formatEstablecimiento(e.target.value);
    if (formatted) {
      formik.setFieldValue('establecimiento', formatted);
    }
  };

  /**
   * Manejar formato de punto de emisión con padding de ceros
   */
  const handlePuntoEmisionBlur = (e) => {
    formik.handleBlur(e);
    const formatted = formatPuntoEmision(e.target.value);
    if (formatted) {
      formik.setFieldValue('punto_emision', formatted);
    }
  };

  /**
   * Manejar formato de secuencial con padding de ceros
   */
  const handleSecuencialBlur = (e) => {
    formik.handleBlur(e);
    const formatted = formatSecuencial(e.target.value);
    if (formatted) {
      formik.setFieldValue('secuencial', formatted);
    }
  };

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {mode === 'create' ? 'Nueva Venta' : 'Editar Venta'}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {/* Información del Cliente */}
          <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
            📋 Información del Cliente
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo ID</InputLabel>
                <Select
                  name="tipo_identificacion_cliente"
                  label="Tipo ID"
                  value={formik.values.tipo_identificacion_cliente}
                  onChange={formik.handleChange}
                  error={formik.touched.tipo_identificacion_cliente && Boolean(formik.errors.tipo_identificacion_cliente)}
                >
                  <MenuItem value="01">01 - RUC</MenuItem>
                  <MenuItem value="02">02 - Cédula</MenuItem>
                  <MenuItem value="03">03 - Pasaporte</MenuItem>
                  <MenuItem value="07">07 - Consumidor Final</MenuItem>
                  <MenuItem value="08">08 - Identificación del Exterior</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                name="identificacion_cliente"
                label="RUC/Cédula/Pasaporte"
                value={formik.values.identificacion_cliente}
                onChange={formik.handleChange}
                error={formik.touched.identificacion_cliente && Boolean(formik.errors.identificacion_cliente)}
                helperText={formik.touched.identificacion_cliente && formik.errors.identificacion_cliente}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                size="small"
                name="razon_social_cliente"
                label="Razón Social / Nombre"
                value={formik.values.razon_social_cliente}
                onChange={formik.handleChange}
                error={formik.touched.razon_social_cliente && Boolean(formik.errors.razon_social_cliente)}
                helperText={formik.touched.razon_social_cliente && formik.errors.razon_social_cliente}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Información del Comprobante */}
          <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
            📄 Información del Comprobante
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                name="periodo"
                label="Periodo (MM/YYYY)"
                placeholder="01/2024"
                value={formik.values.periodo}
                onChange={formik.handleChange}
                error={formik.touched.periodo && Boolean(formik.errors.periodo)}
                helperText={formik.touched.periodo && formik.errors.periodo}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                name="fecha_emision"
                label="Fecha Emisión"
                InputLabelProps={{ shrink: true }}
                value={formik.values.fecha_emision}
                onChange={formik.handleChange}
                error={formik.touched.fecha_emision && Boolean(formik.errors.fecha_emision)}
                helperText={formik.touched.fecha_emision && formik.errors.fecha_emision}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo Comprobante</InputLabel>
                <Select
                  name="tipo_comprobante"
                  label="Tipo Comprobante"
                  value={formik.values.tipo_comprobante}
                  onChange={formik.handleChange}
                  error={formik.touched.tipo_comprobante && Boolean(formik.errors.tipo_comprobante)}
                >
                  <MenuItem value="01">Factura</MenuItem>
                  <MenuItem value="04">Nota de Crédito</MenuItem>
                  <MenuItem value="05">Nota de Débito</MenuItem>
                  <MenuItem value="06">Guía de Remisión</MenuItem>
                  <MenuItem value="07">Comprobante de Retención</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Forma de Pago</InputLabel>
                <Select
                  name="forma_pago"
                  label="Forma de Pago"
                  value={formik.values.forma_pago}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="01">Sin utilización del sistema financiero</MenuItem>
                  <MenuItem value="16">Tarjeta de débito</MenuItem>
                  <MenuItem value="17">Dinero electrónico</MenuItem>
                  <MenuItem value="18">Tarjeta prepago</MenuItem>
                  <MenuItem value="19">Tarjeta de crédito</MenuItem>
                  <MenuItem value="20">Otros con utilización del sistema financiero</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                name="establecimiento"
                label="Establecimiento"
                placeholder="001"
                value={formik.values.establecimiento}
                onChange={formik.handleChange}
                onBlur={handleEstablecimientoBlur}
                error={formik.touched.establecimiento && Boolean(formik.errors.establecimiento)}
                helperText={formik.touched.establecimiento && formik.errors.establecimiento}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                name="punto_emision"
                label="Punto Emisión"
                placeholder="001"
                value={formik.values.punto_emision}
                onChange={formik.handleChange}
                onBlur={handlePuntoEmisionBlur}
                error={formik.touched.punto_emision && Boolean(formik.errors.punto_emision)}
                helperText={formik.touched.punto_emision && formik.errors.punto_emision}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                name="secuencial"
                label="Secuencial"
                placeholder="000000001"
                value={formik.values.secuencial}
                onChange={formik.handleChange}
                onBlur={handleSecuencialBlur}
                error={formik.touched.secuencial && Boolean(formik.errors.secuencial)}
                helperText={formik.touched.secuencial && formik.errors.secuencial}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Número Completo
              </Typography>
              <Typography variant="body1" fontFamily="monospace" fontWeight="bold">
                {formik.values.establecimiento || '___'}-
                {formik.values.punto_emision || '___'}-
                {formik.values.secuencial || '_________'}
              </Typography>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                name="numero_autorizacion"
                label="Número de Autorización"
                value={formik.values.numero_autorizacion}
                onChange={formik.handleChange}
                error={formik.touched.numero_autorizacion && Boolean(formik.errors.numero_autorizacion)}
                helperText={formik.touched.numero_autorizacion && formik.errors.numero_autorizacion}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Valores */}
          <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
            💰 Valores
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="base_imponible_0"
                label="Base Imponible 0%"
                inputProps={{ step: '0.01', min: '0' }}
                value={formik.values.base_imponible_0}
                onChange={formik.handleChange}
                error={formik.touched.base_imponible_0 && Boolean(formik.errors.base_imponible_0)}
                helperText={formik.touched.base_imponible_0 && formik.errors.base_imponible_0}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="base_imponible_iva"
                label="Base Imponible IVA 15%"
                inputProps={{ step: '0.01', min: '0' }}
                value={formik.values.base_imponible_iva}
                onChange={formik.handleChange}
                error={formik.touched.base_imponible_iva && Boolean(formik.errors.base_imponible_iva)}
                helperText={formik.touched.base_imponible_iva && formik.errors.base_imponible_iva}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="base_imponible_no_objeto_iva"
                label="Base No Objeto IVA"
                inputProps={{ step: '0.01', min: '0' }}
                value={formik.values.base_imponible_no_objeto_iva}
                onChange={formik.handleChange}
                error={formik.touched.base_imponible_no_objeto_iva && Boolean(formik.errors.base_imponible_no_objeto_iva)}
                helperText={formik.touched.base_imponible_no_objeto_iva && formik.errors.base_imponible_no_objeto_iva}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="base_imponible_exento_iva"
                label="Base Exento IVA"
                inputProps={{ step: '0.01', min: '0' }}
                value={formik.values.base_imponible_exento_iva}
                onChange={formik.handleChange}
                error={formik.touched.base_imponible_exento_iva && Boolean(formik.errors.base_imponible_exento_iva)}
                helperText={formik.touched.base_imponible_exento_iva && formik.errors.base_imponible_exento_iva}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  name="monto_iva"
                  label="Monto IVA"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={formik.values.monto_iva}
                  onChange={formik.handleChange}
                  error={formik.touched.monto_iva && Boolean(formik.errors.monto_iva)}
                  helperText={formik.touched.monto_iva && formik.errors.monto_iva}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={calcularIVA}
                  startIcon={<CalculateIcon />}
                  sx={{ minWidth: 120, height: 40 }}
                >
                  Calcular
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="monto_ice"
                label="Monto ICE"
                inputProps={{ step: '0.01', min: '0' }}
                value={formik.values.monto_ice}
                onChange={formik.handleChange}
                error={formik.touched.monto_ice && Boolean(formik.errors.monto_ice)}
                helperText={formik.touched.monto_ice && formik.errors.monto_ice}
              />
            </Grid>
          </Grid>

          {/* Total */}
          <Alert severity="info" icon={false} sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Total Venta
                </Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  ${parseFloat(formik.values.total_venta || 0).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Cálculo automático
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Base 0% + Base IVA + Base No Objeto + Base Exento + IVA + ICE
                </Typography>
              </Grid>
            </Grid>
          </Alert>

          {/* Retenciones Recibidas */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
            💰 Retenciones Recibidas
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Registra los valores que el cliente retuvo en esta venta
          </Alert>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="valor_retencion_iva"
                label="Valor Retención IVA"
                inputProps={{ step: '0.01', min: '0' }}
                value={formik.values.valor_retencion_iva}
                onChange={formik.handleChange}
                error={formik.touched.valor_retencion_iva && Boolean(formik.errors.valor_retencion_iva)}
                helperText={formik.touched.valor_retencion_iva && formik.errors.valor_retencion_iva}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="valor_retencion_renta"
                label="Valor Retención Renta"
                inputProps={{ step: '0.01', min: '0' }}
                value={formik.values.valor_retencion_renta}
                onChange={formik.handleChange}
                error={formik.touched.valor_retencion_renta && Boolean(formik.errors.valor_retencion_renta)}
                helperText={formik.touched.valor_retencion_renta && formik.errors.valor_retencion_renta}
              />
            </Grid>
          </Grid>

          {/* Observaciones */}
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            name="observaciones"
            label="Observaciones (opcional)"
            value={formik.values.observaciones}
            onChange={formik.handleChange}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {mode === 'create' ? 'Crear Venta' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default VentaForm;
