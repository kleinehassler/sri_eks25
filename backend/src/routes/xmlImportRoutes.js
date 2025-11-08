const express = require('express');
const router = express.Router();
const xmlImportController = require('../controllers/xmlImportController');
const { authenticate, authorize } = require('../middlewares');
const { logActivity } = require('../middlewares/logger');

/**
 * @route POST /api/xml/importar-factura
 * @desc Importar factura desde XML electrónico
 * @access Private
 */
router.post(
  '/importar-factura',
  xmlImportController.uploadMiddleware,
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  logActivity('IMPORTAR_XML_FACTURA', 'XML_IMPORT'),
  xmlImportController.importarFactura
);

/**
 * @route POST /api/xml/importar-retencion
 * @desc Importar retención desde XML electrónico
 * @access Private
 */
router.post(
  '/importar-retencion',
  xmlImportController.uploadMiddleware,
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  logActivity('IMPORTAR_XML_RETENCION', 'XML_IMPORT'),
  xmlImportController.importarRetencion
);

/**
 * @route POST /api/xml/importar-factura-venta
 * @desc Importar factura de venta desde XML electrónico
 * @access Private
 */
router.post(
  '/importar-factura-venta',
  xmlImportController.uploadMiddleware,
  authenticate,
  authorize('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_EMPRESA', 'CONTADOR', 'OPERADOR'),
  logActivity('IMPORTAR_XML_FACTURA_VENTA', 'XML_IMPORT'),
  xmlImportController.importarFacturaVenta
);

/**
 * @route POST /api/xml/previsualizar
 * @desc Previsualizar datos del XML sin guardar
 * @access Private
 */
router.post(
  '/previsualizar',
  xmlImportController.uploadMiddleware,
  authenticate,
  xmlImportController.previsualizarXML
);

module.exports = router;
