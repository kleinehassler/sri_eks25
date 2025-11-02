const { Usuario, Empresa } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

/**
 * Servicio de gestión de usuarios
 */
class UsuarioService {
  /**
   * Obtener todos los usuarios (con paginación y filtros)
   * @param {Object} filtros - Filtros de búsqueda
   * @param {number} pagina - Número de página
   * @param {number} limite - Registros por página
   * @returns {Object} Lista de usuarios y metadatos de paginación
   */
  async obtenerTodos(filtros = {}, pagina = 1, limite = 10) {
    const offset = (pagina - 1) * limite;
    const where = {};

    // Aplicar filtros
    if (filtros.empresa_id) {
      where.empresa_id = filtros.empresa_id;
    }

    if (filtros.rol) {
      where.rol = filtros.rol;
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.busqueda) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${filtros.busqueda}%` } },
        { apellido: { [Op.like]: `%${filtros.busqueda}%` } },
        { email: { [Op.like]: `%${filtros.busqueda}%` } }
      ];
    }

    const { rows, count } = await Usuario.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [{
        model: Empresa,
        as: 'empresa',
        attributes: ['id', 'ruc', 'razon_social', 'nombre_comercial']
      }],
      attributes: { exclude: ['password_hash'] } // Excluir password_hash
    });

    return {
      usuarios: rows,
      paginacion: {
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(count / limite)
      }
    };
  }

  /**
   * Obtener usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Object} Usuario
   */
  async obtenerPorId(id) {
    const usuario = await Usuario.findByPk(id, {
      include: [{
        model: Empresa,
        as: 'empresa',
        attributes: ['id', 'ruc', 'razon_social', 'nombre_comercial']
      }],
      attributes: { exclude: ['password_hash'] }
    });

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return usuario;
  }

  /**
   * Obtener usuario por email
   * @param {string} email - Email del usuario
   * @returns {Object} Usuario
   */
  async obtenerPorEmail(email) {
    const usuario = await Usuario.findOne({
      where: { email },
      include: [{
        model: Empresa,
        as: 'empresa'
      }]
    });

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return usuario;
  }

  /**
   * Obtener usuarios por empresa
   * @param {number} empresaId - ID de la empresa
   * @returns {Array} Lista de usuarios
   */
  async obtenerPorEmpresa(empresaId) {
    const usuarios = await Usuario.findAll({
      where: { empresa_id: empresaId },
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });

    return usuarios;
  }

  /**
   * Crear nuevo usuario
   * @param {Object} datos - Datos del usuario
   * @returns {Object} Usuario creado
   */
  async crear(datos) {
    // Verificar que el email no esté duplicado
    const usuarioExistente = await Usuario.findOne({
      where: { email: datos.email }
    });

    if (usuarioExistente) {
      throw new AppError('Ya existe un usuario con este email', 409);
    }

    // Verificar que la empresa exista
    if (datos.empresa_id) {
      const empresa = await Empresa.findByPk(datos.empresa_id);
      if (!empresa) {
        throw new AppError('Empresa no encontrada', 404);
      }
    }

    // Crear usuario (el password_hash se hasheará automáticamente en el hook del modelo)
    const usuario = await Usuario.create({
      ...datos,
      password_hash: datos.password // Mapear password a password_hash
    });

    // Retornar sin password_hash
    const usuarioSinPassword = usuario.toJSON();
    delete usuarioSinPassword.password_hash;

    return usuarioSinPassword;
  }

  /**
   * Actualizar usuario
   * @param {number} id - ID del usuario
   * @param {Object} datos - Datos a actualizar
   * @returns {Object} Usuario actualizado
   */
  async actualizar(id, datos) {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Si se actualiza el email, verificar que no esté duplicado
    if (datos.email && datos.email !== usuario.email) {
      const usuarioExistente = await Usuario.findOne({
        where: { email: datos.email }
      });

      if (usuarioExistente) {
        throw new AppError('Ya existe un usuario con este email', 409);
      }
    }

    // Si se actualiza la contraseña, mapear a password_hash
    if (datos.password) {
      datos.password_hash = datos.password;
      delete datos.password;
    }

    // Si se actualiza la empresa, verificar que exista
    if (datos.empresa_id && datos.empresa_id !== usuario.empresa_id) {
      const empresa = await Empresa.findByPk(datos.empresa_id);
      if (!empresa) {
        throw new AppError('Empresa no encontrada', 404);
      }
    }

    await usuario.update(datos);

    // Retornar sin password_hash
    const usuarioActualizado = usuario.toJSON();
    delete usuarioActualizado.password_hash;

    return usuarioActualizado;
  }

  /**
   * Eliminar usuario (soft delete)
   * @param {number} id - ID del usuario
   */
  async eliminar(id) {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Cambiar estado a INACTIVO en lugar de eliminar
    await usuario.update({ estado: 'INACTIVO' });

    return { mensaje: 'Usuario eliminado correctamente' };
  }

  /**
   * Cambiar estado de usuario
   * @param {number} id - ID del usuario
   * @param {string} nuevoEstado - Nuevo estado
   * @returns {Object} Usuario actualizado
   */
  async cambiarEstado(id, nuevoEstado) {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    await usuario.update({ estado: nuevoEstado });

    // Retornar sin password_hash
    const usuarioActualizado = usuario.toJSON();
    delete usuarioActualizado.password_hash;

    return usuarioActualizado;
  }

  /**
   * Cambiar contraseña de usuario
   * @param {number} id - ID del usuario
   * @param {string} passwordActual - Contraseña actual
   * @param {string} passwordNueva - Nueva contraseña
   * @returns {Object} Resultado
   */
  async cambiarPassword(id, passwordActual, passwordNueva) {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password_hash);
    if (!passwordValida) {
      throw new AppError('Contraseña actual incorrecta', 401);
    }

    // Actualizar con nueva contraseña (se hasheará automáticamente en el hook)
    await usuario.update({ password_hash: passwordNueva });

    return { mensaje: 'Contraseña actualizada correctamente' };
  }

  /**
   * Resetear contraseña de usuario (por admin)
   * @param {number} id - ID del usuario
   * @param {string} passwordNueva - Nueva contraseña
   * @returns {Object} Resultado
   */
  async resetearPassword(id, passwordNueva) {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Actualizar con nueva contraseña (se hasheará automáticamente en el hook)
    await usuario.update({ password_hash: passwordNueva });

    return { mensaje: 'Contraseña reseteada correctamente' };
  }
}

module.exports = new UsuarioService();
