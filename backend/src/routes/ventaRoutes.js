const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ventaController = require('../controllers/ventaController');
const ventaImportController = require('../controllers/ventaImportController');
const { authenticate, authorize } = require('../middlewares/auth');
const { logActivity } = require('../middlewares/logger');

// Configuración de multer para subida de archivos .txt
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/temp'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `claves-acceso-${uniqueSuffix}.txt`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo archivos .txt
    if (file.mimetype === 'text/plain' || path.extname(file.originalname).toLowerCase() === '.txt') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .txt'));
    }
  }
});

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
 * @route DELETE /api/ventas/eliminar-anulados
 * @desc Eliminar permanentemente todas las ventas en estado ANULADO
 * @access Private
 * IMPORTANTE: Esta ruta debe estar ANTES de /:id para evitar que Express la interprete como un ID
 */
router.delete(
  '/eliminar-anulados',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA'),
  logActivity('ELIMINAR_VENTAS_ANULADAS', 'VENTAS'),
  ventaController.eliminarAnulados
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
 * @route POST /api/ventas/importar-desde-sri
 * @desc Importar ventas masivamente desde archivo .txt con claves de acceso del SRI
 * @access Private
 */
router.post(
  '/importar-desde-sri',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  upload.single('archivo'),
  logActivity('IMPORTAR_VENTAS_SRI', 'VENTAS'),
  ventaImportController.importarVentasDesdeArchivo
);

/**
 * @route POST /api/ventas/importar-desde-sri/unica
 * @desc Importar una única venta desde el SRI usando la clave de acceso
 * @access Private
 */
router.post(
  '/importar-desde-sri/unica',
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  logActivity('IMPORTAR_VENTA_SRI', 'VENTAS'),
  ventaImportController.importarVentaUnica
);

module.exports = router;
