'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('parametros_sri', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tipo_parametro: {
        type: Sequelize.ENUM(
          'TIPO_DOCUMENTO',
          'TIPO_COMPROBANTE_VENTA',
          'CODIGO_SUSTENTO',
          'FORMA_PAGO',
          'TIPO_IDENTIFICACION',
          'PAIS',
          'TIPO_REGIMEN_FISCAL',
          'CODIGO_RETENCION',
          'CODIGO_IMPUESTO'
        ),
        allowNull: false
      },
      codigo: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      porcentaje: {
        type: Sequelize.DECIMAL(5, 2)
      },
      estado: {
        type: Sequelize.ENUM('ACTIVO', 'INACTIVO'),
        allowNull: false,
        defaultValue: 'ACTIVO'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('parametros_sri', ['tipo_parametro', 'codigo']);
    await queryInterface.addIndex('parametros_sri', ['estado']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('parametros_sri');
  }
};
