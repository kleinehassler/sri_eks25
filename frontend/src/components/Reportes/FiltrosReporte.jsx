import { useState } from 'react';
import {
  Paper,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

function FiltrosReporte({ onAplicarFiltros, onExportar, mostrarExportar = true, tipoReporte = 'general' }) {
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = currentDate.getFullYear().toString();

  // Calcular primer y último día del mes actual
  const primerDiaMes = `${currentYear}-${currentMonth}-01`;
  const ultimoDiaMes = new Date(currentYear, currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

  const [filtros, setFiltros] = useState({
    periodo: `${currentMonth}/${currentYear}`,
    fecha_desde: primerDiaMes,
    fecha_hasta: ultimoDiaMes,
    estado: '',
    busqueda: ''
  });

  const handleChange = (field, value) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAplicar = () => {
    onAplicarFiltros(filtros);
  };

  const handleLimpiar = () => {
    const filtrosLimpios = {
      periodo: `${currentMonth}/${currentYear}`,
      fecha_desde: primerDiaMes,
      fecha_hasta: ultimoDiaMes,
      estado: '',
      busqueda: ''
    };
    setFiltros(filtrosLimpios);
    onAplicarFiltros(filtrosLimpios);
  };

  const handleExportar = (formato) => {
    if (onExportar) {
      onExportar(formato, filtros);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        🔍 Filtros de Búsqueda
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Periodo */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Periodo"
            placeholder="MM/YYYY"
            value={filtros.periodo}
            onChange={(e) => handleChange('periodo', e.target.value)}
            helperText="Formato: MM/YYYY"
          />
        </Grid>

        {/* Fecha Desde */}
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Fecha Desde"
            value={filtros.fecha_desde}
            onChange={(e) => handleChange('fecha_desde', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Fecha Hasta */}
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Fecha Hasta"
            value={filtros.fecha_hasta}
            onChange={(e) => handleChange('fecha_hasta', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Estado */}
        <Grid item xs={12} sm={6} md={2.5}>
          <FormControl fullWidth size="small">
            <InputLabel>Estado</InputLabel>
            <Select
              value={filtros.estado}
              label="Estado"
              onChange={(e) => handleChange('estado', e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="BORRADOR">Borrador</MenuItem>
              <MenuItem value="VALIDADO">Validado</MenuItem>
              <MenuItem value="INCLUIDO_ATS">Incluido ATS</MenuItem>
              <MenuItem value="ANULADO">Anulado</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Búsqueda */}
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            fullWidth
            size="small"
            label="Buscar"
            placeholder={tipoReporte === 'compras' ? 'Proveedor o RUC...' : tipoReporte === 'ventas' ? 'Cliente o RUC...' : 'Buscar...'}
            value={filtros.busqueda}
            onChange={(e) => handleChange('busqueda', e.target.value)}
          />
        </Grid>
      </Grid>

      {/* Botones de acción */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleAplicar}
        >
          Generar Reporte
        </Button>

        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleLimpiar}
        >
          Limpiar Filtros
        </Button>

        {mostrarExportar && (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="outlined"
              color="success"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExportar('excel')}
            >
              Exportar Excel
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExportar('pdf')}
            >
              Exportar PDF
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
}

export default FiltrosReporte;
