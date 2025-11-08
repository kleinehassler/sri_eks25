'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Tipos de documentos de identidad
    await queryInterface.bulkInsert('parametros_sri', [
      // TIPOS DE IDENTIFICACIÓN
      {
        tipo_parametro: 'TIPO_IDENTIFICACION',
        codigo: '01',
        descripcion: 'RUC',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'TIPO_IDENTIFICACION',
        codigo: '02',
        descripcion: 'Cédula',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'TIPO_IDENTIFICACION',
        codigo: '03',
        descripcion: 'Pasaporte',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'TIPO_IDENTIFICACION',
        codigo: '07',
        descripcion: 'Consumidor Final',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'TIPO_IDENTIFICACION',
        codigo: '08',
        descripcion: 'Identificación del Exterior',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },

      // TIPOS DE COMPROBANTES
      {
        tipo_parametro: 'TIPO_COMPROBANTE_VENTA',
        codigo: '01',
        descripcion: 'Factura',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'TIPO_COMPROBANTE_VENTA',
        codigo: '04',
        descripcion: 'Nota de Crédito',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'TIPO_COMPROBANTE_VENTA',
        codigo: '05',
        descripcion: 'Nota de Débito',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'TIPO_COMPROBANTE_VENTA',
        codigo: '07',
        descripcion: 'Comprobante de Retención',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },

      // CÓDIGOS DE SUSTENTO TRIBUTARIO
      {
        tipo_parametro: 'CODIGO_SUSTENTO',
        codigo: '01',
        descripcion: 'Crédito Tributario para declaración de IVA (servicios y bienes distintos de inventarios y activos fijos)',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'CODIGO_SUSTENTO',
        codigo: '02',
        descripcion: 'Costo o Gasto para declaración de Impuesto a la Renta (servicios y bienes distintos de inventarios y activos fijos)',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'CODIGO_SUSTENTO',
        codigo: '03',
        descripcion: 'Activo Fijo - Crédito Tributario para declaración de IVA',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'CODIGO_SUSTENTO',
        codigo: '04',
        descripcion: 'Activo Fijo - Costo o Gasto para declaración de Impuesto a la Renta',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'CODIGO_SUSTENTO',
        codigo: '05',
        descripcion: 'Liquidación Gastos de Viaje, hospedaje y alimentación Gastos IR (a nombre de empleados y no de la empresa)',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },

      // FORMAS DE PAGO
      {
        tipo_parametro: 'FORMA_PAGO',
        codigo: '01',
        descripcion: 'Sin utilización del sistema financiero',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'FORMA_PAGO',
        codigo: '02',
        descripcion: 'Cheque propio',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'FORMA_PAGO',
        codigo: '03',
        descripcion: 'Cheque certificado',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'FORMA_PAGO',
        codigo: '04',
        descripcion: 'Transferencia',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'FORMA_PAGO',
        codigo: '05',
        descripcion: 'Tarjeta de débito',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'FORMA_PAGO',
        codigo: '06',
        descripcion: 'Tarjeta de crédito',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },

      // CÓDIGOS DE RETENCIÓN IVA
      {
        tipo_parametro: 'CODIGO_RETENCION',
        codigo: '1',
        descripcion: 'Retención IVA 10%',
        porcentaje: 10.00,
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'CODIGO_RETENCION',
        codigo: '2',
        descripcion: 'Retención IVA 20%',
        porcentaje: 20.00,
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'CODIGO_RETENCION',
        codigo: '3',
        descripcion: 'Retención IVA 30%',
        porcentaje: 30.00,
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'CODIGO_RETENCION',
        codigo: '7',
        descripcion: 'Retención IVA 70%',
        porcentaje: 70.00,
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'CODIGO_RETENCION',
        codigo: '8',
        descripcion: 'Retención IVA 100%',
        porcentaje: 100.00,
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },

      // PAÍSES (principales)
      {
        tipo_parametro: 'PAIS',
        codigo: '593',
        descripcion: 'Ecuador',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'PAIS',
        codigo: '001',
        descripcion: 'Estados Unidos',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'PAIS',
        codigo: '057',
        descripcion: 'Colombia',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        tipo_parametro: 'PAIS',
        codigo: '051',
        descripcion: 'Perú',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('parametros_sri', null, {});
  }
};
