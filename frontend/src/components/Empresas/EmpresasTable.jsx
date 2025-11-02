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

function EmpresasTable({ empresas, loading, error, onEdit, onDelete, onToggleEstado }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar empresas por búsqueda
  const filteredEmpresas = empresas.filter(empresa =>
    empresa.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.ruc.includes(searchTerm) ||
    (empresa.nombre_comercial && empresa.nombre_comercial.toLowerCase().includes(searchTerm.toLowerCase()))
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

  // Obtener el color del chip según el régimen tributario
  const getRegimenColor = (regimen) => {
    switch (regimen) {
      case 'GENERAL':
        return 'primary';
      case 'RISE':
        return 'secondary';
      case 'RIMPE':
        return 'warning';
      default:
        return 'default';
    }
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
        Error al cargar empresas: {error}
      </Alert>
    );
  }

  if (empresas.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No hay empresas registradas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Haz clic en "Nueva Empresa" para agregar la primera empresa
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
        placeholder="Buscar por RUC, razón social o nombre comercial..."
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
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>RUC</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Razón Social</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre Comercial</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Régimen</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmpresas
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((empresa) => (
                <TableRow
                  key={empresa.id}
                  hover
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {empresa.ruc}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {empresa.razon_social}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {empresa.nombre_comercial || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={empresa.regimen_tributario}
                      color={getRegimenColor(empresa.regimen_tributario)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={empresa.estado}
                      color={getEstadoColor(empresa.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEdit(empresa)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={empresa.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}>
                        <IconButton
                          size="small"
                          color={empresa.estado === 'ACTIVO' ? 'warning' : 'success'}
                          onClick={() => onToggleEstado(empresa)}
                        >
                          {empresa.estado === 'ACTIVO' ? (
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
                          onClick={() => onDelete(empresa)}
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
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredEmpresas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>
    </Box>
  );
}

export default EmpresasTable;
