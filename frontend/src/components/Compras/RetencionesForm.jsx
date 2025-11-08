import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  IconButton,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { formatEstablecimiento, formatPuntoEmision, formatSecuencial } from '../../utils/formatters';
import codigoRetencionService from '../../services/codigoRetencionService';

// Tipos de impuesto
const tiposImpuesto = [
  { value: 'RENTA', label: 'Impuesto a la Renta' },
  { value: 'IVA', label: 'IVA' }
];

// Códigos de retención IVA (estos se mantienen hardcodeados porque son porcentajes fijos de retención de IVA)
const codigosRetencionIVA = [
  { value: '10', label: '10 - Retención 10%', porcentaje: 10 },
  { value: '20', label: '20 - Retención 20%', porcentaje: 20 },
  { value: '30', label: '30 - Retención 30%', porcentaje: 30 },
  { value: '50', label: '50 - Retención 50%', porcentaje: 50 },
  { value: '70', label: '70 - Retención 70%', porcentaje: 70 },
  { value: '100', label: '100 - Retención 100%', porcentaje: 100 },
];

// Porcentajes de retención según código IVA
const porcentajesIVA = {
  '10': 10,
  '20': 20,
  '30': 30,
  '50': 50,
  '70': 70,
  '100': 100
};

const retencionVacia = {
  fecha_emision: '',
  establecimiento: '',
  punto_emision: '',
  secuencial: '',
  numero_autorizacion: '',
  tipo_impuesto: 'RENTA',
  codigo_retencion: '',
  base_imponible: 0,
  porcentaje_retencion: 0,
  valor_retenido: 0,
  observaciones: ''
};

