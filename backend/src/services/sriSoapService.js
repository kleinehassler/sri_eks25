/**
 * Servicio para comunicación SOAP con el SRI
 * Maneja la descarga de comprobantes electrónicos desde el web service del SRI
 */

const soap = require('soap');
const xml2js = require('xml2js');
const logger = require('../config/logger');

// URLs del WSDL según ambiente
const WSDL_URLS = {
  PRODUCCION: 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl',
  PRUEBAS: 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl'
};

/**
 * Descarga un comprobante electrónico del SRI usando la clave de acceso
 * @param {string} claveAcceso - Clave de acceso del comprobante (49 dígitos)
 * @param {string} ambiente - Ambiente (PRODUCCION o PRUEBAS), default: PRODUCCION
 * @returns {Promise<Object>} Objeto con el XML y datos parseados
 */
async function descargarComprobante(claveAcceso, ambiente = 'PRODUCCION') {
  try {
    // Validar clave de acceso (49 dígitos)
    if (!claveAcceso || claveAcceso.length !== 49 || !/^\d+$/.test(claveAcceso)) {
      throw new Error('Clave de acceso inválida. Debe contener exactamente 49 dígitos.');
    }

    // Seleccionar URL del WSDL según ambiente
    const wsdlUrl = WSDL_URLS[ambiente] || WSDL_URLS.PRODUCCION;

    logger.info(`Descargando comprobante del SRI. Clave: ${claveAcceso}, Ambiente: ${ambiente}`);

    // Crear cliente SOAP
    const client = await soap.createClientAsync(wsdlUrl, {
      forceSoap12Headers: false,
      wsdl_options: {
        timeout: 30000 // 30 segundos timeout
      }
    });

    // Configurar encoding UTF-8
    client.setEndpoint(wsdlUrl.replace('?wsdl', ''));

    // Preparar parámetros para la llamada SOAP
    const params = {
      claveAccesoComprobante: claveAcceso
    };

    // Llamar al método autorizacionComprobante
    const [result] = await client.autorizacionComprobanteAsync(params);

    if (!result) {
      throw new Error('No se recibió respuesta del SRI');
    }

    // Log completo de la respuesta para debugging
    logger.debug('Respuesta completa del SRI:', {
      result: JSON.stringify(result, null, 2)
    });

    // Extraer el XML del comprobante de la respuesta
    let comprobanteXml = '';
    let autorizacion = null;

    if (result.RespuestaAutorizacionComprobante) {
      const respuesta = result.RespuestaAutorizacionComprobante;

      // Log de la estructura de autorizaciones
      logger.debug('Estructura de autorizaciones:', {
        autorizaciones: JSON.stringify(respuesta.autorizaciones, null, 2)
      });

      if (respuesta.autorizaciones) {
        // Manejar diferentes formatos de respuesta
        let autorizacionData = respuesta.autorizaciones.autorizacion;

        if (!autorizacionData) {
          // Intentar con 'Autorizacion' (con mayúscula)
          autorizacionData = respuesta.autorizaciones.Autorizacion;
        }

        // Normalizar a array si es un objeto único
        if (autorizacionData && !Array.isArray(autorizacionData)) {
          autorizacionData = [autorizacionData];
        }

        if (autorizacionData && autorizacionData.length > 0) {
          autorizacion = autorizacionData[0];

          // Verificar estado de autorización
          const estado = autorizacion.estado || autorizacion.Estado;

          if (estado !== 'AUTORIZADO') {
            const mensajes = autorizacion.mensajes || autorizacion.Mensajes || [];
            const mensajesArray = Array.isArray(mensajes) ? mensajes : (mensajes.mensaje || mensajes.Mensaje ? [mensajes] : []);
            const mensajesTexto = mensajesArray.map(m => {
              const id = m.identificador || m.Identificador || '';
              const msg = m.mensaje || m.Mensaje || '';
              return `${id}: ${msg}`;
            }).join('; ');

            throw new Error(`Comprobante no autorizado. Estado: ${estado}. ${mensajesTexto}`);
          }

          // Extraer el XML del comprobante
          comprobanteXml = autorizacion.comprobante || autorizacion.Comprobante || '';

          // Decodificar entidades HTML si es necesario
          comprobanteXml = comprobanteXml.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        } else {
          logger.error('Estructura de respuesta inesperada:', {
            respuesta: JSON.stringify(respuesta, null, 2)
          });
          throw new Error('No se encontró información de autorización en la respuesta del SRI. Verifique que la clave de acceso sea correcta y que el comprobante esté autorizado.');
        }
      } else {
        logger.error('No existe nodo de autorizaciones en la respuesta:', {
          respuesta: JSON.stringify(respuesta, null, 2)
        });
        throw new Error('La respuesta del SRI no contiene información de autorizaciones. Verifique que la clave de acceso sea correcta.');
      }
    } else {
      logger.error('Formato de respuesta inválido:', {
        result: JSON.stringify(result, null, 2)
      });
      throw new Error('Formato de respuesta inválido del SRI');
    }

    if (!comprobanteXml) {
      throw new Error('El XML del comprobante está vacío');
    }

    // Parsear el XML para extraer información
    const datosComprobante = await parsearComprobanteXml(comprobanteXml);

    logger.info(`Comprobante descargado exitosamente. Clave: ${claveAcceso}, Tipo: ${datosComprobante.codDoc}`);

    return {
      claveAcceso,
      xml: comprobanteXml,
      datos: datosComprobante,
      fechaDescarga: new Date()
    };

  } catch (error) {
    logger.error(`Error al descargar comprobante del SRI. Clave: ${claveAcceso}`, {
      error: error.message,
      stack: error.stack
    });

    throw new Error(`Error al descargar comprobante del SRI: ${error.message}`);
  }
}

