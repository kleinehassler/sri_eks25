const { XMLParser } = require('fast-xml-parser');
const { AppError } = require('../middlewares/errorHandler');
const { formatEstablecimiento, formatPuntoEmision, formatSecuencial } = require('../utils/formatters');
const xsdValidatorService = require('./xsdValidatorService');

/**
 * Servicio para importar y parsear XML de facturas y retenciones electrónicas SRI
 * Incluye validación XSD completa contra esquemas oficiales del SRI
 */
class XmlImportService {
  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: false, // IMPORTANTE: Desactivar conversión automática de valores
      parseTagValue: false, // IMPORTANTE: Mantener todos los valores como strings
      trimValues: true,
      numberParseOptions: {
        leadingZeros: false,
        hex: false,
        skipLike: /./  // No parsear ningún valor como número
      }
    });

    // Indicador de si la validación XSD está disponible
    this.xsdValidationAvailable = xsdValidatorService.xsdValidationAvailable;
  }

  /**
   * Parsear XML de factura electrónica SRI
   * @param {string} xmlContent - Contenido XML de la factura
   * @returns {Object} Datos extraídos de la factura
   */
  parsearFactura(xmlContent) {
    try {
      const parsed = this.parser.parse(xmlContent);

      // El XML puede venir con o sin envoltorio de autorización
      let factura = parsed.factura || parsed.Factura;

      // Si viene con envoltorio de autorización, extraer el comprobante
      if (!factura && parsed.autorizacion) {
        const comprobanteStr = parsed.autorizacion.comprobante;
        if (comprobanteStr) {
          const comprobanteParsed = this.parser.parse(comprobanteStr);
          factura = comprobanteParsed.factura || comprobanteParsed.Factura;
        }
      }

      if (!factura) {
        throw new AppError('El XML no corresponde a una factura electrónica válida', 400);
      }

      const infoTributaria = factura.infoTributaria;
      const infoFactura = factura.infoFactura;
      const detalles = factura.detalles?.detalle || [];

      // Extraer información del proveedor (quien emite la factura)
      // En una COMPRA, el proveedor es el emisor del documento (infoTributaria)
      const datosProveedor = {
        tipo_identificacion: '04', // RUC (siempre es RUC para empresas emisoras)
        identificacion_proveedor: String(infoTributaria.ruc || ''),
        razon_social_proveedor: String(infoTributaria.razonSocial || ''),
        // Formatear establecimiento y punto_emision con ceros a la izquierda (3 dígitos)
        establecimiento: String(infoTributaria.estab || '').padStart(3, '0'),
        punto_emision: String(infoTributaria.ptoEmi || '').padStart(3, '0'),
        secuencial: String(infoTributaria.secuencial || '').padStart(9, '0')
      };

      // Extraer información de la factura
      const datosFactura = {
        fecha_emision: this.convertirFecha(infoFactura.fechaEmision),
        tipo_comprobante: '01', // Factura
        // IMPORTANTE: Convertir explícitamente a String para mantener los 49 dígitos
        numero_autorizacion: String(infoTributaria.claveAcceso || parsed.autorizacion?.numeroAutorizacion || ''),
        total_compra: parseFloat(infoFactura.importeTotal || 0)
      };

      // Calcular bases imponibles y impuestos
      const impuestos = this.calcularImpuestos(infoFactura.totalConImpuestos?.totalImpuesto || []);

      return {
        ...datosProveedor,
        ...datosFactura,
        ...impuestos,
        xml_original: xmlContent
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error al parsear XML de factura: ${error.message}`, 400);
    }
  }

  /**
   * Parsear XML de retención electrónica SRI
   * @param {string} xmlContent - Contenido XML de la retención
   * @returns {Object} Datos extraídos de la retención
   */
  parsearRetencion(xmlContent) {
    try {
      const parsed = this.parser.parse(xmlContent);
      const retencion = parsed.comprobanteRetencion || parsed.ComprobanteRetencion;

      if (!retencion) {
        throw new AppError('El XML no corresponde a una retención electrónica válida', 400);
      }

      const infoTributaria = retencion.infoTributaria;
      const infoCompRetencion = retencion.infoCompRetencion;
      const impuestos = retencion.impuestos?.impuesto || [];

      // Normalizar impuestos a array
      const impuestosArray = Array.isArray(impuestos) ? impuestos : [impuestos];

      // Extraer datos básicos
      const datosBasicos = {
        // Formatear establecimiento, punto_emision y secuencial con ceros a la izquierda
        establecimiento: formatEstablecimiento(infoTributaria.estab),
        punto_emision: formatPuntoEmision(infoTributaria.ptoEmi),
        secuencial: formatSecuencial(infoTributaria.secuencial),
        // IMPORTANTE: Convertir a String para mantener los 49 dígitos
        numero_autorizacion: String(infoTributaria.claveAcceso || ''),
        fecha_emision: this.convertirFecha(infoCompRetencion.fechaEmision),
        tipo_identificacion: this.mapearTipoIdentificacion(infoCompRetencion.identificacionSujetoRetenido),
        identificacion_proveedor: String(infoCompRetencion.identificacionSujetoRetenido || ''),
        razon_social_proveedor: String(infoCompRetencion.razonSocialSujetoRetenido || ''),
        periodo: String(infoCompRetencion.periodoFiscal || '')
      };

      // Procesar cada impuesto retenido
      const retenciones = impuestosArray.map(imp => ({
        ...datosBasicos,
        tipo_impuesto: imp.codigo === '1' ? 'RENTA' : 'IVA',
        codigo_retencion: imp.codigoRetencion,
        base_imponible: parseFloat(imp.baseImponible || 0),
        porcentaje_retencion: parseFloat(imp.porcentajeRetener || 0),
        valor_retenido: parseFloat(imp.valorRetenido || 0),
        numero_comprobante_sustento: `${infoCompRetencion.codDocSustento}-${infoCompRetencion.numDocSustento}`,
        fecha_emision_comprobante_sustento: this.convertirFecha(infoCompRetencion.fechaEmisionDocSustento),
        xml_original: xmlContent
      }));

      return retenciones;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error al parsear XML de retención: ${error.message}`, 400);
    }
  }

  /**
   * Calcular bases imponibles y montos de impuestos
   * @param {Array} totalImpuestos - Array de impuestos del XML
   * @returns {Object} Bases imponibles calculadas
   */
  calcularImpuestos(totalImpuestos) {
    const impuestosArray = Array.isArray(totalImpuestos) ? totalImpuestos : [totalImpuestos];

    const resultado = {
      base_imponible_0: 0,
      base_imponible_iva: 0,
      base_imponible_no_objeto_iva: 0,
      base_imponible_exento_iva: 0,
      monto_iva: 0,
      monto_ice: 0
    };

    impuestosArray.forEach(impuesto => {
      const codigo = String(impuesto.codigo);
      const codigoPorcentaje = String(impuesto.codigoPorcentaje);
      const baseImponible = parseFloat(impuesto.baseImponible || 0);
      const valor = parseFloat(impuesto.valor || 0);

      // IVA (código 2)
      if (codigo === '2') {
        if (codigoPorcentaje === '0') {
          // IVA 0%
          resultado.base_imponible_0 += baseImponible;
        } else if (codigoPorcentaje === '2' || codigoPorcentaje === '3' || codigoPorcentaje === '4') {
          // IVA 12%, 14% o 15% (código 2, 3 o 4)
          resultado.base_imponible_iva += baseImponible;
          resultado.monto_iva += valor;
        } else if (codigoPorcentaje === '6') {
          // No objeto de IVA
          resultado.base_imponible_no_objeto_iva += baseImponible;
        } else if (codigoPorcentaje === '7') {
          // Exento de IVA
          resultado.base_imponible_exento_iva += baseImponible;
        }
      }

      // ICE (código 3)
      if (codigo === '3') {
        resultado.monto_ice += valor;
      }
    });

    // Redondear a 2 decimales
    Object.keys(resultado).forEach(key => {
      resultado[key] = parseFloat(resultado[key].toFixed(2));
    });

    return resultado;
  }

  /**
   * Convertir fecha del formato SRI (DD/MM/YYYY) a formato ISO
   * @param {string} fechaSri - Fecha en formato DD/MM/YYYY
   * @returns {string} Fecha en formato ISO YYYY-MM-DD
   */
  convertirFecha(fechaSri) {
    if (!fechaSri) return null;

    const partes = fechaSri.split('/');
    if (partes.length !== 3) return null;

    const [dia, mes, anio] = partes;
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  /**
   * Mapear tipo de identificación del SRI a código interno
   * @param {string} tipoDoc - Tipo de documento SRI
   * @returns {string} Código de tipo de identificación
   */
  mapearTipoIdentificacion(tipoDoc) {
    const mapeo = {
      '04': '04', // RUC
      '05': '05', // Cédula
      '06': '06', // Pasaporte
      '07': '07', // Consumidor final
      '08': '08'  // Identificación del exterior
    };

    return mapeo[tipoDoc] || '04';
  }

  /**
   * Validar estructura básica de XML
   * @param {string} xmlContent - Contenido XML
   * @returns {boolean} True si es válido
   */
  validarXML(xmlContent) {
    if (!xmlContent || typeof xmlContent !== 'string') {
      throw new AppError('El contenido XML es inválido', 400);
    }

    if (!xmlContent.trim().startsWith('<?xml') && !xmlContent.trim().startsWith('<')) {
      throw new AppError('El archivo no tiene formato XML válido', 400);
    }

    return true;
  }

  /**
   * Validar XML contra esquema XSD del SRI
   * @param {string} xmlContent - Contenido XML
   * @returns {Promise<Object>} Resultado de validación XSD
   */
  async validarContraXSD(xmlContent) {
    try {
      // Primero validar que sea XML válido
      this.validarXML(xmlContent);

      // Ejecutar validación XSD completa
      const resultado = await xsdValidatorService.validarXml(xmlContent);

      return {
        valido: resultado.valido,
        errores: resultado.errores || [],
        advertencias: resultado.advertencias || [],
        metodo: resultado.metodo || 'básica',
        mensaje: resultado.mensaje,
        xsdDisponible: this.xsdValidationAvailable
      };
    } catch (error) {
      console.error('Error en validación XSD:', error);
      return {
        valido: false,
        errores: [{
          tipo: 'ERROR_VALIDACION',
          mensaje: 'Error al validar XML',
          detalle: error.message
        }],
        advertencias: [],
        metodo: 'error',
        mensaje: 'Error en el proceso de validación',
        xsdDisponible: this.xsdValidationAvailable
      };
    }
  }

  /**
   * Parsear y validar XML de factura con validación XSD
   * @param {string} xmlContent - Contenido XML de la factura
   * @param {boolean} validarXSD - Si se debe realizar validación XSD (default: true)
   * @returns {Promise<Object>} Datos extraídos y resultado de validación
   */
  async parsearYValidarFactura(xmlContent, validarXSD = true) {
    let resultadoValidacion = {
      valido: true,
      errores: [],
      advertencias: [],
      metodo: 'sin validación XSD',
      mensaje: 'XML procesado sin validación XSD'
    };

    // Validar contra XSD si está habilitado
    if (validarXSD) {
      resultadoValidacion = await this.validarContraXSD(xmlContent);

      // Si hay errores críticos de XSD, no continuar con el parseo
      if (!resultadoValidacion.valido && resultadoValidacion.errores.length > 0) {
        const erroresCriticos = resultadoValidacion.errores.filter(e =>
          e.tipo === 'XSD_VALIDATION' || e.tipo === 'SINTAXIS'
        );

        if (erroresCriticos.length > 0) {
          return {
            datos: null,
            validacion: resultadoValidacion,
            parseado: false
          };
        }
      }
    }

    // Parsear los datos
    try {
      const datos = this.parsearFactura(xmlContent);

      return {
        datos,
        validacion: resultadoValidacion,
        parseado: true
      };
    } catch (error) {
      // Error en el parseo
      resultadoValidacion.errores.push({
        tipo: 'ERROR_PARSEO',
        mensaje: 'Error al extraer datos del XML',
        detalle: error.message
      });

      return {
        datos: null,
        validacion: resultadoValidacion,
        parseado: false
      };
    }
  }

  /**
   * Parsear y validar XML de retención con validación XSD
   * @param {string} xmlContent - Contenido XML de la retención
   * @param {boolean} validarXSD - Si se debe realizar validación XSD (default: true)
   * @returns {Promise<Object>} Datos extraídos y resultado de validación
   */
  async parsearYValidarRetencion(xmlContent, validarXSD = true) {
    let resultadoValidacion = {
      valido: true,
      errores: [],
      advertencias: [],
      metodo: 'sin validación XSD',
      mensaje: 'XML procesado sin validación XSD'
    };

    // Validar contra XSD si está habilitado
    if (validarXSD) {
      resultadoValidacion = await this.validarContraXSD(xmlContent);

      // Si hay errores críticos de XSD, no continuar con el parseo
      if (!resultadoValidacion.valido && resultadoValidacion.errores.length > 0) {
        const erroresCriticos = resultadoValidacion.errores.filter(e =>
          e.tipo === 'XSD_VALIDATION' || e.tipo === 'SINTAXIS'
        );

        if (erroresCriticos.length > 0) {
          return {
            datos: null,
            validacion: resultadoValidacion,
            parseado: false
          };
        }
      }
    }

    // Parsear los datos
    try {
      const datos = this.parsearRetencion(xmlContent);

      return {
        datos,
        validacion: resultadoValidacion,
        parseado: true
      };
    } catch (error) {
      // Error en el parseo
      resultadoValidacion.errores.push({
        tipo: 'ERROR_PARSEO',
        mensaje: 'Error al extraer datos del XML',
        detalle: error.message
      });

      return {
        datos: null,
        validacion: resultadoValidacion,
        parseado: false
      };
    }
  }

  /**
   * Parsear XML de factura electrónica SRI para VENTA (emisor = empresa, comprador = cliente)
   * @param {string} xmlContent - Contenido XML de la factura
   * @returns {Object} Datos extraídos de la factura para venta
   */
  parsearFacturaVenta(xmlContent) {
    try {
      const parsed = this.parser.parse(xmlContent);

      // El XML puede venir con o sin envoltorio de autorización
      let factura = parsed.factura || parsed.Factura;

      // Si viene con envoltorio de autorización, extraer el comprobante
      if (!factura && parsed.autorizacion) {
        const comprobanteStr = parsed.autorizacion.comprobante;
        if (comprobanteStr) {
          const comprobanteParsed = this.parser.parse(comprobanteStr);
          factura = comprobanteParsed.factura || comprobanteParsed.Factura;
        }
      }

      if (!factura) {
        throw new AppError('El XML no corresponde a una factura electrónica válida', 400);
      }

      const infoTributaria = factura.infoTributaria;
      const infoFactura = factura.infoFactura;
      const detalles = factura.detalles?.detalle || [];

      // Extraer información del CLIENTE (quien compra)
      // En una VENTA, el cliente es el comprador del documento (infoFactura)
      const datosCliente = {
        tipo_identificacion_cliente: this.mapearTipoIdentificacion(infoFactura.tipoIdentificacionComprador),
        identificacion_cliente: String(infoFactura.identificacionComprador || ''),
        razon_social_cliente: String(infoFactura.razonSocialComprador || ''),
      };

      // Extraer información del comprobante (emitido por la empresa)
      const datosComprobante = {
        fecha_emision: this.convertirFecha(infoFactura.fechaEmision),
        tipo_comprobante: '01', // Factura
        // Formatear establecimiento y punto_emision con ceros a la izquierda (3 dígitos)
        establecimiento: String(infoTributaria.estab || '').padStart(3, '0'),
        punto_emision: String(infoTributaria.ptoEmi || '').padStart(3, '0'),
        secuencial: String(infoTributaria.secuencial || '').padStart(9, '0'),
        // IMPORTANTE: Convertir explícitamente a String para mantener los 49 dígitos
        numero_autorizacion: String(infoTributaria.claveAcceso || parsed.autorizacion?.numeroAutorizacion || ''),
        total_venta: parseFloat(infoFactura.importeTotal || 0)
      };

      // Calcular bases imponibles y impuestos
      const impuestos = this.calcularImpuestos(infoFactura.totalConImpuestos?.totalImpuesto || []);

      // Extraer forma de pago (si existe)
      const pagos = factura.pagos?.pago;
      let formaPago = null;
      if (pagos) {
        const pagoArray = Array.isArray(pagos) ? pagos : [pagos];
        if (pagoArray.length > 0 && pagoArray[0].formaPago) {
          formaPago = String(pagoArray[0].formaPago).padStart(2, '0');
        }
      }

      return {
        ...datosCliente,
        ...datosComprobante,
        ...impuestos,
        forma_pago: formaPago,
        xml_original: xmlContent
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error al parsear XML de factura para venta: ${error.message}`, 400);
    }
  }

  /**
   * Parsear y validar XML de factura de venta con validación XSD
   * @param {string} xmlContent - Contenido XML de la factura
   * @param {boolean} validarXSD - Si se debe realizar validación XSD (default: true)
   * @returns {Promise<Object>} Datos extraídos y resultado de validación
   */
  async parsearYValidarFacturaVenta(xmlContent, validarXSD = true) {
    let resultadoValidacion = {
      valido: true,
      errores: [],
      advertencias: [],
      metodo: 'sin validación XSD',
      mensaje: 'XML procesado sin validación XSD'
    };

    // Validar contra XSD si está habilitado
    if (validarXSD) {
      resultadoValidacion = await this.validarContraXSD(xmlContent);

      // Si hay errores críticos de XSD, no continuar con el parseo
      if (!resultadoValidacion.valido && resultadoValidacion.errores.length > 0) {
        const erroresCriticos = resultadoValidacion.errores.filter(e =>
          e.tipo === 'XSD_VALIDATION' || e.tipo === 'SINTAXIS'
        );

        if (erroresCriticos.length > 0) {
          return {
            datos: null,
            validacion: resultadoValidacion,
            parseado: false
          };
        }
      }
    }

    // Parsear los datos
    try {
      const datos = this.parsearFacturaVenta(xmlContent);

      return {
        datos,
        validacion: resultadoValidacion,
        parseado: true
      };
    } catch (error) {
      // Error en el parseo
      resultadoValidacion.errores.push({
        tipo: 'ERROR_PARSEO',
        mensaje: 'Error al extraer datos del XML',
        detalle: error.message
      });

      return {
        datos: null,
        validacion: resultadoValidacion,
        parseado: false
      };
    }
  }

  /**
   * Detectar tipo de comprobante del XML
   * @param {string} xmlContent - Contenido XML
   * @returns {string} 'FACTURA' | 'RETENCION' | 'DESCONOCIDO'
   */
  detectarTipoComprobante(xmlContent) {
    if (xmlContent.includes('<factura') || xmlContent.includes('<Factura')) {
      return 'FACTURA';
    }

    if (xmlContent.includes('<comprobanteRetencion') || xmlContent.includes('<ComprobanteRetencion')) {
      return 'RETENCION';
    }

    return 'DESCONOCIDO';
  }
}

module.exports = new XmlImportService();
