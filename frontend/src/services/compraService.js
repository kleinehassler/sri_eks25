import axios from '../config/axios';

const API_URL = '/api/compras';

const compraService = {
  // Obtener todas las compras con filtros opcionales
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.empresaId) params.append('empresaId', filters.empresaId);
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.proveedorRuc) params.append('proveedorRuc', filters.proveedorRuc);

      const response = await axios.get(`${API_URL}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener resumen de compras
  getResumen: async (empresaId, periodo) => {
    try {
      const params = new URLSearchParams();
      if (empresaId) params.append('empresaId', empresaId);
      if (periodo) params.append('periodo', periodo);

      const response = await axios.get(`${API_URL}/resumen?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener una compra por ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear nueva compra
  create: async (compraData) => {
    try {
      const response = await axios.post(API_URL, compraData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar compra existente
  update: async (id, compraData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, compraData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar compra
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Validar compra
  validar: async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/validar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Validar múltiples compras en estado BORRADOR
  validarMasivo: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.identificacion_proveedor) params.append('identificacion_proveedor', filters.identificacion_proveedor);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);

      const response = await axios.post(`${API_URL}/validar-masivo?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar permanentemente todas las compras en estado ANULADO
  eliminarAnulados: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.identificacion_proveedor) params.append('identificacion_proveedor', filters.identificacion_proveedor);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);

      const response = await axios.delete(`${API_URL}/eliminar-anulados?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default compraService;
