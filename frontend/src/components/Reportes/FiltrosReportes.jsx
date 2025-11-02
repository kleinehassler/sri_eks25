import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  Typography
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const FiltrosReportes = ({ onFiltrar, onLimpiar }) => {
  const [filtros, setFiltros] = useState({
    periodo: '',
    fecha_desde: '',
    fecha_hasta: '',
    estado: '',
    tipo_proveedor: '',
    tipo_comprobante: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFiltrar = () => {
    onFiltrar(filtros);
  };

  const handleLimpiar = () => {
    setFiltros({
      periodo: '',
      fecha_desde: '',
      fecha_hasta: '',
      estado: '',
      tipo_proveedor: '',
      tipo_comprobante: ''
    });
    onLimpiar();
  };

  // Generar períodos (últimos 24 meses)
  const generarPeriodos = () => {
    const periodos = [];
    const hoy = new Date();
    for (let i = 0; i < 24; i++) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const anio = fecha.getFullYear();
      periodos.push(`${mes}/${anio}`);
    }
    return periodos;
  };

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Filtros de Búsqueda
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Período</InputLabel>
              <Select
                name="periodo"
                value={filtros.periodo}
                onChange={handleChange}
                label="Período"
              >
                <MenuItem value="">Todos</MenuItem>
                {generarPeriodos().map(periodo => (
                  <MenuItem key={periodo} value={periodo}>
                    {periodo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              name="fecha_desde"
              label="Fecha Desde"
              value={filtros.fecha_desde}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              name="fecha_hasta"
              label="Fecha Hasta"
              value={filtros.fecha_hasta}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                name="estado"
                value={filtros.estado}
                onChange={handleChange}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="anulado">Anulado</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo Proveedor</InputLabel>
              <Select
                name="tipo_proveedor"
                value={filtros.tipo_proveedor}
                onChange={handleChange}
                label="Tipo Proveedor"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="01">Persona Natural</MenuItem>
                <MenuItem value="02">Sociedad</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo Comprobante</InputLabel>
              <Select
                name="tipo_comprobante"
                value={filtros.tipo_comprobante}
                onChange={handleChange}
                label="Tipo Comprobante"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="01">Factura</MenuItem>
                <MenuItem value="04">Nota de Crédito</MenuItem>
                <MenuItem value="05">Nota de Débito</MenuItem>
                <MenuItem value="06">Guía de Remisión</MenuItem>
                <MenuItem value="07">Comprobante de Retención</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={handleFiltrar}
              >
                Filtrar
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                startIcon={<ClearIcon />}
                onClick={handleLimpiar}
              >
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FiltrosReportes;
