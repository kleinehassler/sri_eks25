import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Box,
  Typography,
  TablePagination,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import SearchIcon from '@mui/icons-material/Search';

function CodigosRetencionTable({ codigos, loading, error, onEdit, onDelete, onToggleEstado }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar códigos por búsqueda
  const filteredCodigos = codigos.filter(codigo =>
    codigo.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    codigo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    codigo.porcentaje.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Obtener el color del chip según el estado
  const getEstadoColor = (estado) => {
    return estado === 'ACTIVO' ? 'success' : 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar códigos de retención: {error}
      </Alert>
    );
  }

  if (codigos.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No hay códigos de retención registrados
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Haz clic en "Nuevo Código" para agregar el primer código
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Barra de búsqueda */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar por código, descripción o porcentaje..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '10%' }}>Código</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '50%' }}>Descripción</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>Porcentaje</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '10%' }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCodigos
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((codigo) => (
                <TableRow
                  key={codigo.id}
                  hover
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {codigo.codigo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {codigo.descripcion}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium" color="primary">
                      {codigo.porcentaje}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={codigo.estado}
                      color={getEstadoColor(codigo.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEdit(codigo)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={codigo.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}>
                        <IconButton
                          size="small"
                          color={codigo.estado === 'ACTIVO' ? 'warning' : 'success'}
                          onClick={() => onToggleEstado(codigo)}
                        >
                          {codigo.estado === 'ACTIVO' ? (
                            <ToggleOffIcon fontSize="small" />
                          ) : (
                            <ToggleOnIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(codigo)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredCodigos.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </TableContainer>
    </Box>
  );
}

export default CodigosRetencionTable;
