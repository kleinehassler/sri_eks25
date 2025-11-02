const { XMLParser, XMLValidator } = require('fast-xml-parser');
const fs = require('fs').promises;
const path = require('path');

// Importar libxmljs2 para validación XSD completa
let libxmljs;
let xsdValidationAvailable = false;

try {
  libxmljs = require('libxmljs2');
  xsdValidationAvailable = true;
  console.log('✓ libxmljs2 cargado correctamente - Validación XSD completa disponible');
} catch (error) {
  console.warn('⚠ libxmljs2 no disponible - Usando validación básica');
  console.warn('  Instalar con: npm install libxmljs2');
}

/**
 * Servicio de validación XML contra esquema XSD del SRI
 *
 * Soporta dos modos de validación:
 * 1. Validación XSD completa con libxmljs2 (recomendado)
 * 2. Validación básica con fast-xml-parser (fallback)
 */
class XsdValidatorService {
  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: true,
      parseAttributeValue: true
    });

    this.xsdPath = path.join(__dirname, '../../../requerimientos_documentos/ARCHIVOats-xsd.txt');
    this.xsdSchema = null;
    this.xsdValidationAvailable = xsdValidationAvailable;
  }

  /**
   * Cargar esquema XSD
   */
  async cargarEsquemaXsd() {
    if (!this.xsdValidationAvailable) {
      return null;
    }

    try {
      if (this.xsdSchema) {
        return this.xsdSchema;
      }

      const xsdContent = await fs.readFile(this.xsdPath, 'utf-8');

      // Parsear el esquema XSD
      this.xsdSchema = libxmljs.parseXml(xsdContent);

      return this.xsdSchema;
    } catch (error) {
      console.error('Error al cargar esquema XSD:', error.message);
      return null;
    }
  }

  /**
   * Validar XML contra esquema XSD (método principal)
   * @param {string} xmlContent - Contenido XML a validar
   * @returns {Object} Resultado de validación
   */
  async validarXml(xmlContent) {
    const errores = [];
    const advertencias = [];
    let metodoValidacion = 'básica';

    try {
      // 1. Validación sintáctica básica
      const validacionSintaxis = XMLValidator.validate(xmlContent, {
        allowBooleanAttributes: true
      });

      if (validacionSintaxis !== true) {
        errores.push({
          tipo: 'SINTAXIS',
          mensaje: 'XML mal formado',
          detalle: validacionSintaxis.err.msg,
          linea: validacionSintaxis.err.line
        });
        return {
          valido: false,
          errores,
          advertencias,
          metodo: metodoValidacion,
          mensaje: 'XML con errores de sintaxis'
        };
      }

      // 2. Intentar validación XSD completa con libxmljs2
      if (this.xsdValidationAvailable) {
        const resultadoXsd = await this.validarContraXsd(xmlContent);

        if (resultadoXsd) {
          metodoValidacion = 'XSD completa (libxmljs2)';
          errores.push(...resultadoXsd.errores);
          advertencias.push(...resultadoXsd.advertencias);

          // Si hay errores XSD, retornar inmediatamente
          if (errores.length > 0) {
            return {
              valido: false,
              errores,
              advertencias,
              metodo: metodoValidacion,
              mensaje: 'XML con errores de validación XSD'
            };
          }
        } else {
          // Si falla validación XSD, usar validación básica
          advertencias.push({
            tipo: 'INFO',
            mensaje: 'Validación XSD no disponible, usando validación básica'
          });
        }
      }

      // 3. Validación básica (si no hay libxmljs2 o como complemento)
      if (!this.xsdValidationAvailable || errores.length === 0) {
        const xmlObj = this.parser.parse(xmlContent);

        // Validar estructura ATS
        const validacionEstructura = this.validarEstructuraAts(xmlObj);
        errores.push(...validacionEstructura.errores);
        advertencias.push(...validacionEstructura.advertencias);

        // Validar tipos de datos
        const validacionTipos = this.validarTiposDatos(xmlObj);
        errores.push(...validacionTipos.errores);
        advertencias.push(...validacionTipos.advertencias);
      }

      const mensajeBase = errores.length === 0
        ? 'XML válido'
        : 'XML con errores de validación';

      return {
        valido: errores.length === 0,
        errores,
        advertencias,
        metodo: metodoValidacion,
        mensaje: `${mensajeBase} (método: ${metodoValidacion})`
      };

    } catch (error) {
      return {
        valido: false,
        errores: [{
          tipo: 'ERROR_SISTEMA',
          mensaje: 'Error al validar XML',
          detalle: error.message
        }],
        advertencias: [],
        metodo: metodoValidacion,
        mensaje: 'Error en el proceso de validación'
      };
    }
  }

  /**
   * Validar XML contra esquema XSD usando libxmljs2
   * @param {string} xmlContent - Contenido XML a validar
   * @returns {Object|null} Resultado de validación XSD o null si no está disponible
   */
  async validarContraXsd(xmlContent) {
    if (!this.xsdValidationAvailable) {
      return null;
    }

    const errores = [];
    const advertencias = [];

    try {
      // Cargar esquema XSD
      const xsdSchema = await this.cargarEsquemaXsd();

      if (!xsdSchema) {
        return null;
      }

      // Parsear XML a validar
      const xmlDoc = libxmljs.parseXml(xmlContent);

      // Validar contra esquema
      const esValido = xmlDoc.validate(xsdSchema);

      if (!esValido) {
        // Obtener errores de validación
        const xsdErrors = xmlDoc.validationErrors || [];

        xsdErrors.forEach((error, index) => {
          errores.push({
            tipo: 'XSD_VALIDATION',
            mensaje: this.limpiarMensajeXsd(error.message || error.toString()),
            linea: error.line,
            columna: error.column,
            nivel: error.level === 2 ? 'ERROR' : 'ADVERTENCIA'
          });
        });

        // Limitar errores a los primeros 20 para no saturar
        if (errores.length > 20) {
          const erroresOmitidos = errores.length - 20;
          errores.splice(20);
          advertencias.push({
            tipo: 'INFO',
            mensaje: `Se omitieron ${erroresOmitidos} errores adicionales de validación XSD`
          });
        }
      }

      return { errores, advertencias };

    } catch (error) {
      console.error('Error en validación XSD:', error.message);

      // Si hay error en la validación XSD, agregar como advertencia y retornar null
      // para que se use la validación básica
      advertencias.push({
        tipo: 'ADVERTENCIA',
        mensaje: 'Error al validar contra XSD, usando validación básica',
        detalle: error.message
      });

      return { errores: [], advertencias };
    }
  }

  /**
   * Limpiar mensaje de error XSD para hacerlo más legible
   */
  limpiarMensajeXsd(mensaje) {
    // Remover prefijos técnicos y hacer el mensaje más legible
    return mensaje
      .replace(/Element\s+'(\w+)':/g, 'Elemento <$1>:')
      .replace(/This element is not expected\./g, 'Este elemento no es esperado.')
      .replace(/Expected is \(/g, 'Se esperaba: (')
      .replace(/Missing child element\(s\)\./g, 'Faltan elementos hijos requeridos.')
      .trim();
  }

  /**
   * Validar estructura básica del ATS
   */
  validarEstructuraAts(xmlObj) {
    const errores = [];
    const advertencias = [];

    // Validar nodo raíz
    if (!xmlObj.iva) {
      errores.push({
        tipo: 'ESTRUCTURA',
        mensaje: 'Falta nodo raíz <iva>',
        ruta: '/'
      });
      return { errores, advertencias };
    }

    const iva = xmlObj.iva;

    // Validar campos obligatorios del informante
    const camposObligatorios = [
      'TipoIDInformante',
      'IdInformante',
      'razonSocial',
      'Anio',
      'Mes',
      'numEstabRuc',
      'totalVentas',
      'codigoOperativo'
    ];

    camposObligatorios.forEach(campo => {
      if (!iva[campo]) {
        errores.push({
          tipo: 'CAMPO_OBLIGATORIO',
          mensaje: `Falta campo obligatorio: ${campo}`,
          ruta: `/iva/${campo}`
        });
      }
    });

    // Validar secciones opcionales si existen
    if (iva.compras) {
      const validacionCompras = this.validarSeccionCompras(iva.compras);
      errores.push(...validacionCompras.errores);
      advertencias.push(...validacionCompras.advertencias);
    }

    if (iva.ventas) {
      const validacionVentas = this.validarSeccionVentas(iva.ventas);
      errores.push(...validacionVentas.errores);
      advertencias.push(...validacionVentas.advertencias);
    }

    if (iva.exportaciones) {
      const validacionExportaciones = this.validarSeccionExportaciones(iva.exportaciones);
      errores.push(...validacionExportaciones.errores);
      advertencias.push(...validacionExportaciones.advertencias);
    }

    return { errores, advertencias };
  }

  /**
   * Validar sección de compras
   */
  validarSeccionCompras(compras) {
    const errores = [];
    const advertencias = [];

    if (!compras.detalleCompras) {
      advertencias.push({
        tipo: 'ESTRUCTURA',
        mensaje: 'Sección compras sin detalleCompras',
        ruta: '/iva/compras'
      });
      return { errores, advertencias };
    }

    const detalles = Array.isArray(compras.detalleCompras)
      ? compras.detalleCompras
      : [compras.detalleCompras];

    detalles.forEach((detalle, index) => {
      const camposObligatorios = [
        'codSustento', 'tpIdProv', 'idProv', 'tipoComprobante',
        'fechaRegistro', 'establecimiento', 'puntoEmision',
        'secuencial', 'fechaEmision', 'autorizacion'
      ];

      camposObligatorios.forEach(campo => {
        if (!detalle[campo]) {
          errores.push({
            tipo: 'CAMPO_OBLIGATORIO',
            mensaje: `Compra ${index + 1}: Falta campo ${campo}`,
            ruta: `/iva/compras/detalleCompras[${index}]/${campo}`
          });
        }
      });

      // Validar formato de fecha
      if (detalle.fechaEmision && !this.validarFormatoFecha(detalle.fechaEmision)) {
        errores.push({
          tipo: 'FORMATO',
          mensaje: `Compra ${index + 1}: Formato de fecha inválido (debe ser DD/MM/YYYY)`,
          ruta: `/iva/compras/detalleCompras[${index}]/fechaEmision`,
          valor: detalle.fechaEmision
        });
      }
    });

    return { errores, advertencias };
  }

  /**
   * Validar sección de ventas
   */
  validarSeccionVentas(ventas) {
    const errores = [];
    const advertencias = [];

    if (!ventas.detalleVentas) {
      advertencias.push({
        tipo: 'ESTRUCTURA',
        mensaje: 'Sección ventas sin detalleVentas',
        ruta: '/iva/ventas'
      });
      return { errores, advertencias };
    }

    const detalles = Array.isArray(ventas.detalleVentas)
      ? ventas.detalleVentas
      : [ventas.detalleVentas];

    detalles.forEach((detalle, index) => {
      const camposObligatorios = [
        'tpIdCliente', 'idCliente', 'tipoComprobante',
        'numeroComprobantes'
      ];

      camposObligatorios.forEach(campo => {
        if (!detalle[campo]) {
          errores.push({
            tipo: 'CAMPO_OBLIGATORIO',
            mensaje: `Venta ${index + 1}: Falta campo ${campo}`,
            ruta: `/iva/ventas/detalleVentas[${index}]/${campo}`
          });
        }
      });
    });

    return { errores, advertencias };
  }

  /**
   * Validar sección de exportaciones
   */
  validarSeccionExportaciones(exportaciones) {
    const errores = [];
    const advertencias = [];

    if (!exportaciones.detalleExportaciones) {
      advertencias.push({
        tipo: 'ESTRUCTURA',
        mensaje: 'Sección exportaciones sin detalleExportaciones',
        ruta: '/iva/exportaciones'
      });
      return { errores, advertencias };
    }

    const detalles = Array.isArray(exportaciones.detalleExportaciones)
      ? exportaciones.detalleExportaciones
      : [exportaciones.detalleExportaciones];

    detalles.forEach((detalle, index) => {
      const camposObligatorios = [
        'tpIdClienteEx', 'idClienteEx', 'tipoComprobante',
        'valorFOB', 'establecimiento', 'puntoEmision',
        'secuencial', 'fechaEmision'
      ];

      camposObligatorios.forEach(campo => {
        if (!detalle[campo]) {
          errores.push({
            tipo: 'CAMPO_OBLIGATORIO',
            mensaje: `Exportación ${index + 1}: Falta campo ${campo}`,
            ruta: `/iva/exportaciones/detalleExportaciones[${index}]/${campo}`
          });
        }
      });
    });

    return { errores, advertencias };
  }

  /**
   * Validar tipos de datos según especificación XSD
   */
  validarTiposDatos(xmlObj) {
    const errores = [];
    const advertencias = [];

    if (!xmlObj.iva) return { errores, advertencias };

    const iva = xmlObj.iva;

    // Validar RUC
    if (iva.IdInformante && !this.validarRuc(iva.IdInformante)) {
      errores.push({
        tipo: 'TIPO_DATO',
        mensaje: 'RUC del informante inválido (debe tener 13 dígitos y terminar en 001)',
        ruta: '/iva/IdInformante',
        valor: iva.IdInformante
      });
    }

    // Validar año
    if (iva.Anio && !this.validarAnio(iva.Anio)) {
      errores.push({
        tipo: 'TIPO_DATO',
        mensaje: 'Año inválido (debe estar entre 2000 y 9999)',
        ruta: '/iva/Anio',
        valor: iva.Anio
      });
    }

    // Validar mes
    if (iva.Mes && !this.validarMes(iva.Mes)) {
      errores.push({
        tipo: 'TIPO_DATO',
        mensaje: 'Mes inválido (debe estar entre 01 y 12)',
        ruta: '/iva/Mes',
        valor: iva.Mes
      });
    }

    return { errores, advertencias };
  }

  /**
   * Validar formato de fecha DD/MM/YYYY
   */
  validarFormatoFecha(fecha) {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/;
    return regex.test(fecha);
  }

  /**
   * Validar RUC (13 dígitos terminados en 001)
   */
  validarRuc(ruc) {
    const rucStr = String(ruc);
    // RUC debe tener 13 dígitos y terminar en 001
    const regex = /^[0-9]{13}$/;
    return regex.test(rucStr) && rucStr.length === 13 && rucStr.endsWith('001');
  }

  /**
   * Validar año
   */
  validarAnio(anio) {
    const anioNum = parseInt(anio);
    return anioNum >= 2000 && anioNum <= 9999 && String(anioNum).length === 4;
  }

  /**
   * Validar mes
   */
  validarMes(mes) {
    const regex = /^(0[1-9]|1[012])$/;
    return regex.test(mes);
  }

  /**
   * Generar reporte de validación en formato legible
   */
  generarReporte(resultadoValidacion) {
    let reporte = `\n=== REPORTE DE VALIDACIÓN XML ATS ===\n\n`;
    reporte += `Estado: ${resultadoValidacion.valido ? '✓ VÁLIDO' : '✗ INVÁLIDO'}\n`;

    // Mostrar método de validación
    if (resultadoValidacion.metodo) {
      reporte += `Método: ${resultadoValidacion.metodo}\n`;
    }

    reporte += `Mensaje: ${resultadoValidacion.mensaje}\n\n`;

    if (resultadoValidacion.errores.length > 0) {
      reporte += `ERRORES (${resultadoValidacion.errores.length}):\n`;
      resultadoValidacion.errores.forEach((error, i) => {
        reporte += `\n${i + 1}. [${error.tipo}] ${error.mensaje}\n`;
        if (error.linea) reporte += `   Línea: ${error.linea}${error.columna ? `, Columna: ${error.columna}` : ''}\n`;
        if (error.ruta) reporte += `   Ruta: ${error.ruta}\n`;
        if (error.valor) reporte += `   Valor: ${error.valor}\n`;
        if (error.detalle) reporte += `   Detalle: ${error.detalle}\n`;
        if (error.nivel) reporte += `   Nivel: ${error.nivel}\n`;
      });
    }

    if (resultadoValidacion.advertencias.length > 0) {
      reporte += `\nADVERTENCIAS (${resultadoValidacion.advertencias.length}):\n`;
      resultadoValidacion.advertencias.forEach((adv, i) => {
        reporte += `\n${i + 1}. [${adv.tipo}] ${adv.mensaje}\n`;
        if (adv.ruta) reporte += `   Ruta: ${adv.ruta}\n`;
        if (adv.detalle) reporte += `   Detalle: ${adv.detalle}\n`;
      });
    }

    if (resultadoValidacion.valido && resultadoValidacion.errores.length === 0 && resultadoValidacion.advertencias.length === 0) {
      reporte += `\n✓ No se encontraron errores ni advertencias.\n`;
      reporte += `✓ XML cumple completamente con la especificación XSD del SRI.\n`;
    }

    reporte += `\n======================================\n`;

    return reporte;
  }
}

module.exports = new XsdValidatorService();
