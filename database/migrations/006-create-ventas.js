'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ventas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      empresa_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'empresas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      periodo: {
        type: Sequelize.STRING(7),
        allowNull: false,
        comment: 'Formato MM/AAAA'
      },
      tipo_comprobante: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      tipo_identificacion_cliente: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      identificacion_cliente: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      razon_social_cliente: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      fecha_emision: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      establecimiento: {
        type: Sequelize.STRING(3),
        allowNull: false
      },
      punto_emision: {
        type: Sequelize.STRING(3),
        allowNull: false
      },
      secuencial: {
        type: Sequelize.STRING(9),
        allowNull: false
      },
      numero_autorizacion: {
        type: Sequelize.STRING(49),
        allowNull: false
      },
      base_imponible_0: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      base_imponible_iva: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      base_imponible_no_objeto_iva: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      base_imponible_exento_iva: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      monto_iva: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      monto_ice: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      valor_retencion_iva: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      valor_retencion_renta: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      total_venta: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      forma_pago: {
        type: Sequelize.STRING(2)
      },
      estado: {
        type: Sequelize.ENUM('BORRADOR', 'VALIDADO', 'INCLUIDO_ATS', 'ANULADO'),
        allowNull: false,
        defaultValue: 'BORRADOR'
      },
      observaciones: {
        type: Sequelize.TEXT
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

    await queryInterface.addIndex('ventas', ['empresa_id', 'periodo']);
    await queryInterface.addIndex('ventas', ['usuario_id']);
    await queryInterface.addIndex('ventas', ['identificacion_cliente']);
    await queryInterface.addIndex('ventas', ['estado']);
    await queryInterface.addIndex('ventas', ['fecha_emision']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ventas');
  }
};