/**
 * Parsea el XML del comprobante y extrae los campos principales
 * @param {string} xmlString - String con el XML del comprobante
 * @returns {Promise<Object>} Objeto con los datos extraídos
 */
async function parsearComprobanteXml(xmlString) {
  try {
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      tagNameProcessors: [xml2js.processors.stripPrefix]
    });

    const result = await parser.parseStringPromise(xmlString);

    // Buscar el nodo raíz del comprobante (puede ser factura, notaCredito, notaDebito, etc.)
    let comprobante = null;
    let tipoComprobante = '';

    if (result.factura) {
      comprobante = result.factura;
      tipoComprobante = 'factura';
    } else if (result.notaCredito) {
      comprobante = result.notaCredito;
      tipoComprobante = 'notaCredito';
    } else if (result.notaDebito) {
      comprobante = result.notaDebito;
      tipoComprobante = 'notaDebito';
    } else if (result.comprobanteRetencion) {
      comprobante = result.comprobanteRetencion;
      tipoComprobante = 'comprobanteRetencion';
    } else if (result.guiaRemision) {
      comprobante = result.guiaRemision;
      tipoComprobante = 'guiaRemision';
    } else {
      throw new Error('Tipo de comprobante no reconocido en el XML');
    }

    const infoTributaria = comprobante.infoTributaria || {};
    const infoFactura = comprobante.infoFactura || {};
    const infoNotaCredito = comprobante.infoNotaCredito || {};
    const infoNotaDebito = comprobante.infoNotaDebito || {};

    // Unificar info según tipo de documento
    const info = infoFactura.fechaEmision ? infoFactura :
                 infoNotaCredito.fechaEmision ? infoNotaCredito :
                 infoNotaDebito.fechaEmision ? infoNotaDebito : {};

    // Extraer datos comunes
    const datos = {
      tipoComprobante,
      ambiente: infoTributaria.ambiente || '2',
      tipoEmision: infoTributaria.tipoEmision || '1',
      razonSocial: infoTributaria.razonSocial || '',
      nombreComercial: infoTributaria.nombreComercial || '',
      ruc: infoTributaria.ruc || '',
      claveAcceso: infoTributaria.claveAcceso || '',
      codDoc: infoTributaria.codDoc || '',
      estab: infoTributaria.estab || '',
      ptoEmi: infoTributaria.ptoEmi || '',
      secuencial: infoTributaria.secuencial || '',
      dirMatriz: infoTributaria.dirMatriz || '',
      fechaEmision: info.fechaEmision || '',
      dirEstablecimiento: info.dirEstablecimiento || '',
      contribuyenteEspecial: info.contribuyenteEspecial || '',
      obligadoContabilidad: info.obligadoContabilidad || 'NO',

      // Datos del comprador/cliente
      tipoIdentificacionComprador: info.tipoIdentificacionComprador || '',
      razonSocialComprador: info.razonSocialComprador || '',
      identificacionComprador: info.identificacionComprador || '',
      direccionComprador: info.direccionComprador || '',

      // Totales
      totalSinImpuestos: parseFloat(info.totalSinImpuestos || '0'),
      totalDescuento: parseFloat(info.totalDescuento || '0'),
      propina: parseFloat(info.propina || '0'),
      importeTotal: parseFloat(info.importeTotal || '0'),
      moneda: info.moneda || 'DOLAR',

      // Guía de remisión (si aplica)
      guiaRemision: info.guiaRemision || '',

      // Información de impuestos
      impuestos: [],

      // Información de pagos
      formasPago: []
    };

    // Extraer impuestos
    if (info.totalConImpuestos && info.totalConImpuestos.totalImpuesto) {
      const impuestos = Array.isArray(info.totalConImpuestos.totalImpuesto)
        ? info.totalConImpuestos.totalImpuesto
        : [info.totalConImpuestos.totalImpuesto];

      datos.impuestos = impuestos.map(imp => ({
        codigo: imp.codigo || '',
        codigoPorcentaje: imp.codigoPorcentaje || '',
        baseImponible: parseFloat(imp.baseImponible || '0'),
        tarifa: parseFloat(imp.tarifa || '0'),
        valor: parseFloat(imp.valor || '0')
      }));
    }

    // Extraer formas de pago
    if (info.pagos && info.pagos.pago) {
      const pagos = Array.isArray(info.pagos.pago)
        ? info.pagos.pago
        : [info.pagos.pago];

      datos.formasPago = pagos.map(p => ({
        formaPago: p.formaPago || '',
        total: parseFloat(p.total || '0'),
        plazo: p.plazo || '',
        unidadTiempo: p.unidadTiempo || ''
      }));
    }

    return datos;

  } catch (error) {
    logger.error('Error al parsear XML del comprobante', {
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Error al parsear XML: ${error.message}`);
  }
}

/**
 * Valida una clave de acceso de comprobante electrónico
 * @param {string} claveAcceso - Clave de acceso a validar
 * @returns {Object} Información extraída de la clave de acceso
 */
function validarClaveAcceso(claveAcceso) {
  if (!claveAcceso || claveAcceso.length !== 49 || !/^\d+$/.test(claveAcceso)) {
    return {
      valida: false,
      mensaje: 'Clave de acceso inválida. Debe contener exactamente 49 dígitos.'
    };
  }

  try {
    // Estructura de la clave de acceso (49 dígitos):
    // Posiciones 0-7: Fecha emisión (ddmmaaaa)
    // Posiciones 8-9: Tipo comprobante
    // Posiciones 10-22: RUC
    // Posiciones 23-24: Tipo ambiente
    // Posiciones 25-27: Serie (establecimiento)
    // Posiciones 28-30: Serie (punto emisión)
    // Posiciones 31-39: Número comprobante
    // Posiciones 40-47: Código numérico
    // Posición 48: Dígito verificador

    const fechaEmision = claveAcceso.substring(0, 8);
    const tipoComprobante = claveAcceso.substring(8, 10);
    const ruc = claveAcceso.substring(10, 23);
    const tipoAmbiente = claveAcceso.substring(23, 25);
    const establecimiento = claveAcceso.substring(25, 28);
    const puntoEmision = claveAcceso.substring(28, 31);
    const numeroComprobante = claveAcceso.substring(31, 40);
    const codigoNumerico = claveAcceso.substring(40, 48);
    const digitoVerificador = claveAcceso.substring(48, 49);

    return {
      valida: true,
      fechaEmision: `${fechaEmision.substring(0, 2)}/${fechaEmision.substring(2, 4)}/${fechaEmision.substring(4, 8)}`,
      tipoComprobante,
      ruc,
      tipoAmbiente,
      establecimiento,
      puntoEmision,
      numeroComprobante,
      codigoNumerico,
      digitoVerificador
    };
  } catch (error) {
    return {
      valida: false,
      mensaje: `Error al validar clave de acceso: ${error.message}`
    };
  }
}

module.exports = {
  descargarComprobante,
  parsearComprobanteXml,
  validarClaveAcceso
};