function RetencionesForm({
  retenciones = [],
  onChange,
  disabled = false,
  fechaEmisionCompra = '',
  baseImponibleTotal = 0,
  montoIVA = 0
}) {
  const [retencionActual, setRetencionActual] = useState(retencionVacia);
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [error, setError] = useState(null);
  const [codigosRetencionIR, setCodigosRetencionIR] = useState([]);
  const [loadingCodigos, setLoadingCodigos] = useState(true);
  const [errorCargaCodigos, setErrorCargaCodigos] = useState(null);

  // Cargar códigos de retención de renta desde el backend
  useEffect(() => {
    const cargarCodigosRetencion = async () => {
      try {
        setLoadingCodigos(true);
        setErrorCargaCodigos(null);
        const response = await codigoRetencionService.getActivos();

        // Formatear los códigos para el selector
        const codigosFormateados = response.data.map(codigo => ({
          value: codigo.codigo,
          label: `${codigo.codigo} - ${codigo.descripcion} (${codigo.porcentaje})`,
          porcentaje: codigo.porcentaje
        }));

        setCodigosRetencionIR(codigosFormateados);
      } catch (err) {
        console.error('Error al cargar códigos de retención:', err);
        setErrorCargaCodigos('Error al cargar códigos de retención. Usando códigos predeterminados.');
        // Fallback a una lista básica en caso de error
        setCodigosRetencionIR([
          { value: '303', label: '303 - Honorarios profesionales (10)', porcentaje: '10' },
          { value: '304', label: '304 - Servicios predomina intelecto (10)', porcentaje: '10' },
          { value: '307', label: '307 - Servicios predomina mano de obra (2)', porcentaje: '2' },
          { value: '310', label: '310 - Servicio de transporte (1)', porcentaje: '1' },
          { value: '312', label: '312 - Transferencia de bienes (1.75)', porcentaje: '1.75' },
          { value: '320', label: '320 - Arrendamiento inmuebles (10)', porcentaje: '10' },
          { value: '332', label: '332 - Otras compras no sujetas a retención (0)', porcentaje: '0' },
          { value: '343', label: '343 - Otras retenciones aplicables 1% (1)', porcentaje: '1' },
        ]);
      } finally {
        setLoadingCodigos(false);
      }
    };

    cargarCodigosRetencion();
  }, []);

  // Efecto para auto-completar fecha de emisión cuando cambia la fecha de la compra
  useEffect(() => {
    if (fechaEmisionCompra && !retencionActual.fecha_emision && editandoIndex === null) {
      setRetencionActual(prev => ({
        ...prev,
        fecha_emision: fechaEmisionCompra
      }));
    }
  }, [fechaEmisionCompra]);

  // Efecto para auto-completar base imponible cuando cambia el total de la compra
  useEffect(() => {
    if (baseImponibleTotal > 0 && !retencionActual.base_imponible && editandoIndex === null) {
      // Determinar la base según el tipo de impuesto
      const baseAUtilizar = retencionActual.tipo_impuesto === 'IVA' ? montoIVA : baseImponibleTotal;

      if (baseAUtilizar > 0) {
        setRetencionActual(prev => ({
          ...prev,
          base_imponible: baseAUtilizar
        }));
      }
    }
  }, [baseImponibleTotal, montoIVA]);

  // Calcular totales
  const totalRetencionIVA = retenciones
    .filter(r => r.tipo_impuesto === 'IVA')
    .reduce((sum, r) => sum + parseFloat(r.valor_retenido || 0), 0);

  const totalRetencionRenta = retenciones
    .filter(r => r.tipo_impuesto === 'RENTA')
    .reduce((sum, r) => sum + parseFloat(r.valor_retenido || 0), 0);

  // Manejar cambios en el formulario de retención
  const handleChange = (field, value) => {
    setRetencionActual(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calcular valor retenido cuando cambia base o porcentaje
      if (field === 'base_imponible' || field === 'porcentaje_retencion') {
        const base = parseFloat(field === 'base_imponible' ? value : updated.base_imponible) || 0;
        const porcentaje = parseFloat(field === 'porcentaje_retencion' ? value : updated.porcentaje_retencion) || 0;
        updated.valor_retenido = ((base * porcentaje) / 100).toFixed(2);
      }

      // Si cambia el tipo de impuesto, limpiar código de retención y actualizar base
      if (field === 'tipo_impuesto') {
        updated.codigo_retencion = '';
        updated.porcentaje_retencion = 0;

        // Auto-completar base según el tipo de impuesto
        if (value === 'IVA') {
          updated.base_imponible = montoIVA > 0 ? montoIVA : 0;
        } else {
          updated.base_imponible = baseImponibleTotal > 0 ? baseImponibleTotal : 0;
        }

        // Recalcular valor retenido
        updated.valor_retenido = 0;
      }

      // Si selecciona código de retención IVA, auto-llenar porcentaje
      if (field === 'codigo_retencion' && updated.tipo_impuesto === 'IVA') {
        const porcentaje = porcentajesIVA[value] || 0;
        updated.porcentaje_retencion = porcentaje;
        const base = parseFloat(updated.base_imponible) || 0;
        updated.valor_retenido = ((base * porcentaje) / 100).toFixed(2);
      }

      // Si selecciona código de retención IR, intentar extraer porcentaje del código
      if (field === 'codigo_retencion' && updated.tipo_impuesto === 'RENTA') {
        const codigoSeleccionado = codigosRetencionIR.find(c => c.value === value);
        if (codigoSeleccionado && codigoSeleccionado.porcentaje) {
          // Intentar convertir el porcentaje a número
          const porcentajeStr = codigoSeleccionado.porcentaje;
          const porcentajeNumerico = parseFloat(porcentajeStr);

          // Solo auto-completar si es un número válido
          if (!isNaN(porcentajeNumerico)) {
            updated.porcentaje_retencion = porcentajeNumerico;
            const base = parseFloat(updated.base_imponible) || 0;
            updated.valor_retenido = ((base * porcentajeNumerico) / 100).toFixed(2);
          }
        }
      }

      return updated;
    });
  };

  // Agregar nueva retención
  const handleAgregarRetencion = () => {
    // Validar campos requeridos
    if (!retencionActual.fecha_emision) {
      setError('La fecha de emisión es requerida');
      return;
    }
    if (!retencionActual.establecimiento || !retencionActual.punto_emision || !retencionActual.secuencial) {
      setError('Los datos del comprobante son requeridos');
      return;
    }
    if (!retencionActual.numero_autorizacion) {
      setError('El número de autorización es requerido');
      return;
    }
    if (!retencionActual.codigo_retencion) {
      setError('El código de retención es requerido');
      return;
    }
    if (parseFloat(retencionActual.base_imponible) <= 0) {
      setError('La base imponible debe ser mayor a 0');
      return;
    }

    setError(null);

    if (editandoIndex !== null) {
      // Actualizar retención existente
      const nuevasRetenciones = [...retenciones];
      nuevasRetenciones[editandoIndex] = { ...retencionActual };
      onChange(nuevasRetenciones);
      setEditandoIndex(null);
    } else {
      // Agregar nueva retención
      onChange([...retenciones, { ...retencionActual }]);
    }

    // Limpiar formulario pero mantener datos del comprobante (que son los mismos para todas las retenciones)
    // También mantener fecha de emisión y base imponible auto-completadas
    setRetencionActual({
      ...retencionVacia,
      fecha_emision: fechaEmisionCompra || '',
      establecimiento: retencionActual.establecimiento,  // Mantener establecimiento
      punto_emision: retencionActual.punto_emision,      // Mantener punto de emisión
      secuencial: retencionActual.secuencial,            // Mantener secuencial
      numero_autorizacion: retencionActual.numero_autorizacion,  // Mantener número de autorización
      base_imponible: baseImponibleTotal || 0  // Por defecto RENTA usa base total
    });
  };

  // Editar retención
  const handleEditarRetencion = (index) => {
    setRetencionActual({ ...retenciones[index] });
    setEditandoIndex(index);
  };

  // Eliminar retención
  const handleEliminarRetencion = (index) => {
    const nuevasRetenciones = retenciones.filter((_, i) => i !== index);
    onChange(nuevasRetenciones);
  };

  // Cancelar edición
  const handleCancelarEdicion = () => {
    // Mantener los datos del comprobante al cancelar edición
    const ultimaRetencion = retenciones.length > 0 ? retenciones[retenciones.length - 1] : retencionActual;
    setRetencionActual({
      ...retencionVacia,
      fecha_emision: fechaEmisionCompra || '',
      establecimiento: ultimaRetencion.establecimiento || '',
      punto_emision: ultimaRetencion.punto_emision || '',
      secuencial: ultimaRetencion.secuencial || '',
      numero_autorizacion: ultimaRetencion.numero_autorizacion || '',
      base_imponible: baseImponibleTotal || 0  // Por defecto RENTA usa base total
    });
    setEditandoIndex(null);
    setError(null);
  };

  // Obtener códigos según tipo de impuesto
  const obtenerCodigosRetencion = () => {
    return retencionActual.tipo_impuesto === 'IVA'
      ? codigosRetencionIVA
      : codigosRetencionIR;
  };

  return (
    <Box>
      {/* Título de sección */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ReceiptIcon color="primary" />
        <Typography variant="h6" color="primary">
          Retenciones
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Formulario de retención */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2}>
          {/* Datos del Comprobante de Retención */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Datos del Comprobante de Retención
            </Typography>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Fecha de Emisión"
              value={retencionActual.fecha_emision}
              onChange={(e) => handleChange('fecha_emision', e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={disabled}
              helperText="Auto-completada desde la compra (editable)"
            />
          </Grid>

          <Grid item xs={6} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="Establecimiento"
              placeholder="001"
              value={retencionActual.establecimiento}
              onChange={(e) => handleChange('establecimiento', e.target.value)}
              onBlur={(e) => {
                const formatted = formatEstablecimiento(e.target.value);
                if (formatted) handleChange('establecimiento', formatted);
              }}
              inputProps={{ maxLength: 3 }}
              disabled={disabled}
            />
          </Grid>

          <Grid item xs={6} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="Pto. Emisión"
              placeholder="001"
              value={retencionActual.punto_emision}
              onChange={(e) => handleChange('punto_emision', e.target.value)}
              onBlur={(e) => {
                const formatted = formatPuntoEmision(e.target.value);
                if (formatted) handleChange('punto_emision', formatted);
              }}
              inputProps={{ maxLength: 3 }}
              disabled={disabled}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="Secuencial"
              placeholder="000000001"
              value={retencionActual.secuencial}
              onChange={(e) => handleChange('secuencial', e.target.value)}
              onBlur={(e) => {
                const formatted = formatSecuencial(e.target.value);
                if (formatted) handleChange('secuencial', formatted);
              }}
              inputProps={{ maxLength: 9 }}
              disabled={disabled}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Impuesto</InputLabel>
              <Select
                value={retencionActual.tipo_impuesto}
                onChange={(e) => handleChange('tipo_impuesto', e.target.value)}
                label="Tipo de Impuesto"
                disabled={disabled}
              >
                {tiposImpuesto.map(tipo => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Número de Autorización"
              value={retencionActual.numero_autorizacion}
              onChange={(e) => handleChange('numero_autorizacion', e.target.value)}
              placeholder="49 dígitos de la clave de acceso"
              disabled={disabled}
            />
          </Grid>

          {/* Datos de la Retención */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Chip label="Datos de la Retención" size="small" />
            </Divider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Código de Retención</InputLabel>
              <Select
                value={retencionActual.codigo_retencion}
                onChange={(e) => handleChange('codigo_retencion', e.target.value)}
                label="Código de Retención"
                disabled={disabled}
              >
                {obtenerCodigosRetencion().map(codigo => (
                  <MenuItem key={codigo.value} value={codigo.value}>
                    {codigo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Base Imponible"
              value={retencionActual.base_imponible}
              onChange={(e) => handleChange('base_imponible', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              disabled={disabled}
              helperText={
                retencionActual.tipo_impuesto === 'IVA'
                  ? 'Auto-completada con monto IVA (editable)'
                  : 'Auto-completada como suma de bases (editable)'
              }
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Porcentaje"
              value={retencionActual.porcentaje_retencion}
              onChange={(e) => handleChange('porcentaje_retencion', e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
              disabled={disabled || retencionActual.tipo_impuesto === 'IVA'}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Valor Retenido"
              value={retencionActual.valor_retenido}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                readOnly: true
              }}
              sx={{
                '& .MuiInputBase-input': {
                  fontWeight: 'bold',
                  color: 'error.main'
                }
              }}
              disabled={disabled}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Observaciones"
              value={retencionActual.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              placeholder="Opcional"
              disabled={disabled}
            />
          </Grid>

          {/* Botones de acción */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {editandoIndex !== null && (
                <Button
                  size="small"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelarEdicion}
                  disabled={disabled}
                >
                  Cancelar
                </Button>
              )}
              <Button
                variant="contained"
                size="small"
                startIcon={editandoIndex !== null ? <SaveIcon /> : <AddIcon />}
                onClick={handleAgregarRetencion}
                disabled={disabled}
              >
                {editandoIndex !== null ? 'Actualizar Retención' : 'Agregar Retención'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de retenciones */}
      {retenciones.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Tipo</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Comprobante</TableCell>
                <TableCell align="right">Base Imponible</TableCell>
                <TableCell align="right">%</TableCell>
                <TableCell align="right">Valor Retenido</TableCell>
                <TableCell>Observaciones</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {retenciones.map((retencion, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Chip
                      label={retencion.tipo_impuesto}
                      size="small"
                      color={retencion.tipo_impuesto === 'IVA' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>{retencion.codigo_retencion}</TableCell>
                  <TableCell>
                    {retencion.establecimiento}-{retencion.punto_emision}-{retencion.secuencial}
                  </TableCell>
                  <TableCell align="right">${parseFloat(retencion.base_imponible).toFixed(2)}</TableCell>
                  <TableCell align="right">{retencion.porcentaje_retencion}%</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    ${parseFloat(retencion.valor_retenido).toFixed(2)}
                  </TableCell>
                  <TableCell>{retencion.observaciones || '-'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => handleEditarRetencion(index)}
                        disabled={disabled}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => handleEliminarRetencion(index)}
                        color="error"
                        disabled={disabled}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {/* Fila de totales */}
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>
                  Total Retención IVA:
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  ${totalRetencionIVA.toFixed(2)}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>
                  Total Retención IR:
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                  ${totalRetencionRenta.toFixed(2)}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {retenciones.length === 0 && (
        <Alert severity="info">
          No hay retenciones registradas. Agregue al menos una retención usando el formulario anterior.
        </Alert>
      )}
    </Box>
  );
}

export default RetencionesForm;
