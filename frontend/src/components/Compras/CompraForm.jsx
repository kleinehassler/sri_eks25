import { useState, useEffect } from 'react';
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
  Alert,
  Box,
  Typography,
  CircularProgress,
  InputAdornment,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import xmlImportService from '../../services/xmlImportService';
import RetencionesForm from './RetencionesForm';
import { formatEstablecimiento, formatPuntoEmision, formatSecuencial } from '../../utils/formatters';

// Tipos de comprobante
const tiposComprobante = [
  { value: '01', label: '01 - Factura' },
  { value: '04', label: '04 - Nota de Crédito' },
  { value: '05', label: '05 - Nota de Débito' },
  { value: '03', label: '03 - Liquidación de Compra' },
  { value: '06', label: '06 - Guía de Remisión' },
];

// Códigos de sustento tributario
const codigosSustento = [
  { value: '01', label: '01 - Crédito Tributario para declaración de IVA' },
  { value: '02', label: '02 - Costo o Gasto para declaración de IR' },
  { value: '03', label: '03 - Activo Fijo' },
  { value: '04', label: '04 - Liquidación Gastos de Viaje' },
  { value: '05', label: '05 - Deducción por Terceros' },
  { value: '06', label: '06 - Crédito Tributario sin derecho a devolución' },
];

// Tipos de proveedor
const tiposProveedor = [
  { value: '01', label: '01 - Persona Natural' },
  { value: '02', label: '02 - Sociedad' },
  { value: '03', label: '03 - Extranjero' },
];

// Tipos de identificación
const tiposIdentificacion = [
  { value: '01', label: '01 - RUC' },
  { value: '02', label: '02 - Cédula' },
  { value: '03', label: '03 - Pasaporte' },
  { value: '07', label: '07 - Consumidor Final' },
  { value: '08', label: '08 - Identificación del Exterior' },
];

// Formas de pago (según catálogo SRI)
const formasPago = [
  { value: '01', label: '01 - Sin utilización del sistema financiero' },
  { value: '15', label: '15 - Compensación de deudas' },
  { value: '16', label: '16 - Tarjeta de débito' },
  { value: '17', label: '17 - Dinero electrónico' },
  { value: '18', label: '18 - Tarjeta prepago' },
  { value: '19', label: '19 - Tarjeta de crédito' },
  { value: '20', label: '20 - Otros con utilización del sistema financiero' },
  { value: '21', label: '21 - Endoso de títulos' },
];

// Esquema de validación con Yup
const validationSchema = Yup.object({
  tipo_proveedor: Yup.string()
    .required('El tipo de proveedor es requerido'),
  tipo_identificacion: Yup.string()
    .required('El tipo de identificación es requerido'),
  identificacion_proveedor: Yup.string()
    .required('El RUC del proveedor es requerido')
    .matches(/^\d{10,13}$/, 'El RUC debe tener entre 10 y 13 dígitos'),
  razon_social_proveedor: Yup.string()
    .required('La razón social del proveedor es requerida')
    .max(300, 'La razón social no puede exceder 300 caracteres'),
  tipo_comprobante: Yup.string()
    .required('El tipo de comprobante es requerido'),
  establecimiento: Yup.string()
    .required('El establecimiento es requerido')
    .matches(/^\d{3}$/, 'El establecimiento debe tener 3 dígitos'),
  punto_emision: Yup.string()
    .required('El punto de emisión es requerido')
    .matches(/^\d{3}$/, 'El punto de emisión debe tener 3 dígitos'),
  secuencial: Yup.string()
    .required('El secuencial es requerido')
    .matches(/^\d{1,9}$/, 'El secuencial debe tener entre 1 y 9 dígitos'),
  numero_autorizacion: Yup.string()
    .required('El número de autorización es requerido')
    .matches(/^\d{10,49}$/, 'El número de autorización debe tener entre 10 y 49 dígitos'),
  fecha_emision: Yup.date()
    .required('La fecha de emisión es requerida')
    .max(new Date(), 'La fecha no puede ser futura'),
  fecha_registro: Yup.date()
    .required('La fecha de registro es requerida')
    .max(new Date(), 'La fecha no puede ser futura'),
  periodo: Yup.string()
    .required('El periodo es requerido')
    .matches(/^\d{2}\/\d{4}$/, 'El periodo debe tener el formato MM/YYYY'),
  codigo_sustento: Yup.string()
    .required('El código de sustento es requerido'),
  base_imponible_iva: Yup.number()
    .min(0, 'La base imponible debe ser mayor o igual a 0')
    .required('La base imponible es requerida'),
  base_imponible_0: Yup.number()
    .min(0, 'La base imponible 0% debe ser mayor o igual a 0'),
  base_imponible_no_objeto_iva: Yup.number()
    .min(0, 'La base no objeto de IVA debe ser mayor o igual a 0'),
  base_imponible_exento_iva: Yup.number()
    .min(0, 'La base exento de IVA debe ser mayor o igual a 0'),
  monto_iva: Yup.number()
    .min(0, 'El monto de IVA debe ser mayor o igual a 0')
    .required('El monto de IVA es requerido'),
  monto_ice: Yup.number()
    .min(0, 'El monto de ICE debe ser mayor o igual a 0'),
  total_compra: Yup.number()
    .min(0, 'El total de la compra debe ser mayor a 0')
    .required('El total de la compra es requerido'),
});

