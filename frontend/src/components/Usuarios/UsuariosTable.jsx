import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { useState } from 'react';

function UsuariosTable({ usuarios, loading, onEditar, onEliminar, onCambiarEstado }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const handleMenuClick = (event, usuario) => {
    setAnchorEl(event.currentTarget);
    setUsuarioSeleccionado(usuario);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setUsuarioSeleccionado(null);
  };

  const handleCambiarEstado = (nuevoEstado) => {
    if (usuarioSeleccionado) {
      onCambiarEstado(usuarioSeleccionado.id, nuevoEstado);
    }
    handleMenuClose();
  };

  const getRolChip = (rol) => {
    const colores = {
      ADMINISTRADOR_GENERAL: 'error',
      ADMINISTRADOR_EMPRESA: 'warning',
      CONTADOR: 'info',
      OPERADOR: 'default',
    };

    const etiquetas = {
      ADMINISTRADOR_GENERAL: 'Admin General',
      ADMINISTRADOR_EMPRESA: 'Admin Empresa',
      CONTADOR: 'Contador',
      OPERADOR: 'Operador',
    };

    return (
      <Chip
        label={etiquetas[rol] || rol}
        color={colores[rol] || 'default'}
        size="small"
      />
    );
  };

  const getEstadoChip = (estado) => {
    const colores = {
      ACTIVO: 'success',
      INACTIVO: 'default',
      BLOQUEADO: 'error',
    };

    return (
      <Chip
        label={estado}
        color={colores[estado] || 'default'}
        size="small"
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!usuarios || usuarios.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No se encontraron usuarios
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Último Acceso</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {usuario.nombre} {usuario.apellido}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {usuario.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  {usuario.empresa ? (
                    <Tooltip title={usuario.empresa.razon_social}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {usuario.empresa.nombre_comercial || usuario.empresa.razon_social}
                      </Typography>
                    </Tooltip>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{getRolChip(usuario.rol)}</TableCell>
                <TableCell>{getEstadoChip(usuario.estado)}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {usuario.ultimo_acceso
                      ? new Date(usuario.ultimo_acceso).toLocaleDateString('es-EC')
                      : 'Nunca'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => onEditar(usuario)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Más opciones">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, usuario)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {usuarioSeleccionado?.estado === 'ACTIVO' && (
          <MenuItem onClick={() => handleCambiarEstado('INACTIVO')}>
            <LockIcon fontSize="small" sx={{ mr: 1 }} />
            Desactivar
          </MenuItem>
        )}
        {usuarioSeleccionado?.estado === 'ACTIVO' && (
          <MenuItem onClick={() => handleCambiarEstado('BLOQUEADO')}>
            <LockIcon fontSize="small" sx={{ mr: 1 }} />
            Bloquear
          </MenuItem>
        )}
        {usuarioSeleccionado?.estado !== 'ACTIVO' && (
          <MenuItem onClick={() => handleCambiarEstado('ACTIVO')}>
            <LockOpenIcon fontSize="small" sx={{ mr: 1 }} />
            Activar
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            onEliminar(usuarioSeleccionado?.id);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>
    </>
  );
}

export default UsuariosTable;
