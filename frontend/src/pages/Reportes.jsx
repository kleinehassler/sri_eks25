import { useState } from 'react';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  Snackbar
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ResumenGeneral from '../components/Reportes/ResumenGeneral';
import FiltrosReporte from '../components/Reportes/FiltrosReporte';
import TablaReporte from '../components/Reportes/TablaReporte';
import ReporteRetenciones from '../components/Reportes/ReporteRetenciones';
import { useAuth } from '../context/AuthContext';
import reporteService from '../services/reporteService';
import compraService from '../services/compraService';
import ventaService from '../services/ventaService';

function Reportes() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [datosReporte, setDatosReporte] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estado para el resumen general (Tab 0)
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = currentDate.getFullYear().toString();
  const [periodoResumen, setPeriodoResumen] = useState(`${currentMonth}/${currentYear}`);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setDatosReporte([]);
  };

  const handleAplicarFiltros = async (filtros) => {
    setLoading(true);
    try {
      let response;

      switch (tabValue) {
        case 0: // Resumen General
          setPeriodoResumen(filtros.periodo);
          break;

        case 1: // Reporte de Compras
          response = await reporteService.getReporteCompras(filtros);
          setDatosReporte(response.data?.compras || []);
          break;

        case 2: // Reporte de Ventas
          response = await reporteService.getReporteVentas(filtros);
          setDatosReporte(response.data?.ventas || []);
          break;

        default:
          break;
      }
    } catch (error) {
      showSnackbar(error.mensaje || 'Error al cargar el reporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async (formato, filtros) => {
    try {
      let tipoReporte;
      switch (tabValue) {
        case 1:
          tipoReporte = 'compras';
          break;
        case 2:
          tipoReporte = 'ventas';
          break;
        default:
          tipoReporte = 'general';
      }

      const blob = formato === 'excel'
        ? await reporteService.exportarExcel(tipoReporte, { empresaId: user?.empresa_id, ...filtros })
        : await reporteService.exportarPDF(tipoReporte, { empresaId: user?.empresa_id, ...filtros });

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${tipoReporte}_${new Date().getTime()}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSnackbar(`Reporte exportado a ${formato.toUpperCase()} exitosamente`, 'success');
    } catch (error) {
      showSnackbar('Error al exportar el reporte', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Columnas para el reporte de compras
  const columnasCompras = [
    { field: 'periodo', label: 'Periodo' },
    { field: 'fecha_emision', label: 'Fecha', tipo: 'date' },
    {
      field: 'razon_social_proveedor',
      label: 'Proveedor',
      render: (row) => (
        <Box>
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {row.razon_social_proveedor}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.identificacion_proveedor}
          </Typography>
        </Box>
      )
    },
    {
      field: 'numero_factura',
      label: 'Factura',
      render: (row) => (
        <Typography variant="body2" fontFamily="monospace">
          {row.establecimiento}-{row.punto_emision}-{row.secuencial}
        </Typography>
      )
    },
    { field: 'base_imponible_iva', label: 'Base IVA', tipo: 'currency', align: 'right' },
    { field: 'monto_iva', label: 'IVA', tipo: 'currency', align: 'right' },
    { field: 'total_compra', label: 'Total', tipo: 'currency', align: 'right' },
    { field: 'estado', label: 'Estado' }
  ];

  // Columnas para el reporte de ventas
  const columnasVentas = [
    { field: 'periodo', label: 'Periodo' },
    { field: 'fecha_emision', label: 'Fecha', tipo: 'date' },
    {
      field: 'razon_social_cliente',
      label: 'Cliente',
      render: (row) => (
        <Box>
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {row.razon_social_cliente}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.identificacion_cliente}
          </Typography>
        </Box>
      )
    },
    {
      field: 'numero_factura',
      label: 'Factura',
      render: (row) => (
        <Typography variant="body2" fontFamily="monospace">
          {row.establecimiento}-{row.punto_emision}-{row.secuencial}
        </Typography>
      )
    },
    { field: 'base_imponible_iva', label: 'Base IVA', tipo: 'currency', align: 'right' },
    { field: 'monto_iva', label: 'IVA', tipo: 'currency', align: 'right' },
    { field: 'total_venta', label: 'Total', tipo: 'currency', align: 'right' },
    { field: 'estado', label: 'Estado' }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Reportes y Análisis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualiza estadísticas y reportes de transacciones
          </Typography>
        </Box>
      </Box>

      {/* Información */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Los reportes muestran información consolidada de compras y ventas por periodo.
          Puedes exportar los datos a Excel o PDF para análisis externos.
        </Typography>
      </Alert>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Resumen General" />
          <Tab label="Reporte de Compras" />
          <Tab label="Reporte de Ventas" />
          <Tab label="Retenciones por %" />
          <Tab label="Retenciones por Código" />
          <Tab label="Compras Sin Retenciones" />
          <Tab label="Retenciones IVA Recibidas" />
          <Tab label="Retenciones IR Recibidas" />
        </Tabs>
      </Box>

      {/* Contenido de cada Tab */}
      <Box>
        {/* Tab 0: Resumen General */}
        {tabValue === 0 && (
          <Box>
            <FiltrosReporte
              onAplicarFiltros={handleAplicarFiltros}
              onExportar={handleExportar}
              mostrarExportar={false}
              tipoReporte="general"
            />
            <ResumenGeneral
              empresaId={user?.empresa_id}
              periodo={periodoResumen}
            />
          </Box>
        )}

        {/* Tab 1: Reporte de Compras */}
        {tabValue === 1 && (
          <Box>
            <FiltrosReporte
              onAplicarFiltros={handleAplicarFiltros}
              onExportar={handleExportar}
              mostrarExportar={true}
              tipoReporte="compras"
            />
            <TablaReporte
              datos={datosReporte}
              columnas={columnasCompras}
              titulo="Detalle de Compras"
              loading={loading}
            />
          </Box>
        )}

        {/* Tab 2: Reporte de Ventas */}
        {tabValue === 2 && (
          <Box>
            <FiltrosReporte
              onAplicarFiltros={handleAplicarFiltros}
              onExportar={handleExportar}
              mostrarExportar={true}
              tipoReporte="ventas"
            />
            <TablaReporte
              datos={datosReporte}
              columnas={columnasVentas}
              titulo="Detalle de Ventas"
              loading={loading}
            />
          </Box>
        )}

        {/* Tab 3: Retenciones por Porcentaje */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Reporte de Retenciones por Porcentaje
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Este reporte agrupa las retenciones realizadas por tipo de impuesto y porcentaje de retención.
            </Alert>
            <ReporteRetenciones tipo="porcentaje" />
          </Box>
        )}

        {/* Tab 4: Retenciones por Código */}
        {tabValue === 4 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Reporte de Retenciones por Código
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Este reporte muestra las retenciones agrupadas por código de retención del SRI.
            </Alert>
            <ReporteRetenciones tipo="codigo" />
          </Box>
        )}

        {/* Tab 5: Compras Sin Retenciones */}
        {tabValue === 5 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Compras Sin Retenciones
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Este reporte lista todas las compras que no tienen retenciones asociadas. Revisa si requieren retención.
            </Alert>
            <ReporteRetenciones tipo="sin-retenciones" />
          </Box>
        )}

        {/* Tab 6: Retenciones IVA Recibidas */}
        {tabValue === 6 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Retenciones de IVA Recibidas por Cliente
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Este reporte muestra las retenciones de IVA que tus clientes te han realizado, agrupadas por cliente.
            </Alert>
            <ReporteRetenciones tipo="recibidas-iva" />
          </Box>
        )}

        {/* Tab 7: Retenciones IR Recibidas */}
        {tabValue === 7 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Retenciones de Impuesto a la Renta Recibidas por Cliente
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Este reporte muestra las retenciones de IR que tus clientes te han realizado, agrupadas por cliente.
            </Alert>
            <ReporteRetenciones tipo="recibidas-ir" />
          </Box>
        )}
      </Box>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Reportes;
