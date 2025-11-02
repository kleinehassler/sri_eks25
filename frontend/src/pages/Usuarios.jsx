import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import usuarioService from '../services/usuarioService';
import empresaService from '../services/empresaService';
import UsuariosTable from '../components/Usuarios/UsuariosTable';
import UsuarioForm from '../components/Usuarios/UsuarioForm';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState({
    empresa_id: '',
    rol: '',
    estado: ''
  });

  // Cargar empresas para el selector
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const response = await empresaService.getAll();
        setEmpresas(response.data || []);
      } catch (error) {
        console.error('Error al cargar empresas:', error);
      }
    };
    fetchEmpresas();
  }, []);

  // Cargar usuarios
  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const params = {
        ...filtros,
        busqueda: busqueda || undefined
      };

      const response = await usuarioService.getAll(params);
      setUsuarios(response.data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, [filtros]);

  const handleBuscar = () => {
    cargarUsuarios();
  };

  const handleNuevoUsuario = () => {
    setUsuarioEditar(null);
    setOpenForm(true);
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioEditar(usuario);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setUsuarioEditar(null);
  };

  const handleSubmitUsuario = async (datos) => {
    try {
      if (usuarioEditar) {
        await usuarioService.update(usuarioEditar.id, datos);
      } else {
        await usuarioService.create(datos);
      }
      cargarUsuarios();
      handleCloseForm();
    } catch (error) {
      throw error;
    }
  };

  const handleEliminarUsuario = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await usuarioService.delete(id);
        cargarUsuarios();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert(error.response?.data?.error || 'Error al eliminar usuario');
      }
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await usuarioService.cambiarEstado(id, nuevoEstado);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestión de Usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administre los usuarios del sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNuevoUsuario}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Empresa</InputLabel>
            <Select
              value={filtros.empresa_id}
              onChange={(e) => setFiltros({ ...filtros, empresa_id: e.target.value })}
              label="Empresa"
            >
              <MenuItem value="">Todas</MenuItem>
              {empresas.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.razon_social}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Rol</InputLabel>
            <Select
              value={filtros.rol}
              onChange={(e) => setFiltros({ ...filtros, rol: e.target.value })}
              label="Rol"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="ADMINISTRADOR_GENERAL">Admin General</MenuItem>
              <MenuItem value="ADMINISTRADOR_EMPRESA">Admin Empresa</MenuItem>
              <MenuItem value="CONTADOR">Contador</MenuItem>
              <MenuItem value="OPERADOR">Operador</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="ACTIVO">Activo</MenuItem>
              <MenuItem value="INACTIVO">Inactivo</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar por nombre, email o cédula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <Button variant="contained" onClick={handleBuscar} disabled={loading}>
            Buscar
          </Button>
          <IconButton onClick={cargarUsuarios} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      <Paper>
        <UsuariosTable
          usuarios={usuarios}
          loading={loading}
          onEditar={handleEditarUsuario}
          onEliminar={handleEliminarUsuario}
          onCambiarEstado={handleCambiarEstado}
        />
      </Paper>

      <UsuarioForm
        open={openForm}
        onClose={handleCloseForm}
        usuario={usuarioEditar}
        onSubmit={handleSubmitUsuario}
        loading={loading}
        empresas={empresas}
      />
    </Box>
  );
}

export default Usuarios;
