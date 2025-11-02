const express = require('express');
const router = express.Router();
const atsController = require('../controllers/atsController');
const { authenticate, authorize, verifyEmpresaAccess } = require('../middlewares/auth');

/**
 * Rutas de generación de ATS (Anexo Transaccional Simplificado)
 * Todas las rutas requieren autenticación
 */

/**
 * @route POST /api/ats/generar
 * @desc Generar archivo ATS para un periodo específico
 * @access Requiere rol: ADMINISTRADOR_EMPRESA, CONTADOR
 */
router.post(
  '/generar',
  authenticate,
  verifyEmpresaAccess,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  atsController.generarAts
);

/**
 * @route GET /api/ats/descargar/:id
 * @desc Descargar archivo XML o ZIP del ATS (query param: tipo=xml|zip)
 * @access Requiere rol: ADMINISTRADOR_EMPRESA, CONTADOR
 */
router.get(
  '/descargar/:id',
  authenticate,
  verifyEmpresaAccess,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  atsController.descargarAts
);

/**
 * @route GET /api/ats/historial
 * @desc Obtener historial de archivos ATS generados
 * @access Requiere autenticación
 */
router.get(
  '/historial',
  authenticate,
  verifyEmpresaAccess,
  atsController.obtenerHistorial
);

/**
 * @route GET /api/ats/vista-previa
 * @desc Obtener vista previa de datos antes de generar ATS
 * @access Requiere rol: ADMINISTRADOR_EMPRESA, CONTADOR
 */
router.get(
  '/vista-previa',
  authenticate,
  verifyEmpresaAccess,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  atsController.obtenerVistaPrevia
);

/**
 * @route GET /api/ats/:id
 * @desc Obtener detalle de un archivo ATS específico
 * @access Requiere autenticación
 */
router.get(
  '/:id',
  authenticate,
  verifyEmpresaAccess,
  atsController.obtenerDetalle
);

/**
 * @route DELETE /api/ats/:id
 * @desc Eliminar un registro de ATS del historial
 * @access Requiere rol: ADMINISTRADOR_EMPRESA, CONTADOR
 */
router.delete(
  '/:id',
  authenticate,
  verifyEmpresaAccess,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR'),
  atsController.eliminarAts
);

module.exports = router;
