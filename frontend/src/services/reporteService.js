import axios from '../config/axios';

const API_URL = '/api/reportes';

const reporteService = {
  // Resumen general
  getResumenGeneral: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);

      const response = await axios.get(`${API_URL}/resumen?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reporte de compras
  getReporteCompras: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.tipo_proveedor) params.append('tipo_proveedor', filters.tipo_proveedor);

      const response = await axios.get(`${API_URL}/compras?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reporte de ventas
  getReporteVentas: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.tipo_comprobante) params.append('tipo_comprobante', filters.tipo_comprobante);

      const response = await axios.get(`${API_URL}/ventas?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Estadísticas por periodo (para gráficos)
  getEstadisticasPorPeriodo: async (periodo) => {
    try {
      const response = await axios.get(`${API_URL}/periodo/${periodo}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener estadísticas para el Dashboard
  getEstadisticasDashboard: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Exportar a Excel
  exportarExcel: async (tipoReporte, filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.tipo_proveedor) params.append('tipo_proveedor', filters.tipo_proveedor);
      if (filters.tipo_comprobante) params.append('tipo_comprobante', filters.tipo_comprobante);

      const endpoint = tipoReporte === 'compras' ? 'compras' : 'ventas';

      const response = await axios.get(`${API_URL}/exportar/${endpoint}?${params.toString()}`, {
        responseType: 'blob' // Importante para recibir el archivo
      });

      return response.data;
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      throw error.response?.data || error.message;
    }
  },

  // Exportar a PDF
  exportarPDF: async (tipoReporte, filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.tipo_proveedor) params.append('tipo_proveedor', filters.tipo_proveedor);
      if (filters.tipo_comprobante) params.append('tipo_comprobante', filters.tipo_comprobante);

      const endpoint = tipoReporte === 'compras' ? 'compras' : 'ventas';

      const response = await axios.get(`${API_URL}/exportar/pdf/${endpoint}?${params.toString()}`, {
        responseType: 'blob' // Importante para recibir el archivo
      });

      return response.data;
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      throw error.response?.data || error.message;
    }
  },

  // Reportes de Retenciones - Compras
  getReporteRetencionesPorPorcentaje: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.tipo_impuesto) params.append('tipo_impuesto', filters.tipo_impuesto);

      const response = await axios.get(`${API_URL}/retenciones/porcentaje?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getReporteRetencionesPorCodigo: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.tipo_impuesto) params.append('tipo_impuesto', filters.tipo_impuesto);

      const response = await axios.get(`${API_URL}/retenciones/codigo?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getReporteComprasSinRetenciones: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
      if (filters.estado) params.append('estado', filters.estado);

      const response = await axios.get(`${API_URL}/compras/sin-retenciones?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reportes de Retenciones - Ventas
  getReporteRetencionesRecibidasIVA: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
      if (filters.estado) params.append('estado', filters.estado);

      const response = await axios.get(`${API_URL}/retenciones-recibidas/iva?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getReporteRetencionesRecibidasIR: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
      if (filters.estado) params.append('estado', filters.estado);

      const response = await axios.get(`${API_URL}/retenciones-recibidas/ir?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Exportar Reportes de Retenciones
  exportarRetencionesExcel: async (tipoReporte, filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.tipo_impuesto) params.append('tipo_impuesto', filters.tipo_impuesto);

      let endpoint;
      switch(tipoReporte) {
        case 'porcentaje':
          endpoint = 'retenciones/porcentaje';
          break;
        case 'codigo':
          endpoint = 'retenciones/codigo';
          break;
        case 'sin-retenciones':
          endpoint = 'compras/sin-retenciones';
          break;
        case 'recibidas-iva':
          endpoint = 'retenciones-recibidas/iva';
          break;
        case 'recibidas-ir':
          endpoint = 'retenciones-recibidas/ir';
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      const response = await axios.get(`${API_URL}/exportar/${endpoint}?${params.toString()}`, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error) {
      console.error('Error al exportar retenciones a Excel:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default reporteService;
