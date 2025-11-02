const { XMLParser } = require('fast-xml-parser');
const fs = require('fs').promises;
const path = require('path');
const AppError = require('../utils/AppError');
const { formatEstablecimiento, formatPuntoEmision, formatSecuencial } = require('../utils/formatters');

/**
 * Servicio para parsear XML de facturas electrónicas del SRI
 * Basado en el esquema Factura_V2.1.0.xsd
 */
class XMLParserService {
  constructor() {
    // Configuración del parser XML
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: false, // Desactivar conversión automática de valores
      parseTagValue: false, // IMPORTANTE: No parsear valores de etiquetas como números
      trimValues: true,
      cdataPropName: '__cdata', // Usar nombre especial para CDATA
      preserveOrder: false,
      numberParseOptions: {
        leadingZeros: false,
        hex: false,
        skipLike: /./  // No parsear ningún valor como número
      }
    });
  }

  /**
   * Parsear XML de factura electrónica
   * @param {string} xmlContent - Contenido del archivo XML
   * @returns {Object} Datos extraídos de la factura
   */
  async parsearFacturaElectronica(xmlContent) {
    try {
      // Parsear XML principal
      const xmlObj = this.parser.parse(xmlContent);

      let factura = null;

      // Caso 1: XML de autorización del SRI (contiene CDATA con la factura)
      if (xmlObj.autorizacion || xmlObj.Autorizacion) {
        const autorizacion = xmlObj.autorizacion || xmlObj.Autorizacion;

        // Extraer el comprobante del CDATA
        let comprobanteXml = autorizacion.comprobante;

        if (!comprobanteXml) {
          throw new AppError('El XML de autorización no contiene un comprobante', 400);
        }

        // El CDATA puede venir como:
        // 1. Objeto con propiedad __cdata
        // 2. String directo
        // 3. Objeto con #text
        let xmlString = null;

        if (typeof comprobanteXml === 'object') {
          xmlString = comprobanteXml.__cdata || comprobanteXml['#text'] || comprobanteXml;
        } else if (typeof comprobanteXml === 'string') {
          xmlString = comprobanteXml;
        }

        if (typeof xmlString === 'string') {
          const comprobanteObj = this.parser.parse(xmlString);
          factura = comprobanteObj.factura || comprobanteObj.Factura;
        } else {
          factura = comprobanteXml.factura || comprobanteXml.Factura;
        }
      }
      // Caso 2: XML directo de factura
      else {
        factura = xmlObj.factura || xmlObj.Factura;
      }

      if (!factura) {
        throw new AppError('El XML no contiene una factura válida', 400);
      }

      // Extraer datos
      const datosExtraidos = this.extraerDatosFactura(factura);

      return datosExtraidos;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error al parsear XML: ${error.message}`, 400);
    }
  }

  /**
   * Extraer datos de la factura del XML parseado
   * @param {Object} factura - Objeto factura del XML
   * @returns {Object} Datos formateados para el modelo Compra
   */
  extraerDatosFactura(factura) {
    const infoTributaria = factura.infoTributaria;
    const infoFactura = factura.infoFactura;
    const detalles = factura.detalles?.detalle;
    const pagos = factura.pagos?.pago;

    if (!infoTributaria || !infoFactura) {
      throw new AppError('XML de factura incompleto: faltan datos tributarios o de factura', 400);
    }

    // Calcular bases imponibles y totales
    const totales = this.calcularTotalesFactura(infoFactura);

    // Determinar tipo de proveedor basado en RUC
    const tipoProveedor = this.determinarTipoProveedor(infoTributaria.ruc);

    // Extraer forma de pago (tomar el primer pago si hay múltiples)
    let formaPago = null;
    if (pagos) {
      const pagoArray = Array.isArray(pagos) ? pagos : [pagos];
      if (pagoArray.length > 0 && pagoArray[0].formaPago) {
        formaPago = String(pagoArray[0].formaPago).padStart(2, '0');
      }
    }

    // Extraer datos formateados
    const datosCompra = {
      // Datos del proveedor
      tipo_proveedor: tipoProveedor,
      tipo_identificacion: '04', // RUC por defecto para facturas electrónicas
      identificacion_proveedor: String(infoTributaria.ruc || '').padStart(13, '0'),
      razon_social_proveedor: String(infoTributaria.razonSocial || ''),

      // Datos del comprobante
      tipo_comprobante: '01', // Factura
      establecimiento: formatEstablecimiento(infoTributaria.estab || ''),
      punto_emision: formatPuntoEmision(infoTributaria.ptoEmi || ''),
      secuencial: formatSecuencial(infoTributaria.secuencial || ''),
      // Número de autorización ya viene como string de 49 caracteres, no agregar padding
      numero_autorizacion: String(factura.infoTributaria?.claveAcceso || ''),

      // Fechas
      fecha_emision: this.convertirFecha(infoFactura.fechaEmision),
      fecha_registro: this.convertirFecha(infoFactura.fechaEmision), // Por defecto la misma

      // Periodo (se debe calcular desde la fecha de emisión)
      periodo: this.calcularPeriodo(infoFactura.fechaEmision),

      // Código de sustento (por defecto 01 - Crédito Tributario)
      codigo_sustento: '01',

      // Totales y bases imponibles
      base_imponible_iva: totales.baseImponibleIva,
      base_imponible_0: totales.baseImponible0,
      base_imponible_no_objeto_iva: totales.baseNoObjetoIva,
      base_imponible_exento_iva: totales.baseExentaIva,
      monto_iva: totales.montoIva,
      monto_ice: totales.montoIce,
      total_compra: parseFloat(infoFactura.importeTotal || 0),

      // Propina (si existe)
      propina: parseFloat(infoFactura.propina || 0),

      // Forma de pago y país
      forma_pago: formaPago,
      pais_pago: '593', // Ecuador por defecto (código ISO 3166)

      // Información adicional extraída
      _xmlInfo: {
        dirEstablecimiento: infoTributaria.dirMatriz,
        nombreComercial: infoTributaria.nombreComercial,
        ambiente: infoTributaria.ambiente,
        tipoEmision: infoTributaria.tipoEmision,
        formaPago: infoFactura.formaPago,
        totalSinImpuestos: parseFloat(infoFactura.totalSinImpuestos || 0),
        totalDescuento: parseFloat(infoFactura.totalDescuento || 0)
      }
    };

    return datosCompra;
  }

  /**
   * Calcular totales de la factura desde totalConImpuestos
   * @param {Object} infoFactura - Información de la factura
   * @returns {Object} Totales calculados
   */
  calcularTotalesFactura(infoFactura) {
    const totales = {
      baseImponibleIva: 0,
      baseImponible0: 0,
      baseNoObjetoIva: 0,
      baseExentaIva: 0,
      montoIva: 0,
      montoIce: 0
    };

    // Extraer totalConImpuestos
    const totalConImpuestos = infoFactura.totalConImpuestos?.totalImpuesto;

    if (!totalConImpuestos) {
      return totales;
    }

    // Convertir a array si es un solo elemento
    const impuestos = Array.isArray(totalConImpuestos) ? totalConImpuestos : [totalConImpuestos];

    impuestos.forEach(impuesto => {
      const codigo = impuesto.codigo?.toString();
      const codigoPorcentaje = impuesto.codigoPorcentaje?.toString();
      const baseImponible = parseFloat(impuesto.baseImponible || 0);
      const valor = parseFloat(impuesto.valor || 0);

      // Código 2 = IVA
      if (codigo === '2') {
        if (codigoPorcentaje === '0') {
          // IVA 0%
          totales.baseImponible0 += baseImponible;
        } else if (codigoPorcentaje === '2' || codigoPorcentaje === '3' || codigoPorcentaje === '4') {
          // IVA 12%, 14%, 15%
          totales.baseImponibleIva += baseImponible;
          totales.montoIva += valor;
        } else if (codigoPorcentaje === '6') {
          // No objeto de IVA
          totales.baseNoObjetoIva += baseImponible;
        } else if (codigoPorcentaje === '7') {
          // Exento de IVA
          totales.baseExentaIva += baseImponible;
        }
      }
      // Código 3 = ICE
      else if (codigo === '3') {
        totales.montoIce += valor;
      }
    });

    // Redondear a 2 decimales
    Object.keys(totales).forEach(key => {
      totales[key] = parseFloat(totales[key].toFixed(2));
    });

    return totales;
  }

  /**
   * Determinar tipo de proveedor según RUC
   * @param {string} ruc - RUC del proveedor
   * @returns {string} Código de tipo de proveedor (01, 02, 03)
   */
  determinarTipoProveedor(ruc) {
    if (!ruc) return '02'; // Por defecto Sociedad

    // Convertir a string por si viene como número del parser XML
    const rucString = String(ruc);

    // RUC de sociedad termina en 001
    if (rucString.endsWith('001')) {
      return '02'; // Sociedad
    }

    // RUC de persona natural termina en otros dígitos
    return '01'; // Persona Natural
  }

  /**
   * Convertir fecha del formato DD/MM/YYYY al formato ISO YYYY-MM-DD
   * @param {string} fecha - Fecha en formato DD/MM/YYYY
   * @returns {string} Fecha en formato ISO YYYY-MM-DD
   */
  convertirFecha(fecha) {
    if (!fecha) return null;

    try {
      // Formato del SRI: DD/MM/YYYY
      const partes = fecha.split('/');
      if (partes.length === 3) {
        const [dia, mes, anio] = partes;
        return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Calcular periodo MM/YYYY desde fecha de emisión
   * @param {string} fecha - Fecha en formato DD/MM/YYYY
   * @returns {string} Periodo en formato MM/YYYY
   */
  calcularPeriodo(fecha) {
    if (!fecha) return null;

    try {
      const partes = fecha.split('/');
      if (partes.length === 3) {
        const [dia, mes, anio] = partes;
        return `${mes.padStart(2, '0')}/${anio}`;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validar estructura básica del XML de factura
   * @param {string} xmlContent - Contenido XML
   * @returns {Object} Resultado de validación
   */
  async validarEstructuraXML(xmlContent) {
    try {
      const xmlObj = this.parser.parse(xmlContent);

      const validacion = {
        valido: true,
        errores: [],
        advertencias: []
      };

      let factura = null;

      // Caso 1: XML de autorización del SRI
      if (xmlObj.autorizacion || xmlObj.Autorizacion) {
        const autorizacion = xmlObj.autorizacion || xmlObj.Autorizacion;

        // Verificar que tenga comprobante
        if (!autorizacion.comprobante) {
          validacion.valido = false;
          validacion.errores.push('El XML de autorización no contiene un comprobante');
          return validacion;
        }

        // Extraer el XML del comprobante del CDATA
        let comprobanteXml = autorizacion.comprobante;
        let xmlString = null;

        if (typeof comprobanteXml === 'object') {
          xmlString = comprobanteXml.__cdata || comprobanteXml['#text'] || comprobanteXml;
        } else if (typeof comprobanteXml === 'string') {
          xmlString = comprobanteXml;
        }

        if (typeof xmlString === 'string') {
          try {
            const comprobanteObj = this.parser.parse(xmlString);
            factura = comprobanteObj.factura || comprobanteObj.Factura;
          } catch (error) {
            validacion.valido = false;
            validacion.errores.push('Error al parsear el comprobante dentro del XML de autorización');
            return validacion;
          }
        } else {
          factura = comprobanteXml.factura || comprobanteXml.Factura;
        }
      }
      // Caso 2: XML directo de factura
      else {
        factura = xmlObj.factura || xmlObj.Factura;
      }

      if (!factura) {
        validacion.valido = false;
        validacion.errores.push('El XML no contiene un elemento <factura>');
        return validacion;
      }

      // Validar secciones requeridas
      if (!factura.infoTributaria) {
        validacion.valido = false;
        validacion.errores.push('Falta sección <infoTributaria>');
      }

      if (!factura.infoFactura) {
        validacion.valido = false;
        validacion.errores.push('Falta sección <infoFactura>');
      }

      // Validar campos críticos
      if (factura.infoTributaria) {
        if (!factura.infoTributaria.ruc) {
          validacion.advertencias.push('Falta RUC del emisor');
        }
        if (!factura.infoTributaria.razonSocial) {
          validacion.advertencias.push('Falta razón social del emisor');
        }
      }

      if (factura.infoFactura) {
        if (!factura.infoFactura.fechaEmision) {
          validacion.errores.push('Falta fecha de emisión');
          validacion.valido = false;
        }
        if (!factura.infoFactura.importeTotal) {
          validacion.advertencias.push('Falta importe total');
        }
      }

      return validacion;
    } catch (error) {
      return {
        valido: false,
        errores: [`Error al parsear XML: ${error.message}`],
        advertencias: []
      };
    }
  }

  /**
   * Guardar archivo XML en el sistema de archivos
   * @param {Buffer} fileBuffer - Buffer del archivo
   * @param {string} filename - Nombre del archivo
   * @returns {string} Ruta relativa del archivo guardado
   */
  async guardarArchivoXML(fileBuffer, filename) {
    try {
      // Crear directorio si no existe
      const uploadDir = path.join(__dirname, '../../uploads/xml');
      await fs.mkdir(uploadDir, { recursive: true });

      // Generar nombre único
      const timestamp = Date.now();
      const nombreArchivo = `${timestamp}_${filename}`;
      const rutaCompleta = path.join(uploadDir, nombreArchivo);

      // Guardar archivo
      await fs.writeFile(rutaCompleta, fileBuffer);

      // Retornar ruta relativa
      return `uploads/xml/${nombreArchivo}`;
    } catch (error) {
      throw new AppError(`Error al guardar archivo XML: ${error.message}`, 500);
    }
  }
}

module.exports = new XMLParserService();
