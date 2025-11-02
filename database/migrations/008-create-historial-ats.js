'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('historial_ats', {
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
      nombre_archivo: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      ruta_archivo_xml: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      ruta_archivo_zip: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      total_compras: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_ventas: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_exportaciones: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_retenciones: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      validacion_xsd: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      errores_validacion: {
        type: Sequelize.TEXT
      },
      fecha_generacion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('GENERADO', 'DESCARGADO', 'PRESENTADO', 'ERROR'),
        allowNull: false,
        defaultValue: 'GENERADO'
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

    await queryInterface.addIndex('historial_ats', ['empresa_id', 'periodo']);
    await queryInterface.addIndex('historial_ats', ['usuario_id']);
    await queryInterface.addIndex('historial_ats', ['estado']);
    await queryInterface.addIndex('historial_ats', ['fecha_generacion']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('historial_ats');
  }
};
