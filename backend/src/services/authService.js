const bcrypt = require('bcrypt');
const { Usuario, Empresa } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Servicio de autenticación
 */
class AuthService {
  /**
   * Login de usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Object} Usuario y tokens
   */
  async login(email, password) {
    // Buscar usuario
    const usuario = await Usuario.findOne({
      where: { email },
      include: [{
        model: Empresa,
        as: 'empresa',
        attributes: ['id', 'ruc', 'razon_social', 'regimen_tributario', 'estado']
      }]
    });

    if (!usuario) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar estado del usuario
    if (usuario.estado === 'BLOQUEADO') {
      throw new AppError('Usuario bloqueado. Contacte al administrador', 403);
    }

    if (usuario.estado === 'INACTIVO') {
      throw new AppError('Usuario inactivo', 403);
    }

    // Verificar estado de la empresa
    if (usuario.empresa.estado !== 'ACTIVO') {
      throw new AppError('La empresa asociada no está activa', 403);
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Actualizar último acceso
    await usuario.update({ ultimo_acceso: new Date() });

    // Generar tokens
    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      empresaId: usuario.empresa_id
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Retornar usuario sin contraseña
    const usuarioData = usuario.toJSON();
    delete usuarioData.password_hash;

    return {
      usuario: usuarioData,
      accessToken,
      refreshToken
    };
  }

  /**
   * Registro de nuevo usuario
   * @param {Object} datos - Datos del usuario
   * @returns {Object} Usuario creado
   */
  async registrar(datos) {
    // Verificar que la empresa existe y está activa
    const empresa = await Empresa.findByPk(datos.empresa_id);

    if (!empresa) {
      throw new AppError('Empresa no encontrada', 404);
    }

    if (empresa.estado !== 'ACTIVO') {
      throw new AppError('No se pueden crear usuarios para empresas inactivas', 400);
    }

    // Verificar que el email no esté en uso
    const usuarioExistente = await Usuario.findOne({
      where: { email: datos.email }
    });

    if (usuarioExistente) {
      throw new AppError('El correo electrónico ya está registrado', 409);
    }

    // Crear usuario
    const usuario = await Usuario.create(datos);

    // Retornar sin contraseña
    const usuarioData = usuario.toJSON();
    delete usuarioData.password_hash;

    return usuarioData;
  }

  /**
   * Cambiar contraseña
   * @param {number} usuarioId - ID del usuario
   * @param {string} passwordActual - Contraseña actual
   * @param {string} passwordNueva - Nueva contraseña
   */
  async cambiarPassword(usuarioId, passwordActual, passwordNueva) {
    const usuario = await Usuario.findByPk(usuarioId);

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const passwordValido = await bcrypt.compare(passwordActual, usuario.password_hash);

    if (!passwordValido) {
      throw new AppError('Contraseña actual incorrecta', 401);
    }

    // Hash de nueva contraseña
    const passwordHash = await bcrypt.hash(passwordNueva, 10);

    // Actualizar
    await usuario.update({ password_hash: passwordHash });

    return { mensaje: 'Contraseña actualizada correctamente' };
  }

  /**
   * Refrescar token de acceso
   * @param {Object} payload - Payload del refresh token
   * @returns {Object} Nuevo access token
   */
  async refreshToken(payload) {
    const usuario = await Usuario.findByPk(payload.id);

    if (!usuario || usuario.estado !== 'ACTIVO') {
      throw new AppError('Token inválido', 401);
    }

    const newPayload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      empresaId: usuario.empresa_id
    };

    const accessToken = generateAccessToken(newPayload);

    return { accessToken };
  }
}

module.exports = new AuthService();
