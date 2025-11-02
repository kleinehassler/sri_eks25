import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Alert
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';

function PeriodoSelector({ onPeriodoSelected, empresaId }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [mes, setMes] = useState(currentMonth.toString().padStart(2, '0'));
  const [anio, setAnio] = useState(currentYear.toString());
  const [error, setError] = useState(null);

  const meses = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  const anios = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    anios.push(i.toString());
  }

  const handleBuscar = () => {
    setError(null);

    // Validar que se haya seleccionado empresa
    if (!empresaId) {
      setError('Debes seleccionar una empresa primero');
      return;
    }

    // Validar mes y año
    if (!mes || !anio) {
      setError('Debes seleccionar un mes y año');
      return;
    }

    // Construir periodo en formato MM/YYYY
    const periodo = `${mes}/${anio}`;

    // Validar que el periodo no sea futuro
    const selectedDate = new Date(parseInt(anio), parseInt(mes) - 1);
    const now = new Date();
    now.setDate(1); // Primer día del mes actual

    if (selectedDate > now) {
      setError('No puedes generar ATS para un periodo futuro');
      return;
    }

    // Llamar al callback con el periodo seleccionado
    if (onPeriodoSelected) {
      onPeriodoSelected(periodo);
    }
  };

  const handleMesChange = (event) => {
    setMes(event.target.value);
    setError(null);
  };

  const handleAnioChange = (event) => {
    setAnio(event.target.value);
    setError(null);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CalendarMonthIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h6">
          Seleccionar Periodo
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selecciona el mes y año para el cual deseas generar el Anexo Transaccional Simplificado (ATS).
        Solo se incluirán las transacciones validadas del periodo seleccionado.
      </Typography>

      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Mes</InputLabel>
            <Select
              value={mes}
              onChange={handleMesChange}
              label="Mes"
            >
              {meses.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Año</InputLabel>
            <Select
              value={anio}
              onChange={handleAnioChange}
              label="Año"
            >
              {anios.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            onClick={handleBuscar}
            sx={{ height: '56px' }}
          >
            Buscar Transacciones
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Información adicional */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
        <Typography variant="body2" color="info.dark">
          <strong>Nota:</strong> El sistema generará el archivo ATS en formato XML conforme a las
          especificaciones del SRI. Solo se incluirán transacciones con estado VALIDADO.
        </Typography>
      </Box>
    </Paper>
  );
}

export default PeriodoSelector;
