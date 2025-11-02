const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { usuarioValidator, manejarErroresValidacion } = require('../validators');
const { authenticate, authLimiter } = require('../middlewares');
const { logActivity } = require('../middlewares/logger');

/**
 * @route POST /api/auth/login
 * @desc Login de usuario
 * @access Public
 */
router.post(
  '/login',
  authLimiter,
  usuarioValidator.validarLogin,
  manejarErroresValidacion,
  logActivity('LOGIN', 'AUTH'),
  authController.login
);

/**
 * @route POST /api/auth/registrar
 * @desc Registro de nuevo usuario
 * @access Private (Admin)
 */
router.post(
  '/registrar',
  authenticate,
  usuarioValidator.validarCrearUsuario,
  manejarErroresValidacion,
  logActivity('REGISTRO', 'AUTH'),
  authController.registrar
);

/**
 * @route POST /api/auth/cambiar-password
 * @desc Cambiar contraseña del usuario actual
 * @access Private
 */
router.post(
  '/cambiar-password',
  authenticate,
  usuarioValidator.validarCambiarPassword,
  manejarErroresValidacion,
  logActivity('CAMBIO_PASSWORD', 'AUTH'),
  authController.cambiarPassword
);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refrescar token de acceso
 * @access Public
 */
router.post(
  '/refresh-token',
  authController.refreshToken
);

/**
 * @route GET /api/auth/perfil
 * @desc Obtener perfil del usuario actual
 * @access Private
 */
router.get(
  '/perfil',
  authenticate,
  authController.perfil
);

/**
 * @route POST /api/auth/logout
 * @desc Cerrar sesión
 * @access Private
 */
router.post(
  '/logout',
  authenticate,
  logActivity('LOGOUT', 'AUTH'),
  authController.logout
);

module.exports = router;
