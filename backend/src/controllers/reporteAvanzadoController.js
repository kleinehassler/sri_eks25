const compraService = require('../services/compraService');
const ventaService = require('../services/ventaService');
const reporteService = require('../services/reporteService');

/**
 * Controlador para reportes avanzados
 */
class ReporteAvanzadoController {
  // ============================================
  // REPORTES DE COMPRAS
  // ============================================

  /**
   * Reporte de compras por crédito tributario
   */
  async comprasPorCreditoTributario(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, fecha_desde, fecha_hasta };

      const reporte = await compraService.reportePorCreditoTributario(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de compras por crédito tributario generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reporte de compras por proveedor
   */
  async comprasPorProveedor(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, fecha_desde, fecha_hasta };

      const reporte = await compraService.reportePorProveedor(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de compras por proveedor generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reporte de compras por porcentaje de IVA
   */
  async comprasPorPorcentajeIVA(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, fecha_desde, fecha_hasta };

      const reporte = await compraService.reportePorPorcentajeIVA(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de compras por porcentaje de IVA generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reporte de compras por retención de IVA
   */
  async comprasPorRetencionIVA(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, fecha_desde, fecha_hasta };

      const reporte = await compraService.reportePorRetencionIVA(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de compras por retención de IVA generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reporte de compras por retención de Renta
   */
  async comprasPorRetencionRenta(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, fecha_desde, fecha_hasta };

      const reporte = await compraService.reportePorRetencionRenta(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de compras por retención de Renta generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reporte de compras sin retenciones
   */
  async comprasSinRetenciones(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, fecha_desde, fecha_hasta };

      const reporte = await compraService.reporteComprasSinRetenciones(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de compras sin retenciones generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reporte detallado de compras por proveedor específico
   */
  async reporteDetalladoProveedor(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { ruc } = req.params;
      const { periodo, periodo_inicio, periodo_fin, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, periodo_inicio, periodo_fin, fecha_desde, fecha_hasta };

      const reporte = await compraService.reporteDetalladoProveedor(empresaId, ruc, filtros);

      res.json({
        mensaje: 'Reporte detallado de proveedor generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // REPORTES DE VENTAS
  // ============================================

  /**
   * Reporte de ventas por cliente
   */
  async ventasPorCliente(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, fecha_desde, fecha_hasta };

      const reporte = await ventaService.reportePorCliente(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de ventas por cliente generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reporte de ventas por porcentaje de IVA
   */
  async ventasPorPorcentajeIVA(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, fecha_desde, fecha_hasta };

      const reporte = await ventaService.reportePorPorcentajeIVA(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de ventas por porcentaje de IVA generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reporte de ventas por tipo de comprobante
   */
  async ventasPorTipoComprobante(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, fecha_desde, fecha_hasta };

      const reporte = await ventaService.reportePorTipoComprobante(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de ventas por tipo de comprobante generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reporte detallado de ventas por cliente específico
   */
  async reporteDetalladoCliente(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { ruc } = req.params;
      const { periodo, periodo_inicio, periodo_fin, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, periodo_inicio, periodo_fin, fecha_desde, fecha_hasta };

      const reporte = await ventaService.reporteDetalladoCliente(empresaId, ruc, filtros);

      res.json({
        mensaje: 'Reporte detallado de cliente generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // EXPORTACIÓN A EXCEL - COMPRAS
  // ============================================

  /**
   * Exportar reporte de compras por proveedor a Excel
   */
  async exportarComprasPorProveedorExcel(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, fecha_desde, fecha_hasta };

      const buffer = await reporteService.exportarComprasPorProveedorExcel(empresaId, filtros);

      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Compras_Por_Proveedor_${periodo || fecha}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar reporte de compras por porcentaje de IVA a Excel
   */
  async exportarComprasPorIVAExcel(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, fecha_desde, fecha_hasta };

      const buffer = await reporteService.exportarComprasPorIVAExcel(empresaId, filtros);

      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Compras_Por_IVA_${periodo || fecha}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // EXPORTACIÓN A PDF - COMPRAS
  // ============================================

  /**
   * Exportar reporte de compras por proveedor a PDF
   */
  async exportarComprasPorProveedorPDF(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta } = req.query;

      const filtros = { periodo, fecha_desde, fecha_hasta };

      const buffer = await reporteService.exportarComprasPorProveedorPDF(empresaId, filtros);

      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Compras_Por_Proveedor_${periodo || fecha}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReporteAvanzadoController();
