import { useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Esquema de validación con Yup
const validationSchema = Yup.object({
  codigo: Yup.string()
    .required('El código es requerido')
    .max(10, 'El código no puede exceder 10 caracteres'),
  descripcion: Yup.string()
    .required('La descripción es requerida')
    .min(3, 'La descripción debe tener al menos 3 caracteres'),
  porcentaje: Yup.string()
    .required('El porcentaje es requerido')
    .max(50, 'El porcentaje no puede exceder 50 caracteres'),
  estado: Yup.string()
    .required('El estado es requerido')
    .oneOf(['ACTIVO', 'INACTIVO'], 'Estado inválido')
});

function CodigoRetencionForm({ open, onClose, codigo, onSubmit, loading }) {
  const [submitError, setSubmitError] = useState(null);
  const isEditing = Boolean(codigo);

  const formik = useFormik({
    initialValues: {
      codigo: codigo?.codigo || '',
      descripcion: codigo?.descripcion || '',
      porcentaje: codigo?.porcentaje || '',
      estado: codigo?.estado || 'ACTIVO',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        await onSubmit(values);
        formik.resetForm();
      } catch (error) {
        setSubmitError(error.mensaje || error.error || 'Error al guardar el código de retención');
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
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {isEditing ? 'Editar Código de Retención' : 'Nuevo Código de Retención'}
        </DialogTitle>

        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Código */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="codigo"
                name="codigo"
                label="Código"
                value={formik.values.codigo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.codigo && Boolean(formik.errors.codigo)}
                helperText={formik.touched.codigo && formik.errors.codigo}
                disabled={isEditing}
                required
              />
            </Grid>

            {/* Estado */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="estado-label">Estado</InputLabel>
                <Select
                  labelId="estado-label"
                  id="estado"
                  name="estado"
                  value={formik.values.estado}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.estado && Boolean(formik.errors.estado)}
                  label="Estado"
                  required
                >
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="INACTIVO">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Descripción */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="descripcion"
                name="descripcion"
                label="Descripción"
                multiline
                rows={3}
                value={formik.values.descripcion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
                helperText={formik.touched.descripcion && formik.errors.descripcion}
                required
              />
            </Grid>

            {/* Porcentaje */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="porcentaje"
                name="porcentaje"
                label="Porcentaje"
                value={formik.values.porcentaje}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.porcentaje && Boolean(formik.errors.porcentaje)}
                helperText={
                  (formik.touched.porcentaje && formik.errors.porcentaje) ||
                  'Puede ser un número (ej: 10, 2.75) o texto (ej: "varios porcentajes", "1 a 2")'
                }
                required
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formik.isValid}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isEditing ? (
              'Actualizar'
            ) : (
              'Crear'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CodigoRetencionForm;
