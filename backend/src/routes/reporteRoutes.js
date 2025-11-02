const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { authenticate, authorize } = require('../middlewares');

/**
 * @route GET /api/reportes/compras
 * @desc Obtener reporte de compras
 * @access Private
 */
router.get(
  '/compras',
  authenticate,
  reporteController.reporteCompras
);

/**
 * @route GET /api/reportes/ventas
 * @desc Obtener reporte de ventas
 * @access Private
 */
router.get(
  '/ventas',
  authenticate,
  reporteController.reporteVentas
);

/**
 * @route GET /api/reportes/resumen
 * @desc Obtener resumen general
 * @access Private
 */
router.get(
  '/resumen',
  authenticate,
  reporteController.resumenGeneral
);

/**
 * @route GET /api/reportes/dashboard
 * @desc Obtener estadísticas para el Dashboard
 * @access Private
 */
router.get(
  '/dashboard',
  authenticate,
  reporteController.estadisticasDashboard
);

/**
 * @route GET /api/reportes/periodo/:periodo
 * @desc Obtener estadísticas por período
 * @access Private
 */
router.get(
  '/periodo/:periodo',
  authenticate,
  reporteController.estadisticasPorPeriodo
);

/**
 * @route GET /api/reportes/exportar/compras
 * @desc Exportar reporte de compras a Excel
 * @access Private
 */
router.get(
  '/exportar/compras',
  authenticate,
  reporteController.exportarComprasExcel
);

/**
 * @route GET /api/reportes/exportar/ventas
 * @desc Exportar reporte de ventas a Excel
 * @access Private
 */
router.get(
  '/exportar/ventas',
  authenticate,
  reporteController.exportarVentasExcel
);

/**
 * @route GET /api/reportes/exportar/pdf/compras
 * @desc Exportar reporte de compras a PDF
 * @access Private
 */
router.get(
  '/exportar/pdf/compras',
  authenticate,
  reporteController.exportarComprasPDF
);

/**
 * @route GET /api/reportes/exportar/pdf/ventas
 * @desc Exportar reporte de ventas a PDF
 * @access Private
 */
router.get(
  '/exportar/pdf/ventas',
  authenticate,
  reporteController.exportarVentasPDF
);

/**
 * @route GET /api/reportes/retenciones/porcentaje
 * @desc Obtener reporte de compras por porcentaje de retención
 * @access Private
 */
router.get(
  '/retenciones/porcentaje',
  authenticate,
  reporteController.reporteComprasPorPorcentajeRetencion
);

/**
 * @route GET /api/reportes/retenciones/codigo
 * @desc Obtener reporte de compras por código de retención
 * @access Private
 */
router.get(
  '/retenciones/codigo',
  authenticate,
  reporteController.reporteComprasPorCodigoRetencion
);

/**
 * @route GET /api/reportes/compras/sin-retenciones
 * @desc Obtener reporte de compras sin retenciones
 * @access Private
 */
router.get(
  '/compras/sin-retenciones',
  authenticate,
  reporteController.reporteComprasSinRetenciones
);

/**
 * @route GET /api/reportes/retenciones-recibidas/iva
 * @desc Obtener reporte de retenciones recibidas por cliente - IVA
 * @access Private
 */
router.get(
  '/retenciones-recibidas/iva',
  authenticate,
  reporteController.reporteRetencionesRecibidasPorClienteIVA
);

/**
 * @route GET /api/reportes/retenciones-recibidas/ir
 * @desc Obtener reporte de retenciones recibidas por cliente - IR
 * @access Private
 */
router.get(
  '/retenciones-recibidas/ir',
  authenticate,
  reporteController.reporteRetencionesRecibidasPorClienteIR
);

/**
 * @route GET /api/reportes/exportar/retenciones/porcentaje
 * @desc Exportar reporte de compras por porcentaje de retención a Excel
 * @access Private
 */
router.get(
  '/exportar/retenciones/porcentaje',
  authenticate,
  reporteController.exportarComprasPorPorcentajeRetencionExcel
);

/**
 * @route GET /api/reportes/exportar/retenciones/codigo
 * @desc Exportar reporte de compras por código de retención a Excel
 * @access Private
 */
router.get(
  '/exportar/retenciones/codigo',
  authenticate,
  reporteController.exportarComprasPorCodigoRetencionExcel
);

/**
 * @route GET /api/reportes/exportar/compras/sin-retenciones
 * @desc Exportar reporte de compras sin retenciones a Excel
 * @access Private
 */
router.get(
  '/exportar/compras/sin-retenciones',
  authenticate,
  reporteController.exportarComprasSinRetencionesExcel
);

/**
 * @route GET /api/reportes/exportar/retenciones-recibidas/iva
 * @desc Exportar reporte de retenciones recibidas por cliente IVA a Excel
 * @access Private
 */
router.get(
  '/exportar/retenciones-recibidas/iva',
  authenticate,
  reporteController.exportarRetencionesRecibidasPorClienteIVAExcel
);

/**
 * @route GET /api/reportes/exportar/retenciones-recibidas/ir
 * @desc Exportar reporte de retenciones recibidas por cliente IR a Excel
 * @access Private
 */
router.get(
  '/exportar/retenciones-recibidas/ir',
  authenticate,
  reporteController.exportarRetencionesRecibidasPorClienteIRExcel
);

module.exports = router;
