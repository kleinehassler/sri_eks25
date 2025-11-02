import axios from '../config/axios';

const API_URL = '/api/usuarios';

const usuarioService = {
  // Obtener todos los usuarios con filtros opcionales
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.empresa_id) params.append('empresa_id', filters.empresa_id);
      if (filters.rol) params.append('rol', filters.rol);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.busqueda) params.append('busqueda', filters.busqueda);

      const response = await axios.get(`${API_URL}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener usuario por ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener usuarios por empresa
  getByEmpresa: async (empresaId) => {
    try {
      const response = await axios.get(`${API_URL}/empresa/${empresaId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear nuevo usuario
  create: async (usuarioData) => {
    try {
      const response = await axios.post(API_URL, usuarioData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar usuario existente
  update: async (id, usuarioData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, usuarioData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar usuario
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cambiar estado de usuario (activar/desactivar)
  cambiarEstado: async (id, nuevoEstado) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/estado`, { estado: nuevoEstado });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cambiar contraseña de usuario
  cambiarPassword: async (id, passwordActual, passwordNueva) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/cambiar-password`, {
        passwordActual,
        passwordNueva
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Resetear contraseña de usuario (por admin)
  resetearPassword: async (id, passwordNueva) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/resetear-password`, {
        passwordNueva
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default usuarioService;
