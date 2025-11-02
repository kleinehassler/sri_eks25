'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('retenciones', {
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
      compra_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'compras',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      periodo: {
        type: Sequelize.STRING(7),
        allowNull: false,
        comment: 'Formato MM/AAAA'
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
      fecha_emision: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      tipo_identificacion: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      identificacion_proveedor: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      razon_social_proveedor: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      tipo_impuesto: {
        type: Sequelize.ENUM('IVA', 'RENTA'),
        allowNull: false
      },
      codigo_retencion: {
        type: Sequelize.STRING(5),
        allowNull: false
      },
      base_imponible: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      porcentaje_retencion: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      valor_retenido: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      numero_comprobante_sustento: {
        type: Sequelize.STRING(17),
        comment: 'Formato: 001-002-000000001'
      },
      fecha_emision_comprobante_sustento: {
        type: Sequelize.DATEONLY
      },
      archivo_xml: {
        type: Sequelize.TEXT,
        comment: 'Ruta o contenido del XML de retención electrónica'
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

    await queryInterface.addIndex('retenciones', ['empresa_id', 'periodo']);
    await queryInterface.addIndex('retenciones', ['usuario_id']);
    await queryInterface.addIndex('retenciones', ['compra_id']);
    await queryInterface.addIndex('retenciones', ['identificacion_proveedor']);
    await queryInterface.addIndex('retenciones', ['estado']);
    await queryInterface.addIndex('retenciones', ['fecha_emision']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('retenciones');
  }
};
