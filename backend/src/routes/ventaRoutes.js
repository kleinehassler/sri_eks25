const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const { authenticate, authorize } = require('../middlewares/auth');
const { logActivity } = require('../middlewares/logger');

/**
 * @route GET /api/ventas
 * @desc Obtener todas las ventas de la empresa
 * @access Private
 */
router.get(
  '/',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  ventaController.obtenerTodas
);

/**
 * @route GET /api/ventas/resumen
 * @desc Obtener resumen de ventas por periodo
 * @access Private
 */
router.get(
  '/resumen',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  ventaController.obtenerResumen
);

/**
 * @route GET /api/ventas/:id
 * @desc Obtener venta por ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  ventaController.obtenerPorId
);

/**
 * @route POST /api/ventas
 * @desc Crear nueva venta
 * @access Private
 */
router.post(
  '/',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  logActivity('CREAR_VENTA', 'VENTAS'),
  ventaController.crear
);

/**
 * @route PUT /api/ventas/:id
 * @desc Actualizar venta
 * @access Private
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  logActivity('ACTUALIZAR_VENTA', 'VENTAS'),
  ventaController.actualizar
);

/**
 * @route DELETE /api/ventas/:id
 * @desc Eliminar (anular) venta
 * @access Private
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  logActivity('ELIMINAR_VENTA', 'VENTAS'),
  ventaController.eliminar
);

/**
 * @route PATCH /api/ventas/:id/validar
 * @desc Validar venta
 * @access Private
 */
router.patch(
  '/:id/validar',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  logActivity('VALIDAR_VENTA', 'VENTAS'),
  ventaController.validar
);

/**
 * @route PATCH /api/ventas/:id/anular
 * @desc Anular venta
 * @access Private
 */
router.patch(
  '/:id/anular',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  logActivity('ANULAR_VENTA', 'VENTAS'),
  ventaController.anular
);

/**
 * @route DELETE /api/ventas/eliminar-anulados
 * @desc Eliminar permanentemente todas las ventas en estado ANULADO
 * @access Private
 */
router.delete(
  '/eliminar-anulados',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA'),
  logActivity('ELIMINAR_VENTAS_ANULADAS', 'VENTAS'),
  ventaController.eliminarAnulados
);

module.exports = router;