function CompraForm({ open, onClose, compra, onSubmit, loading, empresaId }) {
  const [submitError, setSubmitError] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const [importando, setImportando] = useState(false);
  const [xmlImportado, setXmlImportado] = useState(false);
  const [retenciones, setRetenciones] = useState(compra?.retenciones || []);
  const isEditing = Boolean(compra);

  const formik = useFormik({
    initialValues: {
      empresa_id: empresaId || compra?.empresa_id || '',
      tipo_proveedor: compra?.tipo_proveedor || '02',
      tipo_identificacion: compra?.tipo_identificacion || '01',
      identificacion_proveedor: compra?.identificacion_proveedor || '',
      razon_social_proveedor: compra?.razon_social_proveedor || '',
      tipo_comprobante: compra?.tipo_comprobante || '01',
      establecimiento: compra?.establecimiento || '',
      punto_emision: compra?.punto_emision || '',
      secuencial: compra?.secuencial || '',
      numero_autorizacion: compra?.numero_autorizacion || '',
      fecha_emision: compra?.fecha_emision ? compra.fecha_emision.split('T')[0] : '',
      fecha_registro: compra?.fecha_registro ? compra.fecha_registro.split('T')[0] : '',
      periodo: compra?.periodo || '',
      codigo_sustento: compra?.codigo_sustento || '01',
      base_imponible_iva: compra?.base_imponible_iva || 0,
      base_imponible_0: compra?.base_imponible_0 || 0,
      base_imponible_no_objeto_iva: compra?.base_imponible_no_objeto_iva || 0,
      base_imponible_exento_iva: compra?.base_imponible_exento_iva || 0,
      monto_iva: compra?.monto_iva || 0,
      monto_ice: compra?.monto_ice || 0,
      total_compra: compra?.total_compra || 0,
      forma_pago: compra?.forma_pago || '',
      pais_pago: compra?.pais_pago || '593',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        // Incluir retenciones en el envío
        const datosCompra = {
          ...values,
          retenciones: retenciones
        };
        await onSubmit(datosCompra);
        formik.resetForm();
        setRetenciones([]);
      } catch (error) {
        const errorMessage = error.message || 'Error al guardar la compra';
        setSubmitError(errorMessage);
        console.error('Error en formulario de compra:', error);
        // No re-lanzar el error aquí para evitar que formik lo maneje
        // El error ya se muestra en el Alert dentro del formulario
      }
    },
  });

  // Actualizar retenciones cuando se carga una compra para editar
  useEffect(() => {
    if (compra?.retenciones) {
      setRetenciones(compra.retenciones);
    }
  }, [compra]);

  // Calcular total automáticamente
  useEffect(() => {
    const base_iva = parseFloat(formik.values.base_imponible_iva) || 0;
    const base_0 = parseFloat(formik.values.base_imponible_0) || 0;
    const base_no_objeto = parseFloat(formik.values.base_imponible_no_objeto_iva) || 0;
    const base_exento = parseFloat(formik.values.base_imponible_exento_iva) || 0;
    const iva = parseFloat(formik.values.monto_iva) || 0;
    const ice = parseFloat(formik.values.monto_ice) || 0;

    const total = base_iva + base_0 + base_no_objeto + base_exento + iva + ice;
    formik.setFieldValue('total_compra', total.toFixed(2));
  }, [
    formik.values.base_imponible_iva,
    formik.values.base_imponible_0,
    formik.values.base_imponible_no_objeto_iva,
    formik.values.base_imponible_exento_iva,
    formik.values.monto_iva,
    formik.values.monto_ice
  ]);

  // Calcular IVA automáticamente (15%)
  const calcularIVA = () => {
    const base = parseFloat(formik.values.base_imponible_iva) || 0;
    const iva = (base * 0.15).toFixed(2);
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
    setSubmitError(null);
    setXmlFile(null);
    setXmlImportado(false);
    setRetenciones([]);
    onClose();
  };

  /**
   * Manejar selección de archivo XML
   */
  const handleXmlFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setXmlFile(file);
      setXmlImportado(false);
    }
  };

  /**
   * Importar datos desde XML
   */
  const handleImportarXML = async () => {
    if (!xmlFile) {
      setSubmitError('Por favor seleccione un archivo XML');
      return;
    }

    // Validar archivo
    const validacion = xmlImportService.validarArchivo(xmlFile);
    if (!validacion.valido) {
      setSubmitError(validacion.errores.join(', '));
      return;
    }

    setImportando(true);
    setSubmitError(null);

    try {
      // Importar XML
      const resultado = await xmlImportService.importarXML(xmlFile, true);

      console.log('Datos importados:', resultado.data);

      // Llenar formulario con datos extraídos
      const datosImportados = resultado.data;

      // Actualizar cada campo del formulario
      Object.keys(datosImportados).forEach(key => {
        if (key !== '_xmlInfo' && formik.values.hasOwnProperty(key)) {
          formik.setFieldValue(key, datosImportados[key]);
        }
      });

      setXmlImportado(true);
      setSubmitError(null);

      // Mostrar advertencias si existen
      if (resultado.validacion?.advertencias?.length > 0) {
        console.warn('Advertencias:', resultado.validacion.advertencias);
      }
    } catch (error) {
      console.error('Error al importar XML:', error);
      setSubmitError(error.mensaje || 'Error al importar el archivo XML');
      setXmlImportado(false);
    } finally {
      setImportando(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          {isEditing ? 'Editar Compra' : 'Nueva Compra'}
        </Typography>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {/* SECCIÓN: IMPORTAR XML */}
          {!isEditing && (
            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.default', border: '1px dashed', borderColor: 'primary.main' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <UploadFileIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Importar desde XML de Factura Electrónica
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Sube un archivo XML de factura electrónica del SRI para auto-completar los datos del formulario
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={8}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadFileIcon />}
                    disabled={importando}
                  >
                    {xmlFile ? xmlFile.name : 'Seleccionar archivo XML'}
                    <input
                      type="file"
                      hidden
                      accept=".xml"
                      onChange={handleXmlFileChange}
                    />
                  </Button>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleImportarXML}
                    disabled={!xmlFile || importando}
                    startIcon={importando ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                  >
                    {importando ? 'Importando...' : 'Importar'}
                  </Button>
                </Grid>

                {xmlImportado && (
                  <Grid item xs={12}>
                    <Alert severity="success" icon={<CheckCircleIcon />}>
                      Datos importados exitosamente desde el XML. Verifica los campos y completa cualquier información faltante.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}

          {xmlImportado && <Divider sx={{ mb: 3 }}><Chip label="Datos Importados" color="success" size="small" /></Divider>}

          <Grid container spacing={2}>
            {/* SECCIÓN: DATOS DEL PROVEEDOR */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Datos del Proveedor
              </Typography>
            </Grid>

            {/* Tipo de Proveedor */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={formik.touched.tipo_proveedor && Boolean(formik.errors.tipo_proveedor)}>
                <InputLabel>Tipo de Proveedor *</InputLabel>
                <Select
                  id="tipo_proveedor"
                  name="tipo_proveedor"
                  value={formik.values.tipo_proveedor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Tipo de Proveedor *"
                >
                  {tiposProveedor.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tipo de Identificación */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={formik.touched.tipo_identificacion && Boolean(formik.errors.tipo_identificacion)}>
                <InputLabel>Tipo de Identificación *</InputLabel>
                <Select
                  id="tipo_identificacion"
                  name="tipo_identificacion"
                  value={formik.values.tipo_identificacion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Tipo de Identificación *"
                >
                  {tiposIdentificacion.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* RUC Proveedor */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="identificacion_proveedor"
                name="identificacion_proveedor"
                label="Identificación del Proveedor *"
                value={formik.values.identificacion_proveedor}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.identificacion_proveedor && Boolean(formik.errors.identificacion_proveedor)}
                helperText={formik.touched.identificacion_proveedor && formik.errors.identificacion_proveedor}
              />
            </Grid>

            {/* Razón Social Proveedor */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="razon_social_proveedor"
                name="razon_social_proveedor"
                label="Razón Social del Proveedor *"
                value={formik.values.razon_social_proveedor}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.razon_social_proveedor && Boolean(formik.errors.razon_social_proveedor)}
                helperText={formik.touched.razon_social_proveedor && formik.errors.razon_social_proveedor}
              />
            </Grid>

            {/* SECCIÓN: DATOS DEL COMPROBANTE */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Datos del Comprobante
              </Typography>
            </Grid>

            {/* Tipo de Comprobante */}
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth error={formik.touched.tipo_comprobante && Boolean(formik.errors.tipo_comprobante)}>
                <InputLabel>Tipo de Comprobante *</InputLabel>
                <Select
                  id="tipo_comprobante"
                  name="tipo_comprobante"
                  value={formik.values.tipo_comprobante}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Tipo de Comprobante *"
                >
                  {tiposComprobante.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Establecimiento */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                id="establecimiento"
                name="establecimiento"
                label="Establecimiento *"
                placeholder="001"
                value={formik.values.establecimiento}
                onChange={formik.handleChange}
                onBlur={handleEstablecimientoBlur}
                error={formik.touched.establecimiento && Boolean(formik.errors.establecimiento)}
                helperText={formik.touched.establecimiento && formik.errors.establecimiento}
                inputProps={{ maxLength: 3 }}
              />
            </Grid>

            {/* Punto de Emisión */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                id="punto_emision"
                name="punto_emision"
                label="Punto de Emisión *"
                placeholder="001"
                value={formik.values.punto_emision}
                onChange={formik.handleChange}
                onBlur={handlePuntoEmisionBlur}
                error={formik.touched.punto_emision && Boolean(formik.errors.punto_emision)}
                helperText={formik.touched.punto_emision && formik.errors.punto_emision}
                inputProps={{ maxLength: 3 }}
              />
            </Grid>

            {/* Secuencial */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                id="secuencial"
                name="secuencial"
                label="Secuencial *"
                placeholder="000000001"
                value={formik.values.secuencial}
                onChange={formik.handleChange}
                onBlur={handleSecuencialBlur}
                error={formik.touched.secuencial && Boolean(formik.errors.secuencial)}
                helperText={formik.touched.secuencial && formik.errors.secuencial}
                inputProps={{ maxLength: 9 }}
              />
            </Grid>

            {/* Número de Autorización */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="numero_autorizacion"
                name="numero_autorizacion"
                label="Número de Autorización *"
                value={formik.values.numero_autorizacion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.numero_autorizacion && Boolean(formik.errors.numero_autorizacion)}
                helperText={formik.touched.numero_autorizacion && formik.errors.numero_autorizacion}
              />
            </Grid>

            {/* Fecha de Emisión */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="date"
                id="fecha_emision"
                name="fecha_emision"
                label="Fecha de Emisión *"
                value={formik.values.fecha_emision}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fecha_emision && Boolean(formik.errors.fecha_emision)}
                helperText={formik.touched.fecha_emision && formik.errors.fecha_emision}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Fecha de Registro */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="date"
                id="fecha_registro"
                name="fecha_registro"
                label="Fecha de Registro *"
                value={formik.values.fecha_registro}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fecha_registro && Boolean(formik.errors.fecha_registro)}
                helperText={formik.touched.fecha_registro && formik.errors.fecha_registro}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Periodo */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                id="periodo"
                name="periodo"
                label="Periodo *"
                placeholder="MM/YYYY"
                value={formik.values.periodo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.periodo && Boolean(formik.errors.periodo)}
                helperText={formik.touched.periodo && formik.errors.periodo || 'Formato: 01/2024'}
              />
            </Grid>

            {/* Código de Sustento */}
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth error={formik.touched.codigo_sustento && Boolean(formik.errors.codigo_sustento)}>
                <InputLabel>Código de Sustento *</InputLabel>
                <Select
                  id="codigo_sustento"
                  name="codigo_sustento"
                  value={formik.values.codigo_sustento}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Código de Sustento *"
                >
                  {codigosSustento.map((codigo) => (
                    <MenuItem key={codigo.value} value={codigo.value}>
                      {codigo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* SECCIÓN: VALORES */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Valores
              </Typography>
            </Grid>

            {/* Base Imponible IVA */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                id="base_imponible_iva"
                name="base_imponible_iva"
                label="Base Imponible IVA *"
                value={formik.values.base_imponible_iva}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.base_imponible_iva && Boolean(formik.errors.base_imponible_iva)}
                helperText={formik.touched.base_imponible_iva && formik.errors.base_imponible_iva}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            {/* Monto IVA */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                id="monto_iva"
                name="monto_iva"
                label="Monto IVA (15%) *"
                value={formik.values.monto_iva}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.monto_iva && Boolean(formik.errors.monto_iva)}
                helperText={formik.touched.monto_iva && formik.errors.monto_iva}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button size="small" onClick={calcularIVA}>
                        Calcular
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Base Imponible 0% */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                id="base_imponible_0"
                name="base_imponible_0"
                label="Base Imponible 0%"
                value={formik.values.base_imponible_0}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.base_imponible_0 && Boolean(formik.errors.base_imponible_0)}
                helperText={formik.touched.base_imponible_0 && formik.errors.base_imponible_0}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            {/* Base No Objeto IVA */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                id="base_imponible_no_objeto_iva"
                name="base_imponible_no_objeto_iva"
                label="Base No Objeto de IVA"
                value={formik.values.base_imponible_no_objeto_iva}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.base_imponible_no_objeto_iva && Boolean(formik.errors.base_imponible_no_objeto_iva)}
                helperText={formik.touched.base_imponible_no_objeto_iva && formik.errors.base_imponible_no_objeto_iva}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            {/* Base Exento IVA */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                id="base_imponible_exento_iva"
                name="base_imponible_exento_iva"
                label="Base Exento de IVA"
                value={formik.values.base_imponible_exento_iva}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.base_imponible_exento_iva && Boolean(formik.errors.base_imponible_exento_iva)}
                helperText={formik.touched.base_imponible_exento_iva && formik.errors.base_imponible_exento_iva}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            {/* Monto ICE */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                id="monto_ice"
                name="monto_ice"
                label="Monto ICE"
                value={formik.values.monto_ice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.monto_ice && Boolean(formik.errors.monto_ice)}
                helperText={formik.touched.monto_ice && formik.errors.monto_ice}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            {/* Total Compra (calculado automáticamente) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                id="total_compra"
                name="total_compra"
                label="Total Compra *"
                value={formik.values.total_compra}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  readOnly: true,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    color: 'success.main'
                  }
                }}
              />
            </Grid>

            {/* Divider para Información de Pago */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Información de Pago" size="small" />
              </Divider>
            </Grid>

            {/* Forma de Pago */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Forma de Pago</InputLabel>
                <Select
                  id="forma_pago"
                  name="forma_pago"
                  value={formik.values.forma_pago}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Forma de Pago"
                  error={formik.touched.forma_pago && Boolean(formik.errors.forma_pago)}
                >
                  <MenuItem value=""><em>Ninguno</em></MenuItem>
                  {formasPago.map((fp) => (
                    <MenuItem key={fp.value} value={fp.value}>
                      {fp.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* País de Pago */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="pais_pago"
                name="pais_pago"
                label="País de Pago"
                value={formik.values.pais_pago}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.pais_pago && Boolean(formik.errors.pais_pago)}
                helperText={formik.touched.pais_pago && formik.errors.pais_pago || 'Código ISO del país (ej: 593 para Ecuador)'}
                inputProps={{ maxLength: 3 }}
              />
            </Grid>

            {/* SECCIÓN: RETENCIONES */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <RetencionesForm
                retenciones={retenciones}
                onChange={setRetenciones}
                disabled={loading}
                fechaEmisionCompra={formik.values.fecha_emision}
                baseImponibleTotal={
                  parseFloat(formik.values.base_imponible_iva || 0) +
                  parseFloat(formik.values.base_imponible_0 || 0) +
                  parseFloat(formik.values.base_imponible_no_objeto_iva || 0) +
                  parseFloat(formik.values.base_imponible_exento_iva || 0)
                }
                montoIVA={parseFloat(formik.values.monto_iva || 0)}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              * Campos requeridos
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || (formik.submitCount > 0 && !formik.isValid)}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CompraForm;
