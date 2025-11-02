import axios from '../config/axios';

const API_URL = '/api/ventas';

const ventaService = {
  // Obtener todas las ventas con filtros opcionales
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.empresaId) params.append('empresaId', filters.empresaId);
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`${API_URL}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener venta por ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear nueva venta
  create: async (ventaData) => {
    try {
      const response = await axios.post(API_URL, ventaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar venta
  update: async (id, ventaData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, ventaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar venta
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Validar venta (cambiar estado a VALIDADO)
  validar: async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/validar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Anular venta (cambiar estado a ANULADO)
  anular: async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/anular`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar permanentemente todas las ventas en estado ANULADO
  eliminarAnulados: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.identificacion_cliente) params.append('identificacion_cliente', filters.identificacion_cliente);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);

      const response = await axios.delete(`${API_URL}/eliminar-anulados?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default ventaService;
