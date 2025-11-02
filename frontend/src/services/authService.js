import axios from '../config/axios';

const API_URL = '/api/auth';

const authService = {
  // Login de usuario
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Registrar nuevo usuario (requiere autenticación - solo admin)
  registrar: async (usuarioData) => {
    try {
      const response = await axios.post(`${API_URL}/registrar`, usuarioData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener perfil del usuario autenticado
  getPerfil: async () => {
    try {
      const response = await axios.get(`${API_URL}/perfil`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cambiar contraseña del usuario autenticado
  cambiarPassword: async (passwordActual, passwordNueva) => {
    try {
      const response = await axios.post(`${API_URL}/cambiar-password`, {
        passwordActual,
        passwordNueva
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Refrescar token de acceso
  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default authService;
