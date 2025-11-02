import axios from '../config/axios';

const API_URL = '/api/empresas';

const empresaService = {
  // Obtener todas las empresas
  getAll: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener una empresa por ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear nueva empresa
  create: async (empresaData) => {
    try {
      const response = await axios.post(API_URL, empresaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar empresa existente
  update: async (id, empresaData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, empresaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar empresa
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cambiar estado de empresa (activar/desactivar)
  cambiarEstado: async (id, nuevoEstado) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/estado`, { estado: nuevoEstado });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default empresaService;
