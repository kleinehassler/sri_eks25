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
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

function UsuarioForm({ open, onClose, usuario, onSubmit, loading, empresas }) {
  const [formData, setFormData] = useState({
    empresa_id: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'OPERADOR',
    estado: 'ACTIVO',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (usuario) {
      // Modo edición
      setFormData({
        empresa_id: usuario.empresa_id || '',
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        email: usuario.email || '',
        password: '', // No mostrar password en edición
        rol: usuario.rol || 'OPERADOR',
        estado: usuario.estado || 'ACTIVO',
      });
    } else {
      // Modo creación
      setFormData({
        empresa_id: '',
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        rol: 'OPERADOR',
        estado: 'ACTIVO',
      });
    }
    setError('');
  }, [usuario, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.empresa_id) {
      setError('Debe seleccionar una empresa');
      return;
    }

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.apellido.trim()) {
      setError('El apellido es requerido');
      return;
    }

    if (!formData.email.trim()) {
      setError('El email es requerido');
      return;
    }

    // Validar password solo en creación
    if (!usuario && !formData.password) {
      setError('La contraseña es requerida');
      return;
    }

    if (!usuario && formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      // Si estamos editando y no hay password, no enviarlo
      const dataToSubmit = { ...formData };
      if (usuario && !formData.password) {
        delete dataToSubmit.password;
      }

      await onSubmit(dataToSubmit);
    } catch (err) {
      console.error('Error completo:', err);
      console.error('Error response:', err.response);

      // Extraer mensaje de error del backend
      let errorMsg = 'Error al guardar usuario';

      if (err.response?.data) {
        // Si hay múltiples errores de validación
        if (err.response.data.errores && Array.isArray(err.response.data.errores)) {
          errorMsg = err.response.data.errores.map(e => `${e.campo}: ${e.mensaje}`).join(', ');
        }
        // Si hay un solo error
        else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        }
        // Si hay mensaje
        else if (err.response.data.mensaje) {
          errorMsg = err.response.data.mensaje;
        }
      }

      setError(errorMsg);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Empresa</InputLabel>
                <Select
                  name="empresa_id"
                  value={formData.empresa_id}
                  onChange={handleChange}
                  label="Empresa"
                >
                  {empresas.map((empresa) => (
                    <MenuItem key={empresa.id} value={empresa.id}>
                      {empresa.razon_social}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required={!usuario}
                type={showPassword ? 'text' : 'password'}
                label={usuario ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                helperText={
                  usuario
                    ? 'Dejar en blanco para mantener la contraseña actual'
                    : 'Mínimo 8 caracteres, mayúscula, minúscula y número'
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Rol</InputLabel>
                <Select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  label="Rol"
                >
                  <MenuItem value="ADMINISTRADOR_GENERAL">
                    Administrador General
                  </MenuItem>
                  <MenuItem value="ADMINISTRADOR_EMPRESA">
                    Administrador de Empresa
                  </MenuItem>
                  <MenuItem value="CONTADOR">Contador</MenuItem>
                  <MenuItem value="OPERADOR">Operador</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  label="Estado"
                >
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="INACTIVO">Inactivo</MenuItem>
                  <MenuItem value="BLOQUEADO">Bloqueado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Alert severity="info" variant="outlined">
              <strong>Roles:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>
                  <strong>Admin General:</strong> Acceso total al sistema
                </li>
                <li>
                  <strong>Admin Empresa:</strong> Gestiona usuarios y datos de su empresa
                </li>
                <li>
                  <strong>Contador:</strong> Gestiona transacciones y genera ATS
                </li>
                <li>
                  <strong>Operador:</strong> Solo captura de datos
                </li>
              </ul>
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {usuario ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default UsuarioForm;
