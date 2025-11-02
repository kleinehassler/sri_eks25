const { Compra, Venta, Empresa, Usuario, Retencion } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

/**
 * Servicio de reportes y estadísticas
 */
class ReporteService {
  /**
   * Obtener reporte de compras con totales agregados
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros del reporte
   * @returns {Object} Reporte de compras
   */
  async reporteCompras(empresaId, filtros = {}) {
    const where = { empresa_id: empresaId };

    // Aplicar filtros
    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.tipo_proveedor) {
      where.tipo_proveedor = filtros.tipo_proveedor;
    }

    // Obtener compras
    const compras = await Compra.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_emision', 'DESC']]
    });

    // Calcular totales
    const totales = await Compra.findOne({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_registros'],
        [sequelize.fn('SUM', sequelize.col('base_imponible_iva')), 'total_base_iva'],
        [sequelize.fn('SUM', sequelize.col('base_imponible_0')), 'total_base_0'],
        [sequelize.fn('SUM', sequelize.col('monto_iva')), 'total_iva'],
        [sequelize.fn('SUM', sequelize.col('monto_ice')), 'total_ice'],
        [sequelize.fn('SUM', sequelize.col('total_compra')), 'total_compras']
      ],
      raw: true
    });

    // Agrupar por mes
    const porMes = await Compra.findAll({
      where,
      attributes: [
        'periodo',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('total_compra')), 'total']
      ],
      group: ['periodo'],
      order: [['periodo', 'ASC']],
      raw: true
    });

    // Agrupar por proveedor (top 10)
    const porProveedor = await Compra.findAll({
      where,
      attributes: [
        'razon_social_proveedor',
        'identificacion_proveedor',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('total_compra')), 'total']
      ],
      group: ['razon_social_proveedor', 'identificacion_proveedor'],
      order: [[sequelize.literal('total'), 'DESC']],
      limit: 10,
      raw: true
    });

    return {
      compras,
      totales: {
        total_registros: parseInt(totales.total_registros) || 0,
        total_base_iva: parseFloat(totales.total_base_iva) || 0,
        total_base_0: parseFloat(totales.total_base_0) || 0,
        total_iva: parseFloat(totales.total_iva) || 0,
        total_ice: parseFloat(totales.total_ice) || 0,
        total_compras: parseFloat(totales.total_compras) || 0
      },
      porMes,
      porProveedor
    };
  }

  /**
   * Obtener reporte de ventas con totales agregados
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros del reporte
   * @returns {Object} Reporte de ventas
   */
  async reporteVentas(empresaId, filtros = {}) {
    const where = { empresa_id: empresaId };

    // Aplicar filtros
    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.tipo_comprobante) {
      where.tipo_comprobante = filtros.tipo_comprobante;
    }

    // Obtener ventas
    const ventas = await Venta.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_emision', 'DESC']]
    });

    // Calcular totales
    const totales = await Venta.findOne({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_registros'],
        [sequelize.fn('SUM', sequelize.col('base_imponible_iva')), 'total_base_iva'],
        [sequelize.fn('SUM', sequelize.col('base_imponible_0')), 'total_base_0'],
        [sequelize.fn('SUM', sequelize.col('monto_iva')), 'total_iva'],
        [sequelize.fn('SUM', sequelize.col('total_venta')), 'total_ventas']
      ],
      raw: true
    });

    // Agrupar por mes
    const porMes = await Venta.findAll({
      where,
      attributes: [
        'periodo',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('total_venta')), 'total']
      ],
      group: ['periodo'],
      order: [['periodo', 'ASC']],
      raw: true
    });

    // Agrupar por tipo de comprobante
    const porTipoComprobante = await Venta.findAll({
      where,
      attributes: [
        'tipo_comprobante',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('total_venta')), 'total']
      ],
      group: ['tipo_comprobante'],
      order: [[sequelize.literal('total'), 'DESC']],
      raw: true
    });

    return {
      ventas,
      totales: {
        total_registros: parseInt(totales.total_registros) || 0,
        total_base_iva: parseFloat(totales.total_base_iva) || 0,
        total_base_0: parseFloat(totales.total_base_0) || 0,
        total_iva: parseFloat(totales.total_iva) || 0,
        total_ventas: parseFloat(totales.total_ventas) || 0
      },
      porMes,
      porTipoComprobante
    };
  }

  /**
   * Obtener resumen general (compras y ventas)
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros del reporte
   * @returns {Object} Resumen general
   */
  async resumenGeneral(empresaId, filtros = {}) {
    const where = { empresa_id: empresaId };

    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    // Totales de compras
    const totalesCompras = await Compra.findOne({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('total_compra')), 'total'],
        [sequelize.fn('SUM', sequelize.col('monto_iva')), 'iva']
      ],
      raw: true
    });

    // Totales de ventas
    const totalesVentas = await Venta.findOne({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('total_venta')), 'total'],
        [sequelize.fn('SUM', sequelize.col('monto_iva')), 'iva']
      ],
      raw: true
    });

    // Comparación por mes
    const comprasPorMes = await Compra.findAll({
      where,
      attributes: [
        'periodo',
        [sequelize.fn('SUM', sequelize.col('total_compra')), 'total']
      ],
      group: ['periodo'],
      order: [['periodo', 'ASC']],
      raw: true
    });

    const ventasPorMes = await Venta.findAll({
      where,
      attributes: [
        'periodo',
        [sequelize.fn('SUM', sequelize.col('total_venta')), 'total']
      ],
      group: ['periodo'],
      order: [['periodo', 'ASC']],
      raw: true
    });

    return {
      compras: {
        cantidad: parseInt(totalesCompras.cantidad) || 0,
        total: parseFloat(totalesCompras.total) || 0,
        iva: parseFloat(totalesCompras.iva) || 0
      },
      ventas: {
        cantidad: parseInt(totalesVentas.cantidad) || 0,
        total: parseFloat(totalesVentas.total) || 0,
        iva: parseFloat(totalesVentas.iva) || 0
      },
      comparacion: {
        comprasPorMes,
        ventasPorMes
      }
    };
  }

  /**
   * Obtener estadísticas por período
   * @param {number} empresaId - ID de la empresa
   * @param {string} periodo - Período en formato MM/YYYY
   * @returns {Object} Estadísticas del período
   */
  async estadisticasPorPeriodo(empresaId, periodo) {
    const where = {
      empresa_id: empresaId,
      periodo
    };

    const [compras, ventas] = await Promise.all([
      Compra.findAll({
        where,
        attributes: [
          'estado',
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
          [sequelize.fn('SUM', sequelize.col('total_compra')), 'total']
        ],
        group: ['estado'],
        raw: true
      }),
      Venta.findAll({
        where,
        attributes: [
          'estado',
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
          [sequelize.fn('SUM', sequelize.col('total_venta')), 'total']
        ],
        group: ['estado'],
        raw: true
      })
    ]);

    return {
      periodo,
      compras,
      ventas
    };
  }

  /**
   * Obtener estadísticas para el Dashboard
   * @param {number} empresaId - ID de la empresa
   * @param {number} usuarioId - ID del usuario
   * @param {string} rol - Rol del usuario
   * @returns {Object} Estadísticas del dashboard
   */
  async estadisticasDashboard(empresaId, usuarioId, rol) {
    // Obtener mes actual
    const hoy = new Date();
    const mesActual = String(hoy.getMonth() + 1).padStart(2, '0');
    const anioActual = hoy.getFullYear();
    const periodoActual = `${mesActual}/${anioActual}`;

    const whereEmpresa = { empresa_id: empresaId };
    const wherePeriodoActual = { empresa_id: empresaId, periodo: periodoActual };

    // Si es ADMINISTRADOR_GENERAL, obtener todas las empresas
    let totalEmpresas = 1;
    if (rol === 'ADMINISTRADOR_GENERAL') {
      totalEmpresas = await Empresa.count({
        where: { estado: 'ACTIVO' }
      });
    } else {
      // Para otros roles, solo contar su empresa
      totalEmpresas = await Empresa.count({
        where: { id: empresaId, estado: 'ACTIVO' }
      });
    }

    // Compras del mes actual
    const comprasMes = await Compra.count({
      where: wherePeriodoActual
    });

    // Ventas del mes actual
    const ventasMes = await Venta.count({
      where: wherePeriodoActual
    });

    // ATS generados (usando tabla HistorialAts si existe)
    const { HistorialAts } = require('../models');
    let atsGenerados = 0;
    try {
      if (HistorialAts) {
        atsGenerados = await HistorialAts.count({
          where: whereEmpresa
        });
      }
    } catch (error) {
      // Si la tabla no existe o hay error, mantener en 0
      atsGenerados = 0;
    }

    // Resumen del mes actual
    const [comprasTotales, ventasTotales] = await Promise.all([
      Compra.findOne({
        where: wherePeriodoActual,
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
          [sequelize.fn('SUM', sequelize.col('total_compra')), 'total']
        ],
        raw: true
      }),
      Venta.findOne({
        where: wherePeriodoActual,
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
          [sequelize.fn('SUM', sequelize.col('total_venta')), 'total']
        ],
        raw: true
      })
    ]);

    return {
      totalEmpresas,
      comprasMes,
      ventasMes,
      atsGenerados,
      periodoActual,
      resumenMesActual: {
        compras: {
          cantidad: parseInt(comprasTotales.cantidad) || 0,
          total: parseFloat(comprasTotales.total) || 0
        },
        ventas: {
          cantidad: parseInt(ventasTotales.cantidad) || 0,
          total: parseFloat(ventasTotales.total) || 0
        }
      }
    };
  }

  /**
   * Exportar reporte de compras a Excel
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros del reporte
   * @returns {Buffer} Buffer del archivo Excel
   */
  async exportarComprasExcel(empresaId, filtros = {}) {
    const reporte = await this.reporteCompras(empresaId, filtros);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema ATS - SRI Ecuador';
    workbook.created = new Date();

    // Hoja de datos de compras
    const worksheet = workbook.addWorksheet('Compras');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Fecha Emisión', key: 'fecha_emision', width: 15 },
      { header: 'Período', key: 'periodo', width: 12 },
      { header: 'RUC Proveedor', key: 'identificacion_proveedor', width: 15 },
      { header: 'Razón Social', key: 'razon_social_proveedor', width: 40 },
      { header: 'Tipo Comprobante', key: 'tipo_comprobante', width: 15 },
      { header: 'Establecimiento', key: 'establecimiento', width: 15 },
      { header: 'Punto Emisión', key: 'punto_emision', width: 15 },
      { header: 'Secuencial', key: 'secuencial', width: 15 },
      { header: 'Base IVA', key: 'base_imponible_iva', width: 15 },
      { header: 'Base 0%', key: 'base_imponible_0', width: 15 },
      { header: 'Monto IVA', key: 'monto_iva', width: 15 },
      { header: 'Total', key: 'total_compra', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    reporte.compras.forEach(compra => {
      worksheet.addRow({
        fecha_emision: compra.fecha_emision,
        periodo: compra.periodo,
        identificacion_proveedor: compra.identificacion_proveedor,
        razon_social_proveedor: compra.razon_social_proveedor,
        tipo_comprobante: compra.tipo_comprobante,
        establecimiento: compra.establecimiento,
        punto_emision: compra.punto_emision,
        secuencial: compra.secuencial,
        base_imponible_iva: parseFloat(compra.base_imponible_iva || 0),
        base_imponible_0: parseFloat(compra.base_imponible_0 || 0),
        monto_iva: parseFloat(compra.monto_iva || 0),
        total_compra: parseFloat(compra.total_compra || 0),
        estado: compra.estado
      });
    });

    // Agregar fila de totales
    const lastRow = worksheet.addRow({
      razon_social_proveedor: 'TOTALES',
      base_imponible_iva: reporte.totales.total_base_iva,
      base_imponible_0: reporte.totales.total_base_0,
      monto_iva: reporte.totales.total_iva,
      total_compra: reporte.totales.total_compras
    });
    lastRow.font = { bold: true };
    lastRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };

    // Formato de números para las columnas monetarias
    ['base_imponible_iva', 'base_imponible_0', 'monto_iva', 'total_compra'].forEach(col => {
      worksheet.getColumn(col).numFmt = '$#,##0.00';
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * Exportar reporte de ventas a Excel
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros del reporte
   * @returns {Buffer} Buffer del archivo Excel
   */
  async exportarVentasExcel(empresaId, filtros = {}) {
    const reporte = await this.reporteVentas(empresaId, filtros);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema ATS - SRI Ecuador';
    workbook.created = new Date();

    // Hoja de datos de ventas
    const worksheet = workbook.addWorksheet('Ventas');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Fecha Emisión', key: 'fecha_emision', width: 15 },
      { header: 'Período', key: 'periodo', width: 12 },
      { header: 'RUC Cliente', key: 'identificacion_cliente', width: 15 },
      { header: 'Razón Social', key: 'razon_social_cliente', width: 40 },
      { header: 'Tipo Comprobante', key: 'tipo_comprobante', width: 15 },
      { header: 'Establecimiento', key: 'establecimiento', width: 15 },
      { header: 'Punto Emisión', key: 'punto_emision', width: 15 },
      { header: 'Secuencial', key: 'secuencial', width: 15 },
      { header: 'Base IVA', key: 'base_imponible_iva', width: 15 },
      { header: 'Base 0%', key: 'base_imponible_0', width: 15 },
      { header: 'Monto IVA', key: 'monto_iva', width: 15 },
      { header: 'Total', key: 'total_venta', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00B050' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    reporte.ventas.forEach(venta => {
      worksheet.addRow({
        fecha_emision: venta.fecha_emision,
        periodo: venta.periodo,
        identificacion_cliente: venta.identificacion_cliente,
        razon_social_cliente: venta.razon_social_cliente,
        tipo_comprobante: venta.tipo_comprobante,
        establecimiento: venta.establecimiento,
        punto_emision: venta.punto_emision,
        secuencial: venta.secuencial,
        base_imponible_iva: parseFloat(venta.base_imponible_iva || 0),
        base_imponible_0: parseFloat(venta.base_imponible_0 || 0),
        monto_iva: parseFloat(venta.monto_iva || 0),
        total_venta: parseFloat(venta.total_venta || 0),
        estado: venta.estado
      });
    });

    // Agregar fila de totales
    const lastRow = worksheet.addRow({
      razon_social_cliente: 'TOTALES',
      base_imponible_iva: reporte.totales.total_base_iva,
      base_imponible_0: reporte.totales.total_base_0,
      monto_iva: reporte.totales.total_iva,
      total_venta: reporte.totales.total_ventas
    });
    lastRow.font = { bold: true };
    lastRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2EFDA' }
    };

    // Formato de números para las columnas monetarias
    ['base_imponible_iva', 'base_imponible_0', 'monto_iva', 'total_venta'].forEach(col => {
      worksheet.getColumn(col).numFmt = '$#,##0.00';
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * Exportar reporte de compras a PDF
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros del reporte
   * @returns {Promise<Buffer>} Buffer del archivo PDF
   */
  async exportarComprasPDF(empresaId, filtros = {}) {
    const reporte = await this.reporteCompras(empresaId, filtros);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Título
        doc.fontSize(18).text('Reporte de Compras', { align: 'center' });
        doc.moveDown();

        // Información del reporte
        doc.fontSize(10);
        if (filtros.periodo) {
          doc.text(`Período: ${filtros.periodo}`);
        }
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-EC')}`);
        doc.text(`Total registros: ${reporte.totales.total_registros}`);
        doc.moveDown();

        // Tabla de datos
        const tableTop = doc.y;
        const colWidths = { fecha: 70, ruc: 90, proveedor: 120, factura: 90, baseIva: 60, iva: 50, total: 60, estado: 60 };
        let yPosition = tableTop;

        // Encabezados
        doc.fontSize(8).font('Helvetica-Bold');
        doc.rect(50, yPosition, 750, 20).fill('#0070C0');
        doc.fillColor('#FFFFFF');

        let xPosition = 55;
        doc.text('Fecha', xPosition, yPosition + 5, { width: colWidths.fecha });
        xPosition += colWidths.fecha;
        doc.text('RUC', xPosition, yPosition + 5, { width: colWidths.ruc });
        xPosition += colWidths.ruc;
        doc.text('Proveedor', xPosition, yPosition + 5, { width: colWidths.proveedor });
        xPosition += colWidths.proveedor;
        doc.text('Factura', xPosition, yPosition + 5, { width: colWidths.factura });
        xPosition += colWidths.factura;
        doc.text('Base IVA', xPosition, yPosition + 5, { width: colWidths.baseIva, align: 'right' });
        xPosition += colWidths.baseIva;
        doc.text('IVA', xPosition, yPosition + 5, { width: colWidths.iva, align: 'right' });
        xPosition += colWidths.iva;
        doc.text('Total', xPosition, yPosition + 5, { width: colWidths.total, align: 'right' });
        xPosition += colWidths.total;
        doc.text('Estado', xPosition, yPosition + 5, { width: colWidths.estado });

        yPosition += 25;
        doc.font('Helvetica').fillColor('#000000');

        // Datos
        const maxItemsPerPage = 15;
        let itemCount = 0;

        reporte.compras.forEach((compra, index) => {
          if (itemCount >= maxItemsPerPage) {
            doc.addPage();
            yPosition = 50;
            itemCount = 0;
          }

          xPosition = 55;

          // Alternar color de fondo
          if (index % 2 === 0) {
            doc.rect(50, yPosition - 3, 750, 18).fillOpacity(0.1).fill('#D9E1F2').fillOpacity(1);
          }

          doc.fontSize(7);
          doc.text(compra.fecha_emision || '', xPosition, yPosition, { width: colWidths.fecha });
          xPosition += colWidths.fecha;
          doc.text(compra.identificacion_proveedor || '', xPosition, yPosition, { width: colWidths.ruc });
          xPosition += colWidths.ruc;
          doc.text((compra.razon_social_proveedor || '').substring(0, 25), xPosition, yPosition, { width: colWidths.proveedor });
          xPosition += colWidths.proveedor;
          const factura = `${compra.establecimiento}-${compra.punto_emision}-${compra.secuencial}`;
          doc.text(factura, xPosition, yPosition, { width: colWidths.factura });
          xPosition += colWidths.factura;
          doc.text(`$${parseFloat(compra.base_imponible_iva || 0).toFixed(2)}`, xPosition, yPosition, { width: colWidths.baseIva, align: 'right' });
          xPosition += colWidths.baseIva;
          doc.text(`$${parseFloat(compra.monto_iva || 0).toFixed(2)}`, xPosition, yPosition, { width: colWidths.iva, align: 'right' });
          xPosition += colWidths.iva;
          doc.text(`$${parseFloat(compra.total_compra || 0).toFixed(2)}`, xPosition, yPosition, { width: colWidths.total, align: 'right' });
          xPosition += colWidths.total;
          doc.text(compra.estado || '', xPosition, yPosition, { width: colWidths.estado });

          yPosition += 18;
          itemCount++;
        });

        // Totales
        yPosition += 10;
        doc.fontSize(9).font('Helvetica-Bold');
        doc.rect(50, yPosition - 3, 750, 20).fill('#D9E1F2');
        doc.fillColor('#000000');
        xPosition = 55 + colWidths.fecha + colWidths.ruc + colWidths.proveedor + colWidths.factura;
        doc.text(`$${reporte.totales.total_base_iva.toFixed(2)}`, xPosition, yPosition + 3, { width: colWidths.baseIva, align: 'right' });
        xPosition += colWidths.baseIva;
        doc.text(`$${reporte.totales.total_iva.toFixed(2)}`, xPosition, yPosition + 3, { width: colWidths.iva, align: 'right' });
        xPosition += colWidths.iva;
        doc.text(`$${reporte.totales.total_compras.toFixed(2)}`, xPosition, yPosition + 3, { width: colWidths.total, align: 'right' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Exportar reporte de ventas a PDF
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros del reporte
   * @returns {Promise<Buffer>} Buffer del archivo PDF
   */
  async exportarVentasPDF(empresaId, filtros = {}) {
    const reporte = await this.reporteVentas(empresaId, filtros);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Título
        doc.fontSize(18).text('Reporte de Ventas', { align: 'center' });
        doc.moveDown();

        // Información del reporte
        doc.fontSize(10);
        if (filtros.periodo) {
          doc.text(`Período: ${filtros.periodo}`);
        }
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-EC')}`);
        doc.text(`Total registros: ${reporte.totales.total_registros}`);
        doc.moveDown();

        // Tabla de datos
        const tableTop = doc.y;
        const colWidths = { fecha: 70, ruc: 90, cliente: 120, factura: 90, baseIva: 60, iva: 50, total: 60, estado: 60 };
        let yPosition = tableTop;

        // Encabezados
        doc.fontSize(8).font('Helvetica-Bold');
        doc.rect(50, yPosition, 750, 20).fill('#00B050');
        doc.fillColor('#FFFFFF');

        let xPosition = 55;
        doc.text('Fecha', xPosition, yPosition + 5, { width: colWidths.fecha });
        xPosition += colWidths.fecha;
        doc.text('RUC', xPosition, yPosition + 5, { width: colWidths.ruc });
        xPosition += colWidths.ruc;
        doc.text('Cliente', xPosition, yPosition + 5, { width: colWidths.cliente });
        xPosition += colWidths.cliente;
        doc.text('Factura', xPosition, yPosition + 5, { width: colWidths.factura });
        xPosition += colWidths.factura;
        doc.text('Base IVA', xPosition, yPosition + 5, { width: colWidths.baseIva, align: 'right' });
        xPosition += colWidths.baseIva;
        doc.text('IVA', xPosition, yPosition + 5, { width: colWidths.iva, align: 'right' });
        xPosition += colWidths.iva;
        doc.text('Total', xPosition, yPosition + 5, { width: colWidths.total, align: 'right' });
        xPosition += colWidths.total;
        doc.text('Estado', xPosition, yPosition + 5, { width: colWidths.estado });

        yPosition += 25;
        doc.font('Helvetica').fillColor('#000000');

        // Datos
        const maxItemsPerPage = 15;
        let itemCount = 0;

        reporte.ventas.forEach((venta, index) => {
          if (itemCount >= maxItemsPerPage) {
            doc.addPage();
            yPosition = 50;
            itemCount = 0;
          }

          xPosition = 55;

          // Alternar color de fondo
          if (index % 2 === 0) {
            doc.rect(50, yPosition - 3, 750, 18).fillOpacity(0.1).fill('#E2EFDA').fillOpacity(1);
          }

          doc.fontSize(7);
          doc.text(venta.fecha_emision || '', xPosition, yPosition, { width: colWidths.fecha });
          xPosition += colWidths.fecha;
          doc.text(venta.identificacion_cliente || '', xPosition, yPosition, { width: colWidths.ruc });
          xPosition += colWidths.ruc;
          doc.text((venta.razon_social_cliente || '').substring(0, 25), xPosition, yPosition, { width: colWidths.cliente });
          xPosition += colWidths.cliente;
          const factura = `${venta.establecimiento}-${venta.punto_emision}-${venta.secuencial}`;
          doc.text(factura, xPosition, yPosition, { width: colWidths.factura });
          xPosition += colWidths.factura;
          doc.text(`$${parseFloat(venta.base_imponible_iva || 0).toFixed(2)}`, xPosition, yPosition, { width: colWidths.baseIva, align: 'right' });
          xPosition += colWidths.baseIva;
          doc.text(`$${parseFloat(venta.monto_iva || 0).toFixed(2)}`, xPosition, yPosition, { width: colWidths.iva, align: 'right' });
          xPosition += colWidths.iva;
          doc.text(`$${parseFloat(venta.total_venta || 0).toFixed(2)}`, xPosition, yPosition, { width: colWidths.total, align: 'right' });
          xPosition += colWidths.total;
          doc.text(venta.estado || '', xPosition, yPosition, { width: colWidths.estado });

          yPosition += 18;
          itemCount++;
        });

        // Totales
        yPosition += 10;
        doc.fontSize(9).font('Helvetica-Bold');
        doc.rect(50, yPosition - 3, 750, 20).fill('#E2EFDA');
        doc.fillColor('#000000');
        xPosition = 55 + colWidths.fecha + colWidths.ruc + colWidths.cliente + colWidths.factura;
        doc.text(`$${reporte.totales.total_base_iva.toFixed(2)}`, xPosition, yPosition + 3, { width: colWidths.baseIva, align: 'right' });
        xPosition += colWidths.baseIva;
        doc.text(`$${reporte.totales.total_iva.toFixed(2)}`, xPosition, yPosition + 3, { width: colWidths.iva, align: 'right' });
        xPosition += colWidths.iva;
        doc.text(`$${reporte.totales.total_ventas.toFixed(2)}`, xPosition, yPosition + 3, { width: colWidths.total, align: 'right' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Exportar reporte de compras por proveedor a Excel
   */
  async exportarComprasPorProveedorExcel(empresaId, filtros = {}) {
    const compraService = require('./compraService');
    const reporte = await compraService.reportePorProveedor(empresaId, filtros);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Compras por Proveedor');

    // Estilo del encabezado
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    // Encabezados
    worksheet.columns = [
      { header: 'RUC/Cédula', key: 'identificacion', width: 15 },
      { header: 'Proveedor', key: 'razon_social', width: 40 },
      { header: 'Cantidad', key: 'cantidad_compras', width: 12 },
      { header: 'Total Compras', key: 'total_compras', width: 15 },
      { header: 'Total IVA', key: 'total_iva', width: 15 }
    ];

    // Aplicar estilo al encabezado
    worksheet.getRow(1).eachCell(cell => {
      cell.style = headerStyle;
    });

    // Agregar datos
    reporte.forEach(item => {
      worksheet.addRow({
        identificacion: item.identificacion,
        razon_social: item.razon_social,
        cantidad_compras: item.cantidad_compras,
        total_compras: item.total_compras,
        total_iva: item.total_iva
      });
    });

    // Formato de moneda
    worksheet.getColumn('total_compras').numFmt = '$#,##0.00';
    worksheet.getColumn('total_iva').numFmt = '$#,##0.00';

    // Totales
    const totalRow = worksheet.addRow({
      identificacion: '',
      razon_social: 'TOTAL',
      cantidad_compras: reporte.reduce((sum, item) => sum + item.cantidad_compras, 0),
      total_compras: reporte.reduce((sum, item) => sum + item.total_compras, 0),
      total_iva: reporte.reduce((sum, item) => sum + item.total_iva, 0)
    });

    totalRow.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      }
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Exportar reporte de compras por porcentaje de IVA a Excel
   */
  async exportarComprasPorIVAExcel(empresaId, filtros = {}) {
    const compraService = require('./compraService');
    const reporte = await compraService.reportePorPorcentajeIVA(empresaId, filtros);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Compras por % IVA');

    // Estilo del encabezado
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    // Encabezados
    worksheet.columns = [
      { header: 'Porcentaje IVA', key: 'porcentaje', width: 20 },
      { header: 'Cantidad', key: 'cantidad', width: 12 },
      { header: 'Base Imponible', key: 'base_imponible', width: 18 },
      { header: 'Monto IVA', key: 'monto_iva', width: 15 }
    ];

    // Aplicar estilo al encabezado
    worksheet.getRow(1).eachCell(cell => {
      cell.style = headerStyle;
    });

    // Agregar datos
    reporte.forEach(item => {
      worksheet.addRow({
        porcentaje: item.porcentaje,
        cantidad: item.cantidad,
        base_imponible: item.base_imponible,
        monto_iva: item.monto_iva || 0
      });
    });

    // Formato de moneda
    worksheet.getColumn('base_imponible').numFmt = '$#,##0.00';
    worksheet.getColumn('monto_iva').numFmt = '$#,##0.00';

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Reporte de compras por porcentaje de retención
   * Agrupa las retenciones realizadas por porcentaje retenido
   */
  async reporteComprasPorPorcentajeRetencion(empresaId, filtros = {}) {
    const where = { empresa_id: empresaId };

    // Aplicar filtros
    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.tipo_impuesto) {
      where.tipo_impuesto = filtros.tipo_impuesto;
    }

    // Agrupar por porcentaje de retención y tipo de impuesto
    const reporte = await Retencion.findAll({
      where,
      attributes: [
        'tipo_impuesto',
        'porcentaje_retencion',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad_retenciones'],
        [sequelize.fn('SUM', sequelize.col('base_imponible')), 'total_base_imponible'],
        [sequelize.fn('SUM', sequelize.col('valor_retenido')), 'total_retenido']
      ],
      group: ['tipo_impuesto', 'porcentaje_retencion'],
      order: [['tipo_impuesto', 'ASC'], ['porcentaje_retencion', 'DESC']],
      raw: true
    });

    // Calcular totales generales
    const totales = await Retencion.findOne({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_retenciones'],
        [sequelize.fn('SUM', sequelize.col('base_imponible')), 'total_base'],
        [sequelize.fn('SUM', sequelize.col('valor_retenido')), 'total_retenido']
      ],
      raw: true
    });

    return {
      detalle: reporte.map(item => ({
        tipo_impuesto: item.tipo_impuesto,
        porcentaje_retencion: parseFloat(item.porcentaje_retencion),
        cantidad_retenciones: parseInt(item.cantidad_retenciones) || 0,
        total_base_imponible: parseFloat(item.total_base_imponible) || 0,
        total_retenido: parseFloat(item.total_retenido) || 0
      })),
      totales: {
        total_retenciones: parseInt(totales.total_retenciones) || 0,
        total_base: parseFloat(totales.total_base) || 0,
        total_retenido: parseFloat(totales.total_retenido) || 0
      }
    };
  }

  /**
   * Reporte de compras por código de retención
   * Agrupa las retenciones realizadas por código de retención del SRI
   */
  async reporteComprasPorCodigoRetencion(empresaId, filtros = {}) {
    const where = { empresa_id: empresaId };

    // Aplicar filtros
    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.tipo_impuesto) {
      where.tipo_impuesto = filtros.tipo_impuesto;
    }

    // Agrupar por código de retención
    const reporte = await Retencion.findAll({
      where,
      attributes: [
        'tipo_impuesto',
        'codigo_retencion',
        'porcentaje_retencion',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad_retenciones'],
        [sequelize.fn('SUM', sequelize.col('base_imponible')), 'total_base_imponible'],
        [sequelize.fn('SUM', sequelize.col('valor_retenido')), 'total_retenido']
      ],
      group: ['tipo_impuesto', 'codigo_retencion', 'porcentaje_retencion'],
      order: [['tipo_impuesto', 'ASC'], ['codigo_retencion', 'ASC']],
      raw: true
    });

    // Calcular totales generales
    const totales = await Retencion.findOne({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_retenciones'],
        [sequelize.fn('SUM', sequelize.col('base_imponible')), 'total_base'],
        [sequelize.fn('SUM', sequelize.col('valor_retenido')), 'total_retenido']
      ],
      raw: true
    });

    return {
      detalle: reporte.map(item => ({
        tipo_impuesto: item.tipo_impuesto,
        codigo_retencion: item.codigo_retencion,
        porcentaje_retencion: parseFloat(item.porcentaje_retencion),
        cantidad_retenciones: parseInt(item.cantidad_retenciones) || 0,
        total_base_imponible: parseFloat(item.total_base_imponible) || 0,
        total_retenido: parseFloat(item.total_retenido) || 0
      })),
      totales: {
        total_retenciones: parseInt(totales.total_retenciones) || 0,
        total_base: parseFloat(totales.total_base) || 0,
        total_retenido: parseFloat(totales.total_retenido) || 0
      }
    };
  }

  /**
   * Reporte de compras sin retenciones
   * Lista todas las compras que no tienen retenciones asociadas
   */
  async reporteComprasSinRetenciones(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      [Op.or]: [
        { valor_retencion_iva: 0 },
        { valor_retencion_renta: 0 }
      ]
    };

    // Aplicar filtros
    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    // Buscar compras sin retenciones
    const compras = await Compra.findAll({
      where,
      include: [
        {
          model: Retencion,
          as: 'retenciones',
          required: false
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_emision', 'DESC']]
    });

    // Filtrar solo las que no tienen retenciones
    const comprasSinRetenciones = compras.filter(
      compra => !compra.retenciones || compra.retenciones.length === 0
    );

    // Calcular totales
    const totales = {
      cantidad: comprasSinRetenciones.length,
      total_compras: comprasSinRetenciones.reduce((sum, c) => sum + parseFloat(c.total_compra || 0), 0),
      total_base_iva: comprasSinRetenciones.reduce((sum, c) => sum + parseFloat(c.base_imponible_iva || 0), 0),
      total_iva: comprasSinRetenciones.reduce((sum, c) => sum + parseFloat(c.monto_iva || 0), 0)
    };

    return {
      compras: comprasSinRetenciones,
      totales
    };
  }

  /**
   * Reporte de retenciones recibidas por cliente - IVA
   * Agrupa las ventas por cliente y muestra las retenciones de IVA que le realizaron
   */
  async reporteRetencionesRecibidasPorClienteIVA(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      valor_retencion_iva: {
        [Op.gt]: 0
      }
    };

    // Aplicar filtros
    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    // Agrupar por cliente
    const reporte = await Venta.findAll({
      where,
      attributes: [
        'identificacion_cliente',
        'razon_social_cliente',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad_ventas'],
        [sequelize.fn('SUM', sequelize.col('total_venta')), 'total_ventas'],
        [sequelize.fn('SUM', sequelize.col('base_imponible_iva')), 'total_base_iva'],
        [sequelize.fn('SUM', sequelize.col('valor_retencion_iva')), 'total_retencion_iva']
      ],
      group: ['identificacion_cliente', 'razon_social_cliente'],
      order: [[sequelize.literal('total_retencion_iva'), 'DESC']],
      raw: true
    });

    // Calcular totales generales
    const totales = await Venta.findOne({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_ventas'],
        [sequelize.fn('SUM', sequelize.col('total_venta')), 'total'],
        [sequelize.fn('SUM', sequelize.col('base_imponible_iva')), 'total_base_iva'],
        [sequelize.fn('SUM', sequelize.col('valor_retencion_iva')), 'total_retencion_iva']
      ],
      raw: true
    });

    return {
      detalle: reporte.map(item => ({
        identificacion_cliente: item.identificacion_cliente,
        razon_social_cliente: item.razon_social_cliente,
        cantidad_ventas: parseInt(item.cantidad_ventas) || 0,
        total_ventas: parseFloat(item.total_ventas) || 0,
        total_base_iva: parseFloat(item.total_base_iva) || 0,
        total_retencion_iva: parseFloat(item.total_retencion_iva) || 0
      })),
      totales: {
        total_ventas: parseInt(totales.total_ventas) || 0,
        total: parseFloat(totales.total) || 0,
        total_base_iva: parseFloat(totales.total_base_iva) || 0,
        total_retencion_iva: parseFloat(totales.total_retencion_iva) || 0
      }
    };
  }

  /**
   * Reporte de retenciones recibidas por cliente - IR (Impuesto a la Renta)
   * Agrupa las ventas por cliente y muestra las retenciones de IR que le realizaron
   */
  async reporteRetencionesRecibidasPorClienteIR(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      valor_retencion_renta: {
        [Op.gt]: 0
      }
    };

    // Aplicar filtros
    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    // Agrupar por cliente
    const reporte = await Venta.findAll({
      where,
      attributes: [
        'identificacion_cliente',
        'razon_social_cliente',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad_ventas'],
        [sequelize.fn('SUM', sequelize.col('total_venta')), 'total_ventas'],
        [sequelize.fn('SUM', sequelize.col('valor_retencion_renta')), 'total_retencion_renta']
      ],
      group: ['identificacion_cliente', 'razon_social_cliente'],
      order: [[sequelize.literal('total_retencion_renta'), 'DESC']],
      raw: true
    });

    // Calcular totales generales
    const totales = await Venta.findOne({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_ventas'],
        [sequelize.fn('SUM', sequelize.col('total_venta')), 'total'],
        [sequelize.fn('SUM', sequelize.col('valor_retencion_renta')), 'total_retencion_renta']
      ],
      raw: true
    });

    return {
      detalle: reporte.map(item => ({
        identificacion_cliente: item.identificacion_cliente,
        razon_social_cliente: item.razon_social_cliente,
        cantidad_ventas: parseInt(item.cantidad_ventas) || 0,
        total_ventas: parseFloat(item.total_ventas) || 0,
        total_retencion_renta: parseFloat(item.total_retencion_renta) || 0
      })),
      totales: {
        total_ventas: parseInt(totales.total_ventas) || 0,
        total: parseFloat(totales.total) || 0,
        total_retencion_renta: parseFloat(totales.total_retencion_renta) || 0
      }
    };
  }

  /**
   * Exportar reporte de compras por porcentaje de retención a Excel
   */
  async exportarComprasPorPorcentajeRetencionExcel(empresaId, filtros = {}) {
    const reporte = await this.reporteComprasPorPorcentajeRetencion(empresaId, filtros);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema ATS - SRI Ecuador';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Retenciones por Porcentaje');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Tipo Impuesto', key: 'tipo_impuesto', width: 18 },
      { header: 'Porcentaje Retención', key: 'porcentaje_retencion', width: 20 },
      { header: 'Cantidad Retenciones', key: 'cantidad_retenciones', width: 20 },
      { header: 'Base Imponible Total', key: 'total_base_imponible', width: 20 },
      { header: 'Total Retenido', key: 'total_retenido', width: 18 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    reporte.detalle.forEach(item => {
      worksheet.addRow({
        tipo_impuesto: item.tipo_impuesto,
        porcentaje_retencion: item.porcentaje_retencion + '%',
        cantidad_retenciones: item.cantidad_retenciones,
        total_base_imponible: item.total_base_imponible,
        total_retenido: item.total_retenido
      });
    });

    // Agregar fila de totales
    const lastRow = worksheet.addRow({
      tipo_impuesto: '',
      porcentaje_retencion: 'TOTALES',
      cantidad_retenciones: reporte.totales.total_retenciones,
      total_base_imponible: reporte.totales.total_base,
      total_retenido: reporte.totales.total_retenido
    });
    lastRow.font = { bold: true };
    lastRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };

    // Formato de números
    worksheet.getColumn('total_base_imponible').numFmt = '$#,##0.00';
    worksheet.getColumn('total_retenido').numFmt = '$#,##0.00';

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Exportar reporte de compras por código de retención a Excel
   */
  async exportarComprasPorCodigoRetencionExcel(empresaId, filtros = {}) {
    const reporte = await this.reporteComprasPorCodigoRetencion(empresaId, filtros);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema ATS - SRI Ecuador';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Retenciones por Código');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Tipo Impuesto', key: 'tipo_impuesto', width: 18 },
      { header: 'Código Retención', key: 'codigo_retencion', width: 20 },
      { header: 'Porcentaje', key: 'porcentaje_retencion', width: 15 },
      { header: 'Cantidad', key: 'cantidad_retenciones', width: 15 },
      { header: 'Base Imponible', key: 'total_base_imponible', width: 18 },
      { header: 'Total Retenido', key: 'total_retenido', width: 18 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    reporte.detalle.forEach(item => {
      worksheet.addRow({
        tipo_impuesto: item.tipo_impuesto,
        codigo_retencion: item.codigo_retencion,
        porcentaje_retencion: item.porcentaje_retencion + '%',
        cantidad_retenciones: item.cantidad_retenciones,
        total_base_imponible: item.total_base_imponible,
        total_retenido: item.total_retenido
      });
    });

    // Agregar fila de totales
    const lastRow = worksheet.addRow({
      tipo_impuesto: '',
      codigo_retencion: 'TOTALES',
      porcentaje_retencion: '',
      cantidad_retenciones: reporte.totales.total_retenciones,
      total_base_imponible: reporte.totales.total_base,
      total_retenido: reporte.totales.total_retenido
    });
    lastRow.font = { bold: true };
    lastRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };

    // Formato de números
    worksheet.getColumn('total_base_imponible').numFmt = '$#,##0.00';
    worksheet.getColumn('total_retenido').numFmt = '$#,##0.00';

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Exportar reporte de compras sin retenciones a Excel
   */
  async exportarComprasSinRetencionesExcel(empresaId, filtros = {}) {
    const reporte = await this.reporteComprasSinRetenciones(empresaId, filtros);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema ATS - SRI Ecuador';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Compras Sin Retenciones');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Fecha Emisión', key: 'fecha_emision', width: 15 },
      { header: 'Período', key: 'periodo', width: 12 },
      { header: 'RUC Proveedor', key: 'identificacion_proveedor', width: 15 },
      { header: 'Razón Social', key: 'razon_social_proveedor', width: 40 },
      { header: 'Factura', key: 'numero_factura', width: 20 },
      { header: 'Base IVA', key: 'base_imponible_iva', width: 15 },
      { header: 'Monto IVA', key: 'monto_iva', width: 15 },
      { header: 'Total', key: 'total_compra', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF0000' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    reporte.compras.forEach(compra => {
      const numeroFactura = `${compra.establecimiento}-${compra.punto_emision}-${compra.secuencial}`;
      worksheet.addRow({
        fecha_emision: compra.fecha_emision,
        periodo: compra.periodo,
        identificacion_proveedor: compra.identificacion_proveedor,
        razon_social_proveedor: compra.razon_social_proveedor,
        numero_factura: numeroFactura,
        base_imponible_iva: parseFloat(compra.base_imponible_iva || 0),
        monto_iva: parseFloat(compra.monto_iva || 0),
        total_compra: parseFloat(compra.total_compra || 0),
        estado: compra.estado
      });
    });

    // Agregar fila de totales
    const lastRow = worksheet.addRow({
      razon_social_proveedor: 'TOTALES',
      base_imponible_iva: reporte.totales.total_base_iva,
      monto_iva: reporte.totales.total_iva,
      total_compra: reporte.totales.total_compras
    });
    lastRow.font = { bold: true };
    lastRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFD9D9' }
    };

    // Formato de números
    ['base_imponible_iva', 'monto_iva', 'total_compra'].forEach(col => {
      worksheet.getColumn(col).numFmt = '$#,##0.00';
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Exportar reporte de retenciones recibidas por cliente IVA a Excel
   */
  async exportarRetencionesRecibidasPorClienteIVAExcel(empresaId, filtros = {}) {
    const reporte = await this.reporteRetencionesRecibidasPorClienteIVA(empresaId, filtros);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema ATS - SRI Ecuador';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Retenciones Recibidas IVA');

    // Configurar columnas
    worksheet.columns = [
      { header: 'RUC/Cédula Cliente', key: 'identificacion_cliente', width: 20 },
      { header: 'Razón Social', key: 'razon_social_cliente', width: 40 },
      { header: 'Cantidad Ventas', key: 'cantidad_ventas', width: 18 },
      { header: 'Total Ventas', key: 'total_ventas', width: 18 },
      { header: 'Base IVA', key: 'total_base_iva', width: 18 },
      { header: 'Retención IVA', key: 'total_retencion_iva', width: 18 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00B050' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    reporte.detalle.forEach(item => {
      worksheet.addRow({
        identificacion_cliente: item.identificacion_cliente,
        razon_social_cliente: item.razon_social_cliente,
        cantidad_ventas: item.cantidad_ventas,
        total_ventas: item.total_ventas,
        total_base_iva: item.total_base_iva,
        total_retencion_iva: item.total_retencion_iva
      });
    });

    // Agregar fila de totales
    const lastRow = worksheet.addRow({
      razon_social_cliente: 'TOTALES',
      cantidad_ventas: reporte.totales.total_ventas,
      total_ventas: reporte.totales.total,
      total_base_iva: reporte.totales.total_base_iva,
      total_retencion_iva: reporte.totales.total_retencion_iva
    });
    lastRow.font = { bold: true };
    lastRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2EFDA' }
    };

    // Formato de números
    ['total_ventas', 'total_base_iva', 'total_retencion_iva'].forEach(col => {
      worksheet.getColumn(col).numFmt = '$#,##0.00';
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Exportar reporte de retenciones recibidas por cliente IR a Excel
   */
  async exportarRetencionesRecibidasPorClienteIRExcel(empresaId, filtros = {}) {
    const reporte = await this.reporteRetencionesRecibidasPorClienteIR(empresaId, filtros);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema ATS - SRI Ecuador';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Retenciones Recibidas IR');

    // Configurar columnas
    worksheet.columns = [
      { header: 'RUC/Cédula Cliente', key: 'identificacion_cliente', width: 20 },
      { header: 'Razón Social', key: 'razon_social_cliente', width: 40 },
      { header: 'Cantidad Ventas', key: 'cantidad_ventas', width: 18 },
      { header: 'Total Ventas', key: 'total_ventas', width: 18 },
      { header: 'Retención IR', key: 'total_retencion_renta', width: 18 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00B050' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    reporte.detalle.forEach(item => {
      worksheet.addRow({
        identificacion_cliente: item.identificacion_cliente,
        razon_social_cliente: item.razon_social_cliente,
        cantidad_ventas: item.cantidad_ventas,
        total_ventas: item.total_ventas,
        total_retencion_renta: item.total_retencion_renta
      });
    });

    // Agregar fila de totales
    const lastRow = worksheet.addRow({
      razon_social_cliente: 'TOTALES',
      cantidad_ventas: reporte.totales.total_ventas,
      total_ventas: reporte.totales.total,
      total_retencion_renta: reporte.totales.total_retencion_renta
    });
    lastRow.font = { bold: true };
    lastRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2EFDA' }
    };

    // Formato de números
    ['total_ventas', 'total_retencion_renta'].forEach(col => {
      worksheet.getColumn(col).numFmt = '$#,##0.00';
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Exportar reporte de compras por proveedor a PDF
   */
  async exportarComprasPorProveedorPDF(empresaId, filtros = {}) {
    const compraService = require('./compraService');
    const reporte = await compraService.reportePorProveedor(empresaId, filtros);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Encabezado
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#0070C0')
          .text('Reporte de Compras por Proveedor', { align: 'center' });

        doc.moveDown();
        doc.fontSize(10).fillColor('#000000')
          .text(`Fecha: ${new Date().toLocaleDateString('es-EC')}`, { align: 'right' });

        if (filtros.periodo) {
          doc.text(`Periodo: ${filtros.periodo}`, { align: 'right' });
        }

        doc.moveDown(2);

        // Tabla
        const startY = doc.y;
        const itemsPerPage = 15;
        let currentItem = 0;

        // Encabezados de tabla
        const drawHeaders = (y) => {
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
          doc.rect(30, y, 100, 20).fillAndStroke('#0070C0', '#0070C0');
          doc.text('RUC/Cédula', 35, y + 6);

          doc.rect(130, y, 250, 20).fillAndStroke('#0070C0', '#0070C0');
          doc.text('Proveedor', 135, y + 6);

          doc.rect(380, y, 80, 20).fillAndStroke('#0070C0', '#0070C0');
          doc.text('Cantidad', 385, y + 6);

          doc.rect(460, y, 120, 20).fillAndStroke('#0070C0', '#0070C0');
          doc.text('Total Compras', 465, y + 6);

          doc.rect(580, y, 120, 20).fillAndStroke('#0070C0', '#0070C0');
          doc.text('Total IVA', 585, y + 6);
        };

        drawHeaders(startY);
        let y = startY + 20;

        // Datos
        doc.font('Helvetica').fillColor('#000000');

        reporte.forEach((item, index) => {
          if (currentItem > 0 && currentItem % itemsPerPage === 0) {
            doc.addPage({ size: 'A4', layout: 'landscape', margin: 30 });
            y = 30;
            drawHeaders(y);
            y += 20;
          }

          doc.fontSize(8);
          doc.text(item.identificacion, 35, y + 4, { width: 90 });
          doc.text(item.razon_social, 135, y + 4, { width: 240 });
          doc.text(item.cantidad_compras.toString(), 385, y + 4, { width: 70 });
          doc.text(`$${item.total_compras.toFixed(2)}`, 465, y + 4, { width: 110 });
          doc.text(`$${item.total_iva.toFixed(2)}`, 585, y + 4, { width: 110 });

          y += 20;
          currentItem++;
        });

        // Totales
        y += 10;
        doc.fontSize(10).font('Helvetica-Bold');
        const totalCompras = reporte.reduce((sum, item) => sum + item.total_compras, 0);
        const totalIVA = reporte.reduce((sum, item) => sum + item.total_iva, 0);

        doc.text('TOTAL:', 135, y);
        doc.text(`$${totalCompras.toFixed(2)}`, 465, y);
        doc.text(`$${totalIVA.toFixed(2)}`, 585, y);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ReporteService();
