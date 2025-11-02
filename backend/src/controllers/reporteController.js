const reporteService = require('../services/reporteService');

/**
 * Controlador de reportes
 */
class ReporteController {
  /**
   * Obtener reporte de compras
   */
  async reporteCompras(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado, tipo_proveedor } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado,
        tipo_proveedor
      };

      const reporte = await reporteService.reporteCompras(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de compras generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reporte de ventas
   */
  async reporteVentas(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado, tipo_comprobante } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado,
        tipo_comprobante
      };

      const reporte = await reporteService.reporteVentas(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de ventas generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener resumen general
   */
  async resumenGeneral(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta
      };

      const resumen = await reporteService.resumenGeneral(empresaId, filtros);

      res.json({
        mensaje: 'Resumen general generado exitosamente',
        data: resumen
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas por período
   */
  async estadisticasPorPeriodo(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo } = req.params;

      if (!periodo) {
        return res.status(400).json({
          error: 'El periodo es requerido'
        });
      }

      const estadisticas = await reporteService.estadisticasPorPeriodo(empresaId, periodo);

      res.json({
        mensaje: 'Estadísticas por período generadas exitosamente',
        data: estadisticas
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas para el Dashboard
   */
  async estadisticasDashboard(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const usuarioId = req.usuario.id;
      const rol = req.usuario.rol;

      const estadisticas = await reporteService.estadisticasDashboard(empresaId, usuarioId, rol);

      res.json({
        mensaje: 'Estadísticas del dashboard obtenidas exitosamente',
        data: estadisticas
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar reporte de compras a Excel
   */
  async exportarComprasExcel(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado, tipo_proveedor } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado,
        tipo_proveedor
      };

      const buffer = await reporteService.exportarComprasExcel(empresaId, filtros);

      // Generar nombre del archivo
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Compras_${periodo || fecha}.xlsx`;

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar reporte de ventas a Excel
   */
  async exportarVentasExcel(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado, tipo_comprobante } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado,
        tipo_comprobante
      };

      const buffer = await reporteService.exportarVentasExcel(empresaId, filtros);

      // Generar nombre del archivo
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Ventas_${periodo || fecha}.xlsx`;

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar reporte de compras a PDF
   */
  async exportarComprasPDF(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado, tipo_proveedor } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado,
        tipo_proveedor
      };

      const buffer = await reporteService.exportarComprasPDF(empresaId, filtros);

      // Generar nombre del archivo
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Compras_${periodo || fecha}.pdf`;

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar reporte de ventas a PDF
   */
  async exportarVentasPDF(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado, tipo_comprobante } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado,
        tipo_comprobante
      };

      const buffer = await reporteService.exportarVentasPDF(empresaId, filtros);

      // Generar nombre del archivo
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Ventas_${periodo || fecha}.pdf`;

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reporte de compras por porcentaje de retención
   */
  async reporteComprasPorPorcentajeRetencion(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado, tipo_impuesto } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado,
        tipo_impuesto
      };

      const reporte = await reporteService.reporteComprasPorPorcentajeRetencion(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de compras por porcentaje de retención generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reporte de compras por código de retención
   */
  async reporteComprasPorCodigoRetencion(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado, tipo_impuesto } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado,
        tipo_impuesto
      };

      const reporte = await reporteService.reporteComprasPorCodigoRetencion(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de compras por código de retención generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reporte de compras sin retenciones
   */
  async reporteComprasSinRetenciones(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado
      };

      const reporte = await reporteService.reporteComprasSinRetenciones(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de compras sin retenciones generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reporte de retenciones recibidas por cliente - IVA
   */
  async reporteRetencionesRecibidasPorClienteIVA(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado
      };

      const reporte = await reporteService.reporteRetencionesRecibidasPorClienteIVA(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de retenciones recibidas de IVA por cliente generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reporte de retenciones recibidas por cliente - IR
   */
  async reporteRetencionesRecibidasPorClienteIR(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado
      };

      const reporte = await reporteService.reporteRetencionesRecibidasPorClienteIR(empresaId, filtros);

      res.json({
        mensaje: 'Reporte de retenciones recibidas de IR por cliente generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar reporte de compras por porcentaje de retención a Excel
   */
  async exportarComprasPorPorcentajeRetencionExcel(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado, tipo_impuesto } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado,
        tipo_impuesto
      };

      const buffer = await reporteService.exportarComprasPorPorcentajeRetencionExcel(empresaId, filtros);

      // Generar nombre del archivo
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Retenciones_Porcentaje_${periodo || fecha}.xlsx`;

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar reporte de compras por código de retención a Excel
   */
  async exportarComprasPorCodigoRetencionExcel(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado, tipo_impuesto } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado,
        tipo_impuesto
      };

      const buffer = await reporteService.exportarComprasPorCodigoRetencionExcel(empresaId, filtros);

      // Generar nombre del archivo
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Retenciones_Codigo_${periodo || fecha}.xlsx`;

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar reporte de compras sin retenciones a Excel
   */
  async exportarComprasSinRetencionesExcel(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado
      };

      const buffer = await reporteService.exportarComprasSinRetencionesExcel(empresaId, filtros);

      // Generar nombre del archivo
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Compras_Sin_Retenciones_${periodo || fecha}.xlsx`;

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar reporte de retenciones recibidas por cliente IVA a Excel
   */
  async exportarRetencionesRecibidasPorClienteIVAExcel(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado
      };

      const buffer = await reporteService.exportarRetencionesRecibidasPorClienteIVAExcel(empresaId, filtros);

      // Generar nombre del archivo
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Retenciones_Recibidas_IVA_${periodo || fecha}.xlsx`;

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar reporte de retenciones recibidas por cliente IR a Excel
   */
  async exportarRetencionesRecibidasPorClienteIRExcel(req, res, next) {
    try {
      const empresaId = req.empresaId;
      const { periodo, fecha_desde, fecha_hasta, estado } = req.query;

      const filtros = {
        periodo,
        fecha_desde,
        fecha_hasta,
        estado
      };

      const buffer = await reporteService.exportarRetencionesRecibidasPorClienteIRExcel(empresaId, filtros);

      // Generar nombre del archivo
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Retenciones_Recibidas_IR_${periodo || fecha}.xlsx`;

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReporteController();
