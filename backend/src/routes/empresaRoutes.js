const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const { empresaValidator, manejarErroresValidacion } = require('../validators');
const { authenticate, authorize } = require('../middlewares');
const { logActivity, logChanges } = require('../middlewares/logger');

/**
 * @route GET /api/empresas
 * @desc Obtener todas las empresas
 * @access Private (Todos los roles autenticados)
 * @note Admin General ve todas, otros roles ven solo su empresa
 */
router.get(
  '/',
  authenticate,
  empresaController.obtenerTodas
);

/**
 * @route GET /api/empresas/:id
 * @desc Obtener empresa por ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  empresaValidator.validarIdEmpresa,
  manejarErroresValidacion,
  empresaController.obtenerPorId
);

/**
 * @route POST /api/empresas
 * @desc Crear nueva empresa
 * @access Private (Admin General)
 */
router.post(
  '/',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL'),
  empresaValidator.validarCrearEmpresa,
  manejarErroresValidacion,
  logChanges('EMPRESAS', 'empresa'),
  empresaController.crear
);

/**
 * @route PUT /api/empresas/:id
 * @desc Actualizar empresa
 * @access Private (Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA'),
  empresaValidator.validarActualizarEmpresa,
  manejarErroresValidacion,
  logChanges('EMPRESAS', 'empresa'),
  empresaController.actualizar
);

/**
 * @route DELETE /api/empresas/:id
 * @desc Eliminar empresa
 * @access Private (Admin General)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL'),
  empresaValidator.validarIdEmpresa,
  manejarErroresValidacion,
  logActivity('DELETE', 'EMPRESAS'),
  empresaController.eliminar
);

/**
 * @route PATCH /api/empresas/:id/estado
 * @desc Cambiar estado de empresa
 * @access Private (Admin General)
 */
router.patch(
  '/:id/estado',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL'),
  empresaValidator.validarIdEmpresa,
  manejarErroresValidacion,
  logActivity('CAMBIO_ESTADO', 'EMPRESAS'),
  empresaController.cambiarEstado
);

module.exports = router;
