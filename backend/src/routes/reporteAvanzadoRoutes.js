const express = require('express');
const router = express.Router();
const reporteAvanzadoController = require('../controllers/reporteAvanzadoController');
const { authenticate } = require('../middlewares');

/**
 * REPORTES AVANZADOS DE COMPRAS
 */

/**
 * @route GET /api/reportes-avanzados/compras/credito-tributario
 * @desc Obtener reporte de compras por crédito tributario
 * @access Private
 */
router.get(
  '/compras/credito-tributario',
  authenticate,
  reporteAvanzadoController.comprasPorCreditoTributario
);

/**
 * @route GET /api/reportes-avanzados/compras/proveedor
 * @desc Obtener reporte de compras por proveedor
 * @access Private
 */
router.get(
  '/compras/proveedor',
  authenticate,
  reporteAvanzadoController.comprasPorProveedor
);

/**
 * @route GET /api/reportes-avanzados/compras/porcentaje-iva
 * @desc Obtener reporte de compras por porcentaje de IVA
 * @access Private
 */
router.get(
  '/compras/porcentaje-iva',
  authenticate,
  reporteAvanzadoController.comprasPorPorcentajeIVA
);

/**
 * @route GET /api/reportes-avanzados/compras/retencion-iva
 * @desc Obtener reporte de compras por retención de IVA
 * @access Private
 */
router.get(
  '/compras/retencion-iva',
  authenticate,
  reporteAvanzadoController.comprasPorRetencionIVA
);

/**
 * @route GET /api/reportes-avanzados/compras/retencion-renta
 * @desc Obtener reporte de compras por retención de Renta
 * @access Private
 */
router.get(
  '/compras/retencion-renta',
  authenticate,
  reporteAvanzadoController.comprasPorRetencionRenta
);

/**
 * @route GET /api/reportes-avanzados/compras/sin-retenciones
 * @desc Obtener reporte de compras sin retenciones
 * @access Private
 */
router.get(
  '/compras/sin-retenciones',
  authenticate,
  reporteAvanzadoController.comprasSinRetenciones
);

/**
 * @route GET /api/reportes-avanzados/compras/proveedor/:ruc/detallado
 * @desc Obtener reporte detallado de compras de un proveedor específico
 * @access Private
 */
router.get(
  '/compras/proveedor/:ruc/detallado',
  authenticate,
  reporteAvanzadoController.reporteDetalladoProveedor
);

/**
 * REPORTES AVANZADOS DE VENTAS
 */

/**
 * @route GET /api/reportes-avanzados/ventas/cliente
 * @desc Obtener reporte de ventas por cliente
 * @access Private
 */
router.get(
  '/ventas/cliente',
  authenticate,
  reporteAvanzadoController.ventasPorCliente
);

/**
 * @route GET /api/reportes-avanzados/ventas/porcentaje-iva
 * @desc Obtener reporte de ventas por porcentaje de IVA
 * @access Private
 */
router.get(
  '/ventas/porcentaje-iva',
  authenticate,
  reporteAvanzadoController.ventasPorPorcentajeIVA
);

/**
 * @route GET /api/reportes-avanzados/ventas/tipo-comprobante
 * @desc Obtener reporte de ventas por tipo de comprobante
 * @access Private
 */
router.get(
  '/ventas/tipo-comprobante',
  authenticate,
  reporteAvanzadoController.ventasPorTipoComprobante
);

/**
 * @route GET /api/reportes-avanzados/ventas/cliente/:ruc/detallado
 * @desc Obtener reporte detallado de ventas de un cliente específico
 * @access Private
 */
router.get(
  '/ventas/cliente/:ruc/detallado',
  authenticate,
  reporteAvanzadoController.reporteDetalladoCliente
);

/**
 * EXPORTACIÓN A EXCEL - COMPRAS
 */

/**
 * @route GET /api/reportes-avanzados/compras/proveedor/excel
 * @desc Exportar reporte de compras por proveedor a Excel
 * @access Private
 */
router.get(
  '/compras/proveedor/excel',
  authenticate,
  reporteAvanzadoController.exportarComprasPorProveedorExcel
);

/**
 * @route GET /api/reportes-avanzados/compras/porcentaje-iva/excel
 * @desc Exportar reporte de compras por IVA a Excel
 * @access Private
 */
router.get(
  '/compras/porcentaje-iva/excel',
  authenticate,
  reporteAvanzadoController.exportarComprasPorIVAExcel
);

/**
 * EXPORTACIÓN A PDF - COMPRAS
 */

/**
 * @route GET /api/reportes-avanzados/compras/proveedor/pdf
 * @desc Exportar reporte de compras por proveedor a PDF
 * @access Private
 */
router.get(
  '/compras/proveedor/pdf',
  authenticate,
  reporteAvanzadoController.exportarComprasPorProveedorPDF
);

module.exports = router;
