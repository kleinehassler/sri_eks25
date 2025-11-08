const express = require('express');
const router = express.Router();
const multer = require('multer');
const compraController = require('../controllers/compraController');
const { compraValidator, manejarErroresValidacion } = require('../validators');
const { authenticate, authorize, verifyEmpresaAccess } = require('../middlewares');
const { logChanges } = require('../middlewares/logger');

// Configurar multer para subida de archivos XML en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/xml' || file.mimetype === 'application/xml' || file.originalname.endsWith('.xml')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos XML'));
    }
  }
});

/**
 * @route GET /api/compras
 * @desc Obtener todas las compras de la empresa
 * @access Private
 */
router.get(
  '/',
  authenticate,
  compraController.obtenerTodas
);

/**
 * @route GET /api/compras/resumen
 * @desc Obtener resumen de compras por periodo
 * @access Private
 */
router.get(
  '/resumen',
  authenticate,
  compraValidator.validarConsultarPorPeriodo,
  manejarErroresValidacion,
  compraController.obtenerResumen
);

/**
 * @route GET /api/compras/:id
 * @desc Obtener compra por ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  compraValidator.validarIdCompra,
  manejarErroresValidacion,
  compraController.obtenerPorId
);

/**
 * @route POST /api/compras
 * @desc Crear nueva compra
 * @access Private
 */
router.post(
  '/',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  compraValidator.validarCrearCompra,
  manejarErroresValidacion,
  logChanges('COMPRAS', 'compra'),
  compraController.crear
);

/**
 * @route PUT /api/compras/:id
 * @desc Actualizar compra
 * @access Private
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  compraValidator.validarActualizarCompra,
  manejarErroresValidacion,
  logChanges('COMPRAS', 'compra'),
  compraController.actualizar
);

/**
 * @route POST /api/compras/validar-masivo
 * @desc Validar múltiples compras en estado BORRADOR
 * @access Private
 */
router.post(
  '/validar-masivo',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  compraController.validarMasivo
);

/**
 * @route DELETE /api/compras/eliminar-anulados
 * @desc Eliminar permanentemente todas las compras en estado ANULADO
 * @access Private
 * IMPORTANTE: Esta ruta debe estar ANTES de /:id para evitar que Express la interprete como un ID
 */
router.delete(
  '/eliminar-anulados',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA'),
  logChanges('COMPRAS', 'compra'),
  compraController.eliminarAnulados
);

/**
 * @route DELETE /api/compras/:id
 * @desc Eliminar (anular) compra
 * @access Private
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  compraValidator.validarIdCompra,
  manejarErroresValidacion,
  logChanges('COMPRAS', 'compra'),
  compraController.eliminar
);

/**
 * @route PATCH /api/compras/:id/validar
 * @desc Validar compra
 * @access Private
 */
router.patch(
  '/:id/validar',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  compraValidator.validarIdCompra,
  manejarErroresValidacion,
  logChanges('COMPRAS', 'compra'),
  compraController.validar
);

/**
 * @route PATCH /api/compras/:id/retenciones
 * @desc Agregar o actualizar retenciones a una compra existente
 * @access Private
 */
router.patch(
  '/:id/retenciones',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  compraValidator.validarIdCompra,
  manejarErroresValidacion,
  logChanges('COMPRAS', 'compra'),
  compraController.agregarRetenciones
);

/**
 * @route POST /api/compras/importar-xml
 * @desc Importar XML de factura electrónica
 * @access Private
 */
router.post(
  '/importar-xml',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  upload.single('xml'),
  compraController.importarXML
);

module.exports = router;
