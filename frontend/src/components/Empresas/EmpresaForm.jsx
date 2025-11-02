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
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Validación de RUC Ecuatoriano SOLO PARA EMPRESAS
const validarRUC = (ruc) => {
  if (!ruc) return false;

  ruc = ruc.trim();

  // Las empresas SIEMPRE tienen 13 dígitos
  if (ruc.length !== 13) return false;

  // Validar que sean solo números
  if (!/^\d+$/.test(ruc)) return false;

  // Validar provincia (01-24, 30)
  const provincia = parseInt(ruc.substring(0, 2));
  if ((provincia < 1 || provincia > 24) && provincia !== 30) return false;

  const tercerDigito = parseInt(ruc.charAt(2));

  // Rechazar RUC de personas naturales
  if (tercerDigito < 6) return false;

  // Los últimos 3 dígitos DEBEN ser 001
  if (ruc.substring(10, 13) !== '001') return false;

  // Sociedad privada (tercer dígito = 9)
  if (tercerDigito === 9) {
    return validarRUCSociedad(ruc);
  }

  // Entidad pública (tercer dígito = 6)
  if (tercerDigito === 6) {
    return validarRUCPublico(ruc);
  }

  // Otros terceros dígitos no son válidos para empresas
  return false;
};

// Validación para sociedades privadas (tercer dígito = 9)
const validarRUCSociedad = (ruc) => {
  const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    suma += parseInt(ruc.charAt(i)) * coeficientes[i];
  }

  const residuo = suma % 11;
  const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;
  return digitoVerificador === parseInt(ruc.charAt(9));
};

// Validación para entidades públicas (tercer dígito = 6)
const validarRUCPublico = (ruc) => {
  const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 8; i++) {
    suma += parseInt(ruc.charAt(i)) * coeficientes[i];
  }

  const residuo = suma % 11;
  const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;
  return digitoVerificador === parseInt(ruc.charAt(8));
};

// Esquema de validación con Yup
const validationSchema = Yup.object({
  ruc: Yup.string()
    .required('El RUC es requerido')
    .matches(/^\d{13}$/, 'El RUC debe tener exactamente 13 dígitos numéricos'),
  razon_social: Yup.string()
    .required('La razón social es requerida')
    .min(3, 'La razón social debe tener al menos 3 caracteres')
    .max(300, 'La razón social no puede exceder 300 caracteres'),
  nombre_comercial: Yup.string()
    .max(300, 'El nombre comercial no puede exceder 300 caracteres'),
  regimen_tributario: Yup.string()
    .required('El régimen tributario es requerido')
    .oneOf(['RISE', 'GENERAL', 'RIMPE'], 'Régimen tributario inválido'),
  direccion: Yup.string()
    .max(500, 'La dirección no puede exceder 500 caracteres'),
  telefono: Yup.string()
    .matches(/^[0-9]{7,15}$/, 'El teléfono debe tener entre 7 y 15 dígitos'),
  email: Yup.string()
    .email('El email no es válido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  representante_legal: Yup.string()
    .max(200, 'El nombre del representante legal no puede exceder 200 caracteres'),
  contador_nombre: Yup.string()
    .max(200, 'El nombre del contador no puede exceder 200 caracteres'),
  contador_ruc: Yup.string()
    .matches(/^\d{10,13}$/, 'El RUC del contador debe tener entre 10 y 13 dígitos')
});

function EmpresaForm({ open, onClose, empresa, onSubmit, loading }) {
  const [submitError, setSubmitError] = useState(null);
  const isEditing = Boolean(empresa);

  const formik = useFormik({
    initialValues: {
      ruc: empresa?.ruc || '',
      razon_social: empresa?.razon_social || '',
      nombre_comercial: empresa?.nombre_comercial || '',
      regimen_tributario: empresa?.regimen_tributario || 'GENERAL',
      direccion: empresa?.direccion || '',
      telefono: empresa?.telefono || '',
      email: empresa?.email || '',
      representante_legal: empresa?.representante_legal || '',
      contador_nombre: empresa?.contador_nombre || '',
      contador_ruc: empresa?.contador_ruc || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        await onSubmit(values);
        formik.resetForm();
      } catch (error) {
        setSubmitError(error.message || 'Error al guardar la empresa');
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setSubmitError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          {isEditing ? 'Editar Empresa' : 'Nueva Empresa'}
        </Typography>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* RUC */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="ruc"
                name="ruc"
                label="RUC *"
                placeholder="1790016919001"
                value={formik.values.ruc}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.ruc && Boolean(formik.errors.ruc)}
                helperText={formik.touched.ruc && formik.errors.ruc || 'Ingrese el RUC de 13 dígitos'}
                disabled={isEditing} // No permitir editar RUC
                inputProps={{ maxLength: 13 }}
              />
            </Grid>

            {/* Régimen Tributario */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.regimen_tributario && Boolean(formik.errors.regimen_tributario)}>
                <InputLabel>Régimen Tributario *</InputLabel>
                <Select
                  id="regimen_tributario"
                  name="regimen_tributario"
                  value={formik.values.regimen_tributario}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Régimen Tributario *"
                >
                  <MenuItem value="GENERAL">General</MenuItem>
                  <MenuItem value="RISE">RISE</MenuItem>
                  <MenuItem value="RIMPE">RIMPE</MenuItem>
                </Select>
                {formik.touched.regimen_tributario && formik.errors.regimen_tributario && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {formik.errors.regimen_tributario}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Razón Social */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="razon_social"
                name="razon_social"
                label="Razón Social *"
                value={formik.values.razon_social}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.razon_social && Boolean(formik.errors.razon_social)}
                helperText={formik.touched.razon_social && formik.errors.razon_social}
              />
            </Grid>

            {/* Nombre Comercial */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="nombre_comercial"
                name="nombre_comercial"
                label="Nombre Comercial"
                value={formik.values.nombre_comercial}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nombre_comercial && Boolean(formik.errors.nombre_comercial)}
                helperText={formik.touched.nombre_comercial && formik.errors.nombre_comercial}
              />
            </Grid>

            {/* Dirección */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="direccion"
                name="direccion"
                label="Dirección"
                multiline
                rows={2}
                value={formik.values.direccion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.direccion && Boolean(formik.errors.direccion)}
                helperText={formik.touched.direccion && formik.errors.direccion}
              />
            </Grid>

            {/* Teléfono */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="telefono"
                name="telefono"
                label="Teléfono"
                value={formik.values.telefono}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.telefono && Boolean(formik.errors.telefono)}
                helperText={formik.touched.telefono && formik.errors.telefono}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            {/* Representante Legal */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="representante_legal"
                name="representante_legal"
                label="Representante Legal"
                value={formik.values.representante_legal}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.representante_legal && Boolean(formik.errors.representante_legal)}
                helperText={formik.touched.representante_legal && formik.errors.representante_legal}
              />
            </Grid>

            {/* Contador Nombre */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="contador_nombre"
                name="contador_nombre"
                label="Nombre del Contador"
                value={formik.values.contador_nombre}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contador_nombre && Boolean(formik.errors.contador_nombre)}
                helperText={formik.touched.contador_nombre && formik.errors.contador_nombre}
              />
            </Grid>

            {/* Contador RUC */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="contador_ruc"
                name="contador_ruc"
                label="RUC del Contador"
                value={formik.values.contador_ruc}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contador_ruc && Boolean(formik.errors.contador_ruc)}
                helperText={formik.touched.contador_ruc && formik.errors.contador_ruc}
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
            disabled={loading || !formik.isValid}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default EmpresaForm;
