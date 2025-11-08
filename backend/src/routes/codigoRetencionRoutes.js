const express = require('express');
const router = express.Router();
const codigoRetencionController = require('../controllers/codigoRetencionController');
const { codigoRetencionValidator, manejarErroresValidacion } = require('../validators');
const { authenticate, authorize } = require('../middlewares');
const { logActivity, logChanges } = require('../middlewares/logger');

/**
 * @route GET /api/codigos-retencion/activos
 * @desc Obtener todos los códigos de retención activos (sin paginación)
 * @access Private (Todos los roles autenticados)
 * @note Esta ruta debe estar ANTES de /:id para evitar que Express la interprete como un ID
 */
router.get(
  '/activos',
  authenticate,
  codigoRetencionController.obtenerActivos
);

/**
 * @route GET /api/codigos-retencion
 * @desc Obtener todos los códigos de retención
 * @access Private (Solo Admin General)
 */
router.get(
  '/',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL'),
  codigoRetencionController.obtenerTodos
);

/**
 * @route GET /api/codigos-retencion/:id
 * @desc Obtener código de retención por ID
 * @access Private (Solo Admin General)
 */
router.get(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL'),
  codigoRetencionValidator.validarIdCodigoRetencion,
  manejarErroresValidacion,
  codigoRetencionController.obtenerPorId
);

/**
 * @route POST /api/codigos-retencion
 * @desc Crear nuevo código de retención
 * @access Private (Solo Admin General)
 */
router.post(
  '/',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL'),
  codigoRetencionValidator.validarCrearCodigoRetencion,
  manejarErroresValidacion,
  logChanges('CODIGOS_RETENCION', 'codigo_retencion'),
  codigoRetencionController.crear
);

/**
 * @route PUT /api/codigos-retencion/:id
 * @desc Actualizar código de retención
 * @access Private (Solo Admin General)
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL'),
  codigoRetencionValidator.validarActualizarCodigoRetencion,
  manejarErroresValidacion,
  logChanges('CODIGOS_RETENCION', 'codigo_retencion'),
  codigoRetencionController.actualizar
);

/**
 * @route DELETE /api/codigos-retencion/:id
 * @desc Eliminar código de retención (soft delete)
 * @access Private (Solo Admin General)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL'),
  codigoRetencionValidator.validarIdCodigoRetencion,
  manejarErroresValidacion,
  logActivity('DELETE', 'CODIGOS_RETENCION'),
  codigoRetencionController.eliminar
);

/**
 * @route PATCH /api/codigos-retencion/:id/estado
 * @desc Cambiar estado del código de retención
 * @access Private (Solo Admin General)
 */
router.patch(
  '/:id/estado',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL'),
  codigoRetencionValidator.validarCambiarEstado,
  manejarErroresValidacion,
  logActivity('CAMBIO_ESTADO', 'CODIGOS_RETENCION'),
  codigoRetencionController.cambiarEstado
);

module.exports = router;
