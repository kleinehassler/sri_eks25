const express = require('express');
const router = express.Router();
const exportacionController = require('../controllers/exportacionController');
const { exportacionValidator, manejarErroresValidacion } = require('../validators');
const { authenticate, authorize } = require('../middlewares');
const { logChanges } = require('../middlewares/logger');

/**
 * @route GET /api/exportaciones
 * @desc Obtener todas las exportaciones de la empresa
 * @access Private
 */
router.get(
  '/',
  authenticate,
  exportacionValidator.validarFiltros,
  manejarErroresValidacion,
  exportacionController.obtenerTodas
);

/**
 * @route GET /api/exportaciones/resumen
 * @desc Obtener resumen de exportaciones por periodo
 * @access Private
 */
router.get(
  '/resumen',
  authenticate,
  exportacionValidator.validarConsultarPorPeriodo,
  manejarErroresValidacion,
  exportacionController.obtenerResumen
);

/**
 * @route GET /api/exportaciones/resumen-pais
 * @desc Obtener resumen de exportaciones por país de destino
 * @access Private
 */
router.get(
  '/resumen-pais',
  authenticate,
  exportacionValidator.validarConsultarPorPeriodo,
  manejarErroresValidacion,
  exportacionController.obtenerResumenPorPais
);

/**
 * @route GET /api/exportaciones/cliente
 * @desc Buscar exportaciones por cliente
 * @access Private
 */
router.get(
  '/cliente',
  authenticate,
  exportacionValidator.validarBuscarPorCliente,
  manejarErroresValidacion,
  exportacionController.buscarPorCliente
);

/**
 * @route GET /api/exportaciones/anio
 * @desc Obtener exportaciones por año
 * @access Private
 */
router.get(
  '/anio',
  authenticate,
  exportacionValidator.validarObtenerPorAnio,
  manejarErroresValidacion,
  exportacionController.obtenerPorAnio
);

/**
 * @route GET /api/exportaciones/:id
 * @desc Obtener exportación por ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  exportacionValidator.validarIdExportacion,
  manejarErroresValidacion,
  exportacionController.obtenerPorId
);

/**
 * @route POST /api/exportaciones
 * @desc Crear nueva exportación
 * @access Private
 */
router.post(
  '/',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  exportacionValidator.validarCrearExportacion,
  manejarErroresValidacion,
  logChanges('EXPORTACIONES', 'exportacion'),
  exportacionController.crear
);

/**
 * @route PUT /api/exportaciones/:id
 * @desc Actualizar exportación
 * @access Private
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  exportacionValidator.validarActualizarExportacion,
  manejarErroresValidacion,
  logChanges('EXPORTACIONES', 'exportacion'),
  exportacionController.actualizar
);

/**
 * @route DELETE /api/exportaciones/:id
 * @desc Eliminar (anular) exportación
 * @access Private
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  exportacionValidator.validarIdExportacion,
  manejarErroresValidacion,
  logChanges('EXPORTACIONES', 'exportacion'),
  exportacionController.eliminar
);

/**
 * @route PATCH /api/exportaciones/:id/validar
 * @desc Validar exportación
 * @access Private
 */
router.patch(
  '/:id/validar',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  exportacionValidator.validarIdExportacion,
  manejarErroresValidacion,
  logChanges('EXPORTACIONES', 'exportacion'),
  exportacionController.validar
);

/**
 * @route POST /api/exportaciones/validar-masivo
 * @desc Validar múltiples exportaciones en estado BORRADOR
 * @access Private
 */
router.post(
  '/validar-masivo',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  exportacionController.validarMasivo
);

module.exports = router;
