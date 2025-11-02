const { Venta, Empresa, Usuario } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

/**
 * Servicio de gestión de ventas
 */
class VentaService {
  /**
   * Obtener todas las ventas con filtros
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros de búsqueda
   * @param {number} pagina - Número de página
   * @param {number} limite - Registros por página
   * @returns {Object} Lista de ventas y metadatos
   */
  async obtenerTodas(empresaId, filtros = {}, pagina = 1, limite = 20) {
    const offset = (pagina - 1) * limite;
    const where = { empresa_id: empresaId };

    // Aplicar filtros
    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.identificacion_cliente) {
      where.identificacion_cliente = { [Op.like]: `%${filtros.identificacion_cliente}%` };
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const { rows, count } = await Venta.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['fecha_emision', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    return {
      ventas: rows,
      paginacion: {
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(count / limite)
      }
    };
  }

  /**
   * Obtener venta por ID
   * @param {number} id - ID de la venta
   * @param {number} empresaId - ID de la empresa
   * @returns {Object} Venta
   */
  async obtenerPorId(id, empresaId) {
    const venta = await Venta.findOne({
      where: { id, empresa_id: empresaId },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    if (!venta) {
      throw new AppError('Venta no encontrada', 404);
    }

    return venta;
  }

  /**
   * Crear nueva venta
   * @param {Object} datos - Datos de la venta
   * @param {number} usuarioId - ID del usuario que crea
   * @returns {Object} Venta creada
   */
  async crear(datos, usuarioId) {
    // Agregar usuario_id
    datos.usuario_id = usuarioId;

    // Validar totales
    this.validarTotales(datos);

    const venta = await Venta.create(datos);
    return venta;
  }

  /**
   * Actualizar venta
   * @param {number} id - ID de la venta
   * @param {number} empresaId - ID de la empresa
   * @param {Object} datos - Datos a actualizar
   * @returns {Object} Venta actualizada
   */
  async actualizar(id, empresaId, datos) {
    const venta = await Venta.findOne({
      where: { id, empresa_id: empresaId }
    });

    if (!venta) {
      throw new AppError('Venta no encontrada', 404);
    }

    // No permitir actualizar si ya está incluida en ATS
    if (venta.estado === 'INCLUIDO_ATS') {
      throw new AppError('No se puede modificar una venta ya incluida en el ATS', 400);
    }

    // Validar totales si se modifican
    if (datos.total_venta) {
      this.validarTotales({ ...venta.toJSON(), ...datos });
    }

    await venta.update(datos);
    return venta;
  }

  /**
   * Eliminar venta
   * @param {number} id - ID de la venta
   * @param {number} empresaId - ID de la empresa
   */
  async eliminar(id, empresaId) {
    const venta = await Venta.findOne({
      where: { id, empresa_id: empresaId }
    });

    if (!venta) {
      throw new AppError('Venta no encontrada', 404);
    }

    // No permitir eliminar si ya está incluida en ATS
    if (venta.estado === 'INCLUIDO_ATS') {
      throw new AppError('No se puede eliminar una venta ya incluida en el ATS', 400);
    }

    // Cambiar estado a ANULADO
    await venta.update({ estado: 'ANULADO' });

    return { mensaje: 'Venta anulada correctamente' };
  }

  /**
   * Validar venta
   * @param {number} id - ID de la venta
   * @param {number} empresaId - ID de la empresa
   * @returns {Object} Venta validada
   */
  async validar(id, empresaId) {
    const venta = await Venta.findOne({
      where: { id, empresa_id: empresaId }
    });

    if (!venta) {
      throw new AppError('Venta no encontrada', 404);
    }

    // Validar totales
    this.validarTotales(venta);

    await venta.update({ estado: 'VALIDADO' });
    return venta;
  }

  /**
   * Anular venta
   * @param {number} id - ID de la venta
   * @param {number} empresaId - ID de la empresa
   * @returns {Object} Venta anulada
   */
  async anular(id, empresaId) {
    const venta = await Venta.findOne({
      where: { id, empresa_id: empresaId }
    });

    if (!venta) {
      throw new AppError('Venta no encontrada', 404);
    }

    // No permitir anular si ya está incluida en ATS
    if (venta.estado === 'INCLUIDO_ATS') {
      throw new AppError('No se puede anular una venta ya incluida en el ATS', 400);
    }

    await venta.update({ estado: 'ANULADO' });
    return venta;
  }

  /**
   * Eliminar permanentemente todas las ventas en estado ANULADO
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros opcionales (periodo, cliente, etc.)
   * @returns {Object} Resultado de la eliminación
   */
  async eliminarAnulados(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      estado: 'ANULADO'
    };

    // Aplicar filtros adicionales si existen
    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.identificacion_cliente) {
      where.identificacion_cliente = { [Op.like]: `%${filtros.identificacion_cliente}%` };
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    // Contar ventas ANULADAS que cumplan los filtros
    const count = await Venta.count({ where });

    if (count === 0) {
      return {
        mensaje: 'No hay ventas anuladas para eliminar',
        eliminados: 0
      };
    }

    // Eliminar las ventas
    const eliminados = await Venta.destroy({ where });

    return {
      mensaje: `${eliminados} venta(s) anulada(s) eliminada(s) permanentemente`,
      eliminados
    };
  }

  /**
   * Validación de totales (lógica de negocio)
   * @param {Object} datos - Datos de la venta
   * @throws {AppError} Si los totales no cuadran
   */
  validarTotales(datos) {
    const baseTotal =
      parseFloat(datos.base_imponible_0 || 0) +
      parseFloat(datos.base_imponible_iva || 0) +
      parseFloat(datos.base_imponible_no_objeto_iva || 0) +
      parseFloat(datos.base_imponible_exento_iva || 0);

    const totalCalculado = baseTotal +
      parseFloat(datos.monto_iva || 0) +
      parseFloat(datos.monto_ice || 0);

    const totalRegistrado = parseFloat(datos.total_venta || 0);
    const diferencia = Math.abs(totalCalculado - totalRegistrado);

    // Permitir diferencia de 0.05 por redondeo
    if (diferencia > 0.05) {
      console.error('Error de validación de totales:', {
        baseTotal,
        totalCalculado: totalCalculado.toFixed(2),
        totalRegistrado: totalRegistrado.toFixed(2),
        diferencia: diferencia.toFixed(2),
        datos
      });
      throw new AppError(
        `El total de la venta no cuadra. Calculado: ${totalCalculado.toFixed(2)}, Registrado: ${totalRegistrado.toFixed(2)}. Diferencia: ${diferencia.toFixed(2)}`,
        400
      );
    }

    return true;
  }

  /**
   * Obtener resumen de ventas por periodo
   * @param {number} empresaId - ID de la empresa
   * @param {string} periodo - Periodo formato MM/AAAA
   * @returns {Object} Resumen de ventas
   */
  async obtenerResumenPorPeriodo(empresaId, periodo) {
    const ventas = await Venta.findAll({
      where: {
        empresa_id: empresaId,
        periodo,
        estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
      }
    });

    const resumen = {
      total_ventas: ventas.length,
      base_imponible_0: 0,
      base_imponible_iva: 0,
      total_iva: 0,
      total_retenciones_iva: 0,
      total_retenciones_renta: 0,
      total_general: 0
    };

    ventas.forEach(venta => {
      resumen.base_imponible_0 += parseFloat(venta.base_imponible_0 || 0);
      resumen.base_imponible_iva += parseFloat(venta.base_imponible_iva || 0);
      resumen.total_iva += parseFloat(venta.monto_iva || 0);
      resumen.total_retenciones_iva += parseFloat(venta.valor_retencion_iva || 0);
      resumen.total_retenciones_renta += parseFloat(venta.valor_retencion_renta || 0);
      resumen.total_general += parseFloat(venta.total_venta || 0);
    });

    // Redondear a 2 decimales
    Object.keys(resumen).forEach(key => {
      if (typeof resumen[key] === 'number' && key !== 'total_ventas') {
        resumen[key] = parseFloat(resumen[key].toFixed(2));
      }
    });

    return resumen;
  }

  /**
   * Reporte de ventas agrupadas por cliente
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros
   * @returns {Array} Ventas agrupadas por cliente
   */
  async reportePorCliente(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
    };

    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const ventas = await Venta.findAll({
      where,
      order: [['razon_social_cliente', 'ASC'], ['fecha_emision', 'DESC']]
    });

    // Agrupar por cliente
    const agrupado = {};
    ventas.forEach(venta => {
      const key = venta.identificacion_cliente;
      if (!agrupado[key]) {
        agrupado[key] = {
          identificacion: venta.identificacion_cliente,
          razon_social: venta.razon_social_cliente,
          cantidad_ventas: 0,
          total_ventas: 0,
          total_iva: 0,
          ventas: []
        };
      }

      agrupado[key].cantidad_ventas++;
      agrupado[key].total_ventas += parseFloat(venta.total_venta || 0);
      agrupado[key].total_iva += parseFloat(venta.monto_iva || 0);
      agrupado[key].ventas.push(venta);
    });

    // Ordenar por total ventas descendente
    return Object.values(agrupado).sort((a, b) => b.total_ventas - a.total_ventas);
  }

  /**
   * Reporte de ventas agrupadas por porcentaje de IVA
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros
   * @returns {Array} Ventas agrupadas por porcentaje de IVA
   */
  async reportePorPorcentajeIVA(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
    };

    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const ventas = await Venta.findAll({ where });

    // Categorizar por porcentaje de IVA
    const categorias = {
      '0%': { porcentaje: '0%', cantidad: 0, base_imponible: 0, monto_iva: 0, ventas: [] },
      '12%': { porcentaje: '12%', cantidad: 0, base_imponible: 0, monto_iva: 0, ventas: [] },
      '15%': { porcentaje: '15%', cantidad: 0, base_imponible: 0, monto_iva: 0, ventas: [] },
      'NO_OBJETO': { porcentaje: 'No Objeto IVA', cantidad: 0, base_imponible: 0, monto_iva: 0, ventas: [] },
      'EXENTO': { porcentaje: 'Exento IVA', cantidad: 0, base_imponible: 0, monto_iva: 0, ventas: [] }
    };

    ventas.forEach(venta => {
      if (parseFloat(venta.base_imponible_0 || 0) > 0) {
        categorias['0%'].cantidad++;
        categorias['0%'].base_imponible += parseFloat(venta.base_imponible_0);
        categorias['0%'].ventas.push(venta);
      }
      if (parseFloat(venta.base_imponible_iva || 0) > 0) {
        const porcentaje_iva = parseFloat(venta.monto_iva) / parseFloat(venta.base_imponible_iva) * 100;
        if (porcentaje_iva >= 14 && porcentaje_iva <= 16) {
          categorias['15%'].cantidad++;
          categorias['15%'].base_imponible += parseFloat(venta.base_imponible_iva);
          categorias['15%'].monto_iva += parseFloat(venta.monto_iva);
          categorias['15%'].compras.push(venta);
        } else {
          categorias['12%'].cantidad++;
          categorias['12%'].base_imponible += parseFloat(venta.base_imponible_iva);
          categorias['12%'].monto_iva += parseFloat(venta.monto_iva);
          categorias['12%'].ventas.push(venta);
        }
      }
      if (parseFloat(venta.base_imponible_no_objeto_iva || 0) > 0) {
        categorias['NO_OBJETO'].cantidad++;
        categorias['NO_OBJETO'].base_imponible += parseFloat(venta.base_imponible_no_objeto_iva);
        categorias['NO_OBJETO'].ventas.push(venta);
      }
      if (parseFloat(venta.base_imponible_exento_iva || 0) > 0) {
        categorias['EXENTO'].cantidad++;
        categorias['EXENTO'].base_imponible += parseFloat(venta.base_imponible_exento_iva);
        categorias['EXENTO'].ventas.push(venta);
      }
    });

    return Object.values(categorias).filter(cat => cat.cantidad > 0);
  }

