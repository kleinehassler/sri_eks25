import axios from '../config/axios';

const API_URL = '/codigos-retencion';

const codigoRetencionService = {
  // Obtener todos los códigos de retención con paginación y filtros
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.busqueda) params.append('busqueda', filters.busqueda);
      if (filters.pagina) params.append('pagina', filters.pagina);
      if (filters.limite) params.append('limite', filters.limite);

      const response = await axios.get(`${API_URL}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener códigos activos (sin paginación)
  getActivos: async () => {
    try {
      const response = await axios.get(`${API_URL}/activos`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener un código de retención por ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear nuevo código de retención
  create: async (codigoData) => {
    try {
      const response = await axios.post(API_URL, codigoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar código de retención existente
  update: async (id, codigoData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, codigoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar código de retención
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cambiar estado del código de retención (activar/desactivar)
  cambiarEstado: async (id, nuevoEstado) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/estado`, { estado: nuevoEstado });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default codigoRetencionService;
