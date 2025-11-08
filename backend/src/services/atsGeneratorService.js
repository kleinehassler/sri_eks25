const { XMLBuilder } = require('fast-xml-parser');
const { Compra, Venta, Exportacion, Empresa, HistorialAts, Retencion } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const xsdValidator = require('./xsdValidatorService');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { Op } = require('sequelize');

/**
 * Servicio de generación de archivo ATS (Anexo Transaccional Simplificado)
 */
class AtsGeneratorService {
  constructor() {
    this.builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: false,
      suppressEmptyNode: true,
      tagValueProcessor: (tagName, tagValue) => {
        // Asegurar que valores numéricos largos se mantengan como strings
        if (typeof tagValue === 'number' && Math.abs(tagValue) > 1e15) {
          return String(tagValue);
        }
        return tagValue;
      }
    });
  }

  /**
   * Generar archivo ATS para un periodo específico
   * @param {number} empresaId - ID de la empresa
   * @param {string} periodo - Periodo formato MM/AAAA
   * @param {number} usuarioId - ID del usuario que genera
   * @returns {Object} Información del archivo generado
   */
  async generarATS(empresaId, periodo, usuarioId) {
    try {
      // Validar periodo
      if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(periodo)) {
        throw new AppError('Formato de periodo inválido. Use MM/AAAA', 400);
      }

      // Obtener empresa
      const empresa = await Empresa.findByPk(empresaId);
      if (!empresa) {
        throw new AppError('Empresa no encontrada', 404);
      }

      // Obtener datos transaccionales
      const [compras, ventas, exportaciones, retenciones, anulados] = await Promise.all([
        this.obtenerComprasValidadas(empresaId, periodo),
        this.obtenerVentasValidadas(empresaId, periodo),
        this.obtenerExportacionesValidadas(empresaId, periodo),
        this.obtenerRetencionesValidadas(empresaId, periodo),
        this.obtenerAnulados(empresaId, periodo)
      ]);

      // Construir estructura XML del ATS
      const atsXml = this.construirXmlAts(empresa, periodo, compras, ventas, exportaciones, retenciones, anulados);

      // Generar archivo XML
      const [mes, anio] = periodo.split('/');
      const nombreArchivo = `ATS${mes}${anio}.xml`;
      const rutaXml = path.join('storage', 'ats', empresa.ruc, nombreArchivo);

      // Crear directorio si no existe
      await fs.mkdir(path.dirname(rutaXml), { recursive: true });

      // Escribir XML
      const xmlContent = this.builder.build(atsXml);
      const xmlCompleto = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>${xmlContent}`;
      await fs.writeFile(rutaXml, xmlCompleto, 'utf-8');

      // Validar XML contra esquema XSD del SRI
      const validacionXsd = await xsdValidator.validarXml(xmlCompleto);

      // Log de validación
      console.log('=== RESULTADO DE VALIDACIÓN XSD DEL ATS ===');
      console.log(`Método de validación: ${validacionXsd.metodo || 'XSD'}`);
      console.log(`Estado: ${validacionXsd.valido ? '✓ VÁLIDO' : '✗ INVÁLIDO'}`);

      if (!validacionXsd.valido) {
        console.warn('⚠ ADVERTENCIA: XML del ATS generado con errores de validación');
        console.warn('Reporte detallado:');
        console.warn(xsdValidator.generarReporte(validacionXsd));
      } else {
        console.log('✓ XML del ATS cumple con el esquema XSD del SRI');
      }
      console.log('==========================================');

      // Crear ZIP
      const nombreZip = `AT${mes}${anio}.zip`;
      const rutaZip = path.join('storage', 'ats', empresa.ruc, nombreZip);
      await this.crearZip(rutaXml, rutaZip);

      // Guardar en historial
      const historialData = {
        empresa_id: empresaId,
        usuario_id: usuarioId,
        periodo,
        nombre_archivo: nombreArchivo,
        ruta_archivo_xml: rutaXml,
        ruta_archivo_zip: rutaZip,
        total_compras: compras.length,
        total_ventas: ventas.length,
        total_exportaciones: exportaciones.length,
        total_retenciones: retenciones.length,
        validacion_xsd: validacionXsd.valido,
        fecha_generacion: new Date(),
        estado: validacionXsd.valido ? 'GENERADO' : 'GENERADO_CON_ADVERTENCIAS'
      };

      const historialCreado = await HistorialAts.create(historialData);

      return {
        mensaje: 'ATS generado exitosamente',
        id: historialCreado.id,
        archivo_xml: nombreArchivo,
        archivo_zip: nombreZip,
        ruta_descarga_xml: `/api/ats/descargar/${historialCreado.id}?tipo=xml`,
        ruta_descarga_zip: `/api/ats/descargar/${historialCreado.id}?tipo=zip`,
        estadisticas: {
          total_compras: compras.length,
          total_ventas: ventas.length,
          total_exportaciones: exportaciones.length,
          total_retenciones: retenciones.length
        },
        validacion: {
          valido: validacionXsd.valido,
          metodo: validacionXsd.metodo || 'XSD',
          errores: validacionXsd.errores || [],
          advertencias: validacionXsd.advertencias || [],
          mensaje: validacionXsd.mensaje,
          xsdDisponible: xsdValidator.xsdValidationAvailable
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error al generar ATS: ${error.message}`, 500);
    }
  }

  /**
   * Construir estructura XML del ATS según especificación SRI
   */
  construirXmlAts(empresa, periodo, compras, ventas, exportaciones, retenciones, anulados) {
    const [mes, anio] = periodo.split('/');

    const ats = {
      iva: {
        TipoIDInformante: this.determinarTipoId(empresa.ruc),
        IdInformante: String(empresa.ruc),
        razonSocial: this.formatearRazonSocial(empresa.razon_social),
        Anio: String(anio),
        Mes: String(mes).padStart(2, '0'),
        numEstabRuc: this.contarEstablecimientosUnicos(ventas),
        totalVentas: this.calcularTotalVentas(ventas, exportaciones),
        codigoOperativo: 'IVA'
      }
    };

    // Agregar compras si existen
    if (compras.length > 0) {
      ats.iva.compras = {
        detalleCompras: compras.map(c => this.mapearCompra(c, retenciones))
      };
    }

    // Agregar ventas si existen (agrupadas por cliente y tipo de comprobante)
    if (ventas.length > 0) {
      const ventasAgrupadas = this.agruparVentasPorClienteYTipoComprobante(ventas);
      ats.iva.ventas = {
        detalleVentas: ventasAgrupadas.map(v => this.mapearVenta(v))
      };
    }

    // Agregar ventasEstablecimiento si hay ventas
    if (ventas.length > 0) {
      ats.iva.ventasEstablecimiento = this.construirVentasEstablecimiento(ventas);
    }

    // Agregar exportaciones si existen
    if (exportaciones.length > 0) {
      ats.iva.exportaciones = {
        detalleExportaciones: exportaciones.map(e => this.mapearExportacion(e))
      };
    }

    // Agregar anulados si existen
    if (anulados.length > 0) {
      ats.iva.anulados = {
        detalleAnulados: anulados.map(a => this.mapearAnulado(a))
      };
    }

    return ats;
  }

  /**
   * Mapear compra al formato XML ATS
   */
  mapearCompra(compra, retenciones) {
    // Obtener retenciones de IVA para esta compra
    const retencionesIVA = retenciones.filter(r => r.compra_id === compra.id && r.tipo_impuesto === 'IVA');

    // Calcular valores de retenciones de IVA según porcentaje
    let valRetBien10 = 0;
    let valRetServ20 = 0;
    let valRetServ50 = 0;
    let valRetServ100 = 0;

    retencionesIVA.forEach(ret => {
      const porcentaje = parseFloat(ret.porcentaje_retencion || 0);
      const valorRetenido = parseFloat(ret.valor_retenido || 0);

      if (porcentaje === 10) {
        valRetBien10 += valorRetenido;
      } else if (porcentaje === 20) {
        valRetServ20 += valorRetenido;
      } else if (porcentaje === 50) {
        valRetServ50 += valorRetenido;
      } else if (porcentaje === 100) {
        valRetServ100 += valorRetenido;
      }
    });

    const detalleCompra = {
      codSustento: String(compra.codigo_sustento || '01'),
      tpIdProv: String(compra.tipo_identificacion || '01'),
      idProv: String(compra.identificacion_proveedor || ''),
      tipoComprobante: String(compra.tipo_comprobante || '01'),
      parteRel: 'NO',
      fechaRegistro: this.formatearFecha(compra.fecha_registro),
      establecimiento: String(compra.establecimiento || '').padStart(3, '0'),
      puntoEmision: String(compra.punto_emision || '').padStart(3, '0'),
      secuencial: parseInt(compra.secuencial || '0'),
      fechaEmision: this.formatearFecha(compra.fecha_emision),
      autorizacion: this.formatearAutorizacion(compra.numero_autorizacion),
      baseNoGraIva: this.formatearDecimal(compra.base_imponible_0),
      baseImponible: this.formatearDecimal(compra.base_imponible_no_objeto_iva),
      baseImpGrav: this.formatearDecimal(compra.base_imponible_iva),
      baseImpExe: this.formatearDecimal(compra.base_imponible_exento_iva),
      montoIce: this.formatearDecimal(compra.monto_ice),
      montoIva: this.formatearDecimal(compra.monto_iva),
      valRetBien10: this.formatearDecimal(valRetBien10),
      valRetServ20: this.formatearDecimal(valRetServ20),
      valorRetBienes: this.formatearDecimal(valRetBien10),
      valRetServ50: this.formatearDecimal(valRetServ50),
      valorRetServicios: this.formatearDecimal(valRetServ20 + valRetServ50),
      valRetServ100: this.formatearDecimal(valRetServ100),
      totbasesImpReemb: '0.00'
    };

    // Agregar pagoExterior (siempre se incluye según el ejemplo del SRI)
    detalleCompra.pagoExterior = {
      pagoLocExt: compra.pago_exterior_pais_efect_pago ? '02' : '01',
      paisEfecPago: compra.pago_exterior_pais_efect_pago ? String(compra.pago_exterior_pais_efect_pago) : 'NA',
      aplicConvDobTrib: compra.aplica_convenio_doble_imposicion ? 'SI' : 'NA',
      pagExtSujRetNorLeg: 'NA'
    };

    // Agregar forma de pago si está disponible
    if (compra.forma_pago) {
      detalleCompra.formasDePago = {
        formaPago: String(compra.forma_pago)
      };
    }

    // Agregar retenciones en la fuente (air)
    const retencionesCompra = retenciones.filter(r => r.compra_id === compra.id && r.tipo_impuesto === 'RENTA');
    if (retencionesCompra.length > 0) {
      detalleCompra.air = {
        detalleAir: retencionesCompra.map(ret => ({
          codRetAir: String(ret.codigo_retencion),
          baseImpAir: this.formatearDecimal(ret.base_imponible),
          porcentajeAir: this.formatearDecimal(ret.porcentaje_retencion),
          valRetAir: this.formatearDecimal(ret.valor_retenido)
        }))
      };

      // Agregar datos de la retención emitida (si existe la primera retención)
      const primeraRetencion = retencionesCompra[0];
      detalleCompra.estabRetencion1 = String(primeraRetencion.establecimiento || '').padStart(3, '0');
      detalleCompra.ptoEmiRetencion1 = String(primeraRetencion.punto_emision || '').padStart(3, '0');
      detalleCompra.secRetencion1 = parseInt(primeraRetencion.secuencial || '0');
      detalleCompra.autRetencion1 = this.formatearAutorizacion(primeraRetencion.numero_autorizacion);
      detalleCompra.fechaEmiRet1 = this.formatearFecha(primeraRetencion.fecha_emision);
    }

    return detalleCompra;
  }

  /**
   * Agrupar ventas por cliente y tipo de comprobante
   * Según especificación del SRI, las ventas deben acumularse por cliente y tipo de documento
   */
  agruparVentasPorClienteYTipoComprobante(ventas) {
    const grupos = {};

    ventas.forEach(venta => {
      // Crear clave única por cliente y tipo de comprobante
      const key = `${venta.identificacion_cliente}-${venta.tipo_comprobante}`;

      if (!grupos[key]) {
        // Inicializar nuevo grupo
        grupos[key] = {
          tipo_identificacion_cliente: venta.tipo_identificacion_cliente,
          identificacion_cliente: venta.identificacion_cliente,
          tipo_comprobante: venta.tipo_comprobante,
          forma_pago: venta.forma_pago, // Tomar forma de pago de la primera venta
          numeroComprobantes: 0,
          base_imponible_0: 0,
          base_imponible_iva: 0,
          monto_iva: 0,
          monto_ice: 0,
          valor_retencion_iva: 0,
          valor_retencion_renta: 0
        };
      }

      // Acumular valores
      const grupo = grupos[key];
      grupo.numeroComprobantes += 1;
      grupo.base_imponible_0 += parseFloat(venta.base_imponible_0 || 0);
      grupo.base_imponible_iva += parseFloat(venta.base_imponible_iva || 0);
      grupo.monto_iva += parseFloat(venta.monto_iva || 0);
      grupo.monto_ice += parseFloat(venta.monto_ice || 0);
      grupo.valor_retencion_iva += parseFloat(venta.valor_retencion_iva || 0);
      grupo.valor_retencion_renta += parseFloat(venta.valor_retencion_renta || 0);
    });

    // Convertir objeto a array
    return Object.values(grupos);
  }

  /**
   * Mapear venta al formato XML ATS
   * Acepta tanto ventas individuales como ventas agrupadas
   */
  mapearVenta(venta) {
    // Mapear código de tipo de comprobante según especificaciones del SRI para ventas
    // 01 (Factura) -> 18 (Factura para ventas en ATS)
    let tipoComprobante = String(venta.tipo_comprobante || '');
    if (tipoComprobante === '01') {
      tipoComprobante = '18';
    }

    const detalleVenta = {
      tpIdCliente: String(venta.tipo_identificacion_cliente || ''),
      idCliente: String(venta.identificacion_cliente || ''),
      parteRelVtas: 'NO',
      tipoComprobante: tipoComprobante,
      tipoEmision: venta.tipo_emision || 'E', // E=Electrónica, F=Física
      numeroComprobantes: venta.numeroComprobantes || 1,
      baseNoGraIva: this.formatearDecimal(venta.base_imponible_0),
      baseImponible: this.formatearDecimal(venta.base_imponible_iva),
      baseImpGrav: this.formatearDecimal(venta.base_imponible_iva),
      montoIva: this.formatearDecimal(venta.monto_iva),
      montoIce: this.formatearDecimal(venta.monto_ice),
      valorRetIva: this.formatearDecimal(venta.valor_retencion_iva),
      valorRetRenta: this.formatearDecimal(venta.valor_retencion_renta)
    };

    // Agregar forma de pago si está disponible
    if (venta.forma_pago) {
      detalleVenta.formasDePago = {
        formaPago: String(venta.forma_pago)
      };
    }

    return detalleVenta;
  }

  /**
   * Mapear exportación al formato XML ATS
   */
  mapearExportacion(exportacion) {
    // Mapear código de tipo de comprobante según especificaciones del SRI para exportaciones
    // 01 (Factura) -> 18 (Factura para exportaciones en ATS)
    let tipoComprobante = String(exportacion.tipo_comprobante || '');
    if (tipoComprobante === '01') {
      tipoComprobante = '18';
    }

    const detalleExportacion = {
      tpIdClienteEx: String(exportacion.tipo_identificacion || ''),
      idClienteEx: String(exportacion.identificacion_cliente || ''),
      parteRelExp: 'NO',
      tipoComprobante: tipoComprobante,
      tipoEmision: exportacion.tipo_emision || 'E', // E=Electrónica, F=Física
      tipoRegi: exportacion.tipo_regimen_fiscal || '01',
      paisEfecExp: String(exportacion.pais_destino || ''),
      exportacionDe: '01',
      valorFOB: this.formatearDecimal(exportacion.valor_fob_comprobante),
      valorFOBComprobante: this.formatearDecimal(exportacion.valor_fob_comprobante),
      establecimiento: String(exportacion.establecimiento || '').padStart(3, '0'),
      puntoEmision: String(exportacion.punto_emision || '').padStart(3, '0'),
      secuencial: parseInt(exportacion.secuencial || '0'),
      autorizacion: this.formatearAutorizacion(exportacion.numero_autorizacion),
      fechaEmision: this.formatearFecha(exportacion.fecha_emision)
    };

    // Agregar país de pago si existe
    if (exportacion.pais_efect_pago) {
      detalleExportacion.paisEfecPagoParFis = String(exportacion.pais_efect_pago);
    }

    return detalleExportacion;
  }

  /**
   * Construir sección de ventas por establecimiento
   */
  construirVentasEstablecimiento(ventas) {
    // Agrupar ventas por establecimiento
    // Solo incluir ventas que NO son electrónicas (tipo_emision !== 'E')
    const ventasPorEstablecimiento = {};

    // Primero, obtener todos los establecimientos únicos de TODAS las ventas
    const establecimientosUnicos = new Set();
    ventas.forEach(venta => {
      const estab = venta.establecimiento || '001';
      establecimientosUnicos.add(estab);
    });

    // Inicializar todos los establecimientos con 0
    establecimientosUnicos.forEach(estab => {
      ventasPorEstablecimiento[estab] = {
        totalVentas: 0
      };
    });

    // Sumar solo las ventas NO electrónicas
    ventas
      .filter(venta => venta.tipo_emision !== 'E')
      .forEach(venta => {
        const estab = venta.establecimiento || '001';
        ventasPorEstablecimiento[estab].totalVentas += parseFloat(venta.total_venta || 0);
      });

    // Convertir a array para el XML
    const ventasEstab = Object.keys(ventasPorEstablecimiento).map(codEstab => ({
      codEstab: String(codEstab).padStart(3, '0'),
      ventasEstab: this.formatearDecimal(ventasPorEstablecimiento[codEstab].totalVentas)
    }));

    return { ventaEst: ventasEstab };
  }

  /**
   * Mapear comprobante anulado al formato XML ATS
   */
  mapearAnulado(anulado) {
    return {
      tipoComprobante: String(anulado.tipo_comprobante),
      establecimiento: String(anulado.establecimiento).padStart(3, '0'),
      puntoEmision: String(anulado.punto_emision).padStart(3, '0'),
      secuencialInicio: parseInt(anulado.secuencial_inicio),
      secuencialFin: parseInt(anulado.secuencial_fin),
      autorizacion: this.formatearAutorizacion(anulado.numero_autorizacion)
    };
  }

  /**
   * Obtener compras validadas para el periodo
   */
  async obtenerComprasValidadas(empresaId, periodo) {
    return await Compra.findAll({
      where: {
        empresa_id: empresaId,
        periodo,
        estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
      },
      order: [['fecha_emision', 'ASC']]
    });
  }

  /**
   * Obtener ventas validadas para el periodo
   */
  async obtenerVentasValidadas(empresaId, periodo) {
    return await Venta.findAll({
      where: {
        empresa_id: empresaId,
        periodo,
        estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
      },
      order: [['fecha_emision', 'ASC']]
    });
  }

  /**
   * Obtener exportaciones validadas para el periodo
   */
  async obtenerExportacionesValidadas(empresaId, periodo) {
    return await Exportacion.findAll({
      where: {
        empresa_id: empresaId,
        periodo,
        estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
      },
      order: [['fecha_emision', 'ASC']]
    });
  }

  /**
   * Obtener retenciones validadas para el periodo
   */
  async obtenerRetencionesValidadas(empresaId, periodo) {
    return await Retencion.findAll({
      where: {
        empresa_id: empresaId,
        periodo,
        estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
      },
      order: [['fecha_emision', 'ASC']]
    });
  }

  /**
   * Obtener comprobantes anulados para el periodo
   * Nota: Este método obtiene compras y ventas con estado ANULADO
   */
  async obtenerAnulados(empresaId, periodo) {
    // Obtener compras anuladas
    const comprasAnuladas = await Compra.findAll({
      where: {
        empresa_id: empresaId,
        periodo,
        estado: 'ANULADO'
      },
      attributes: ['tipo_comprobante', 'establecimiento', 'punto_emision', 'secuencial', 'numero_autorizacion'],
      order: [['tipo_comprobante', 'ASC'], ['establecimiento', 'ASC'], ['secuencial', 'ASC']]
    });

    // Obtener ventas anuladas
    const ventasAnuladas = await Venta.findAll({
      where: {
        empresa_id: empresaId,
        periodo,
        estado: 'ANULADO'
      },
      attributes: ['tipo_comprobante', 'establecimiento', 'punto_emision', 'secuencial', 'numero_autorizacion'],
      order: [['tipo_comprobante', 'ASC'], ['establecimiento', 'ASC'], ['secuencial', 'ASC']]
    });

    // Combinar y agrupar por tipo, establecimiento y punto de emisión para crear rangos
    const anulados = [...comprasAnuladas, ...ventasAnuladas];
    return this.agruparAnulados(anulados);
  }

  /**
   * Agrupar comprobantes anulados en rangos consecutivos
   */
  agruparAnulados(anulados) {
    if (anulados.length === 0) return [];

    const grupos = [];
    let grupoActual = null;

    anulados.forEach(doc => {
      const key = `${doc.tipo_comprobante}-${doc.establecimiento}-${doc.punto_emision}`;
      const secuencial = parseInt(doc.secuencial);

      if (!grupoActual || grupoActual.key !== key || secuencial !== grupoActual.secuencial_fin + 1) {
        // Crear nuevo grupo
        if (grupoActual) grupos.push(grupoActual);

        grupoActual = {
          key,
          tipo_comprobante: doc.tipo_comprobante,
          establecimiento: doc.establecimiento,
          punto_emision: doc.punto_emision,
          secuencial_inicio: secuencial,
          secuencial_fin: secuencial,
          numero_autorizacion: doc.numero_autorizacion
        };
      } else {
        // Extender grupo existente
        grupoActual.secuencial_fin = secuencial;
      }
    });

    // Agregar último grupo
    if (grupoActual) grupos.push(grupoActual);

    return grupos;
  }

  /**
   * Contar establecimientos únicos de las ventas
   */
  contarEstablecimientosUnicos(ventas) {
    // Si no hay ventas, retornar 000
    if (!ventas || ventas.length === 0) {
      return '000';
    }

    // Obtener establecimientos únicos de TODAS las ventas (físicas y electrónicas)
    const establecimientosUnicos = new Set();

    ventas.forEach(venta => {
      const establecimiento = venta.establecimiento || '001';
      establecimientosUnicos.add(establecimiento);
    });

    // Retornar el número de establecimientos únicos con padding de 3 caracteres
    return String(establecimientosUnicos.size).padStart(3, '0');
  }

  /**
   * Calcular total de ventas
   */
  calcularTotalVentas(ventas, exportaciones) {
    // Solo sumar ventas que NO son electrónicas (tipo_emision !== 'E')
    const totalVentas = ventas
      .filter(v => v.tipo_emision !== 'E')
      .reduce((sum, v) => sum + parseFloat(v.total_venta || 0), 0);

    // Las exportaciones también solo si no son electrónicas
    const totalExportaciones = exportaciones
      .filter(e => e.tipo_emision !== 'E')
      .reduce((sum, e) => sum + parseFloat(e.valor_fob_comprobante || 0), 0);

    return this.formatearDecimal(totalVentas + totalExportaciones);
  }

  /**
   * Determinar tipo de identificación según RUC
   */
  determinarTipoId(ruc) {
    if (ruc.length === 13) return 'R'; // RUC
    if (ruc.length === 10) return 'C'; // Cédula
    return 'P'; // Pasaporte
  }

  /**
   * Formatear razón social según patrón XSD
   * Patrón: [a-zA-Z0-9][a-zA-Z0-9\s]+[a-zA-Z0-9\s]
   * No puede terminar con caracteres especiales como punto
   */
  formatearRazonSocial(razonSocial) {
    if (!razonSocial) return '';

    let formatted = String(razonSocial)
      // Remover caracteres especiales excepto espacios
      .replace(/[^a-zA-Z0-9\s]/g, '')
      // Reemplazar múltiples espacios con uno solo
      .replace(/\s+/g, ' ')
      // Trim espacios al inicio y final
      .trim();

    // Asegurar longitud mínima de 5 caracteres
    if (formatted.length < 5) {
      formatted = formatted.padEnd(5, ' ');
    }

    // Asegurar longitud máxima de 500 caracteres
    if (formatted.length > 500) {
      formatted = formatted.substring(0, 500);
    }

    return formatted;
  }

  /**
   * Formatear número de autorización como string
   * Evita notación científica para números grandes
   */
  formatearAutorizacion(autorizacion) {
    if (!autorizacion) return '';

    // Convertir a string sin notación científica
    const str = String(autorizacion);

    // Si contiene 'e' o 'E' (notación científica), es un problema
    if (str.match(/[eE]/)) {
      // Intentar convertir de notación científica a número normal
      const num = parseFloat(str);
      if (!isNaN(num)) {
        return num.toFixed(0);
      }
    }

    return str;
  }

  /**
   * Formatear fecha a DD/MM/YYYY
   */
  formatearFecha(fecha) {
    if (!fecha) return '';
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  /**
   * Formatear decimal a 2 decimales
   */
  formatearDecimal(valor) {
    return parseFloat(valor || 0).toFixed(2);
  }

  /**
   * Crear archivo ZIP
   */
  async crearZip(rutaXml, rutaZip) {
    return new Promise((resolve, reject) => {
      const output = require('fs').createWriteStream(rutaZip);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));

      archive.pipe(output);
      archive.file(rutaXml, { name: path.basename(rutaXml) });
      archive.finalize();
    });
  }

  /**
   * Obtener vista previa de datos para el periodo sin generar el archivo
   * @param {number} empresaId - ID de la empresa
   * @param {string} periodo - Periodo formato MM/AAAA
   * @returns {Object} Resumen de datos para el periodo
   */
  async obtenerVistaPrevia(empresaId, periodo) {
    try {
      // Validar periodo
      if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(periodo)) {
        throw new AppError('Formato de periodo inválido. Use MM/AAAA', 400);
      }

      // Obtener empresa
      const empresa = await Empresa.findByPk(empresaId);
      if (!empresa) {
        throw new AppError('Empresa no encontrada', 404);
      }

      // Obtener datos transaccionales
      const [compras, ventas, exportaciones] = await Promise.all([
        this.obtenerComprasValidadas(empresaId, periodo),
        this.obtenerVentasValidadas(empresaId, periodo),
        this.obtenerExportacionesValidadas(empresaId, periodo)
      ]);

      // Agrupar ventas por cliente y tipo de comprobante (como saldrá en el XML)
      const ventasAgrupadas = this.agruparVentasPorClienteYTipoComprobante(ventas);

      // Calcular totales
      const totalCompras = compras.reduce((sum, c) => sum + parseFloat(c.total_compra || 0), 0);
      const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.total_venta || 0), 0);
      const totalExportaciones = exportaciones.reduce((sum, e) => sum + parseFloat(e.valor_fob_comprobante || 0), 0);

      const totalIvaCompras = compras.reduce((sum, c) => sum + parseFloat(c.monto_iva || 0), 0);
      const totalIvaVentas = ventas.reduce((sum, v) => sum + parseFloat(v.monto_iva || 0), 0);

      // Calcular totales de retenciones recibidas
      const totalRetencionesIvaRecibidas = ventas.reduce((sum, v) => sum + parseFloat(v.valor_retencion_iva || 0), 0);
      const totalRetencionesRentaRecibidas = ventas.reduce((sum, v) => sum + parseFloat(v.valor_retencion_renta || 0), 0);

      return {
        periodo,
        empresa: {
          ruc: empresa.ruc,
          razon_social: empresa.razon_social
        },
        resumen: {
          total_compras: compras.length,
          total_ventas: ventas.length,
          total_ventas_agrupadas: ventasAgrupadas.length, // Ventas agrupadas como saldrán en el XML
          total_exportaciones: exportaciones.length,
          valor_total_compras: this.formatearDecimal(totalCompras),
          valor_total_ventas: this.formatearDecimal(totalVentas),
          valor_total_exportaciones: this.formatearDecimal(totalExportaciones),
          iva_compras: this.formatearDecimal(totalIvaCompras),
          iva_ventas: this.formatearDecimal(totalIvaVentas),
          retenciones_iva_recibidas: this.formatearDecimal(totalRetencionesIvaRecibidas),
          retenciones_renta_recibidas: this.formatearDecimal(totalRetencionesRentaRecibidas)
        },
        compras: compras.map(c => c.get({ plain: true })),
        ventas: ventas.map(v => v.get({ plain: true })),
        ventas_agrupadas: ventasAgrupadas, // Ventas agrupadas para vista previa XML
        exportaciones: exportaciones.map(e => e.get({ plain: true }))
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error al obtener vista previa: ${error.message}`, 500);
    }
  }
}

module.exports = new AtsGeneratorService();
