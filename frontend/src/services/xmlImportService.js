import axios from '../config/axios';

const API_URL_XML = '/api/xml';
const API_URL_COMPRAS = '/api/compras';

const xmlImportService = {
  /**
   * Importar XML de factura electrónica (nueva implementación)
   * @param {File} file - Archivo XML
   * @param {Object} additionalData - Datos adicionales (codigo_sustento, tipo_proveedor)
   * @returns {Promise<Object>} Compra creada
   */
  importarXML: async (file, additionalData = {}) => {
    try {
      const formData = new FormData();
      formData.append('xmlFile', file);

      // Agregar datos adicionales al FormData
      if (additionalData.codigo_sustento) {
        formData.append('codigo_sustento', additionalData.codigo_sustento);
      }
      if (additionalData.tipo_proveedor) {
        formData.append('tipo_proveedor', additionalData.tipo_proveedor);
      }

      const response = await axios.post(`${API_URL_XML}/importar-factura`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error al importar XML:', error);
      throw {
        mensaje: error.response?.data?.mensaje || error.response?.data?.error || 'Error al importar el archivo XML',
        detalles: error.response?.data?.errores || error.response?.data?.detalles || [],
      };
    }
  },

  /**
   * Validar archivo XML antes de importar
   * @param {File} file - Archivo a validar
   * @returns {Object} Resultado de validación
   */
  validarArchivo: (file) => {
    const errores = [];

    // Validar que sea un archivo
    if (!file) {
      errores.push('No se ha seleccionado ningún archivo');
      return { valido: false, errores };
    }

    // Validar extensión
    if (!file.name.toLowerCase().endsWith('.xml')) {
      errores.push('El archivo debe tener extensión .xml');
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errores.push('El archivo no debe superar los 5MB');
    }

    // Validar tipo MIME
    if (file.type && !['text/xml', 'application/xml'].includes(file.type)) {
      errores.push('El archivo debe ser de tipo XML');
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  },

  /**
   * Previsualizar datos de un archivo XML sin guardarlo
   * @param {File} file - Archivo XML
   * @param {string} tipoDocumento - 'factura' o 'retencion'
   * @returns {Promise<Object>} Datos extraídos del XML
   */
  previsualizar: async (file, tipoDocumento = 'factura') => {
    try {
      const formData = new FormData();
      formData.append('xmlFile', file);

      const endpoint = tipoDocumento === 'factura'
        ? `${API_URL_XML}/previsualizar`
        : `${API_URL_XML}/previsualizar-retencion`;

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error al previsualizar XML:', error);
      throw {
        mensaje: error.response?.data?.mensaje || error.response?.data?.error || 'Error al procesar el archivo XML',
        detalles: error.response?.data?.errores || error.response?.data?.detalles || [],
      };
    }
  },

  // Importar factura XML (método legacy - mantener compatibilidad)
  importarFactura: async (file, additionalData = {}) => {
    try {
      const result = await xmlImportService.importarXML(file, additionalData);
      return result;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Importar retención XML
  importarRetencion: async (file, additionalData = {}) => {
    try {
      const formData = new FormData();
      formData.append('xmlFile', file);

      // Agregar datos adicionales si existen
      if (additionalData.compra_id) {
        formData.append('compra_id', additionalData.compra_id);
      }

      const response = await axios.post(`${API_URL_XML}/importar-retencion`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Importar múltiples archivos XML
  importarMultiple: async (files, additionalData = {}, tipoDocumento = 'factura') => {
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        console.log(`Importando archivo: ${file.name}`);
        let result;
        if (tipoDocumento === 'factura') {
          result = await xmlImportService.importarFactura(file, additionalData);
          console.log(`✓ ${file.name} importado correctamente`);
        } else {
          result = await xmlImportService.importarRetencion(file, additionalData);
          console.log(`✓ ${file.name} importado correctamente`);
        }
        results.push({
          file: file.name,
          success: true,
          data: result.data || result
        });
      } catch (error) {
        console.error(`✗ Error al importar ${file.name}:`, error);
        const errorMessage = error.mensaje ||
                            error.message ||
                            error.error ||
                            'Error desconocido al importar';
        errors.push({
          file: file.name,
          success: false,
          error: errorMessage
        });
      }
    }

    console.log(`Importación completada: ${results.length} exitosos, ${errors.length} con errores`);
    return { results, errors };
  }
};

export default xmlImportService;
