const { Retencion, Empresa, Usuario, Compra } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Servicio de gestión de retenciones
 */
class RetencionService {
  /**
   * Obtener todas las retenciones con filtros
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros de búsqueda
   * @param {number} pagina - Número de página
   * @param {number} limite - Registros por página
   * @returns {Object} Lista de retenciones y metadatos
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

    if (filtros.identificacion_proveedor) {
      where.identificacion_proveedor = { [Op.like]: `%${filtros.identificacion_proveedor}%` };
    }

    if (filtros.tipo_impuesto) {
      where.tipo_impuesto = filtros.tipo_impuesto;
    }

    if (filtros.compra_id) {
      where.compra_id = filtros.compra_id;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const { rows, count } = await Retencion.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['fecha_emision', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Compra,
          as: 'compra',
          required: false,
          attributes: ['id', 'numero_factura', 'total_compra', 'fecha_emision']
        }
      ]
    });

    return {
      retenciones: rows,
      paginacion: {
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(count / limite)
      }
    };
  }

  /**
   * Obtener retención por ID
   * @param {number} id - ID de la retención
   * @param {number} empresaId - ID de la empresa
   * @returns {Object} Retención
   */
  async obtenerPorId(id, empresaId) {
    const retencion = await Retencion.findOne({
      where: { id, empresa_id: empresaId },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Compra,
          as: 'compra',
          required: false,
          attributes: ['id', 'numero_factura', 'total_compra', 'fecha_emision', 'razon_social_proveedor']
        }
      ]
    });

    if (!retencion) {
      throw new AppError('Retención no encontrada', 404);
    }

    return retencion;
  }

  /**
   * Crear nueva retención
   * @param {Object} datos - Datos de la retención
   * @param {number} usuarioId - ID del usuario que crea
   * @returns {Object} Retención creada
   */
  async crear(datos, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      // Agregar usuario_id
      datos.usuario_id = usuarioId;

      // Validar que el valor retenido sea correcto según la base y el porcentaje
      this.validarCalculoRetencion(datos);

      // Si hay compra_id asociada, validar que la compra existe y pertenece a la empresa
      if (datos.compra_id) {
        const compra = await Compra.findOne({
          where: { id: datos.compra_id, empresa_id: datos.empresa_id },
          transaction
        });

        if (!compra) {
          throw new AppError('La compra asociada no existe o no pertenece a esta empresa', 400);
        }

        // Heredar datos del proveedor de la compra si no se proporcionan
        if (!datos.identificacion_proveedor) {
          datos.identificacion_proveedor = compra.identificacion_proveedor;
        }
        if (!datos.razon_social_proveedor) {
          datos.razon_social_proveedor = compra.razon_social_proveedor;
        }
        if (!datos.tipo_identificacion) {
          datos.tipo_identificacion = compra.tipo_identificacion;
        }
      }

      // Crear la retención
      const retencion = await Retencion.create(datos, { transaction });

      // Si está asociada a una compra, actualizar los totales de retención de la compra
      if (datos.compra_id) {
        await this.actualizarTotalesCompra(datos.compra_id, transaction);
      }

      await transaction.commit();

      // Cargar la retención con sus relaciones
      const retencionCompleta = await this.obtenerPorId(retencion.id, datos.empresa_id);

      return retencionCompleta;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Actualizar retención
   * @param {number} id - ID de la retención
   * @param {number} empresaId - ID de la empresa
   * @param {Object} datos - Datos a actualizar
   * @returns {Object} Retención actualizada
   */
  async actualizar(id, empresaId, datos) {
    const transaction = await sequelize.transaction();

    try {
      const retencion = await Retencion.findOne({
        where: { id, empresa_id: empresaId },
        transaction
      });

      if (!retencion) {
        throw new AppError('Retención no encontrada', 404);
      }

      // No permitir actualizar si ya está incluida en ATS
      if (retencion.estado === 'INCLUIDO_ATS') {
        throw new AppError('No se puede modificar una retención ya incluida en el ATS', 400);
      }

      // Validar cálculos si se modifican valores monetarios o porcentajes
      if (datos.base_imponible !== undefined ||
          datos.porcentaje_retencion !== undefined ||
          datos.valor_retenido !== undefined) {

        const datosValidacion = {
          base_imponible: datos.base_imponible ?? retencion.base_imponible,
          porcentaje_retencion: datos.porcentaje_retencion ?? retencion.porcentaje_retencion,
          valor_retenido: datos.valor_retenido ?? retencion.valor_retenido
        };

        this.validarCalculoRetencion(datosValidacion);
      }

      const compraIdAnterior = retencion.compra_id;

      // Actualizar la retención
      await retencion.update(datos, { transaction });

      // Actualizar totales de compra si hay cambios en la asociación
      if (compraIdAnterior && compraIdAnterior !== datos.compra_id) {
        // Actualizar la compra anterior
        await this.actualizarTotalesCompra(compraIdAnterior, transaction);
      }

      if (datos.compra_id) {
        // Actualizar la nueva compra
        await this.actualizarTotalesCompra(datos.compra_id, transaction);
      }

      await transaction.commit();

      // Cargar la retención actualizada
      const retencionActualizada = await this.obtenerPorId(id, empresaId);
      return retencionActualizada;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Eliminar retención (anular)
   * @param {number} id - ID de la retención
   * @param {number} empresaId - ID de la empresa
   */
  async eliminar(id, empresaId) {
    const transaction = await sequelize.transaction();

    try {
      const retencion = await Retencion.findOne({
        where: { id, empresa_id: empresaId },
        transaction
      });

      if (!retencion) {
        throw new AppError('Retención no encontrada', 404);
      }

      // No permitir eliminar si ya está incluida en ATS
      if (retencion.estado === 'INCLUIDO_ATS') {
        throw new AppError('No se puede eliminar una retención ya incluida en el ATS', 400);
      }

      const compraId = retencion.compra_id;

      // Cambiar estado a ANULADO
      await retencion.update({ estado: 'ANULADO' }, { transaction });

      // Actualizar totales de la compra si está asociada
      if (compraId) {
        await this.actualizarTotalesCompra(compraId, transaction);
      }

      await transaction.commit();

      return { mensaje: 'Retención anulada correctamente' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Validar retención (cambiar estado a VALIDADO)
   * @param {number} id - ID de la retención
   * @param {number} empresaId - ID de la empresa
   * @returns {Object} Retención validada
   */
  async validar(id, empresaId) {
    const retencion = await Retencion.findOne({
      where: { id, empresa_id: empresaId }
    });

    if (!retencion) {
      throw new AppError('Retención no encontrada', 404);
    }

    if (retencion.estado === 'ANULADO') {
      throw new AppError('No se puede validar una retención anulada', 400);
    }

    // Validar cálculos
    this.validarCalculoRetencion(retencion);

    await retencion.update({ estado: 'VALIDADO' });
    return retencion;
  }

  /**
   * Validar múltiples retenciones en estado BORRADOR
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros opcionales (periodo, proveedor, etc.)
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

    if (filtros.identificacion_proveedor) {
      where.identificacion_proveedor = { [Op.like]: `%${filtros.identificacion_proveedor}%` };
    }

    if (filtros.tipo_impuesto) {
      where.tipo_impuesto = filtros.tipo_impuesto;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    // Obtener todas las retenciones en BORRADOR
    const retenciones = await Retencion.findAll({ where });

    if (retenciones.length === 0) {
      throw new AppError('No hay retenciones en estado BORRADOR para validar', 404);
    }

    const resultados = {
      total: retenciones.length,
      validadas: 0,
      errores: []
    };

    // Validar cada retención
    for (const retencion of retenciones) {
      try {
        // Validar cálculos
        this.validarCalculoRetencion(retencion);

        // Actualizar estado
        await retencion.update({ estado: 'VALIDADO' });
        resultados.validadas++;
      } catch (error) {
        resultados.errores.push({
          id: retencion.id,
          proveedor: retencion.razon_social_proveedor,
          fecha: retencion.fecha_emision,
          numero: `${retencion.establecimiento}-${retencion.punto_emision}-${retencion.secuencial}`,
          error: error.message
        });
      }
    }

    return resultados;
  }

  /**
   * Obtener retenciones por compra
   * @param {number} compraId - ID de la compra
   * @param {number} empresaId - ID de la empresa
   * @returns {Array} Lista de retenciones
   */
  async obtenerPorCompra(compraId, empresaId) {
    const retenciones = await Retencion.findAll({
      where: {
        compra_id: compraId,
        empresa_id: empresaId,
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

    return retenciones;
  }

  /**
   * Obtener resumen de retenciones por periodo
   * @param {number} empresaId - ID de la empresa
   * @param {string} periodo - Periodo formato MM/AAAA
   * @returns {Object} Resumen de retenciones
   */
  async obtenerResumenPorPeriodo(empresaId, periodo) {
    const retenciones = await Retencion.findAll({
      where: {
        empresa_id: empresaId,
        periodo,
        estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
      }
    });

    const resumen = {
      total_retenciones: retenciones.length,
      retenciones_iva: 0,
      retenciones_renta: 0,
      total_valor_retenido_iva: 0,
      total_valor_retenido_renta: 0,
      total_general: 0,
      por_codigo: {}
    };

    retenciones.forEach(retencion => {
      const valorRetenido = parseFloat(retencion.valor_retenido || 0);

      if (retencion.tipo_impuesto === 'IVA') {
        resumen.retenciones_iva++;
        resumen.total_valor_retenido_iva += valorRetenido;
      } else if (retencion.tipo_impuesto === 'RENTA') {
        resumen.retenciones_renta++;
        resumen.total_valor_retenido_renta += valorRetenido;
      }

      resumen.total_general += valorRetenido;

      // Agrupar por código de retención
      const codigo = retencion.codigo_retencion;
      if (!resumen.por_codigo[codigo]) {
        resumen.por_codigo[codigo] = {
          codigo: codigo,
          tipo: retencion.tipo_impuesto,
          cantidad: 0,
          valor_total: 0
        };
      }
      resumen.por_codigo[codigo].cantidad++;
      resumen.por_codigo[codigo].valor_total += valorRetenido;
    });

    // Redondear a 2 decimales
    resumen.total_valor_retenido_iva = parseFloat(resumen.total_valor_retenido_iva.toFixed(2));
    resumen.total_valor_retenido_renta = parseFloat(resumen.total_valor_retenido_renta.toFixed(2));
    resumen.total_general = parseFloat(resumen.total_general.toFixed(2));

    // Redondear valores por código
    Object.keys(resumen.por_codigo).forEach(codigo => {
      resumen.por_codigo[codigo].valor_total =
        parseFloat(resumen.por_codigo[codigo].valor_total.toFixed(2));
    });

    // Convertir por_codigo a array
    resumen.por_codigo = Object.values(resumen.por_codigo);

    return resumen;
  }

  /**
   * Validar cálculo de retención
   * @param {Object} datos - Datos de la retención
   * @throws {AppError} Si el cálculo no es correcto
   */
  validarCalculoRetencion(datos) {
    const baseImponible = parseFloat(datos.base_imponible || 0);
    const porcentaje = parseFloat(datos.porcentaje_retencion || 0);
    const valorRetenido = parseFloat(datos.valor_retenido || 0);

    // Calcular el valor esperado
    const valorCalculado = (baseImponible * porcentaje) / 100;
    const diferencia = Math.abs(valorCalculado - valorRetenido);

    // Permitir diferencia de 0.02 por redondeo
    if (diferencia > 0.02) {
      throw new AppError(
        `El valor retenido no corresponde al cálculo. Esperado: ${valorCalculado.toFixed(2)}, Registrado: ${valorRetenido.toFixed(2)}`,
        400
      );
    }

    return true;
  }

  /**
   * Actualizar totales de retención en una compra
   * @param {number} compraId - ID de la compra
   * @param {Object} transaction - Transacción de Sequelize
   */
  async actualizarTotalesCompra(compraId, transaction) {
    // Obtener todas las retenciones activas de la compra
    const retenciones = await Retencion.findAll({
      where: {
        compra_id: compraId,
        estado: { [Op.ne]: 'ANULADO' }
      },
      transaction
    });

    let totalRetencionIva = 0;
    let totalRetencionRenta = 0;

    retenciones.forEach(retencion => {
      const valor = parseFloat(retencion.valor_retenido || 0);
      if (retencion.tipo_impuesto === 'IVA') {
        totalRetencionIva += valor;
      } else if (retencion.tipo_impuesto === 'RENTA') {
        totalRetencionRenta += valor;
      }
    });

    // Actualizar la compra
    await Compra.update(
      {
        valor_retencion_iva: parseFloat(totalRetencionIva.toFixed(2)),
        valor_retencion_renta: parseFloat(totalRetencionRenta.toFixed(2))
      },
      {
        where: { id: compraId },
        transaction
      }
    );
  }

  /**
   * Buscar retenciones por proveedor
   * @param {number} empresaId - ID de la empresa
   * @param {string} identificacionProveedor - RUC o cédula del proveedor
   * @param {string} periodo - Periodo opcional MM/AAAA
   * @returns {Array} Lista de retenciones del proveedor
   */
  async buscarPorProveedor(empresaId, identificacionProveedor, periodo = null) {
    const where = {
      empresa_id: empresaId,
      identificacion_proveedor: identificacionProveedor,
      estado: { [Op.ne]: 'ANULADO' }
    };

    if (periodo) {
      where.periodo = periodo;
    }

    const retenciones = await Retencion.findAll({
      where,
      order: [['fecha_emision', 'DESC']],
      include: [
        {
          model: Compra,
          as: 'compra',
          required: false,
          attributes: ['id', 'numero_factura', 'total_compra']
        }
      ]
    });

    return retenciones;
  }
}

module.exports = new RetencionService();
