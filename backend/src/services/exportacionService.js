const { Exportacion, Empresa, Usuario } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Servicio de gestión de exportaciones
 */
class ExportacionService {
  /**
   * Obtener todas las exportaciones con filtros
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros de búsqueda
   * @param {number} pagina - Número de página
   * @param {number} limite - Registros por página
   * @returns {Object} Lista de exportaciones y metadatos
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

    if (filtros.pais_destino) {
      where.pais_destino = filtros.pais_destino;
    }

    if (filtros.tipo_cliente) {
      where.tipo_cliente = filtros.tipo_cliente;
    }

    if (filtros.anio_exportacion) {
      where.anio_exportacion = filtros.anio_exportacion;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const { rows, count } = await Exportacion.findAndCountAll({
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
      exportaciones: rows,
      paginacion: {
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(count / limite)
      }
    };
  }

  /**
   * Obtener exportación por ID
   * @param {number} id - ID de la exportación
   * @param {number} empresaId - ID de la empresa
   * @returns {Object} Exportación
   */
  async obtenerPorId(id, empresaId) {
    const exportacion = await Exportacion.findOne({
      where: { id, empresa_id: empresaId },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    if (!exportacion) {
      throw new AppError('Exportación no encontrada', 404);
    }

    return exportacion;
  }

  /**
   * Crear nueva exportación
   * @param {Object} datos - Datos de la exportación
   * @param {number} usuarioId - ID del usuario que crea
   * @returns {Object} Exportación creada
   */
  async crear(datos, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      // Agregar usuario_id
      datos.usuario_id = usuarioId;

      // Validar que el año de exportación sea coherente con la fecha de emisión
      if (datos.anio_exportacion && datos.fecha_emision) {
        const anioFecha = new Date(datos.fecha_emision).getFullYear();
        if (Math.abs(datos.anio_exportacion - anioFecha) > 1) {
          console.warn(`Advertencia: El año de exportación (${datos.anio_exportacion}) difiere significativamente del año de emisión (${anioFecha})`);
        }
      }

      // Validar valor FOB compensación no mayor que valor FOB comprobante
      if (datos.valor_fob_compensacion > datos.valor_fob_comprobante) {
        throw new AppError('El valor FOB de compensación no puede ser mayor al valor FOB del comprobante', 400);
      }

      // Crear la exportación
      const exportacion = await Exportacion.create(datos, { transaction });

      await transaction.commit();

      // Cargar la exportación con sus relaciones
      const exportacionCompleta = await this.obtenerPorId(exportacion.id, datos.empresa_id);

      return exportacionCompleta;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Actualizar exportación
   * @param {number} id - ID de la exportación
   * @param {number} empresaId - ID de la empresa
   * @param {Object} datos - Datos a actualizar
   * @returns {Object} Exportación actualizada
   */
  async actualizar(id, empresaId, datos) {
    const transaction = await sequelize.transaction();

    try {
      const exportacion = await Exportacion.findOne({
        where: { id, empresa_id: empresaId },
        transaction
      });

      if (!exportacion) {
        throw new AppError('Exportación no encontrada', 404);
      }

      // No permitir actualizar si ya está incluida en ATS
      if (exportacion.estado === 'INCLUIDO_ATS') {
        throw new AppError('No se puede modificar una exportación ya incluida en el ATS', 400);
      }

      // Validar valores FOB si se modifican
      const valorFobComprobante = datos.valor_fob_comprobante ?? exportacion.valor_fob_comprobante;
      const valorFobCompensacion = datos.valor_fob_compensacion ?? exportacion.valor_fob_compensacion;

      if (valorFobCompensacion > valorFobComprobante) {
        throw new AppError('El valor FOB de compensación no puede ser mayor al valor FOB del comprobante', 400);
      }

      // Actualizar la exportación
      await exportacion.update(datos, { transaction });

      await transaction.commit();

      // Cargar la exportación actualizada
      const exportacionActualizada = await this.obtenerPorId(id, empresaId);
      return exportacionActualizada;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Eliminar exportación (anular)
   * @param {number} id - ID de la exportación
   * @param {number} empresaId - ID de la empresa
   */
  async eliminar(id, empresaId) {
    const exportacion = await Exportacion.findOne({
      where: { id, empresa_id: empresaId }
    });

    if (!exportacion) {
      throw new AppError('Exportación no encontrada', 404);
    }

    // No permitir eliminar si ya está incluida en ATS
    if (exportacion.estado === 'INCLUIDO_ATS') {
      throw new AppError('No se puede eliminar una exportación ya incluida en el ATS', 400);
    }

    // Cambiar estado a ANULADO
    await exportacion.update({ estado: 'ANULADO' });

    return { mensaje: 'Exportación anulada correctamente' };
  }

  /**
   * Validar exportación
   * @param {number} id - ID de la exportación
   * @param {number} empresaId - ID de la empresa
   * @returns {Object} Exportación validada
   */
  async validar(id, empresaId) {
    const exportacion = await Exportacion.findOne({
      where: { id, empresa_id: empresaId }
    });

    if (!exportacion) {
      throw new AppError('Exportación no encontrada', 404);
    }

    if (exportacion.estado === 'ANULADO') {
      throw new AppError('No se puede validar una exportación anulada', 400);
    }

    // Validar valores FOB
    if (exportacion.valor_fob_compensacion > exportacion.valor_fob_comprobante) {
      throw new AppError('El valor FOB de compensación no puede ser mayor al valor FOB del comprobante', 400);
    }

    await exportacion.update({ estado: 'VALIDADO' });
    return exportacion;
  }

  /**
   * Validar múltiples exportaciones en estado BORRADOR
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros opcionales (periodo, cliente, etc.)
   * @returns {Object} Resultado de la validación masiva
   */
  async validarMasivo(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      estado: 'BORRADOR'
    };

    // Aplicar filtros adicionales si existen
    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.identificacion_cliente) {
      where.identificacion_cliente = { [Op.like]: `%${filtros.identificacion_cliente}%` };
    }

    if (filtros.pais_destino) {
      where.pais_destino = filtros.pais_destino;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    // Obtener todas las exportaciones en BORRADOR
    const exportaciones = await Exportacion.findAll({ where });

    if (exportaciones.length === 0) {
      throw new AppError('No hay exportaciones en estado BORRADOR para validar', 404);
    }

    const resultados = {
      total: exportaciones.length,
      validadas: 0,
      errores: []
    };

    // Validar cada exportación
    for (const exportacion of exportaciones) {
      try {
        // Validar valores FOB
        if (exportacion.valor_fob_compensacion > exportacion.valor_fob_comprobante) {
          throw new AppError('El valor FOB de compensación no puede ser mayor al valor FOB del comprobante');
        }

        // Actualizar estado
        await exportacion.update({ estado: 'VALIDADO' });
        resultados.validadas++;
      } catch (error) {
        resultados.errores.push({
          id: exportacion.id,
          cliente: exportacion.razon_social_cliente,
          fecha: exportacion.fecha_emision,
          numero: `${exportacion.establecimiento}-${exportacion.punto_emision}-${exportacion.secuencial}`,
          error: error.message
        });
      }
    }

    return resultados;
  }

  /**
   * Obtener resumen de exportaciones por periodo
   * @param {number} empresaId - ID de la empresa
   * @param {string} periodo - Periodo formato MM/AAAA
   * @returns {Object} Resumen de exportaciones
   */
  async obtenerResumenPorPeriodo(empresaId, periodo) {
    const exportaciones = await Exportacion.findAll({
      where: {
        empresa_id: empresaId,
        periodo,
        estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
      }
    });

    const resumen = {
      total_exportaciones: exportaciones.length,
      por_tipo_cliente: {
        persona_natural: 0,
        sociedad: 0
      },
      por_pais_destino: {},
      valor_fob_total: 0,
      valor_fob_compensacion_total: 0,
      valor_fob_neto: 0
    };

    exportaciones.forEach(exportacion => {
      // Contadores por tipo de cliente
      if (exportacion.tipo_cliente === '01') {
        resumen.por_tipo_cliente.persona_natural++;
      } else if (exportacion.tipo_cliente === '02') {
        resumen.por_tipo_cliente.sociedad++;
      }

      // Agrupación por país destino
      const pais = exportacion.pais_destino;
      if (!resumen.por_pais_destino[pais]) {
        resumen.por_pais_destino[pais] = {
          pais_codigo: pais,
          cantidad: 0,
          valor_fob: 0
        };
      }
      resumen.por_pais_destino[pais].cantidad++;
      resumen.por_pais_destino[pais].valor_fob += parseFloat(exportacion.valor_fob_comprobante || 0);

      // Totales
      resumen.valor_fob_total += parseFloat(exportacion.valor_fob_comprobante || 0);
      resumen.valor_fob_compensacion_total += parseFloat(exportacion.valor_fob_compensacion || 0);
    });

    // Calcular valor neto
    resumen.valor_fob_neto = resumen.valor_fob_total - resumen.valor_fob_compensacion_total;

    // Redondear a 2 decimales
    resumen.valor_fob_total = parseFloat(resumen.valor_fob_total.toFixed(2));
    resumen.valor_fob_compensacion_total = parseFloat(resumen.valor_fob_compensacion_total.toFixed(2));
    resumen.valor_fob_neto = parseFloat(resumen.valor_fob_neto.toFixed(2));

    // Redondear valores por país
    Object.keys(resumen.por_pais_destino).forEach(pais => {
      resumen.por_pais_destino[pais].valor_fob =
        parseFloat(resumen.por_pais_destino[pais].valor_fob.toFixed(2));
    });

    // Convertir por_pais_destino a array ordenado por valor descendente
    resumen.por_pais_destino = Object.values(resumen.por_pais_destino)
      .sort((a, b) => b.valor_fob - a.valor_fob);

    return resumen;
  }

  /**
   * Buscar exportaciones por cliente
   * @param {number} empresaId - ID de la empresa
   * @param {string} identificacionCliente - Identificación del cliente
   * @param {string} periodo - Periodo opcional MM/AAAA
   * @returns {Array} Lista de exportaciones del cliente
   */
  async buscarPorCliente(empresaId, identificacionCliente, periodo = null) {
    const where = {
      empresa_id: empresaId,
      identificacion_cliente: identificacionCliente,
      estado: { [Op.ne]: 'ANULADO' }
    };

    if (periodo) {
      where.periodo = periodo;
    }

    const exportaciones = await Exportacion.findAll({
      where,
      order: [['fecha_emision', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    return exportaciones;
  }

  /**
   * Obtener resumen por país de destino
   * @param {number} empresaId - ID de la empresa
   * @param {string} periodo - Periodo formato MM/AAAA
   * @returns {Array} Resumen agrupado por país
   */
  async obtenerResumenPorPais(empresaId, periodo) {
    const exportaciones = await Exportacion.findAll({
      where: {
        empresa_id: empresaId,
        periodo,
        estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
      },
      attributes: [
        'pais_destino',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('valor_fob_comprobante')), 'valor_fob_total'],
        [sequelize.fn('SUM', sequelize.col('valor_fob_compensacion')), 'valor_fob_compensacion_total']
      ],
      group: ['pais_destino'],
      order: [[sequelize.fn('SUM', sequelize.col('valor_fob_comprobante')), 'DESC']]
    });

    return exportaciones.map(exp => ({
      pais_destino: exp.pais_destino,
      cantidad: parseInt(exp.getDataValue('cantidad')),
      valor_fob_total: parseFloat(parseFloat(exp.getDataValue('valor_fob_total') || 0).toFixed(2)),
      valor_fob_compensacion_total: parseFloat(parseFloat(exp.getDataValue('valor_fob_compensacion_total') || 0).toFixed(2)),
      valor_fob_neto: parseFloat((parseFloat(exp.getDataValue('valor_fob_total') || 0) - parseFloat(exp.getDataValue('valor_fob_compensacion_total') || 0)).toFixed(2))
    }));
  }

  /**
   * Obtener exportaciones por año
   * @param {number} empresaId - ID de la empresa
   * @param {number} anio - Año de exportación
   * @returns {Array} Lista de exportaciones del año
   */
  async obtenerPorAnio(empresaId, anio) {
    const exportaciones = await Exportacion.findAll({
      where: {
        empresa_id: empresaId,
        anio_exportacion: anio,
        estado: { [Op.ne]: 'ANULADO' }
      },
      order: [['fecha_emision', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    return exportaciones;
  }
}

module.exports = new ExportacionService();
