const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { usuarioValidator, manejarErroresValidacion } = require('../validators');
const { authenticate, authorize } = require('../middlewares/auth');
const { logActivity, logChanges } = require('../middlewares/logger');

/**
 * @route GET /api/usuarios
 * @desc Obtener todos los usuarios
 * @access Private (Admin General, Admin Empresa)
 */
router.get(
  '/',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA'),
  usuarioController.obtenerTodos
);

/**
 * @route GET /api/usuarios/empresa/:empresaId
 * @desc Obtener usuarios por empresa
 * @access Private (Admin General, Admin Empresa)
 */
router.get(
  '/empresa/:empresaId',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA'),
  usuarioController.obtenerPorEmpresa
);

/**
 * @route GET /api/usuarios/:id
 * @desc Obtener usuario por ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  usuarioValidator.validarIdUsuario,
  manejarErroresValidacion,
  usuarioController.obtenerPorId
);

/**
 * @route POST /api/usuarios
 * @desc Crear nuevo usuario
 * @access Private (Admin General, Admin Empresa)
 */
router.post(
  '/',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA'),
  usuarioValidator.validarCrearUsuario,
  manejarErroresValidacion,
  logChanges('USUARIOS', 'usuario'),
  usuarioController.crear
);

/**
 * @route PUT /api/usuarios/:id
 * @desc Actualizar usuario
 * @access Private (Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA'),
  usuarioValidator.validarActualizarUsuario,
  manejarErroresValidacion,
  logChanges('USUARIOS', 'usuario'),
  usuarioController.actualizar
);

/**
 * @route DELETE /api/usuarios/:id
 * @desc Eliminar usuario
 * @access Private (Admin General, Admin Empresa)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA'),
  usuarioValidator.validarIdUsuario,
  manejarErroresValidacion,
  logActivity('DELETE', 'USUARIOS'),
  usuarioController.eliminar
);

/**
 * @route PATCH /api/usuarios/:id/estado
 * @desc Cambiar estado de usuario
 * @access Private (Admin General, Admin Empresa)
 */
router.patch(
  '/:id/estado',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA'),
  usuarioValidator.validarIdUsuario,
  manejarErroresValidacion,
  logActivity('CAMBIO_ESTADO', 'USUARIOS'),
  usuarioController.cambiarEstado
);

/**
 * @route POST /api/usuarios/:id/cambiar-password
 * @desc Cambiar contraseña de usuario
 * @access Private (Usuario autenticado)
 */
router.post(
  '/:id/cambiar-password',
  authenticate,
  usuarioValidator.validarCambiarPassword,
  manejarErroresValidacion,
  logActivity('CAMBIO_PASSWORD', 'USUARIOS'),
  usuarioController.cambiarPassword
);

/**
 * @route POST /api/usuarios/:id/resetear-password
 * @desc Resetear contraseña de usuario (por admin)
 * @access Private (Admin General, Admin Empresa)
 */
router.post(
  '/:id/resetear-password',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA'),
  usuarioValidator.validarResetearPassword,
  manejarErroresValidacion,
  logActivity('RESETEAR_PASSWORD', 'USUARIOS'),
  usuarioController.resetearPassword
);

module.exports = router;