  /**
   * Reporte de ventas por tipo de comprobante
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros
   * @returns {Array} Ventas agrupadas por tipo de comprobante
   */
  async reportePorTipoComprobante(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
    };

    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const ventas = await Venta.findAll({ where });

    // Agrupar por tipo de comprobante
    const agrupado = {};
    ventas.forEach(venta => {
      const tipo = venta.tipo_comprobante || '01'; // Default: Factura
      const nombre_tipo = {
        '01': 'Factura',
        '04': 'Nota de Crédito',
        '05': 'Nota de Débito',
        '06': 'Guía de Remisión',
        '07': 'Comprobante de Retención'
      }[tipo] || 'Otro';

      if (!agrupado[tipo]) {
        agrupado[tipo] = {
          codigo_tipo: tipo,
          nombre_tipo: nombre_tipo,
          cantidad: 0,
          total_ventas: 0,
          total_iva: 0,
          ventas: []
        };
      }

      agrupado[tipo].cantidad++;
      agrupado[tipo].total_ventas += parseFloat(venta.total_venta || 0);
      agrupado[tipo].total_iva += parseFloat(venta.monto_iva || 0);
      agrupado[tipo].ventas.push(venta);
    });

    return Object.values(agrupado).sort((a, b) => b.total_ventas - a.total_ventas);
  }

  /**
   * Reporte detallado de ventas de un cliente específico
   * @param {number} empresaId - ID de la empresa
   * @param {string} identificacionCliente - RUC/Cédula del cliente
   * @param {Object} filtros - Filtros (periodo_inicio, periodo_fin, fecha_desde, fecha_hasta)
   * @returns {Object} Detalle completo de ventas del cliente
   */
  async reporteDetalladoCliente(empresaId, identificacionCliente, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      identificacion_cliente: identificacionCliente,
      estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
    };

    // Filtro por rango de periodos
    if (filtros.periodo_inicio && filtros.periodo_fin) {
      const periodos = this.generarRangoPeriodos(filtros.periodo_inicio, filtros.periodo_fin);
      where.periodo = { [Op.in]: periodos };
    } else if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    // Filtro alternativo por fechas
    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const ventas = await Venta.findAll({
      where,
      order: [['fecha_emision', 'DESC']]
    });

    // Calcular totales
    const resumen = {
      cliente: {
        identificacion: identificacionCliente,
        razon_social: ventas.length > 0 ? ventas[0].razon_social_cliente : '',
      },
      periodo_inicio: filtros.periodo_inicio || filtros.periodo,
      periodo_fin: filtros.periodo_fin || filtros.periodo,
      cantidad_ventas: ventas.length,
      totales: {
        base_0: 0,
        base_iva: 0,
        base_no_objeto: 0,
        base_exento: 0,
        total_iva: 0,
        total_ice: 0,
        total_ventas: 0
      },
      ventas: []
    };

    // Procesar cada venta
    ventas.forEach(venta => {
      resumen.totales.base_0 += parseFloat(venta.base_imponible_0 || 0);
      resumen.totales.base_iva += parseFloat(venta.base_imponible_iva || 0);
      resumen.totales.base_no_objeto += parseFloat(venta.base_imponible_no_objeto_iva || 0);
      resumen.totales.base_exento += parseFloat(venta.base_imponible_exento_iva || 0);
      resumen.totales.total_iva += parseFloat(venta.monto_iva || 0);
      resumen.totales.total_ice += parseFloat(venta.monto_ice || 0);
      resumen.totales.total_ventas += parseFloat(venta.total_venta || 0);

      // Agregar al detalle
      resumen.ventas.push({
        id: venta.id,
        periodo: venta.periodo,
        fecha_emision: venta.fecha_emision,
        tipo_comprobante: venta.tipo_comprobante,
        establecimiento: venta.establecimiento,
        punto_emision: venta.punto_emision,
        secuencial: venta.secuencial,
        numero_autorizacion: venta.numero_autorizacion,
        base_0: parseFloat(venta.base_imponible_0 || 0),
        base_iva: parseFloat(venta.base_imponible_iva || 0),
        monto_iva: parseFloat(venta.monto_iva || 0),
        total_venta: parseFloat(venta.total_venta || 0)
      });
    });

    // Redondear totales
    Object.keys(resumen.totales).forEach(key => {
      if (typeof resumen.totales[key] === 'number') {
        resumen.totales[key] = parseFloat(resumen.totales[key].toFixed(2));
      }
    });

    return resumen;
  }

  /**
   * Generar lista de periodos en un rango
   * @param {string} inicio - Periodo inicio (MM/YYYY)
   * @param {string} fin - Periodo fin (MM/YYYY)
   * @returns {Array} Lista de periodos
   */
  generarRangoPeriodos(inicio, fin) {
    const periodos = [];
    const [mesInicio, anioInicio] = inicio.split('/').map(Number);
    const [mesFin, anioFin] = fin.split('/').map(Number);

    let mes = mesInicio;
    let anio = anioInicio;

    while (anio < anioFin || (anio === anioFin && mes <= mesFin)) {
      periodos.push(`${mes.toString().padStart(2, '0')}/${anio}`);
      mes++;
      if (mes > 12) {
        mes = 1;
        anio++;
      }
    }

    return periodos;
  }
}

module.exports = new VentaService();
