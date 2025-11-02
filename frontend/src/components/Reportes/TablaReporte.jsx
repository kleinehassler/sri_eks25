import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useState } from 'react';

function TablaReporte({ datos, columnas, titulo, loading = false }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatValue = (value, tipo) => {
    if (value === null || value === undefined) return '-';

    switch (tipo) {
      case 'currency':
        return new Intl.NumberFormat('es-EC', {
          style: 'currency',
          currency: 'USD'
        }).format(value);

      case 'date':
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleDateString('es-EC');

      case 'percentage':
        return `${parseFloat(value).toFixed(2)}%`;

      case 'number':
        return new Intl.NumberFormat('es-EC').format(value);

      default:
        return value;
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Cargando datos...
        </Typography>
      </Paper>
    );
  }

  if (!datos || datos.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          No se encontraron datos para los filtros seleccionados
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {titulo && (
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="h6">{titulo}</Typography>
          <Typography variant="caption" color="text.secondary">
            Total de registros: {datos.length}
          </Typography>
        </Box>
      )}

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columnas.map((col, index) => (
                <TableCell
                  key={index}
                  align={col.align || 'left'}
                  sx={{ fontWeight: 'bold', bgcolor: 'primary.lighter' }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {datos
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, rowIndex) => (
                <TableRow key={rowIndex} hover>
                  {columnas.map((col, colIndex) => (
                    <TableCell key={colIndex} align={col.align || 'left'}>
                      {col.render
                        ? col.render(row)
                        : formatValue(row[col.field], col.tipo)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={datos.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Paper>
  );
}

export default TablaReporte;
