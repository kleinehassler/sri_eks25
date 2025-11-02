const { Empresa, Usuario } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

/**
 * Servicio de gestión de empresas
 */
class EmpresaService {
  /**
   * Obtener todas las empresas (con paginación y filtros)
   * @param {Object} filtros - Filtros de búsqueda
   * @param {number} pagina - Número de página
   * @param {number} limite - Registros por página
   * @param {Object} usuario - Usuario autenticado (para filtrar según rol)
   * @returns {Object} Lista de empresas y metadatos de paginación
   */
  async obtenerTodas(filtros = {}, pagina = 1, limite = 10, usuario = null) {
    const offset = (pagina - 1) * limite;
    const where = {};

    // Si NO es Administrador General, solo mostrar su empresa
    if (usuario && usuario.rol !== 'ADMINISTRADOR_GENERAL') {
      where.id = usuario.empresa_id;
    }

    // Aplicar filtros
    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.regimen_tributario) {
      where.regimen_tributario = filtros.regimen_tributario;
    }

    if (filtros.busqueda) {
      where[Op.or] = [
        { ruc: { [Op.like]: `%${filtros.busqueda}%` } },
        { razon_social: { [Op.like]: `%${filtros.busqueda}%` } },
        { nombre_comercial: { [Op.like]: `%${filtros.busqueda}%` } }
      ];
    }

    const { rows, count } = await Empresa.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [{
        model: Usuario,
        as: 'usuarios',
        attributes: ['id', 'nombre', 'apellido', 'email', 'rol', 'estado'],
        required: false
      }]
    });

    return {
      empresas: rows,
      paginacion: {
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(count / limite)
      }
    };
  }

  /**
   * Obtener empresa por ID
   * @param {number} id - ID de la empresa
   * @returns {Object} Empresa
   */
  async obtenerPorId(id) {
    const empresa = await Empresa.findByPk(id, {
      include: [{
        model: Usuario,
        as: 'usuarios',
        attributes: ['id', 'nombre', 'apellido', 'email', 'rol', 'estado']
      }]
    });

    if (!empresa) {
      throw new AppError('Empresa no encontrada', 404);
    }

    return empresa;
  }

  /**
   * Obtener empresa por RUC
   * @param {string} ruc - RUC de la empresa
   * @returns {Object} Empresa
   */
  async obtenerPorRuc(ruc) {
    const empresa = await Empresa.findOne({
      where: { ruc }
    });

    if (!empresa) {
      throw new AppError('Empresa no encontrada', 404);
    }

    return empresa;
  }

  /**
   * Crear nueva empresa
   * @param {Object} datos - Datos de la empresa
   * @returns {Object} Empresa creada
   */
  async crear(datos) {
    // Verificar que el RUC no esté duplicado
    const empresaExistente = await Empresa.findOne({
      where: { ruc: datos.ruc }
    });

    if (empresaExistente) {
      throw new AppError('Ya existe una empresa con este RUC', 409);
    }

    const empresa = await Empresa.create(datos);
    return empresa;
  }

  /**
   * Actualizar empresa
   * @param {number} id - ID de la empresa
   * @param {Object} datos - Datos a actualizar
   * @returns {Object} Empresa actualizada
   */
  async actualizar(id, datos) {
    const empresa = await Empresa.findByPk(id);

    if (!empresa) {
      throw new AppError('Empresa no encontrada', 404);
    }

    // Si se actualiza el RUC, verificar que no esté duplicado
    if (datos.ruc && datos.ruc !== empresa.ruc) {
      const empresaExistente = await Empresa.findOne({
        where: { ruc: datos.ruc }
      });

      if (empresaExistente) {
        throw new AppError('Ya existe una empresa con este RUC', 409);
      }
    }

    await empresa.update(datos);
    return empresa;
  }

  /**
   * Eliminar empresa (soft delete)
   * @param {number} id - ID de la empresa
   */
  async eliminar(id) {
    const empresa = await Empresa.findByPk(id);

    if (!empresa) {
      throw new AppError('Empresa no encontrada', 404);
    }

    // Verificar si tiene usuarios activos
    const usuariosActivos = await Usuario.count({
      where: {
        empresa_id: id,
        estado: 'ACTIVO'
      }
    });

    if (usuariosActivos > 0) {
      throw new AppError('No se puede eliminar una empresa con usuarios activos', 400);
    }

    // Cambiar estado a INACTIVO en lugar de eliminar
    await empresa.update({ estado: 'INACTIVO' });

    return { mensaje: 'Empresa eliminada correctamente' };
  }

  /**
   * Cambiar estado de empresa
   * @param {number} id - ID de la empresa
   * @param {string} nuevoEstado - Nuevo estado
   * @returns {Object} Empresa actualizada
   */
  async cambiarEstado(id, nuevoEstado) {
    const empresa = await Empresa.findByPk(id);

    if (!empresa) {
      throw new AppError('Empresa no encontrada', 404);
    }

    await empresa.update({ estado: nuevoEstado });
    return empresa;
  }
}

module.exports = new EmpresaService();
