import axios from '../config/axios';

const API_URL = '/ats';

const atsService = {
  // Obtener resumen de transacciones para un periodo
  obtenerResumen: async (empresaId, periodo) => {
    try {
      const response = await axios.get(`${API_URL}/resumen`, {
        params: { empresaId, periodo }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Previsualizar datos del ATS antes de generar
  previsualizar: async (empresaId, periodo) => {
    try {
      const response = await axios.get(`${API_URL}/vista-previa`, {
        params: {
          periodo
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generar archivo ATS
  generar: async (empresaId, periodo) => {
    try {
      const response = await axios.post(`${API_URL}/generar`, {
        empresaId,
        periodo
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Descargar archivo ATS generado
  descargar: async (archivoId, tipoArchivo = 'xml') => {
    try {
      const response = await axios.get(`${API_URL}/descargar/${archivoId}`, {
        params: { tipo: tipoArchivo },
        responseType: 'blob' // Importante para archivos
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener historial de ATS generados
  obtenerHistorial: async (empresaId) => {
    try {
      const response = await axios.get(`${API_URL}/historial`, {
        params: { empresaId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Validar ATS antes de generar
  validar: async (empresaId, periodo) => {
    try {
      const response = await axios.post(`${API_URL}/validar`, {
        empresaId,
        periodo
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default atsService;
