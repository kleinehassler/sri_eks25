const express = require('express');
const router = express.Router();
const retencionController = require('../controllers/retencionController');
const { retencionValidator, manejarErroresValidacion } = require('../validators');
const { authenticate, authorize } = require('../middlewares');
const { logChanges } = require('../middlewares/logger');

/**
 * @route GET /api/retenciones
 * @desc Obtener todas las retenciones de la empresa
 * @access Private
 */
router.get(
  '/',
  authenticate,
  retencionValidator.validarFiltros,
  manejarErroresValidacion,
  retencionController.obtenerTodas
);

/**
 * @route GET /api/retenciones/resumen
 * @desc Obtener resumen de retenciones por periodo
 * @access Private
 */
router.get(
  '/resumen',
  authenticate,
  retencionValidator.validarConsultarPorPeriodo,
  manejarErroresValidacion,
  retencionController.obtenerResumen
);

/**
 * @route GET /api/retenciones/proveedor
 * @desc Buscar retenciones por proveedor
 * @access Private
 */
router.get(
  '/proveedor',
  authenticate,
  retencionValidator.validarBuscarPorProveedor,
  manejarErroresValidacion,
  retencionController.buscarPorProveedor
);

/**
 * @route GET /api/retenciones/compra/:compraId
 * @desc Obtener retenciones de una compra específica
 * @access Private
 */
router.get(
  '/compra/:compraId',
  authenticate,
  retencionValidator.validarIdCompra,
  manejarErroresValidacion,
  retencionController.obtenerPorCompra
);

/**
 * @route GET /api/retenciones/:id
 * @desc Obtener retención por ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  retencionValidator.validarIdRetencion,
  manejarErroresValidacion,
  retencionController.obtenerPorId
);

/**
 * @route POST /api/retenciones
 * @desc Crear nueva retención
 * @access Private
 */
router.post(
  '/',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  retencionValidator.validarCrearRetencion,
  manejarErroresValidacion,
  logChanges('RETENCIONES', 'retencion'),
  retencionController.crear
);

/**
 * @route PUT /api/retenciones/:id
 * @desc Actualizar retención
 * @access Private
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  retencionValidator.validarActualizarRetencion,
  manejarErroresValidacion,
  logChanges('RETENCIONES', 'retencion'),
  retencionController.actualizar
);

/**
 * @route DELETE /api/retenciones/:id
 * @desc Eliminar (anular) retención
 * @access Private
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  retencionValidator.validarIdRetencion,
  manejarErroresValidacion,
  logChanges('RETENCIONES', 'retencion'),
  retencionController.eliminar
);

/**
 * @route PATCH /api/retenciones/:id/validar
 * @desc Validar retención
 * @access Private
 */
router.patch(
  '/:id/validar',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  retencionValidator.validarIdRetencion,
  manejarErroresValidacion,
  logChanges('RETENCIONES', 'retencion'),
  retencionController.validar
);

/**
 * @route POST /api/retenciones/validar-masivo
 * @desc Validar múltiples retenciones en estado BORRADOR
 * @access Private
 */
router.post(
  '/validar-masivo',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  retencionController.validarMasivo
);

module.exports = router;
