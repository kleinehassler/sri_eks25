const { CodigoRetencion } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

/**
 * Servicio de gestión de códigos de retención
 */
class CodigoRetencionService {
  /**
   * Obtener todos los códigos de retención (con paginación y filtros)
   * @param {Object} filtros - Filtros de búsqueda
   * @param {number} pagina - Número de página
   * @param {number} limite - Registros por página
   * @returns {Object} Lista de códigos y metadatos de paginación
   */
  async obtenerTodos(filtros = {}, pagina = 1, limite = 20) {
    const offset = (pagina - 1) * limite;
    const where = {};

    // Aplicar filtros
    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.busqueda) {
      where[Op.or] = [
        { codigo: { [Op.like]: `%${filtros.busqueda}%` } },
        { descripcion: { [Op.like]: `%${filtros.busqueda}%` } }
      ];
    }

    const { rows, count } = await CodigoRetencion.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['codigo', 'ASC']]
    });

    return {
      codigos: rows,
      paginacion: {
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(count / limite)
      }
    };
  }

  /**
   * Obtener código de retención por ID
   * @param {number} id - ID del código
   * @returns {Object} Código de retención
   */
  async obtenerPorId(id) {
    const codigo = await CodigoRetencion.findByPk(id);

    if (!codigo) {
      throw new AppError('Código de retención no encontrado', 404);
    }

    return codigo;
  }

  /**
   * Obtener código de retención por código
   * @param {string} codigo - Código de retención
   * @returns {Object} Código de retención
   */
  async obtenerPorCodigo(codigo) {
    const codigoRetencion = await CodigoRetencion.findOne({
      where: { codigo }
    });

    if (!codigoRetencion) {
      throw new AppError('Código de retención no encontrado', 404);
    }

    return codigoRetencion;
  }

  /**
   * Crear nuevo código de retención
   * @param {Object} datos - Datos del código
   * @returns {Object} Código creado
   */
  async crear(datos) {
    // Verificar que el código no esté duplicado
    const codigoExistente = await CodigoRetencion.findOne({
      where: { codigo: datos.codigo }
    });

    if (codigoExistente) {
      throw new AppError('Ya existe un código de retención con este código', 409);
    }

    const codigo = await CodigoRetencion.create(datos);
    return codigo;
  }

  /**
   * Actualizar código de retención
   * @param {number} id - ID del código
   * @param {Object} datos - Datos a actualizar
   * @returns {Object} Código actualizado
   */
  async actualizar(id, datos) {
    const codigo = await CodigoRetencion.findByPk(id);

    if (!codigo) {
      throw new AppError('Código de retención no encontrado', 404);
    }

    // Si se actualiza el código, verificar que no esté duplicado
    if (datos.codigo && datos.codigo !== codigo.codigo) {
      const codigoExistente = await CodigoRetencion.findOne({
        where: { codigo: datos.codigo }
      });

      if (codigoExistente) {
        throw new AppError('Ya existe un código de retención con este código', 409);
      }
    }

    await codigo.update(datos);
    return codigo;
  }

  /**
   * Eliminar código de retención (soft delete)
   * @param {number} id - ID del código
   */
  async eliminar(id) {
    const codigo = await CodigoRetencion.findByPk(id);

    if (!codigo) {
      throw new AppError('Código de retención no encontrado', 404);
    }

    // Cambiar estado a INACTIVO en lugar de eliminar
    await codigo.update({ estado: 'INACTIVO' });

    return { mensaje: 'Código de retención eliminado correctamente' };
  }

  /**
   * Cambiar estado del código de retención
   * @param {number} id - ID del código
   * @param {string} nuevoEstado - Nuevo estado
   * @returns {Object} Código actualizado
   */
  async cambiarEstado(id, nuevoEstado) {
    const codigo = await CodigoRetencion.findByPk(id);

    if (!codigo) {
      throw new AppError('Código de retención no encontrado', 404);
    }

    await codigo.update({ estado: nuevoEstado });
    return codigo;
  }

  /**
   * Obtener todos los códigos activos (sin paginación)
   * @returns {Array} Lista de códigos activos
   */
  async obtenerActivos() {
    const codigos = await CodigoRetencion.findAll({
      where: { estado: 'ACTIVO' },
      order: [['codigo', 'ASC']]
    });

    return codigos;
  }
}

module.exports = new CodigoRetencionService();
